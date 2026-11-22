"""Synthesize a clean, license-free SFX kit (48kHz stereo WAV)."""
import numpy as np, sys, os
from scipy import signal
from scipy.io import wavfile
SR = 48000
out = sys.argv[1]; os.makedirs(out, exist_ok=True)
rng = np.random.default_rng(7)

def t(d): return np.arange(int(d*SR))/SR
def env(n, a, r, curve=4):
    x = np.ones(n); na=int(a*SR); nr=int(r*SR)
    if na: x[:na] = np.linspace(0,1,na)**2
    if nr: x[-nr:] *= np.linspace(1,0,nr)**curve
    return x
def reverb(x, dur=1.6, mix=0.25, damp=3.0, seed=1):
    r = np.random.default_rng(seed)
    n = int(dur*SR); ir = r.standard_normal((2,n)) * np.exp(-damp*np.arange(n)/SR*3)
    b,a = signal.butter(2, 6000/(SR/2)); ir = signal.lfilter(b,a,ir)
    ir /= np.abs(ir).sum(axis=1, keepdims=True)**0.5*30
    if x.ndim==1: x=np.stack([x,x])
    wet = np.stack([np.pad(signal.fftconvolve(x[i], ir[i]),(0,1))[:x.shape[1]+n] for i in range(2)])
    dry = np.pad(x, ((0,0),(0,n)))
    return dry*(1-mix) + wet*mix*4
def sweep_bp(noise, f0, f1, q=2.0, steps=64):
    y = np.zeros_like(noise); L=len(noise); seg=L//steps
    zi=None
    freqs = np.geomspace(f0,f1,steps)
    for i,f in enumerate(freqs):
        lo=max(20,f/ (1+1/q)); hi=min(SR/2-100, f*(1+1/q))
        sos = signal.butter(2,[lo/(SR/2),hi/(SR/2)],'band',output='sos')
        s=slice(i*seg, L if i==steps-1 else (i+1)*seg)
        if zi is None: zi = signal.sosfilt_zi(sos)*0
        y[s], zi = signal.sosfilt(sos, noise[s], zi=zi)
    return y
def pan_st(x, p):  # p array -1..1
    l = np.cos((p+1)*np.pi/4); r = np.sin((p+1)*np.pi/4)
    return np.stack([x*l, x*r])
def save(name, x, peak=0.89):
    if x.ndim==1: x=np.stack([x,x])
    x = x/ (np.abs(x).max()+1e-9) * peak
    # trim trailing silence
    e = np.abs(x).max(axis=0); idx=np.where(e>1e-3)[0]; x=x[:, :idx[-1]+1 if len(idx) else 1]
    fade=int(0.01*SR); x[:,-fade:]*=np.linspace(1,0,fade)
    wavfile.write(f"{out}/{name}.wav", SR, (x.T*32767).astype(np.int16))

# 1. whoosh (fast, airy, stereo pass L->R)
d=0.55; n=int(d*SR); nz=rng.standard_normal(n)
w = sweep_bp(nz, 300, 5000, q=1.5)*env(n,0.32,0.22,2)
w2 = sweep_bp(rng.standard_normal(n), 120, 900, q=1.2)*env(n,0.3,0.25,2)*0.6
save("whoosh", reverb(pan_st(w+w2, np.linspace(-0.8,0.8,n)), 0.8, 0.18))
# 2. swoosh soft (for captions/labels)
d=0.35; n=int(d*SR)
w = sweep_bp(rng.standard_normal(n), 900, 7000, q=2)*env(n,0.18,0.15,2)
save("swoosh_soft", reverb(pan_st(w, np.linspace(0.5,-0.5,n)),0.5,0.15), 0.6)
# 3. cinematic impact / boom
d=2.2; tt=t(d); n=len(tt)
f = 30+60*np.exp(-tt*9); ph=2*np.pi*np.cumsum(f)/SR
sub = np.sin(ph)*np.exp(-tt*2.2)
click = rng.standard_normal(n)*np.exp(-tt*60); click = signal.sosfilt(signal.butter(2,[200/(SR/2),4000/(SR/2)],'band',output='sos'),click)
body = signal.sosfilt(signal.butter(2,400/(SR/2),output='sos'), rng.standard_normal(n))*np.exp(-tt*6)*3
save("impact", reverb(sub*1.0+click*0.5+body*0.5, 2.0, 0.3, 1.5))
# 4. riser (2.0s) noise + rising tone, ends abruptly
d=2.0; tt=t(d); n=len(tt)
nz = sweep_bp(rng.standard_normal(n), 400, 9000, q=1.8)*(tt/d)**2.2
tone = sum(np.sin(2*np.pi*np.cumsum(np.geomspace(f0,f0*4,n))/SR) for f0 in (110,165,220))*((tt/d)**3)*0.15
save("riser", reverb(nz+tone,1.0,0.2), 0.75)
# 5. shimmer / sparkle (awards reveal)
d=1.8; tt=t(d); x=np.zeros(len(tt))
notes=[1318.5,1568,1975.5,2637,3136,3951]
for i,fq in enumerate(notes):
    st=int(i*0.06*SR); tl=tt[:len(tt)-st]
    tone=(np.sin(2*np.pi*fq*tl)+0.3*np.sin(2*np.pi*fq*2.01*tl))*np.exp(-tl*3.5)
    x[st:]+=tone*(0.9**i)
