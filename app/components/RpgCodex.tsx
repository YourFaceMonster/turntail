'use client';
import {useEffect,useState} from 'react';
import {createPortal} from 'react-dom';
import {RPG_REWORK_RELICS} from '../../lib/rpg-rework';
import {relicImage} from '../../lib/item-battle-relics';
import {STORY_CARDS,type StoryCardId} from '../../lib/rpg-story-cards';
import {STORY_CARD_ART} from '../../lib/rpg-story-card-art';

/** Journey relics found so far: archive + the run in progress. Legacy (pre-rework) relic ids are ignored. */
export function codexEntries(discovered:readonly string[],storyCards:readonly StoryCardId[]){
 const found=new Set(discovered),cards=new Set(storyCards);
 const relics=RPG_REWORK_RELICS.map(relic=>({...relic,found:found.has(relic.id)}));
 const stories=(Object.keys(STORY_CARDS) as StoryCardId[]).map(id=>({id,...STORY_CARDS[id],found:cards.has(id)}));
 return {relics,stories,relicCount:relics.filter(r=>r.found).length,storyCount:stories.filter(s=>s.found).length};
}

/** Read-only collection view: no rewards, no unlock side effects (content-unlock growth stays in the journey). */
export default function RpgCodex({discovered,storyCards,close}:{discovered:readonly string[],storyCards:readonly StoryCardId[],close:()=>void}){
 const [tab,setTab]=useState<'relics'|'stories'>('relics'),[flipped,setFlipped]=useState<StoryCardId|null>(null);
 const data=codexEntries(discovered,storyCards);
 useEffect(()=>{const key=(e:KeyboardEvent)=>{if(e.key==='Escape')close();};document.addEventListener('keydown',key);return()=>document.removeEventListener('keydown',key);},[close]);
 const body=<div className="modal-shade codex-shade" onClick={close}><section className="modal rpg-codex" role="dialog" aria-modal="true" aria-labelledby="codex-title" onClick={e=>e.stopPropagation()}>
  <button className="close" aria-label="도감 닫기" onClick={close}>×</button>
  <span className="eyebrow">JOURNEY CODEX</span><h2 id="codex-title">여정 도감</h2>
  <div className="codex-tabs" role="tablist" aria-label="도감 종류">
   <button role="tab" aria-selected={tab==='relics'} onClick={()=>setTab('relics')}>유물 <b>{data.relicCount}/{data.relics.length}</b></button>
   <button role="tab" aria-selected={tab==='stories'} onClick={()=>setTab('stories')}>이야기 패 <b>{data.storyCount}/{data.stories.length}</b></button>
  </div>
  {tab==='relics'?<ul className="codex-grid codex-relics">{data.relics.map(relic=><li key={relic.id} className={relic.found?'is-found':'is-hidden'}>
   {relic.found?<img src={relicImage(relic.id)} alt=""/>:<span className="codex-unknown" aria-hidden="true">?</span>}
   <strong>{relic.found?relic.name:'???'}</strong><small>{relic.found?relic.effect:'여정에서 발견하면 기록돼요'}</small>
  </li>)}</ul>
  :<ul className="codex-grid codex-stories">{data.stories.map(card=><li key={card.id} className={card.found?'is-found':'is-hidden'}>
   {card.found?<button className="codex-card" aria-label={`${card.name} ${flipped===card.id?'앞면 보기':'뒷면 보기'}`} onClick={()=>setFlipped(flipped===card.id?null:card.id)}><img src={flipped===card.id?STORY_CARD_ART[card.id].back:STORY_CARD_ART[card.id].front} alt=""/></button>:<span className="codex-unknown codex-card-unknown" aria-hidden="true">?</span>}
   <strong>{card.found?card.name:'???'}</strong><small>{card.found?(flipped===card.id?`뒷면 · ${card.back}`:`${card.source}에서 얻음 · 눌러서 뒤집기`):'아직 얻지 못했어요'}</small>
  </li>)}</ul>}
  <p className="codex-note">도감은 기록만 보여 줘요. 보상이나 능력치는 바뀌지 않아요.</p>
 </section></div>;
 return typeof document==='undefined'?body:createPortal(body,document.body);
}
