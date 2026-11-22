import {Composition} from 'remotion';
import {Interview} from './Interview';
import {FPS, H, TIMELINE, W} from './timeline';

export const RemotionRoot: React.FC = () => (
	<Composition id="Interview" component={Interview} durationInFrames={TIMELINE.total} fps={FPS} width={W} height={H} />
);
