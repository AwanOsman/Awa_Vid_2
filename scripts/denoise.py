"""Spectral-gate denoise using each clip's quietest 0.4s as the noise profile."""
import sys, numpy as np, noisereduce as nr
from scipy.io import wavfile
from scipy import signal
src, dst = sys.argv[1], sys.argv[2]
sr, x = wavfile.read(src); x = x.astype(np.float32)
x = signal.sosfilt(signal.butter(4, 90/(sr/2), 'high', output='sos'), x)
win = int(0.4*sr); hop = int(0.05*sr)
rms = [np.sqrt(np.mean(x[i:i+win]**2)) for i in range(0, len(x)-win, hop)]
i0 = int(np.argmin(rms))*hop
y = nr.reduce_noise(y=x, sr=sr, y_noise=x[i0:i0+win], stationary=True, prop_decrease=0.9, n_std_thresh_stationary=1.3)
wavfile.write(dst, sr, y.astype(np.float32))
