import assert from 'node:assert/strict';
import {lowestHandLead,player,room,start,view,rank,suitRank,type Tile} from '../lib/game.ts';
import * as social from '../lib/social.ts';
const {avatarImage,updateProfile}=social;
const t=(n:number,s=0):Tile=>({id:(n-1)*4+s,n,s});
// The lowest tile on the floor never participates. Compare rank, then actual suit order.
const ps=[player('A'),player('B'),player('C')];
ps[0].hand=[t(2),t(4)];ps[1].hand=[t(3,1)];ps[2].hand=[t(3,2)];assert.equal(lowestHandLead(ps).who,2);
ps[0].hand=[t(3,0)];assert.equal(lowestHandLead(ps).who,0);
ps[0].hand=[t(1,0)];ps[1].hand=[t(2,0)];ps[2].hand=[t(15,3)];assert.equal(lowestHandLead(ps).who,2);
for(const n of [2,3,4])for(let k=0;k<40;k++){const g=room('LEAD',player('A'),true,n);for(let i=1;i<n;i++)g.players.push(player('P'+i));start(g);const all=g.players.flatMap((p,who)=>p.hand.map(tile=>({who,tile}))).sort((a,b)=>rank(a.tile)-rank(b.tile)||suitRank(a.tile.s)-suitRank(b.tile.s));assert.equal(g.turn,all[0].who);assert.deepEqual(g.opening,all[0]);}
const photo='data:image/jpeg;base64,/9j/2Q==';assert.equal(avatarImage(photo),photo);assert.throws(()=>avatarImage('data:image/svg+xml;base64,abcd'));assert.throws(()=>avatarImage('https://example.com/a.jpg'));assert.throws(()=>avatarImage('data:image/jpeg;base64,'+'a'.repeat(18000)));
const g=room('SOCIAL',player('A'));g.players.push(player('B'));updateProfile(g.players[1],'친구 사진',photo);assert.equal(view(g,g.players[0].token).players[1].avatar,photo);assert.equal(view(g,g.players[0].token).players[1].name,'친구 사진');assert.equal(JSON.stringify(view(g,g.players[0].token)).includes(g.players[1].token),false);
// 2026-11-20: friend chat removed. No sender exists, and messages left in old saved rooms are never shown.
assert.equal('sendChat' in social,false);
g.chat=[{id:'old',who:0,name:'A',text:'예전 메시지',at:1000}];assert.deepEqual(view(g,g.players[1].token).chat,[]);
console.log('PASS: hand-only opening lead in 120 deals, numeric and suit ties, safe photo payloads, shared profiles, chat removed (no sender, old messages hidden).');
