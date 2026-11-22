import React from 'react';
import {AbsoluteFill, Audio, Easing, Img, interpolate, Sequence, spring, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {BAND_Y, C, SAFE, SANS, SERIF} from '../theme';

/* ---------------- Icons (inline SVG, no emoji font needed) ---------------- */
export type IconName =
	| 'check' | 'pin' | 'cap' | 'home' | 'heart' | 'search' | 'spark' | 'person' | 'clock' | 'medal' | 'calendar'
	| 'list' | 'mic' | 'users' | 'star' | 'x' | 'book';

export const Icon: React.FC<{name: IconName; size?: number; color?: string; stroke?: number}> = ({
	name,
	size = 34,
	color = C.ink,
	stroke = 2.4,
}) => {
	const p = {fill: 'none', stroke: color, strokeWidth: stroke, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const};
	const paths: Record<IconName, React.ReactNode> = {
		check: <path d="M5 12.5l4.5 4.5L19 7.5" {...p} />,
		x: <path d="M6 6l12 12M18 6L6 18" {...p} />,
		pin: (
			<>
				<path d="M12 21s-6.5-6.1-6.5-11A6.5 6.5 0 0 1 18.5 10c0 4.9-6.5 11-6.5 11z" {...p} />
				<circle cx="12" cy="10" r="2.4" {...p} />
			</>
		),
		cap: (
			<>
				<path d="M2.5 9.5L12 5l9.5 4.5L12 14z" {...p} />
				<path d="M6.5 11.5v4.2c0 1.4 2.5 2.8 5.5 2.8s5.5-1.4 5.5-2.8v-4.2M21.5 9.5v5" {...p} />
			</>
		),
		home: (
			<>
				<path d="M3.5 11L12 4l8.5 7" {...p} />
				<path d="M6 9.5V20h12V9.5M10 20v-5h4v5" {...p} />
			</>
		),
		heart: <path d="M12 20s-7.5-4.6-7.5-10A4.3 4.3 0 0 1 12 7.4 4.3 4.3 0 0 1 19.5 10c0 5.4-7.5 10-7.5 10z" {...p} />,
		search: (
			<>
				<circle cx="10.5" cy="10.5" r="6" {...p} />
				<path d="M15 15l5 5" {...p} />
			</>
		),
		spark: (
			<path d="M12 3l1.8 5.4L19 10.2l-5.2 1.8L12 17.5l-1.8-5.5L5 10.2l5.2-1.8zM18.5 15.5l.8 2.2 2.2.8-2.2.8-.8 2.2-.8-2.2-2.2-.8 2.2-.8z" {...p} />
		),
		person: (
			<>
				<circle cx="12" cy="8" r="3.6" {...p} />
				<path d="M4.5 20.5c.8-4 3.8-6 7.5-6s6.7 2 7.5 6" {...p} />
			</>
		),
		users: (
			<>
				<circle cx="9" cy="8.5" r="3.2" {...p} />
				<path d="M3 19.5c.6-3.4 3-5.2 6-5.2s5.4 1.8 6 5.2" {...p} />
				<path d="M15.5 5.6a3.1 3.1 0 0 1 0 5.9M17.5 14.5c2 .6 3.2 2.3 3.5 5" {...p} />
			</>
		),
		clock: (
			<>
				<circle cx="12" cy="12" r="8.5" {...p} />
				<path d="M12 7.5V12l3 2" {...p} />
			</>
		),
		medal: (
			<>
				<path d="M8 3l2.5 6M16 3l-2.5 6" {...p} />
				<circle cx="12" cy="14.5" r="5.5" {...p} />
				<path d="M12 12l.9 1.8 2 .3-1.4 1.4.3 2-1.8-.9-1.8.9.3-2-1.4-1.4 2-.3z" {...p} />
			</>
		),
		calendar: (
			<>
				<rect x="4" y="5.5" width="16" height="14.5" rx="2.5" {...p} />
				<path d="M4 10h16M8.5 3.5v4M15.5 3.5v4" {...p} />
			</>
		),
		list: <path d="M9 7h11M9 12h11M9 17h11M4.5 7h.01M4.5 12h.01M4.5 17h.01" {...p} />,
		mic: (
			<>
				<rect x="9" y="3" width="6" height="11" rx="3" {...p} />
				<path d="M5.5 11a6.5 6.5 0 0 0 13 0M12 17.5V21" {...p} />
			</>
		),
		star: <path d="M12 3.5l2.6 5.4 5.9.8-4.3 4.1 1 5.8L12 16.8l-5.2 2.8 1-5.8-4.3-4.1 5.9-.8z" {...p} />,
		book: (
			<>
				<path d="M4 5.5C6.5 4.5 9.5 4.5 12 6c2.5-1.5 5.5-1.5 8-.5v13c-2.5-1-5.5-1-8 .5-2.5-1.5-5.5-1.5-8-.5z" {...p} />
				<path d="M12 6v13.5" {...p} />
			</>
		),
	};
	return (
		<svg width={size} height={size} viewBox="0 0 24 24">
			{paths[name]}
		</svg>
	);
};

/* ---------------- One-shot sound effect ---------------- */
export type SfxName =
	| 'pop' | 'whoosh' | 'swoosh_soft' | 'impact' | 'riser' | 'shimmer' | 'tick' | 'ding' | 'shutter' | 'transition' | 'typing' | 'subdrop';
export const Sfx: React.FC<{at: number; name: SfxName; vol?: number}> = ({at, name, vol = 0.35}) => (
	<Sequence from={Math.round(at)} durationInFrames={150} layout="none" name={`sfx:${name}`}>
		<Audio src={staticFile(`sfx/${name}.wav`)} volume={vol} />
	</Sequence>
);

/* ---------------- Animated pill ---------------- */
export const Pill: React.FC<{
	at: number; // local frame to appear
	until?: number; // local frame to disappear
	icon?: IconName;
	label: string;
	tone?: 'glass' | 'gold' | 'dim';
	size?: number;
	style?: React.CSSProperties;
	sfx?: SfxName | false;
}> = ({sfx = 'pop', ...props}) => (
	<>
		{sfx ? <Sfx at={props.at} name={sfx} vol={0.3} /> : null}
		<PillVisual {...props} />
	</>
);

const PillVisual: React.FC<{
	at: number;
	until?: number;
	icon?: IconName;
	label: string;
	tone?: 'glass' | 'gold' | 'dim';
	size?: number;
	style?: React.CSSProperties;
}> = ({at, until, icon, label, tone = 'glass', size = 36, style}) => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();
	if (frame < at) return null;
	const s = spring({frame: frame - at, fps, config: {damping: 13, stiffness: 210, mass: 0.7}});
	const out = until !== undefined ? interpolate(frame, [until - 6, until], [1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}) : 1;
	if (out <= 0) return null;
	const gold = tone === 'gold';
	return (
		<div
			style={{
				display: 'inline-flex',
				alignItems: 'center',
				gap: 14,
				padding: `${size * 0.36}px ${size * 0.7}px ${size * 0.36}px ${size * 0.36}px`,
				borderRadius: 999,
				background: gold ? `linear-gradient(135deg, ${C.gold}, #D9A42E)` : C.glass,
				border: gold ? '2px solid rgba(255,255,255,0.35)' : '2px solid rgba(242,193,78,0.55)',
				boxShadow: '0 10px 30px rgba(0,0,0,0.35)',
				backdropFilter: 'blur(14px)',
				transform: `translateY(${(1 - s) * 30}px) scale(${0.6 + 0.4 * s})`,
				transformOrigin: 'left center',
				opacity: Math.min(1, s * 1.5) * out * (tone === 'dim' ? 0.45 : 1),
				...style,
			}}
		>
			{icon ? (
				<div
					style={{
						width: size * 1.35,
						height: size * 1.35,
						borderRadius: 999,
						background: gold ? C.ink : C.gold,
						display: 'flex',
						alignItems: 'center',
						justifyContent: 'center',
					}}
				>
					<Icon name={icon} size={size * 0.9} color={gold ? C.gold : C.ink} />
				</div>
			) : null}
			<span
				style={{
					fontFamily: SANS,
					fontWeight: 700,
					fontSize: size,
					color: gold ? C.ink : C.white,
					whiteSpace: 'nowrap',
					letterSpacing: -0.3,
				}}
			>
				{label}
			</span>
		</div>
	);
};

