import {AbsoluteFill, Audio, Easing, interpolate, Sequence, staticFile, useCurrentFrame} from 'remotion';
import './theme';
import {Captions} from './components/Captions';
import {EndCard, QuestionCard, TitleCard} from './components/Cards';
import {Framed} from './components/Framed';
import {Cutaways, Graphics} from './components/Overlays';
import {BottomShade, Sfx} from './components/ui';
import {ClipScene, FPS, Scene, sceneByKey, TIMELINE} from './timeline';

/* ---------------- Talking-head scene ---------------- */
const Entrance: React.FC<{children: React.ReactNode; enabled: boolean}> = ({children, enabled}) => {
	const frame = useCurrentFrame();
	if (!enabled) return <>{children}</>;
	const p = interpolate(frame, [0, 9], [1, 0], {extrapolateRight: 'clamp', easing: Easing.out(Easing.cubic)});
	return <AbsoluteFill style={{transform: `scale(${1 + p * 0.12})`, filter: `blur(${p * 14}px)`}}>{children}</AbsoluteFill>;
};

const ClipView: React.FC<{scene: ClipScene; entrance: boolean}> = ({scene, entrance}) => (
	<AbsoluteFill>
		<Entrance enabled={entrance}>
			{scene.segments.map((seg, i) => (
				<Sequence key={i} from={seg.from} durationInFrames={seg.dur} name={`${scene.clip} ${seg.src0.toFixed(2)}-${seg.src1.toFixed(2)}`}>
					<Framed clip={scene.clip} trimBefore={Math.round(seg.src0 * FPS)} zoom={seg.zoom} durationInFrames={seg.dur} />
				</Sequence>
			))}
			<Cutaways scene={scene} />
		</Entrance>
		<BottomShade />
		<Graphics scene={scene} />
		<Captions words={scene.words} />
	</AbsoluteFill>
);

const SceneView: React.FC<{scene: Scene; prev?: Scene}> = ({scene, prev}) => {
	switch (scene.kind) {
		case 'clip':
			return <ClipView scene={scene} entrance={prev !== undefined && prev.kind !== 'qcard'} />;
		case 'qcard':
			return <QuestionCard q={scene.q} clip={scene.clip} dur={scene.dur} />;
		case 'title':
			return <TitleCard dur={scene.dur} />;
		case 'end':
			return <EndCard dur={scene.dur} />;
	}
};

/* ---------------- Audio ---------------- */
const voiceScenes = TIMELINE.scenes.filter((s): s is ClipScene => s.kind === 'clip');

const VoiceTrack: React.FC = () => (
	<>
		{voiceScenes.flatMap((scene) =>
			scene.segments.map((seg, i) => (
				<Sequence key={`${scene.key}-${i}`} from={scene.from + seg.from} durationInFrames={seg.dur} layout="none" name={`voice ${scene.key}#${i}`}>
					<Audio
						src={staticFile(`audio/${scene.clip}.wav`)}
						trimBefore={Math.round(seg.src0 * FPS)}
						volume={(f) => Math.min(1, (f + 1) / 2, (seg.dur - f) / 2)}
					/>
				</Sequence>
			)),
		)}
	</>
);

const MUSIC_UNDER_VOICE = 0.075; // ~ -22 dB under the voice
const MUSIC_OPEN = 0.24;

const MusicTrack: React.FC = () => {
	const title = sceneByKey('title');
	const end = sceneByKey('end');
	const intervals = voiceScenes.filter((s) => s.key !== 'hook').map((s) => [s.from - title.from, s.from + s.dur - title.from]);
	const total = TIMELINE.total - title.from;
	return (
		<Sequence from={title.from} layout="none" name="BGM">
			<Audio
				src={staticFile('music/bgm.mp3')}
				loop
				volume={(f) => {
					let d = Infinity;
					for (const [a, b] of intervals) {
						if (f >= a && f <= b) {
							d = 0;
							break;
						}
						d = Math.min(d, Math.abs(f - a), Math.abs(f - b));
					}
					const v = interpolate(d, [0, 12], [MUSIC_UNDER_VOICE, MUSIC_OPEN], {extrapolateRight: 'clamp'});
					const fadeOut = interpolate(f, [total - 40, total], [1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
					const swellEnd = interpolate(f, [end.from - title.from, end.from - title.from + 20], [1, 1.35], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
					return v * fadeOut * swellEnd;
				}}
			/>
		</Sequence>
	);
};

const SfxTrack: React.FC = () => {
	const title = sceneByKey('title');
	const intro = sceneByKey('intro');
	const end = sceneByKey('end');
	const cards = TIMELINE.scenes.filter((s) => s.kind === 'qcard');
	return (
		<>
			<Sfx at={Math.max(0, title.from - 58)} name="riser" vol={0.22} />
			<Sfx at={title.from} name="impact" vol={0.6} />
			<Sfx at={title.from} name="subdrop" vol={0.35} />
			<Sfx at={title.from + 22} name="shimmer" vol={0.28} />
			<Sfx at={title.from + 30} name="pop" vol={0.3} />
			<Sfx at={title.from + 40} name="pop" vol={0.3} />
			<Sfx at={title.from + 50} name="pop" vol={0.3} />
			<Sfx at={intro.from - 6} name="whoosh" vol={0.4} />
			{cards.map((c) => (
				<Sequence key={c.key} from={c.from} layout="none">
					<Sfx at={0} name="transition" vol={0.42} />
					<Sfx at={12} name="typing" vol={0.3} />
				</Sequence>
			))}
			<Sfx at={end.from - 6} name="whoosh" vol={0.4} />
			<Sfx at={end.from + 4} name="impact" vol={0.45} />
			<Sfx at={end.from + 34} name="shimmer" vol={0.3} />
		</>
	);
};

export const Interview: React.FC = () => (
	<AbsoluteFill style={{backgroundColor: '#000'}}>
		{TIMELINE.scenes.map((scene, i) => (
			<Sequence key={scene.key} from={scene.from} durationInFrames={scene.dur} name={scene.key}>
				<SceneView scene={scene} prev={TIMELINE.scenes[i - 1]} />
			</Sequence>
		))}
		<VoiceTrack />
		<MusicTrack />
		<SfxTrack />
	</AbsoluteFill>
);
