#!/usr/bin/env bash
# Voice chain: extract -> spectral denoise (python) -> EQ -> gentle comp -> linear gain to -16 LUFS -> limiter
set -e
SRC="$1"; OUT="$2"; TMP=$(mktemp -d)
for f in Introduction Q1 Q2 Q3 Q4 Q5 Q6 Closing; do
  ffmpeg -v error -y -i "$SRC/$f.MP4" -map 0:a:0 -ac 1 -ar 48000 -c:a pcm_f32le "$TMP/$f.wav"
  python3 -I "$(dirname "$0")/denoise.py" "$TMP/$f.wav" "$TMP/${f}_nr.wav"
  CH="equalizer=f=250:t=q:w=1:g=-1.5,equalizer=f=3800:t=q:w=1.2:g=2.5,equalizer=f=9000:t=h:w=1:g=1.5,acompressor=threshold=-24dB:ratio=2.5:attack=8:release=120:makeup=1"
  I=$(ffmpeg -hide_banner -i "$TMP/${f}_nr.wav" -af "$CH,ebur128" -f null - 2>&1 | grep -A1 "Integrated loudness" | grep -o "I: *-\?[0-9.]*" | tail -1 | grep -o "\-\?[0-9.]*")
  G=$(python3 -c "print(round(-16-($I),2))")
  ffmpeg -v error -y -i "$TMP/${f}_nr.wav" -af "$CH,volume=${G}dB,alimiter=limit=0.89:level=false" -ar 48000 -ac 2 -c:a pcm_s16le "$OUT/$f.wav"
  echo "$f measured $I LUFS gain $G dB"
done
rm -rf "$TMP"
