// Creates the game tables in the LOCAL dev D1 database (.wrangler/state) so multiplayer, records and
// rankings work on the dev server. Production D1 is never touched. Safe to run again: existing tables
// and columns are skipped, and no row is ever deleted.
//   node scripts/local-db-setup.mjs          apply
//   node scripts/local-db-setup.mjs --check  list tables only
import {DatabaseSync} from 'node:sqlite';
import {readdirSync,readFileSync,existsSync} from 'node:fs';
import {join} from 'node:path';

const root=new URL('..',import.meta.url).pathname.replace(/^\/(\w:)/,'$1');
const dir=join(root,'.wrangler/state/v3/d1/miniflare-D1DatabaseObject');
const check=process.argv.includes('--check');
if(!existsSync(dir)){console.log('로컬 D1 폴더가 아직 없습니다. 개발 서버를 한 번 켠 뒤 다시 실행하세요.');process.exit(0);}
const files=readdirSync(dir).filter(name=>name.endsWith('.sqlite')&&name!=='metadata.sqlite');
const migrations=readdirSync(join(root,'drizzle')).filter(name=>/^\d+_.*\.sql$/.test(name)).sort();
const statements=migrations.flatMap(name=>readFileSync(join(root,'drizzle',name),'utf8').split('--> statement-breakpoint').map(sql=>sql.trim()).filter(Boolean).map(sql=>({name,sql})));
const benign=/already exists|duplicate column/i;
for(const file of files){
 const db=new DatabaseSync(join(dir,file));
 const tables=()=>db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE '\\_%' ESCAPE '\\' AND name NOT LIKE 'sqlite%' ORDER BY name").all().map(row=>row.name);
 console.log(`\n${file}\n  지금 표: ${tables().join(', ')||'(없음)'}`);
 if(!check){
  let applied=0,skipped=0;
  for(const {name,sql} of statements){try{db.exec(sql);applied++;}catch(error){if(benign.test(String(error.message)))skipped++;else{console.error(`  실패 ${name}: ${error.message}`);process.exitCode=1;}}}
  console.log(`  적용 ${applied}, 이미 있음 ${skipped}\n  이후 표: ${tables().join(', ')}`);
 }
 db.close();
}
