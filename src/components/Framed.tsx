import {Easing, Freeze, interpolate, OffthreadVideo, staticFile, useCurrentFrame} from 'remotion';
import {ClipId, faceX, FACE, FPS, H, W} from '../timeline';

const SRC_W = 1920;
const SRC_H = 1080;

/**
 * Crops the 16:9 source to 9:16, centred on the face.
 * zoom 1 = full-height crop; >1 punches in while keeping the face at ~y=740.
 */
export const Framed: React.FC<{
	clip: ClipId;
	trimBefore: number; // source frame
	zoom: number;
	durationInFrames: number;
	push?: number; // extra slow push-in over the segment
	freeze?: boolean;
}> = ({clip, trimBefore, zoom, durationInFrames, push = 0.03, freeze}) => {
	const frame = useCurrentFrame();
	const p = interpolate(frame, [0, Math.max(1, durationInFrames)], [0, 1], {
		extrapolateLeft: 'clamp',
		extrapolateRight: 'clamp',
		easing: Easing.inOut(Easing.sin),
	});
	const z = zoom * (1 + push * p);
	const k = (H / SRC_H) * z;
	const t = trimBefore / FPS + frame / FPS;
	const cx = faceX(clip, t);
	const cy = FACE[clip].cy;
	let left = W / 2 - cx * k;
	left = Math.min(0, Math.max(W - SRC_W * k, left));
	let top = 740 - cy * k;
	top = Math.min(0, Math.max(H - SRC_H * k, top));

	const video = (
		<OffthreadVideo
			src={staticFile(`video/${clip}.mp4`)}
			trimBefore={trimBefore}
			muted
			style={{width: SRC_W, height: SRC_H}}
		/>
	);
	return (
		<div style={{position: 'absolute', inset: 0, overflow: 'hidden', backgroundColor: '#000'}}>
			<div
				style={{
					position: 'absolute',
					width: SRC_W,
					height: SRC_H,
					left: 0,
					top: 0,
					transformOrigin: '0 0',
					transform: `translate(${left}px, ${top}px) scale(${k})`,
				}}
			>
				{freeze ? <Freeze frame={0}>{video}</Freeze> : video}
			</div>
		</div>
	);
};
