import json,sqlite3,subprocess
from pathlib import Path
root=Path(__file__).resolve().parents[1]
queries=json.loads(subprocess.check_output(['node','--experimental-strip-types','--input-type=module','-e',"import {LINEUP_SUMMARY_SQL,LINEUP_PLAYERS_SQL} from './lib/history.ts'; console.log(JSON.stringify([LINEUP_SUMMARY_SQL,LINEUP_PLAYERS_SQL]));"],cwd=root))
db=sqlite3.connect(':memory:');db.row_factory=sqlite3.Row
db.executescript((root/'drizzle/0001_neat_nightshade.sql').read_text())
def put(id,names,points,winner,device='mine',self=0):
 result={'players':[{'name':name,'delta':points[i],'winner':winner==i} for i,name in enumerate(names)]}
 db.execute('INSERT INTO match_records VALUES (?,?,?,?,?,?,?,?)',(str(id),device,names[self],id,int(winner==self),points[self],len(names),json.dumps(result)))
for i in range(45):put(i,['나','돼지'],[2,-2],0)
put(46,['돼지','나','토끼'],[5,-2,-3],0,self=1)
put(47,['나','돼지','토끼'],[4,-2,-2],0)
put(48,['친구','친구'],[6,-6],0)
put(49,['나','돼지'],[-99,99],1,'other')
groups=[dict(r) for r in db.execute(queries[0],('mine',))];participants=[dict(r) for r in db.execute(queries[1],('mine',))]
assert len(groups)==3
pair=next(g for g in groups if json.loads(g['lineup'])==['나','돼지'])
assert (pair['games'],pair['wins'],pair['points'])==(45,45,90)
assert next(p for p in participants if p['lineup']==pair['lineup'] and p['name']=='돼지')['points']==-90
triple=next(g for g in groups if g['size']==3);assert (triple['games'],triple['wins'],triple['points'])==(2,1,2)
duplicates=[p for p in participants if p['name']=='친구'];assert len(duplicates)==2;assert sorted(p['occurrence'] for p in duplicates)==[1,2]
print('PASS: SQLite whole-history aggregation beyond 40 rounds, participant score rankings, reordered seats, device isolation and duplicate names.')
