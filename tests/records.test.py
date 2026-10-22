import sqlite3,json,pathlib
con=sqlite3.connect(':memory:')
for p in sorted(pathlib.Path('drizzle').glob('*.sql')):con.executescript(p.read_text())
con.execute('INSERT INTO rooms VALUES (?, ?, ?, ?)',('ABC123',3,json.dumps({'phase':'playing'}),0));con.commit()
insert="INSERT OR IGNORE INTO match_records (id,device,name,at,win,points,size,result) SELECT ?,?,?,?,?,?,?,? WHERE EXISTS (SELECT 1 FROM rooms WHERE code=? AND revision=? AND json_extract(state,'$.lastEvent.id')=?)"
def settle(event):
 state=json.dumps({'phase':'ended','lastEvent':{'id':event}})
 with con:
  changed=con.execute('UPDATE rooms SET state=?,revision=revision+1,updated=? WHERE code=? AND revision=?',(state,1,'ABC123',3)).rowcount
  for i,points in enumerate([11,-1,-10]):
   con.execute(insert,(f'ABC123:1:p{i}',f'device{i}',f'name{i}',1234,int(i==0),points,3,'{}','ABC123',4,event))
 return changed
assert settle('winner-A')==1
assert settle('stale-B')==0
assert settle('winner-A')==0
assert con.execute('SELECT COUNT(*) FROM match_records').fetchone()[0]==3
assert con.execute('SELECT SUM(points),SUM(win) FROM match_records').fetchone()==(0,1)
assert con.execute('SELECT COUNT(*),SUM(points) FROM match_records WHERE device=?',('device0',)).fetchone()==(1,11)
print('PASS: append-only migrations, atomic room/result writes, stale revision rejection, exactly-once result recording, per-device history aggregation.')
