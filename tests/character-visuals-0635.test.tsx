import assert from 'node:assert/strict';
import {renderToStaticMarkup} from 'react-dom/server';
import {RpgProfessionPicker,RpgProfessionStatus} from '../app/components/RpgProfessions';
import OpponentName from '../app/components/OpponentName';
import TileFace from '../app/components/TileFace';
import {StageVisuals} from '../app/components/StageVisuals';
import {RPG_PROFESSIONS} from '../lib/rpg-professions';
import {createHpItemGame} from '../lib/hp-item-mode';
import {view} from '../lib/game';
const text=(html:string)=>html.replace(/<[^>]*>/g,'');
for(const profession of RPG_PROFESSIONS){
 const game=createHpItemGame('나','',Date.now(),2,'toto',profession.id),snapshot=view(game,game.players[0].token);
 const picker=renderToStaticMarkup(<RpgProfessionPicker selected={profession.id} choose={()=>{}} itemBattle/>);
 const status=renderToStaticMarkup(<RpgProfessionStatus game={snapshot} seat={0} detail/>);
 for(const html of [picker,status]){
  assert.ok(!text(html).includes('승리'),'compact ability descriptions omit repeated trigger wording');
  const effects=[...html.matchAll(/<b class="profession-effect-value">([^<]+)<\/b>/g)].map(match=>match[1]);
  assert.ok(effects.length>=2,'both passive and active effects remain readable');
  assert.ok(effects.every(effect=>!effect.includes('판당')&&!/싱글|페어|트리플|스트레이트|풀하우스|포카드/.test(effect)),'conditions and usage limits stay outside bold effect phrases');
  assert.ok(text(html).includes('판당 1회'),'once-per-round restriction remains visible');
 }
 const legacy=renderToStaticMarkup(<RpgProfessionPicker selected={profession.id} choose={()=>{}}/>);
 if(profession.id==='rogue'){assert.ok(text(picker).includes('바닥 1장 투시'));assert.ok(text(legacy).includes('상대 패 1장 확인'));assert.ok(!text(legacy).includes('함정'));}
 if(profession.id==='swordsman'){assert.ok(text(picker).includes('싱글·페어 추가 피해 +1'));assert.ok(text(legacy).includes('페어 추가 피해 +1'));}
}
for(const props of [{name:'네아',bot:true},{name:'히보링지',bot:true},{name:'모루',replaced:true}]){
 const html=renderToStaticMarkup(<OpponentName {...props}/>);
 assert.ok(html.includes('opponent-character-name')&&html.includes('opponent-ai-label'),'independent labels allow the right seat to mirror visually');
 assert.ok(!html.includes('링지'),'saved legacy character names retain the short display name');
 assert.ok(text(html).includes(props.replaced?'AI 대체':'AI'));
}
for(let stage=0;stage<=10;stage++)for(let s=0;s<4;s++)for(let n=1;n<=15;n++){
 const tile={id:(n-1)*4+s,n,s},face=<TileFace tile={tile}/>;
 const html=renderToStaticMarkup(stage?<StageVisuals stage={stage}>{face}</StageVisuals>:face);
 assert.ok(html.includes(`data-number="${n}"`)&&html.includes(`data-suit="${s}"`),'all 60 identities survive every material');
 assert.match(html,/<circle cx="45" cy="46" r="(?:28|30)" fill="#fffdf5"/,'original suit medallion stays at its approved position and size');
 const numbers=[...html.matchAll(/<text\b([^>]*)>(\d+)<\/text>/g)];
 assert.equal(numbers.length,stage?2:1,'regional number halo and outline remain paired');
 for(const [,attributes,value] of numbers){assert.equal(Number(value),n);assert.match(attributes,/x="45"/);assert.ok(n<10||attributes.includes('textLength="32"'),'two-digit numbers fit inside the original medallion');}
 if(s===3)assert.ok(html.includes('transform="translate(45 46)"'),'sun retains its original center and rays');
 assert.ok(!html.includes('r="38"')&&!html.includes('r="35.5"'),'no enlarged plaque covers the original suit artwork');
 if(n===2&&!stage)assert.ok(html.includes(`data-motif="${s}:2"`),'approved suit-specific two emblems remain');
}
console.log('PASS: compact item/legacy descriptions, isolated effect emphasis, mirrored opponent labels, and all 60 centered tile faces across eleven materials.');
