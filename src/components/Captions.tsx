import {interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {C, CAPTION_Y, SANS} from '../theme';
import {SceneWord} from '../timeline';

const KEYWORDS = new Set([
	'magic', 'formula', 'consistency', 'hard', 'work', 'time', 'management', 'support', 'family', 'lecturers',
	'lecturer', 'friendly', 'supportive', 'environment', 'home', 'plus', 'help', 'advice', 'plan', 'schedules',
	'prioritize', 'tasks', 'smoothly', 'give', 'up', 'kemaman', 'four', 'years', 'tar', 'umt', 'pahang', 'branch',
	'friends', 'memories', 'wonderful', 'journey', 'exam', 'assignment', 'useful', 'choose', 'easily',
	'business', 'administration', 'honours', 'tan', 'wei', 'xuan',
]);
const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9']/g, '');

type Chunk = {words: SceneWord[]; f0: number; f1: number};

export function chunkWords(words: SceneWord[]): Chunk[] {
	const chunks: Chunk[] = [];
	let cur: SceneWord[] = [];
	const flush = () => {
		if (cur.length) chunks.push({words: cur, f0: cur[0].f0, f1: cur[cur.length - 1].f1});
		cur = [];
	};
	words.forEach((w, i) => {
		const prev = words[i - 1];
		const chars = cur.reduce((n, x) => n + x.w.length + 1, 0);
		if (cur.length && (cur.length >= 4 || chars + w.w.length > 20 || /[.,!?]$/.test(prev.w) || w.f0 - prev.f1 > 9)) {
			flush();
		}
		cur.push(w);
	});
	flush();
	// each chunk stays until the next one begins (or a short tail)
	chunks.forEach((c, i) => {
		const next = chunks[i + 1];
		c.f1 = next ? next.f0 : c.f1 + 12;
	});
	return chunks;
}

export const Captions: React.FC<{words: SceneWord[]; y?: number}> = ({words, y = CAPTION_Y}) => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();
	const chunks = chunkWords(words);
	const chunk = chunks.find((c) => frame >= c.f0 - 1 && frame < c.f1);
	if (!chunk) return null;
	const enter = spring({frame: frame - chunk.f0 + 1, fps, config: {damping: 16, stiffness: 220, mass: 0.6}});
	return (
		<div
			style={{
				position: 'absolute',
				left: 64,
				width: 876,
				top: y,
				display: 'flex',
				flexWrap: 'wrap',
				justifyContent: 'center',
				alignContent: 'flex-start',
				gap: '6px 20px',
				transform: `translateY(${(1 - enter) * 26}px) scale(${0.9 + enter * 0.1})`,
				opacity: interpolate(enter, [0, 0.4], [0, 1], {extrapolateRight: 'clamp'}),
			}}
		>
			{chunk.words.map((w, i) => {
				const active = frame >= w.f0 && frame < Math.max(w.f1, w.f0 + 5);
				const spoken = frame >= w.f0;
				const isKey = KEYWORDS.has(norm(w.w));
				const pop = spring({frame: frame - w.f0, fps, config: {damping: 12, stiffness: 300, mass: 0.4}});
				return (
					<span
						key={i}
						style={{
							fontFamily: SANS,
							fontWeight: 800,
							fontSize: 66,
							lineHeight: 1.12,
							letterSpacing: -0.5,
							color: active || (spoken && isKey) ? C.gold : C.white,
							opacity: spoken ? 1 : 0.78,
							transform: `scale(${active ? 1 + 0.07 * pop : 1}) translateY(${active ? -3 * pop : 0}px)`,
							display: 'inline-block',
							textShadow: '0 4px 18px rgba(0,0,0,0.55), 0 2px 3px rgba(0,0,0,0.7)',
							WebkitTextStroke: '1.5px rgba(0,0,0,0.25)',
						}}
					>
						{w.w}
					</span>
				);
			})}
		</div>
	);
};
