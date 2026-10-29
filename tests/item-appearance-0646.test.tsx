import assert from 'node:assert/strict';
import React from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import {createHpItemGame,readHpItemArchive,saveHpItemGame,HP_ITEM_SHOP_STORAGE_KEY} from '../lib/hp-item-mode';
import {beginHpItemRound} from '../lib/hp-item-shop';
import {createRpgGame} from '../lib/rpg-game';
import {player,room,start,view} from '../lib/game';
import {StageVisuals} from '../app/components/StageVisuals';
import TileFace from '../app/components/TileFace';
import TileBack from '../app/components/TileBack';
import TableSurface from '../app/components/TableSurface';
const descriptor=Object.getOwnPropertyDescriptor(crypto,'getRandomValues');let serial=0;
try{
 Object.defineProperty(crypto,'getRandomValues',{configurable:true,value:<T extends ArrayBufferView|null>(array:T):T=>{const a=array as unknown as number[];for(let i=0;i<a.length;i++)a[i]=++serial;return array;}});
 const g=createHpItemGame('꾸미기','',1000,2,'toto','mage');assert.ok(g.hpItemMatch!.tileSet!>=1&&g.hpItemMatch!.tileSet!<=10);assert.notEqual(g.hpItemMatch!.visualStage,g.hpItemMatch!.tileSet,'board and tile material use separate random choices');
 const values=new Map<string,string>(),storage={getItem:(key:string)=>values.get(key)||null,setItem:(key:string,value:string)=>{values.set(key,value);}};
 g.hpItemMatch!.visualStage=9;g.hpItemMatch!.tileSet=2;const hp=[...g.rpgRun!.hp],stage=g.rpgRun!.stage,opponents=g.players.slice(1).map(p=>p.name);saveHpItemGame(storage,g);
 const saved=readHpItemArchive(storage,2).active!;assert.equal(saved.hpItemMatch!.visualStage,9);assert.equal(saved.hpItemMatch!.tileSet,2);assert.equal(view(saved,saved.players[0].token).hpItemMatch!.tileSet,2);
 beginHpItemRound(saved);assert.equal(saved.hpItemMatch!.tileSet,2);assert.equal(saved.hpItemMatch!.visualStage,9);assert.deepEqual(saved.rpgRun!.hp,hp);assert.equal(saved.rpgRun!.stage,stage);assert.deepEqual(saved.players.slice(1).map(p=>p.name),opponents);
 const old=structuredClone(saved);delete old.hpItemMatch!.tileSet;values.set(HP_ITEM_SHOP_STORAGE_KEY,JSON.stringify({version:1,active:old,records:[]}));const before=serial,restored=readHpItemArchive(storage,2).active!;assert.equal(restored.hpItemMatch!.tileSet,9,'old saves retain their previous matching board/tile material');assert.equal(serial,before,'resuming does not consume randomness or reroll');
 restored.hpItemMatch!.tileSet=99;values.set(HP_ITEM_SHOP_STORAGE_KEY,JSON.stringify({version:1,active:restored,records:[]}));assert.equal(readHpItemArchive(storage,2).active!.hpItemMatch!.tileSet,9);
 const html=renderToStaticMarkup(<StageVisuals stage={2}><TableSurface stage={9}/><TileFace tile={{id:27,n:7,s:3}}/><TileBack/></StageVisuals>);assert.ok(html.includes('data-tile-material="호두나무"'));assert.ok(html.includes('data-stage-texture="2"'));assert.ok(html.includes('data-surface-stage="9"'),'tile context must not change the explicitly selected table');
 const basic=room('appearance-basic',player('나'),true,3);basic.players.push(player('AI1',true),player('AI2',true));start(basic,1000);assert.equal(basic.hpItemMode,undefined);assert.equal(basic.hpItemMatch,undefined);
 const rpg=createRpgGame('여정','',1000,'mage');assert.equal(rpg.hpItemMatch,undefined);assert.equal(rpg.rpgRun!.stage,1);
 console.log('PASS: independent item-mode board/tile random selection; saved and next-round appearance retained; old saves keep their look; basic and RPG modes unchanged; explicit table and tile rendering separated.');
}finally{if(descriptor)Object.defineProperty(crypto,'getRandomValues',descriptor);}