/** Absolute container for the graphics band below the chin. */
export const Band: React.FC<{children: React.ReactNode; y?: number; gap?: number; column?: boolean}> = ({
	children,
	y = BAND_Y,
	gap = 14,
	column,
}) => (
	<div
		style={{
			position: 'absolute',
			left: SAFE.left,
			width: SAFE.right - SAFE.left,
			top: y,
			display: 'flex',
			flexDirection: column ? 'column' : 'row',
			flexWrap: 'wrap',
			gap,
			alignItems: column ? 'flex-start' : 'center',
		}}
	>
		{children}
	</div>
);

/* ---------------- Topic chip (top-left, outside face) ---------------- */
export const TopicChip: React.FC<{label: string; title: string; dur: number}> = ({label, title, dur}) => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();
	const s = spring({frame: frame - 4, fps, config: {damping: 18, stiffness: 160}});
	const out = interpolate(frame, [dur - 8, dur], [1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
	return (
		<div
			style={{
				position: 'absolute',
				left: SAFE.left,
				top: SAFE.top,
				opacity: s * out,
				transform: `translateX(${(1 - s) * -40}px)`,
				display: 'flex',
				gap: 14,
				alignItems: 'stretch',
				padding: '12px 22px 12px 14px',
				borderRadius: 18,
				background: 'rgba(8, 11, 20, 0.58)',
				backdropFilter: 'blur(12px)',
			}}
		>
			<div style={{width: 5, borderRadius: 3, background: C.gold, transform: `scaleY(${s})`}} />
			<div style={{display: 'flex', flexDirection: 'column', gap: 2}}>
				<span style={{fontFamily: SANS, fontWeight: 700, fontSize: 21, letterSpacing: 5, color: C.gold, textShadow: '0 2px 8px rgba(0,0,0,0.6)'}}>
					{label}
				</span>
				<span style={{fontFamily: SERIF, fontStyle: 'italic', fontWeight: 600, fontSize: 36, color: C.white, textShadow: '0 2px 12px rgba(0,0,0,0.6)'}}>
					{title}
				</span>
			</div>
		</div>
	);
};

/* ---------------- Lower third ---------------- */
export const LowerThird: React.FC<{at: number; until: number; name: string; sub: string}> = ({at, until, name, sub}) => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();
	if (frame < at || frame > until) return null;
	const s = spring({frame: frame - at, fps, config: {damping: 20, stiffness: 140}});
	const s2 = spring({frame: frame - at - 6, fps, config: {damping: 20, stiffness: 140}});
	const out = interpolate(frame, [until - 8, until], [1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
	return (
		<div style={{position: 'absolute', left: SAFE.left, top: BAND_Y - 4, display: 'flex', gap: 18, opacity: out}}>
			<div style={{width: 6, background: C.gold, borderRadius: 3, transform: `scaleY(${s})`, transformOrigin: 'top'}} />
			<div style={{overflow: 'hidden'}}>
				<div
					style={{
						fontFamily: SERIF,
						fontWeight: 700,
						fontSize: 70,
						lineHeight: 1.05,
						color: C.white,
						transform: `translateY(${(1 - s) * 90}px)`,
						textShadow: '0 4px 18px rgba(0,0,0,0.5)',
					}}
				>
					{name}
				</div>
				<div
					style={{
						fontFamily: SANS,
						fontWeight: 600,
						fontSize: 27,
						letterSpacing: 1.5,
						color: C.gold,
						marginTop: 8,
						transform: `translateY(${(1 - s2) * 50}px)`,
						opacity: s2,
						textShadow: '0 2px 10px rgba(0,0,0,0.6)',
					}}
				>
					{sub}
				</div>
			</div>
		</div>
	);
};

/* ---------------- Full-frame photo cutaway (B-roll) ---------------- */
export const PhotoCutaway: React.FC<{
	src: string;
	dur: number;
	focus?: [number, number]; // object-position %
	zoomFrom?: number;
	zoomTo?: number;
	panX?: number;
}> = ({src, dur, focus = [50, 40], zoomFrom = 1.12, zoomTo = 1.0, panX = 0}) => {
	const frame = useCurrentFrame();
	const p = interpolate(frame, [0, dur], [0, 1], {extrapolateRight: 'clamp', easing: Easing.out(Easing.quad)});
	const inn = interpolate(frame, [0, 7], [0, 1], {extrapolateRight: 'clamp', easing: Easing.out(Easing.cubic)});
	const out = interpolate(frame, [dur - 6, dur], [1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
	const flash = interpolate(frame, [0, 2, 7], [0, 0.55, 0], {extrapolateRight: 'clamp'});
	return (
		<AbsoluteFill style={{opacity: inn * out}}>
			<Img
				src={staticFile(src)}
				style={{
					width: '100%',
					height: '100%',
					objectFit: 'cover',
					objectPosition: `${focus[0]}% ${focus[1]}%`,
					transform: `scale(${zoomFrom + (zoomTo - zoomFrom) * p}) translateX(${panX * p}px)`,
					filter: `blur(${(1 - inn) * 12}px)`,
				}}
			/>
			<AbsoluteFill style={{background: 'linear-gradient(180deg, rgba(0,0,0,0) 50%, rgba(0,0,0,0.55) 100%)'}} />
			<AbsoluteFill style={{background: '#fff', opacity: flash}} />
		</AbsoluteFill>
	);
};

/* ---------------- Bottom legibility gradient ---------------- */
export const BottomShade: React.FC<{strength?: number}> = ({strength = 0.55}) => (
	<AbsoluteFill
		style={{
			background: `linear-gradient(180deg, rgba(0,0,0,0) 52%, rgba(0,0,0,${strength * 0.6}) 66%, rgba(0,0,0,${strength}) 100%)`,
		}}
	/>
);

/* ---------------- Countdown ring ---------------- */
export const TimerRing: React.FC<{at: number; seconds: number; stopAt: number; until: number}> = ({at, seconds, stopAt, until}) => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();
	if (frame < at || frame > until) return null;
	const s = spring({frame: frame - at, fps, config: {damping: 14, stiffness: 180}});
	const elapsed = (Math.min(frame, stopAt) - at) / fps;
	const left = Math.max(0, seconds - elapsed);
	const done = frame >= stopAt;
	const R = 54;
	const circ = 2 * Math.PI * R;
	const out = interpolate(frame, [until - 8, until], [1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
	const doneS = spring({frame: frame - stopAt, fps, config: {damping: 10, stiffness: 200}});
	return (
		<div style={{display: 'flex', alignItems: 'center', gap: 20, opacity: s * out, transform: `scale(${0.7 + 0.3 * s})`, transformOrigin: 'left center'}}>
			<div style={{position: 'relative', width: 136, height: 136}}>
				<svg width={136} height={136} style={{position: 'absolute', inset: 0}}>
					<circle cx={68} cy={68} r={R + 8} fill={C.glass} />
					<circle cx={68} cy={68} r={R} fill="none" stroke="rgba(255,255,255,0.18)" strokeWidth={9} />
					<circle
						cx={68}
						cy={68}
						r={R}
						fill="none"
						stroke={done ? '#5EE08A' : C.gold}
						strokeWidth={9}
						strokeLinecap="round"
						strokeDasharray={circ}
						strokeDashoffset={circ * (1 - left / seconds)}
						transform="rotate(-90 68 68)"
					/>
				</svg>
				<div
					style={{
						position: 'absolute',
						inset: 0,
						display: 'flex',
						alignItems: 'center',
						justifyContent: 'center',
						fontFamily: SANS,
						fontWeight: 800,
						fontSize: done ? 40 : 50,
						color: C.white,
					}}
				>
					{done ? <Icon name="check" size={58} color="#5EE08A" stroke={3.2} /> : Math.ceil(left)}
				</div>
			</div>
			<div style={{display: 'flex', flexDirection: 'column'}}>
				<span style={{fontFamily: SANS, fontWeight: 700, fontSize: 22, letterSpacing: 5, color: C.gold, textShadow: '0 2px 8px rgba(0,0,0,0.6)'}}>
					{done ? 'PITCH COMPLETE' : 'THE 10-SECOND PITCH'}
				</span>
				<span
					style={{
						fontFamily: SANS,
						fontWeight: 800,
						fontSize: 44,
						color: C.white,
						textShadow: '0 3px 12px rgba(0,0,0,0.6)',
						transform: done ? `scale(${0.8 + 0.2 * doneS})` : undefined,
						transformOrigin: 'left center',
					}}
				>
					{done ? `Done in ${elapsed.toFixed(1)}s` : `${left.toFixed(1)}s left`}
				</span>
			</div>
		</div>
	);
};