save("shimmer", reverb(x,2.0,0.45,1.5), 0.6)
# 6. pop (UI bubble) 
d=0.18; tt=t(d); f=900*np.exp(-tt*25)+300; ph=2*np.pi*np.cumsum(f)/SR
save("pop", reverb(np.sin(ph)*np.exp(-tt*28),0.3,0.1), 0.7)
# 7. click/tick (typewriter-ish soft key)
d=0.05; tt=t(d)
k = signal.sosfilt(signal.butter(2,[1500/(SR/2),8000/(SR/2)],'band',output='sos'), rng.standard_normal(len(tt)))*np.exp(-tt*180)
k += np.sin(2*np.pi*2200*tt)*np.exp(-tt*250)*0.4
save("tick", k, 0.5)
# 8. ding (soft notification / highlight)
d=1.5; tt=t(d)
x = sum(a*np.sin(2*np.pi*fq*tt)*np.exp(-tt*dk) for fq,a,dk in [(1760,1,3),(3520,0.35,5),(5280,0.12,8),(2637,0.25,4)])
save("ding", reverb(x*env(len(tt),0.002,0.3),1.2,0.3), 0.55)
# 9. camera shutter (photo reveal)
d=0.25; tt=t(d); n=len(tt)
c = signal.sosfilt(signal.butter(2,[800/(SR/2),9000/(SR/2)],'band',output='sos'), rng.standard_normal(n))
e = np.exp(-tt*120); e2=np.zeros(n); s=int(0.09*SR); e2[s:]=np.exp(-tt[:n-s]*90)
save("shutter", reverb(c*(e+0.8*e2),0.4,0.12), 0.7)
# 10. transition hit (whoosh into soft boom)
w=np.load if False else None
wh = sweep_bp(rng.standard_normal(int(0.45*SR)), 200, 6000, q=1.4)*env(int(0.45*SR),0.38,0.05,1)
tt=t(1.4); f=40+50*np.exp(-tt*10); boom=np.sin(2*np.pi*np.cumsum(f)/SR)*np.exp(-tt*3)
x=np.concatenate([wh*0.8, np.zeros(len(tt))]); x[len(wh):]+=boom
save("transition", reverb(x,1.5,0.25,2))
# 11. typing burst (question reveal) ~ 1.2s of ticks
x=np.zeros(int(1.3*SR)); kk=np.load if False else None
tk = signal.sosfilt(signal.butter(2,[1200/(SR/2),7000/(SR/2)],'band',output='sos'), rng.standard_normal(int(0.04*SR)))*np.exp(-t(0.04)*200)
pos=0.0
while pos<1.2:
    i=int(pos*SR); x[i:i+len(tk)]+=tk*rng.uniform(0.5,1.0); pos+=rng.uniform(0.045,0.09)
save("typing", reverb(x,0.3,0.1), 0.45)
# 12. sub drop / bass hit for title
tt=t(1.6); f=55*np.exp(-tt*1.2)+25
save("subdrop", np.sin(2*np.pi*np.cumsum(f)/SR)*env(len(tt),0.005,0.8,2))
print(sorted(os.listdir(out)))
