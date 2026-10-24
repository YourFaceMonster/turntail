"""Original lively 16-bar game cues: varied phrases, bass, chord comping and tonal percussion."""
from pathlib import Path
import numpy as np, wave, subprocess, tempfile, json
SR=32000
OUT=Path(__file__).resolve().parents[1]/'public/audio'
OUT.mkdir(exist_ok=True)
def hz(n):return 440*2**((n-69)/12)
PHRASES=[[(0,12,.7),(1,16,.45),(1.75,19,.25),(2,21,.6),(3,19,.4),(3.5,16,.4)],[(0,14,.45),(.75,16,.25),(1,19,.8),(2,16,.4),(2.75,14,.25),(3,12,.9)],[(0,9,.4),(.5,12,.5),(1.5,16,.5),(2,19,.8),(3,16,.5)],[(0,14,.5),(1,19,.4),(1.5,21,.5),(2.5,19,.25),(3,14,.4),(3.5,12,.45)]]
INFO=[]
def compose(scene,bpm,root,energy,lead):
 beat=60/bpm;N=round(64*beat*SR);mix=np.zeros((N,2),np.float64)
 def place(v,at,pan=.5):
  idx=(round(at*SR)+np.arange(len(v)))%N
  np.add.at(mix[:,0],idx,v*np.cos(pan*np.pi/2));np.add.at(mix[:,1],idx,v*np.sin(pan*np.pi/2))
 def note(n,at,duration,gain,kind='pluck',pan=.5):
  t=np.arange(max(2,int((duration+.09)*SR)))/SR;f=hz(n)
  attack=np.minimum(1,t/(.014 if kind=='reed' else .005));release=np.minimum(1,np.maximum(0,(duration+.09-t)/.09))
  if kind=='pluck':
   v=sum(np.sin(2*np.pi*f*k*t)*np.exp(-t*(2+k*.85))/(k**1.25) for k in range(1,9))
  elif kind=='reed':
   phase=2*np.pi*f*t+.022*np.sin(2*np.pi*5.2*t)
   v=(np.sin(phase)+.23*np.sin(2*phase)+.19*np.sin(3*phase)+.05*np.sin(5*phase))*(.72+.28*np.exp(-t*8))
  elif kind=='bell':v=sum(a*np.sin(2*np.pi*f*k*t)*np.exp(-t*decay) for k,a,decay in [(1,1,4),(2.01,.38,7),(3.97,.16,11),(6.11,.06,15)])
  elif kind=='bass':v=(np.sin(2*np.pi*f*t)+.5*np.sin(2*np.pi*f*2*t)+.15*np.sin(2*np.pi*f*3*t))*np.exp(-t*4)
  else:v=(np.sin(2*np.pi*f*t)+.2*np.sin(2*np.pi*f*2*t))*np.exp(-t*3)
  place(v*attack*release*gain,at,pan)
 def drum(at,kind,gain):
  duration=.19 if kind=='kick' else .075;t=np.arange(int(duration*SR))/SR
  if kind=='kick':v=(np.sin(2*np.pi*(52*t+1.3*(1-np.exp(-t*32))))+.18*np.sin(2*np.pi*155*t))*np.exp(-t*28)
  elif kind=='rim':v=(np.sin(2*np.pi*740*t)+.5*np.sin(2*np.pi*1127*t))*np.exp(-t*75)
  elif kind=='tick':v=(np.sin(2*np.pi*2100*t)+.35*np.sin(2*np.pi*3271*t))*np.exp(-t*125)
  else:v=(np.sin(2*np.pi*(110*t+.8*(1-np.exp(-t*25)))))*np.exp(-t*42)
  place(v*np.minimum(1,t/.002)*gain,at,.5 if kind=='kick' else .4)
 progression=[(0,False),(-3,True),(5,False),(7,False),(0,False),(-3,True),(5,False),(7,False),(2,True),(7,False),(4,True),(-3,True),(5,False),(7,False),(0,False),(7,False)]
 for bar,(offset,minor) in enumerate(progression):
  at=bar*4*beat;chord=root+offset;section=bar//4
  # Call, answer, contrasting bridge, returning phrase; every fourth bar resolves differently.
  for j,(b,p,d) in enumerate(PHRASES[bar%4]):
   pitch=root+p+(7 if section==2 else 0)
   if bar==15 and j>=3:pitch=root+[19,16,12][j-3]
   instrument='reed' if section==2 else lead
   note(pitch,at+b*beat,d*beat,.067*(1.1 if b==0 else .9),instrument,.52)
   if section==3 and j%2==0:note(pitch+12,at+b*beat,.32*beat,.018,'bell',.72)
  third=3 if minor else 4
  for b in [.5,1.5,2.5,3.5]:
   for j,p in enumerate([0,third,7]):note(chord+p+12,at+b*beat+j*.018,.31*beat,.018*energy,'pluck',.25)
  for b,p in [(0,-24),(1.5,-17),(2,-24),(3,-12)]:note(chord+p,at+b*beat,.65*beat,.077*energy,'bass',.5)
  if bar%2==1:
   for b,p in [(2.75,19),(3.25,16),(3.75,14)]:note(root+p,at+b*beat,.22*beat,.024,'bell',.8)
  for b in [0,2]:drum(at+b*beat,'kick',.09*energy)
  for b in [1,3]:drum(at+b*beat,'rim',.026*energy)
  for b in [.5,1.5,2.5,3.5]:drum(at+b*beat,'tick',.011*energy)
  if bar%4==3:
   for b in [3.25,3.5,3.75]:drum(at+b*beat,'tom',.035*energy)
 # Short room reflections only; no sustained hiss, wind bed or heartbeat.
 dry=mix.copy()
 for delay,gain in [(.115,.07),(.23,.045)]:mix+=np.roll(dry,round(delay*SR),axis=0)[:,::-1]*gain
 mix*=.82/max(np.max(np.abs(mix)),.001)
 pcm=(np.tanh(mix)*31000).astype('<i2')
 path=OUT/f'{scene}-0515.mp3'
 with tempfile.NamedTemporaryFile(suffix='.wav') as tmp:
  with wave.open(tmp.name,'wb') as w:w.setnchannels(2);w.setsampwidth(2);w.setframerate(SR);w.writeframes(pcm.tobytes())
  subprocess.run(['ffmpeg','-hide_banner','-loglevel','error','-y','-i',tmp.name,'-af','loudnorm=I=-18:TP=-1.5:LRA=9','-ar',str(SR),'-codec:a','libmp3lame','-b:a','128k',str(path)],check=True)
 INFO.append({'scene':scene,'bpm':bpm,'bars':16,'seconds':round(64*beat,2),'bytes':path.stat().st_size,'parts':['lead phrase','answer chimes','offbeat chord comp','walking bass','tonal drums'],'sections':'A / A variation / B reed bridge / returning layered A'})
 print(json.dumps(INFO[-1]))
compose('menu',116,60,.8,'pluck')
compose('table',128,62,1,'pluck')
compose('victory',136,65,1.05,'reed')
compose('reflection',104,57,.6,'pluck')
(OUT/'music-0515.json').write_text(json.dumps(INFO,ensure_ascii=False,indent=2))
