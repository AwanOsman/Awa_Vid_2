"""Build the edit decision list: remove awkward pauses, fix transcript spelling.
Output: src/data/edl.json  {clip: {ranges:[[a,b]], words:[{w,s,e}], dur}}"""
import json, wave, numpy as np, sys, os
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
raw = json.load(open(f"{ROOT}/scripts/transcript_raw.json"))

# spelling fixes (whisper mishears names)
FIX = {"Dafei": "Tan", "Shen,": "Wei Xuan,", "Thai": "TAR", "Tayo": "TAR", "lecturer's": "lecturers'",
       "Tony": "", "Tai": "TAR", "An": "UMT", "Di": "", "supper.": "support.", "friend": "friends"}
# per-clip exact-token edits for captions
WORD_EDIT = {"Q6": {"friends": "Friends", "at": "at TAR"}, "Q4": {"up": "up."}, "Closing": {"Pahang.": "Pahang,", "All": "all"}}
# manual trims per clip: [start, end] of the usable take (source seconds)
TAKE = {"Introduction": [0.0, 11.40], "Q1": [0.0, 11.45], "Q2": [0.0, 10.30], "Q3": [0.45, 14.55],
        "Q4": [0.0, 12.18], "Q5": [0.0, 8.50], "Q6": [0.78, 6.50], "Closing": [0.0, 3.30]}
# pauses that must NOT be cut (source seconds inside the gap) - detector false positives mid-word
NOCUT = {"Q1": [11.08]}
# extra explicit cuts (source seconds)
CUT = {}
TH_DB, MIN_PAUSE, PAD = -34.0, 0.26, 0.08

def energy(path, hop=0.01):
    w = wave.open(path); sr = w.getframerate()
    x = np.frombuffer(w.readframes(w.getnframes()), np.int16).reshape(-1, w.getnchannels())[:, 0] / 32768
    h = int(hop * sr); n = len(x) // h
    rms = np.sqrt((x[:n*h].reshape(n, h) ** 2).mean(1))
    db = 20*np.log10(rms + 1e-9)
    db = np.convolve(db, np.ones(5)/5, mode="same")
    return db, hop, len(x)/sr

out = {}
for clip, (a, b) in TAKE.items():
    db, hop, dur = energy(f"{ROOT}/public/audio/{clip}.wav")
    silent = db < TH_DB
    ranges = []; cur = a; i = int(a/hop); end = int(b/hop)
    while i < end:
        if silent[i]:
            j = i
            while j < end and silent[j]: j += 1
            s0, s1 = i*hop, j*hop
            if s1 - s0 >= MIN_PAUSE:
                if s0 <= a + 0.001:      # leading silence
                    cur = max(a, s1 - PAD)
                elif j >= end:           # trailing silence
                    pass
                else:
                    ranges.append([round(cur, 3), round(s0 + PAD, 3)]); cur = s1 - PAD
            i = j
        else: i += 1
    # trailing: end at last voiced frame + pad
    voiced = np.where(~silent[int(a/hop):end])[0]
    last = (int(a/hop) + voiced[-1]) * hop + PAD*1.6 if len(voiced) else b
    ranges.append([round(cur, 3), round(min(b, last), 3)])
    for c0, c1 in CUT.get(clip, []):
        nr = []
        for r0, r1 in ranges:
            if c1 <= r0 or c0 >= r1: nr.append([r0, r1]); continue
            if r0 < c0: nr.append([r0, c0])
            if c1 < r1: nr.append([c1, r1])
        ranges = nr
    for t0 in NOCUT.get(clip, []):
        for k in range(len(ranges) - 1):
            if ranges[k][1] <= t0 <= ranges[k + 1][0]:
                ranges[k:k + 2] = [[ranges[k][0], ranges[k + 1][1]]]; break
    ranges = [r for r in ranges if r[1] - r[0] > 0.12]
    words = []
    for w in raw[clip]:
        t = FIX.get(w["w"], w["w"])
        t = WORD_EDIT.get(clip, {}).get(t, t)
        if not t: continue
        if w["e"] <= a or w["s"] >= b - 0.05: continue
        words.append({"w": t, "s": max(w["s"], a), "e": w["e"]})
    kept = sum(r1 - r0 for r0, r1 in ranges)
    out[clip] = {"ranges": ranges, "words": words, "srcDur": round(dur, 3)}
    print(f"{clip:13s} {b-a:5.2f}s -> {kept:5.2f}s  cuts={len(ranges)-1}  {ranges}")
json.dump(out, open(f"{ROOT}/src/data/edl.json", "w"), indent=1)
