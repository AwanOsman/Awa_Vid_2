# Interview edit: Tan Wei Xuan (Remotion)

A 9:16 (1080x1920) semi-formal interview for TikTok and IG Reels. Valedictorian, TAR UMT Pahang Branch 2026.

## Structure
Cold-open hook → title card (awards) → intro → 6 × (question card → answer) → closing → end card.

## Setup
1. Download the Drive folder into `SRC` (for example with `gdown --folder <url>`).
2. Video proxies (HLG HDR → SDR H.264, 30fps) go in `public/video/` (see the ffmpeg command in the commit history notes).
3. `./scripts/process_audio.sh "$SRC" public/audio` runs voice denoise, EQ and compression, then normalizes to -16 LUFS.
4. Copy the photos to `public/img/IMG_856{4,5,6}.jpg`.
5. `python3 scripts/make_sfx.py public/sfx` synthesizes the SFX kit, which is license-free.
6. `python3 scripts/gen_edl.py` cuts the pauses and builds `src/data/edl.json` from the transcript.

## Render
- `npm run studio`: live preview
- `npm run preview`: half-resolution preview
- `npm run render`: final

Music: "Inspiration" (FreePD, public domain / CC0).
