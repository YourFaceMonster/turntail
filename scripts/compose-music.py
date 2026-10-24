"""Original, deterministic four-scene instrumental loops. numpy + ffmpeg, no samples."""
from pathlib import Path
import numpy as np, wave, subprocess, tempfile
SR=32000
OUT=Path(__file__).resolve().parents[1]/'public/audio'
OUT.mkdir(exist_ok=True)
def hz(n):return 440*2**((n-69)/12)
def compose(scene,bpm,root,melody,progression,energy,seed):
 rng=np.random.default_rng(seed);beat=60/bpm;length=64*beat;N=round(length*SR);mix=np.zeros((N,2),np.float64)
 def place(v,at,pan=.5):
  idx=(round(at*SR)+np.arange(len(v)))%N
  np.add.at(mix[:,0],idx,v*np.cos(pan*np.pi/2));np.add.at(mix[:,1],idx,v*np.sin(pan*np.pi/2))
 def pluck(note,duration,gain,at,pan=.5,soft=False):
  t=np.arange(int(duration*SR))/SR;f=hz(note);v=np.zeros_like(t)
  for k in range(1,8):v+=np.sin(2*np.pi*f*k*t+(.01*k*k))*np.exp(-t*(1.2+k*.65))/(k**(1.45 if soft else 1.05))
  v*=np.minimum(1,t/.009)*gain
  place(v,at,pan)
 def pad(notes,at):
  duration=beat*9;t=np.arange(int(duration*SR))/SR;env=np.minimum(t/(beat*.8),1)*np.minimum((duration-t)/(beat*2),1)
  v=sum(np.sin(2*np.pi*hz(n)*t)+.2*np.sin(2*np.pi*hz(n)*1.002*t) for n in notes)*env*.012
  place(v,at,.5)
 for bar in range(16):
  chord=root+progression[bar%len(progression)];start=bar*4*beat
  if bar%2==0:pad([chord,chord+7,chord+12],start)
  for b in [0,2]:pluck(chord-12,beat*2.8,.075*energy,start+b*beat,.5,True)
  for b in range(4):
   note=root+melody[(bar*4+b)%len(melody)]+(12 if bar in [6,7,14,15] else 0)
   if (bar+b)%7!=5:pluck(note,beat*3,.075,start+b*beat,.35 if b%2 else .65)
   if b%2==1:pluck(chord+[7,12,16,19][b],beat*1.7,.035*energy,start+(b+.5)*beat,.75 if b==1 else .25,True)
  if scene=='table':
   for b in [0,2]:
    t=np.arange(int(.16*SR))/SR;v=np.sin(2*np.pi*(70*t+2*(1-np.exp(-t*25))))*np.exp(-t*30)*.075;place(v,start+b*beat)
   for b in [1,3]:
    t=np.arange(int(.07*SR))/SR;v=rng.normal(0,1,len(t))*np.exp(-t*90)*.014;place(v,start+b*beat,.55)
 # Quiet stereo room echoes wrap through the loop boundary.
 dry=mix.copy()
 for delay,gain in [(.17,.12),(.31,.08),(.53,.045)]:mix+=np.roll(dry,round(delay*SR),axis=0)[:,::-1]*gain
 peak=np.max(np.abs(mix));mix*=.64/max(peak,.001)
 # Tanh rounds transients, leaving substantial headroom for action audio.
 pcm=(np.tanh(mix)*28000).astype('<i2')
 with tempfile.NamedTemporaryFile(suffix='.wav') as tmp:
  with wave.open(tmp.name,'wb') as w:w.setnchannels(2);w.setsampwidth(2);w.setframerate(SR);w.writeframes(pcm.tobytes())
  subprocess.run(['ffmpeg','-hide_banner','-loglevel','error','-y','-i',tmp.name,'-codec:a','libmp3lame','-b:a','112k',str(OUT/f'{scene}-0513.mp3')],check=True)
 print(scene,round(length,2),'seconds',int((OUT/f'{scene}-0513.mp3').stat().st_size),'bytes')
compose('menu',76,60,[12,16,19,16,14,12,9,7,12,14,16,19,21,19,16,14],[0,-3,-5,-7],.65,131)
compose('table',100,57,[12,15,19,22,19,15,12,10,12,19,22,24,22,19,15,10],[0,-5,-3,-7],1,132)
compose('victory',108,62,[12,16,19,24,23,19,16,19,21,19,16,14,12,16,19,24],[0,5,7,0],.85,133)
compose('reflection',68,57,[19,15,12,10,12,15,17,15,19,17,15,12,10,7,10,12],[0,-5,-3,-7],.45,134)
