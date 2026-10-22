"""Render an original mellow minor-key lounge loop. Requires numpy, scipy, ffmpeg.
No samples, melodies or recordings from existing soundtracks are used.
"""
from pathlib import Path
import subprocess, tempfile
import numpy as np
from scipy.signal import butter,sosfilt
from scipy.io.wavfile import write
SR=32000; BPM=74; BEAT=60/BPM; BARS=16; DURATION=BARS*4*BEAT
rng=np.random.default_rng(74023); out=np.zeros((round(SR*DURATION),2),dtype=np.float64)
def hz(m):return 440*2**((m-69)/12)
def add(t,y,amp=1,pan=0):
    at=round(t*SR); ids=(at+np.arange(len(y)))%len(out)
    out[ids,0]+=y*amp*np.sqrt((1-pan)/2);out[ids,1]+=y*amp*np.sqrt((1+pan)/2)
def pluck(m,d=2.0,warm=1):
    t=np.arange(round(d*SR))/SR; f=hz(m); y=np.zeros_like(t)
    for k in range(1,13):
        y+=np.sin(2*np.pi*f*k*t+.08*k)*np.exp(-t*(1.8+k*.48))/(k**(1.45+warm*.18))
    return y*(1-np.exp(-t*300))*.4

def keys(m,d=2.2):
    t=np.arange(round(d*SR))/SR;f=hz(m)
    return (np.sin(2*np.pi*f*t+1.3*np.sin(2*np.pi*f*2*t)*np.exp(-t*6))+.16*np.sin(2*np.pi*f*3*t))*np.exp(-t*2)*(1-np.exp(-t*100))*.28

def bass(m):
    t=np.arange(round(1.2*SR))/SR;f=hz(m)
    return (np.sin(2*np.pi*f*t)+.25*np.sin(2*np.pi*f*2*t)+.09*np.sin(2*np.pi*f*3*t))*np.exp(-t*3.7)*(1-np.exp(-t*180))*.44
# Am9, Dm9, G13, Cmaj9, Fmaj9, B half-diminished, E7(b9), Am9.
chords=[[57,60,64,67,71],[53,57,60,64,69],[53,57,59,64,69],[52,55,59,62,67],[53,57,60,64,67],[53,57,59,62,65],[52,56,59,62,65],[52,57,60,64,71]]
roots=[33,38,31,36,29,35,28,33]
for bar in range(BARS):
    start=bar*4*BEAT;c=chords[bar%8];root=roots[bar%8]
    for j,n in enumerate(c):add(start+.015*j,pluck(n),.18,pan=-.35+j*.13)
    for beat,n in [(0,root),(2,root+7),(3.5,root+12 if bar%2 else root+7)]:add(start+beat*BEAT,bass(n),.28 if beat==0 else .19,pan=-.08)
    if bar%2==0:
        for j,n in enumerate([c[2]+12,c[4],c[1]+12]):add(start+(1.5+j*.75)*BEAT,keys(n),.17,pan=.32)
    else:
        for j,n in enumerate([c[3]+12,c[2]+12]):add(start+(1+j*1.5)*BEAT,pluck(n,2.4),.16,pan=.2)
    for b in range(4):
        t=np.arange(round(.18*SR))/SR;noise=sosfilt(butter(2,[2200,7000],fs=SR,btype='bandpass',output='sos'),rng.normal(size=len(t)))
        add(start+(b+.05)*BEAT,noise*np.exp(-t*32)*(1-np.exp(-t*400)),.023 if b%2 else .012,pan=-.35)
    for b in [1,3]:
        t=np.arange(round(.32*SR))/SR;noise=sosfilt(butter(2,[700,4600],fs=SR,btype='bandpass',output='sos'),rng.normal(size=len(t)))
        env=np.sin(np.minimum(t/.07,1)*np.pi/2)*np.exp(-t*12)
        add(start+b*BEAT,noise*env,.025,pan=.2)
# Quiet circular room reflections preserve continuity at the loop boundary.
dry=out.copy()
for delay,gain in [(.079,.13),(.137,.09),(.223,.065),(.337,.04)]:out+=np.roll(dry[:,::-1],round(delay*SR),axis=0)*gain
out=sosfilt(butter(2,7200,fs=SR,output='sos'),out,axis=0)
out=np.tanh(out*1.3);out*=.72/max(.001,np.max(np.abs(out)))
path=Path(__file__).resolve().parents[1]/'public/audio/night-table.mp3';path.parent.mkdir(parents=True,exist_ok=True)
with tempfile.TemporaryDirectory() as temp:
    wav=Path(temp)/'original-loop.wav';write(wav,SR,(out*32767).astype(np.int16))
    subprocess.run(['ffmpeg','-v','error','-y','-i',str(wav),'-af','loudnorm=I=-21:TP=-3:LRA=8','-ar','44100','-codec:a','libmp3lame','-b:a','112k','-metadata','title=Night Table','-metadata','comment=Original synthesized lounge composition for Lexio Jangseong',str(path)],check=True)
print(f'Original Night Table loop: {DURATION:.1f}s, {path.stat().st_size} bytes')
