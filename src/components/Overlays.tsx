import {interpolate, Sequence, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {C, BAND_Y, SAFE, SERIF} from '../theme';
import {ClipScene, QUESTIONS, wordAt} from '../timeline';
import {Band, LowerThird, PhotoCutaway, Pill, Sfx, TimerRing, TopicChip} from './ui';

/** Photo/B-roll layers that sit *under* captions but over the talking head. */
export const Cutaways: React.FC<{scene: ClipScene}> = ({scene}) => {
	const w = (t: string, n = 0, e: 'start' | 'end' = 'start') => wordAt(scene, t, n, e);
	if (scene.key === 'a2') {
		const a = w('friendly') - 2;
		const b = w('because') - 1;
		return (
			<>
				<Sfx at={a - 4} name="whoosh" vol={0.28} />
				<Sfx at={a} name="shutter" vol={0.4} />
				<Sequence from={a} durationInFrames={b - a} layout="none">
					<PhotoCutaway src="img/IMG_8564.jpg" dur={b - a} focus={[38, 45]} zoomFrom={1.18} zoomTo={1.06} panX={-30} />
				</Sequence>
			</>
		);
	}
	if (scene.key === 'a6') {
		const a = w('memories') - 3;
		const m = w('It');
		const b = w('as') - 1;
		return (
			<>
				<Sfx at={a - 4} name="whoosh" vol={0.28} />
				<Sfx at={a} name="shutter" vol={0.4} />
				<Sfx at={m} name="shutter" vol={0.35} />
				<Sequence from={a} durationInFrames={m - a} layout="none">
					<PhotoCutaway src="img/IMG_8565.jpg" dur={m - a} focus={[45, 40]} zoomFrom={1.25} zoomTo={1.1} />
				</Sequence>
				<Sequence from={m} durationInFrames={b - m} layout="none">
					<PhotoCutaway src="img/IMG_8564.jpg" dur={b - m} focus={[40, 50]} zoomFrom={1.05} zoomTo={1.16} />
				</Sequence>
			</>
		);
	}
	return null;
};

const ThankYou: React.FC<{dur: number}> = ({dur}) => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();
	const s = spring({frame: frame - 2, fps, config: {damping: 16, stiffness: 120}});
	const out = interpolate(frame, [dur - 6, dur], [1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
	return (
		<div style={{position: 'absolute', left: SAFE.left, top: BAND_Y - 10, overflow: 'hidden', opacity: out}}>
			<div
				style={{
					fontFamily: SERIF,
					fontStyle: 'italic',
					fontWeight: 600,
					fontSize: 104,
					color: C.gold,
					transform: `translateY(${(1 - s) * 120}px)`,
					textShadow: '0 6px 24px rgba(0,0,0,0.5)',
				}}
			>
				Thank you,
			</div>
		</div>
	);
};

/** Graphics in the band below the chin + top-left topic chip. */
export const Graphics: React.FC<{scene: ClipScene}> = ({scene}) => {
	const frame = useCurrentFrame();
	const D = scene.dur;
	const w = (t: string, n = 0, e: 'start' | 'end' = 'start') => wordAt(scene, t, n, e);
	const chip = scene.q !== undefined ? (
		<TopicChip label={`QUESTION ${String(scene.q + 1).padStart(2, '0')}`} title={QUESTIONS[scene.q].topic} dur={D} />
	) : null;

	switch (scene.key) {
		case 'hook':
			return <TopicChip label="VALEDICTORIAN 2026" title="TAR UMT Pahang Branch" dur={D + 8} />;
		case 'intro':
			return (
				<>
					<Sfx at={4} name="swoosh_soft" vol={0.35} />
					<LowerThird at={4} until={w('Pahang', 0, 'end') + 6} name="Tan Wei Xuan" sub="BACHELOR OF BUSINESS ADMINISTRATION (HONS)" />
					<Band>
						<Pill at={w('Kemaman') - 2} until={w('studied')} icon="pin" label="Kemaman, Terengganu" />
					</Band>
					<Band>
						<Pill at={w('four') - 2} icon="calendar" label="4 years at TAR UMT Pahang" tone="gold" />
					</Band>
				</>
			);
		case 'a1': {
			const sup = w('support');
			return (
				<>
					{chip}
					<Band>
						<Pill at={w('magic') - 2} until={w('consistency') - 2} icon="x" label="No magic formula" />
					</Band>
					<Band>
						<Pill at={w('consistency') - 2} until={sup - 2} icon="check" label="Consistency" size={32} />
						<Pill at={w('hard') - 2} until={sup - 2} icon="check" label="Hard work" size={32} />
						<Pill at={w('time') - 2} until={sup - 2} icon="check" label="Time management" size={32} />
					</Band>
					<Band>
						<Pill at={sup} icon="heart" label="Support from lecturers & family" tone="gold" size={32} />
					</Band>
				</>
			);
		}
		case 'a2':
			return (
				<>
					{chip}
					<Band>
						<Pill at={w('closer') - 2} until={w('friendly') - 2} icon="home" label="Closer to home" />
					</Band>
					<Band>
						<Pill at={w('friendly')} until={w('because') - 2} icon="users" label="Friendly & supportive" tone="gold" />
					</Band>
					<Band>
						<Pill at={w('seek') - 2} icon="person" label="Lecturers always ready to help" />
					</Band>
				</>
			);
		case 'a3': {
			const lec = w('lecturers');
			const end = w('useful') - 2;
			const tone = (isLect: boolean) => (frame >= lec ? (isLect ? 'gold' : 'dim') : 'glass');
			return (
				<>
					{chip}
					<Sfx at={lec} name="ding" vol={0.3} />
					<Band>
						<Pill at={2} until={end} icon="search" label="Google" tone={tone(false)} size={32} />
						<Pill at={8} until={end} icon="spark" label="ChatGPT" tone={tone(false)} size={32} />
						<Pill at={14} until={end} icon="person" label="Lecturer" tone={tone(true)} size={32} />
					</Band>
					<Band>
						<Pill at={w('assignment') - 2} icon="book" label="Assignments" size={32} />
						<Pill at={w('final') - 2} icon="calendar" label="Final exams" size={32} />
					</Band>
				</>
			);
		}
		case 'a4': {
			const so = w('So') - 2;
			return (
				<>
					{chip}
					<Band>
						<Pill at={w('plan') - 2} until={so} icon="check" label="Plan schedules" size={32} />
						<Pill at={w('prioritize') - 2} until={so} icon="check" label="Prioritize tasks" size={32} />
						<Pill at={w('ensure') - 2} until={so} icon="check" label="Execute smoothly" size={32} />
					</Band>
					<Band>
						<Pill at={w('give') - 2} icon="star" label="Giving up? Not an option." tone="gold" />
					</Band>
				</>
			);
		}
		case 'a5':
			return (
				<>
					{chip}
					<Band>
						<TimerRing at={0} seconds={10} stopAt={D - 6} until={D + 4} />
						<Sfx at={0} name="tick" vol={0.4} />
						<Sfx at={D - 6} name="ding" vol={0.32} />
					</Band>
				</>
			);
		case 'a6': {
			const mem = w('memories') - 3;
			return (
				<>
					{chip}
					<Band>
						<Pill at={0} until={mem} icon="users" label="Friends" tone="gold" size={32} />
						<Pill at={4} until={mem} icon="person" label="Lecturers" tone="dim" size={32} />
						<Pill at={8} until={mem} icon="clock" label="Last-minute assignments" tone="dim" size={32} />
					</Band>
					<Band>
						<Pill at={w('wonderful') - 2} icon="heart" label="A wonderful journey" tone="gold" />
					</Band>
				</>
			);
		}
		case 'closing':
			return (
				<>
					<Sfx at={0} name="shimmer" vol={0.25} />
					<ThankYou dur={D} />
				</>
			);
		default:
			return null;
	}
};
