import {loadFont} from '@remotion/fonts';
import {staticFile} from 'remotion';

export const C = {
	gold: '#F2C14E',
	goldSoft: '#E9C877',
	maroon: '#8E1B2B',
	ink: '#0B0F1A',
	white: '#FFFFFF',
	glass: 'rgba(11, 15, 26, 0.62)',
};

export const SANS = 'Montserrat';
export const SERIF = 'Playfair Display';

/** TikTok + IG Reels safe area (1080x1920): keep text/graphics inside this box. */
export const SAFE = {left: 64, right: 940, top: 236, bottom: 1480};
export const BAND_Y = 1092; // graphics band (below chin)
export const CAPTION_Y = 1300; // caption block top

const fonts: [string, string, string, string][] = [
	[SANS, 'montserrat-latin-500-normal.woff2', '500', 'normal'],
	[SANS, 'montserrat-latin-600-normal.woff2', '600', 'normal'],
	[SANS, 'montserrat-latin-700-normal.woff2', '700', 'normal'],
	[SANS, 'montserrat-latin-800-normal.woff2', '800', 'normal'],
	[SANS, 'montserrat-latin-900-normal.woff2', '900', 'normal'],
	[SERIF, 'playfair-display-latin-600-normal.woff2', '600', 'normal'],
	[SERIF, 'playfair-display-latin-700-normal.woff2', '700', 'normal'],
	[SERIF, 'playfair-display-latin-500-italic.woff2', '500', 'italic'],
	[SERIF, 'playfair-display-latin-600-italic.woff2', '600', 'italic'],
	[SERIF, 'playfair-display-latin-700-italic.woff2', '700', 'italic'],
];
for (const [family, file, weight, style] of fonts) {
	loadFont({family, url: staticFile(`fonts/${file}`), weight, style});
}
