import edl from './data/edl.json';

export const FPS = 30;
export const W = 1080;
export const H = 1920;

export type ClipId = 'Introduction' | 'Q1' | 'Q2' | 'Q3' | 'Q4' | 'Q5' | 'Q6' | 'Closing';
export type Word = {w: string; s: number; e: number};
type EdlEntry = {ranges: number[][]; words: Word[]; srcDur: number};
const EDL = edl as unknown as Record<ClipId, EdlEntry>;
/** First kept source second of each clip (used for question-card freeze frames). */
export const EDL_FIRST = Object.fromEntries(Object.entries(EDL).map(([k, v]) => [k, v.ranges[0][0]])) as Record<ClipId, number>;

/** Face centre in the 1920x1080 source (x keyframes over source time, y constant). */
export const FACE: Record<ClipId, {cx: [number, number][]; cy: number}> = {
	Introduction: {cx: [[0, 765], [11.9, 770]], cy: 370},
	Q1: {cx: [[0, 750], [13, 754]], cy: 445},
	Q2: {cx: [[0, 762], [11.6, 792]], cy: 405},
	Q3: {cx: [[0, 782], [4, 776], [7, 757], [11, 739], [15.5, 726]], cy: 365},
	Q4: {cx: [[0, 830], [7, 845], [14, 873]], cy: 430},
	Q5: {cx: [[0, 834], [9.7, 810]], cy: 385},
	Q6: {cx: [[0, 880], [3.5, 850], [7.6, 831]], cy: 335},
	Closing: {cx: [[0, 898], [4.3, 855]], cy: 360},
};

export type Segment = {src0: number; src1: number; from: number; dur: number; zoom: number};
export type SceneWord = Word & {f0: number; f1: number};

export type ClipScene = {
	kind: 'clip';
	key: string;
	clip: ClipId;
	q?: number;
	from: number;
	dur: number;
	segments: Segment[];
	words: SceneWord[];
};
export type CardScene = {kind: 'qcard'; key: string; q: number; clip: ClipId; from: number; dur: number};
export type StillScene = {kind: 'title' | 'end'; key: string; from: number; dur: number};
export type Scene = ClipScene | CardScene | StillScene;

export const QUESTIONS: {topic: string; text: string}[] = [
	{topic: 'The Secret', text: "Congratulations! President's Award and Public Bank Excellence Award. So, what's your secret?"},
	{topic: 'Why Pahang?', text: 'There are other TAR UMT branches too. Why did you choose Pahang?'},
	{topic: 'Who Do You Ask?', text: "When you don't understand something: Google, ChatGPT, or straight to your lecturer?"},
	{topic: 'Exam Week', text: 'Be honest. How many times did you feel like giving up during exam week?'},
	{topic: '10-Second Pitch', text: 'Convince someone to study at TAR UMT Pahang Branch in 10 seconds. Go!'},
	{topic: "What You'll Miss", text: 'Last one! What will you miss most: lecturers, friends, or last-minute assignments?'},
];

const f = (s: number) => Math.round(s * FPS);

function buildClip(key: string, clip: ClipId, ranges: number[][], from: number, q?: number, zoomBase = 0): ClipScene {
	const segments: Segment[] = [];
	let cursor = 0;
	ranges.forEach(([a, b], i) => {
		const start = f(cursor);
		const end = f(cursor + (b - a));
		segments.push({src0: a, src1: b, from: start, dur: end - start, zoom: (i + zoomBase) % 2 === 0 ? 1.0 : 1.14});
		cursor += b - a;
	});
	const dur = segments[segments.length - 1].from + segments[segments.length - 1].dur;
	const mapT = (t: number): number | null => {
		for (const s of segments) {
			if (t >= s.src0 - 0.05 && t <= s.src1 + 0.05) {
				return s.from + (Math.min(Math.max(t, s.src0), s.src1) - s.src0) * FPS;
			}
		}
		return null;
	};
	const words: SceneWord[] = [];
	for (const w of EDL[clip].words) {
		if (w.e < ranges[0][0] || w.s > ranges[ranges.length - 1][1]) continue;
		let f0 = mapT(w.s);
		const f1 = mapT(w.e);
		if (f0 === null && f1 === null) continue;
		if (f0 === null) f0 = (f1 as number) - 6;
		words.push({...w, f0: Math.max(0, f0), f1: f1 ?? f0 + 6});
	}
	return {kind: 'clip', key, clip, q, from, dur, segments, words};
}

const cardDur = (q: number) => f(0.6 + QUESTIONS[q].text.split(' ').length * 0.085 + 1.5);

export function buildTimeline(): {scenes: Scene[]; total: number} {
	const scenes: Scene[] = [];
	let t = 0;
	const push = (s: Scene) => {
		scenes.push(s);
		t += s.dur;
	};
	// 1. Cold-open hook
	push(buildClip('hook', 'Q1', [[0.91, 3.0]], t, undefined, 1));
	// 2. Title
	push({kind: 'title', key: 'title', from: t, dur: f(4.6)});
	// 3. Introduction
	push(buildClip('intro', 'Introduction', EDL.Introduction.ranges, t));
	// 4. Q&A
	const qClips: ClipId[] = ['Q1', 'Q2', 'Q3', 'Q4', 'Q5', 'Q6'];
	qClips.forEach((clip, q) => {
		push({kind: 'qcard', key: `card${q + 1}`, q, clip, from: t, dur: cardDur(q)});
		push(buildClip(`a${q + 1}`, clip, EDL[clip].ranges, t, q));
	});
	// 5. Closing + end card
	push(buildClip('closing', 'Closing', EDL.Closing.ranges, t));
	push({kind: 'end', key: 'end', from: t, dur: f(4.8)});
	return {scenes, total: t};
}

export const TIMELINE = buildTimeline();

export const sceneByKey = (key: string) => TIMELINE.scenes.find((s) => s.key === key)!;

/** Scene-local frame where the n-th word matching `text` starts (case-insensitive, punctuation ignored). */
export function wordAt(scene: ClipScene, text: string, nth = 0, edge: 'start' | 'end' = 'start'): number {
	const norm = (x: string) => x.toLowerCase().replace(/[^a-z0-9']/g, '');
	const hits = scene.words.filter((w) => norm(w.w) === norm(text));
	const w = hits[Math.min(nth, hits.length - 1)];
	if (!w) throw new Error(`word "${text}" not found in ${scene.key}`);
	return Math.round(edge === 'start' ? w.f0 : w.f1);
}

export function faceX(clip: ClipId, t: number): number {
	const k = FACE[clip].cx;
	if (t <= k[0][0]) return k[0][1];
	for (let i = 1; i < k.length; i++) {
		if (t <= k[i][0]) {
			const p = (t - k[i - 1][0]) / (k[i][0] - k[i - 1][0]);
			return k[i - 1][1] + p * (k[i][1] - k[i - 1][1]);
		}
	}
	return k[k.length - 1][1];
}
