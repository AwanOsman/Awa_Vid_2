import {AbsoluteFill, Easing, Img, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {C, SAFE, SANS, SERIF} from '../theme';
import {ClipId, EDL_FIRST, QUESTIONS} from '../timeline';
import {Framed} from './Framed';
import {Icon, IconName} from './ui';

/* ---------------- Question card: freeze of the next answer + question panel in the lower third ---------------- */
export const QuestionCard: React.FC<{q: number; clip: ClipId; dur: number}> = ({q, clip, dur}) => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();
	const {text} = QUESTIONS[q];
	const words = text.split(' ');
	const whip = interpolate(frame, [0, 8], [1, 0], {extrapolateRight: 'clamp', easing: Easing.out(Easing.cubic)});
	const panel = spring({frame: frame - 3, fps, config: {damping: 18, stiffness: 150}});
	const label = spring({frame: frame - 8, fps, config: {damping: 16, stiffness: 160}});
	const out = interpolate(frame, [dur - 7, dur], [1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.in(Easing.cubic)});
	const perWord = 2.6; // frames per word (typing feel)
	const textStart = 12;
	return (
		<AbsoluteFill>
			<AbsoluteFill style={{transform: `translateX(${whip * 260}px)`, filter: `blur(${whip * 18}px)`}}>
				<Framed clip={clip} trimBefore={Math.round(EDL_FIRST[clip] * 30)} zoom={1.0} durationInFrames={dur} push={0.05} freeze />
			</AbsoluteFill>
			{/* soft darkening on lower half only; face stays clean */}
			<AbsoluteFill style={{background: 'linear-gradient(180deg, rgba(0,0,0,0) 48%, rgba(5,8,16,0.55) 62%, rgba(5,8,16,0.82) 100%)'}} />
			<div
				style={{
					position: 'absolute',
					left: SAFE.left,
					width: SAFE.right - SAFE.left,
					top: 1080,
					padding: '34px 38px 38px 40px',
					borderRadius: 34,
					background: 'rgba(10, 13, 24, 0.66)',
					backdropFilter: 'blur(18px)',
					border: '1.5px solid rgba(242,193,78,0.35)',
					boxShadow: '0 30px 60px rgba(0,0,0,0.45)',
					transform: `translateY(${(1 - panel) * 120 + (1 - out) * 40}px)`,
					opacity: Math.min(1, panel * 1.4) * out,
					overflow: 'hidden',
				}}
			>
				<div style={{position: 'absolute', left: 0, top: 0, bottom: 0, width: 7, background: C.gold, transform: `scaleY(${panel})`, transformOrigin: 'top'}} />
				<div style={{display: 'flex', alignItems: 'center', gap: 14, opacity: label, transform: `translateX(${(1 - label) * -30}px)`}}>
					<div style={{width: 46, height: 46, borderRadius: 99, background: C.gold, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
						<Icon name="mic" size={28} color={C.ink} />
					</div>
					<span style={{fontFamily: SANS, fontWeight: 800, fontSize: 25, letterSpacing: 6, color: C.gold}}>
						QUESTION {String(q + 1).padStart(2, '0')}
					</span>
					<div style={{flex: 1, height: 2, background: 'linear-gradient(90deg, rgba(242,193,78,0.6), rgba(242,193,78,0))', transform: `scaleX(${label})`, transformOrigin: 'left'}} />
				</div>
				<div style={{marginTop: 22, display: 'flex', flexWrap: 'wrap', gap: '4px 13px'}}>
					{words.map((w, i) => {
						const wf = frame - textStart - i * perWord;
						const o = interpolate(wf, [0, 5], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
						return (
							<span
								key={i}
								style={{
									fontFamily: SERIF,
									fontWeight: 600,
									fontSize: 54,
									lineHeight: 1.2,
									color: C.white,
									opacity: o,
									transform: `translateY(${(1 - o) * 14}px)`,
									display: 'inline-block',
								}}
							>
								{w}
							</span>
						);
					})}
				</div>
			</div>
		</AbsoluteFill>
	);
};

/* ---------------- Title card ---------------- */
const Badge: React.FC<{at: number; icon: IconName; text: string}> = ({at, icon, text}) => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();
	const s = spring({frame: frame - at, fps, config: {damping: 14, stiffness: 170}});
	if (frame < at) return null;
	return (
		<div style={{display: 'flex', alignItems: 'center', gap: 18, opacity: s, transform: `translateX(${(1 - s) * -60}px)`}}>
			<div
				style={{
					width: 58,
					height: 58,
					borderRadius: 99,
					background: `linear-gradient(135deg, ${C.gold}, #C8922A)`,
					display: 'flex',
					alignItems: 'center',
					justifyContent: 'center',
					boxShadow: '0 6px 18px rgba(0,0,0,0.4)',
				}}
			>
				<Icon name={icon} size={34} color={C.ink} />
			</div>
			<span style={{fontFamily: SANS, fontWeight: 700, fontSize: 36, color: C.white, textShadow: '0 2px 12px rgba(0,0,0,0.6)'}}>{text}</span>
		</div>
	);
};

const Shine: React.FC<{at: number}> = ({at}) => {
	const frame = useCurrentFrame();
	const x = interpolate(frame - at, [0, 22], [-40, 140], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
	return (
		<div
			style={{
				position: 'absolute',
				inset: 0,
				background: `linear-gradient(100deg, transparent ${x - 15}%, rgba(255,255,255,0.55) ${x}%, transparent ${x + 15}%)`,
				mixBlendMode: 'overlay',
			}}
		/>
	);
};

export const TitleCard: React.FC<{dur: number}> = ({dur}) => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();
	const kb = interpolate(frame, [0, dur], [1.16, 1.04]);
	const flash = interpolate(frame, [0, 1, 9], [0.9, 0.9, 0], {extrapolateRight: 'clamp'});
	const s1 = spring({frame: frame - 4, fps, config: {damping: 18, stiffness: 140}});
	const s2 = spring({frame: frame - 9, fps, config: {damping: 16, stiffness: 120}});
	const line = spring({frame: frame - 16, fps, config: {damping: 20, stiffness: 120}});
	const out = interpolate(frame, [dur - 6, dur], [1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
	return (
		<AbsoluteFill style={{backgroundColor: C.ink}}>
			<AbsoluteFill style={{opacity: out}}>
				<Img
					src={staticFile('img/IMG_8565.jpg')}
					style={{width: '100%', height: '100%', objectFit: 'cover', objectPosition: '45% 40%', transform: `scale(${kb})`, filter: `blur(${interpolate(frame, [0, 14], [10, 0], {extrapolateRight: 'clamp'})}px)`}}
				/>
				<AbsoluteFill style={{background: 'linear-gradient(180deg, rgba(5,8,16,0.25) 0%, rgba(5,8,16,0) 30%, rgba(5,8,16,0.55) 55%, rgba(5,8,16,0.92) 80%)'}} />
				<div style={{position: 'absolute', left: SAFE.left, width: SAFE.right - SAFE.left, top: 1010}}>
					<div style={{fontFamily: SANS, fontWeight: 700, fontSize: 26, letterSpacing: 9, color: C.gold, opacity: s1, transform: `translateY(${(1 - s1) * 20}px)`}}>
						MEET OUR VALEDICTORIAN
					</div>
					<div style={{overflow: 'hidden', marginTop: 6, position: 'relative'}}>
						<div style={{fontFamily: SERIF, fontWeight: 700, fontSize: 112, lineHeight: 1.08, color: C.white, transform: `translateY(${(1 - s2) * 130}px)`}}>
							Tan Wei Xuan
						</div>
						<Shine at={22} />
					</div>
					<div style={{height: 3, width: 520, marginTop: 14, background: `linear-gradient(90deg, ${C.gold}, rgba(242,193,78,0))`, transform: `scaleX(${line})`, transformOrigin: 'left'}} />
					<div style={{display: 'flex', flexDirection: 'column', gap: 18, marginTop: 30}}>
						<Badge at={30} icon="cap" text="Valedictorian 2026" />
						<Badge at={40} icon="medal" text="President's Award" />
						<Badge at={50} icon="star" text="Public Bank Excellence Award" />
					</div>
				</div>
			</AbsoluteFill>
			<AbsoluteFill style={{background: '#fff', opacity: flash}} />
		</AbsoluteFill>
	);
};

/* ---------------- End card ---------------- */
export const EndCard: React.FC<{dur: number}> = ({dur}) => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();
	const kb = interpolate(frame, [0, dur], [1.02, 1.14]);
	const inn = interpolate(frame, [0, 10], [0, 1], {extrapolateRight: 'clamp'});
	const a = spring({frame: frame - 8, fps, config: {damping: 18, stiffness: 120}});
	const b = spring({frame: frame - 18, fps, config: {damping: 18, stiffness: 120}});
	const c = spring({frame: frame - 34, fps, config: {damping: 16, stiffness: 140}});
	const d = spring({frame: frame - 46, fps, config: {damping: 16, stiffness: 140}});
	const fadeOut = interpolate(frame, [dur - 20, dur], [1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
	return (
		<AbsoluteFill style={{backgroundColor: '#000'}}>
			<AbsoluteFill style={{opacity: inn * fadeOut}}>
				<Img
					src={staticFile('img/IMG_8566.jpg')}
					style={{width: '100%', height: '100%', objectFit: 'cover', objectPosition: '62% 35%', transform: `scale(${kb})`, transformOrigin: '60% 35%'}}
				/>
				<AbsoluteFill style={{background: 'linear-gradient(180deg, rgba(5,8,16,0.2) 0%, rgba(5,8,16,0) 30%, rgba(5,8,16,0.6) 58%, rgba(5,8,16,0.94) 82%)'}} />
				<div style={{position: 'absolute', left: SAFE.left, width: SAFE.right - SAFE.left, top: 1060}}>
					<div style={{overflow: 'hidden'}}>
						<div style={{fontFamily: SERIF, fontStyle: 'italic', fontWeight: 600, fontSize: 92, lineHeight: 1.05, color: C.white, transform: `translateY(${(1 - a) * 110}px)`}}>
							Your journey
						</div>
					</div>
					<div style={{overflow: 'hidden'}}>
						<div style={{fontFamily: SERIF, fontStyle: 'italic', fontWeight: 600, fontSize: 92, lineHeight: 1.1, color: C.gold, transform: `translateY(${(1 - b) * 110}px)`}}>
							could start here.
						</div>
					</div>
					<div style={{height: 3, width: 420, marginTop: 26, background: `linear-gradient(90deg, ${C.gold}, rgba(242,193,78,0))`, transform: `scaleX(${c})`, transformOrigin: 'left'}} />
					<div style={{marginTop: 24, fontFamily: SANS, fontWeight: 800, fontSize: 40, letterSpacing: 6, color: C.white, opacity: c, transform: `translateY(${(1 - c) * 20}px)`}}>
						TAR UMT PAHANG BRANCH
					</div>
					<div style={{marginTop: 10, fontFamily: SANS, fontWeight: 600, fontSize: 26, letterSpacing: 3, color: C.goldSoft, opacity: d}}>
						Congratulations, Class of 2026
					</div>
				</div>
			</AbsoluteFill>
		</AbsoluteFill>
	);
};
