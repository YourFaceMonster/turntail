'use client';
import {useEffect,useState} from 'react';
import {createPortal} from 'react-dom';
import {RPG_REWORK_RELICS} from '../../lib/rpg-rework';
import {relicImage} from '../../lib/item-battle-relics';
import {STORY_CARDS,type StoryCardId} from '../../lib/rpg-story-cards';
import {STORY_CARD_ART} from '../../lib/rpg-story-card-art';
import {readRelicTally} from '../../lib/relic-tally';
import {tr} from '../../lib/i18n/index.ts';

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
 const data=codexEntries(discovered,storyCards),[fired,setFired]=useState<Record<string,number>>({});
 useEffect(()=>{setFired(readRelicTally().counts);},[]);
 useEffect(()=>{const key=(e:KeyboardEvent)=>{if(e.key==='Escape')close();};document.addEventListener('keydown',key);return()=>document.removeEventListener('keydown',key);},[close]);
 const body=<div className="modal-shade codex-shade" onClick={close}><section className="modal rpg-codex" role="dialog" aria-modal="true" aria-labelledby="codex-title" onClick={e=>e.stopPropagation()}>
  <button className="close" aria-label={tr('도감 닫기')} onClick={close}>×</button>
  <h2 id="codex-title">{tr('여정 도감')}</h2>
  <div className="codex-tabs" role="tablist" aria-label={tr('도감 종류')}>
   <button role="tab" aria-selected={tab==='relics'} onClick={()=>setTab('relics')}>{tr('유물')} <b>{data.relicCount}/{data.relics.length}</b></button>
   <button role="tab" aria-selected={tab==='stories'} onClick={()=>setTab('stories')}>{tr('이야기 패')} <b>{data.storyCount}/{data.stories.length}</b></button>
  </div>
  {tab==='relics'?<ul className="codex-grid codex-relics">{data.relics.map(relic=><li key={relic.id} className={relic.found?'is-found':'is-hidden'}>
   {/* 2026-11-27 QA: unfound relics show their own shape in shadow, not a dashed "?" circle and a repeated line. */}
   <img className={relic.found?undefined:'codex-silhouette'} src={relicImage(relic.id)} alt=""/>
   <strong>{relic.found?relic.name:'???'}</strong>{relic.found&&<small>{relic.effect}</small>}{relic.found&&relic.passive&&<em className="rpg-offer-passive">{tr('갖고만 있어도 적용')}</em>}{relic.found&&(fired[relic.id]||0)>0&&<span className="codex-fired">{tr('발동')} {fired[relic.id]}{tr('회')}</span>}
  </li>)}</ul>
  :<ul className="codex-grid codex-stories">{data.stories.map(card=><li key={card.id} className={card.found?'is-found':'is-hidden'}>
   {card.found?<button className="codex-card" aria-label={`${card.name} ${flipped===card.id?tr('앞면 보기'):tr('뒷면 보기')}`} onClick={()=>setFlipped(flipped===card.id?null:card.id)}><img src={flipped===card.id?STORY_CARD_ART[card.id].back:STORY_CARD_ART[card.id].front} alt=""/></button>:<span className="codex-unknown codex-card-unknown" aria-hidden="true">?</span>}
   <strong>{card.found?card.name:'???'}</strong>{card.found&&<small>{flipped===card.id?tr('뒷면 · {0}',{0:card.back}):tr('{0}에서 얻음 · 눌러서 뒤집기',{0:card.source})}</small>}
  </li>)}</ul>}
 </section></div>;
 return typeof document==='undefined'?body:createPortal(body,document.body);
}
