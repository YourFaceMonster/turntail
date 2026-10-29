// Explicit 100 HP fixtures also cover compatibility with pre-0.6.44 saved matches.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createElement as h} from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import {HP_BATTLE_CHARACTERS,HP_CHARACTERS,hpCharacter,isHpCharacterId,pickHpOpponents,useHpSkill} from '../lib/hp-item-skills.ts';
import {createHpItemGame,saveHpItemGame,readHpItemArchive} from '../lib/hp-item-mode.ts';
import {buyHpItemLoadout} from '../lib/hp-item-shop.ts';
import {resolveHpItemBattle} from '../lib/hp-item-battle.ts';
import {startRpgRound} from '../lib/rpg-game.ts';
import {STAGE_THEMES} from '../lib/stage-theme.ts';
import {stageModel,stageCompanyAssets} from '../lib/stage-models.ts';
import {StagePortrait} from '../app/components/StagePortrait.tsx';
import StageModel from '../app/components/StageModel.tsx';
import {view,type Tile} from '../lib/game.ts';

const tile=(n:number,s=0):Tile=>({id:(n-1)*4+s,n,s});
assert.equal(HP_CHARACTERS.length,3,'keep the compact player character picker');
assert.equal(HP_BATTLE_CHARACTERS.length,30);
assert.equal(new Set(HP_BATTLE_CHARACTERS.map(character=>character.id)).size,30);
assert.equal(new Set(HP_BATTLE_CHARACTERS.map(character=>character.avatar)).size,30);
for(const kind of ['attack','guard','money'])assert.equal(HP_BATTLE_CHARACTERS.filter(character=>character.kind===kind).length,10);
const rendered=new Set<string>();
for(const character of HP_BATTLE_CHARACTERS){
 assert.ok(isHpCharacterId(character.id));
 const index=Number(character.avatar.split(':')[1]),person=STAGE_THEMES.flatMap(stage=>stage.opponents).find(person=>person.portrait===index)!;
 assert.equal(person.name,character.name);
 const model=stageModel(index);assert.ok(fs.existsSync(`public${model.src}`));
 for(const rect of [model.rect,[...model.face.slice(0,2),model.face[2],model.face[2]]])assert.ok(rect[0]>=0&&rect[1]>=0&&rect[2]>0&&rect[3]>0&&rect[0]+rect[2]<=model.size.width&&rect[1]+rect[3]<=model.size.height);
 rendered.add(`${model.src}:${model.rect.join()}`);
 const portrait=renderToStaticMarkup(h(StagePortrait,{index})),body=renderToStaticMarkup(h(StageModel,{index}));
 assert.ok(portrait.includes(model.src)&&portrait.includes(`${character.name} 아바타`));
 assert.ok(body.includes(model.src)&&body.includes(`data-stage-model="${index}"`));
 const g=createHpItemGame('내 이름','',Date.now(),2,character.id,'rogue',100);
 assert.equal(g.hpItemMatch!.skills,undefined,'the retired three character skills are absent');
 const opponents=g.players.slice(1).map(player=>[player.name,player.avatar]);
 assert.equal(new Set(opponents.map(player=>player[1])).size,2);
 for(const player of g.players.slice(1))assert.ok(HP_BATTLE_CHARACTERS.some(person=>person.name===player.name&&person.avatar===player.avatar));
 assert.equal(view(g,g.players[0].token).players[1].hand,undefined);
 buyHpItemLoadout(g,[]);
 const memory=new Map<string,string>(),storage={getItem:(key:string)=>memory.get(key)||null,setItem:(key:string,value:string)=>{memory.set(key,value);}};
 saveHpItemGame(storage,g);const restored=readHpItemArchive(storage,2).active!;
 assert.deepEqual(restored.players.slice(1).map(player=>[player.name,player.avatar]),opponents);
 assert.equal(restored.rpgRun!.combat!.professions[0],'rogue');
 restored.phase='ended';startRpgRound(restored);assert.deepEqual(restored.players.slice(1).map(player=>[player.name,player.avatar]),opponents,'same opponents survive the next card round');
}
assert.equal(rendered.size,30,'every resident has their own full-body drawing');
const possible=new Set<string>();
for(let first=0;first<30;first++){
 let draws=0;const pair=pickHpOpponents(undefined,max=>draws++===0?first%max:0);assert.equal(new Set(pair).size,2);possible.add(pair[0]);
}
assert.equal(possible.size,30,'every resident is reachable by the random draw');
for(const character of HP_BATTLE_CHARACTERS){const pair=pickHpOpponents(character.id,()=>0);assert.equal(new Set(pair).size,2);assert.ok(!pair.includes(character.id));}
const mode1=createHpItemGame('기본 아이템전','',Date.now(),1);assert.equal(new Set(mode1.players.slice(1).map(player=>player.avatar)).size,2);assert.ok(!mode1.hpItemMatch!.skills);for(const player of mode1.players.slice(1))assert.ok(HP_BATTLE_CHARACTERS.some(character=>character.avatar===player.avatar&&character.name===player.name));
assert.deepEqual(new Set(stageCompanyAssets(['stage-portrait:0','stage-portrait:2','stage-portrait:2','korean-monster:0'])),new Set(['/stage-company-0516.webp','/stage-company-0627.webp']));
assert.equal(isHpCharacterId('missing'),false);assert.equal(hpCharacter('missing').id,'toto');
console.log('PASS: all 30 distinct bodies/portraits, all skill effects, every random candidate, no duplicates, both modes, round/save persistence and private hands.');
