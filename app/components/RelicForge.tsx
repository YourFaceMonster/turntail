'use client';
import {RELIC_RECIPES,RELIC_SYNERGIES,RELIC_TAGS,RELIC_TAG_NAMES,forgeBlocker,knownRecipes,reworkRelic,reworkSynergies} from '../../lib/rpg-rework';
import {relicImage} from '../../lib/item-battle-relics.ts';
import type {RpgRun} from '../../lib/rpg.ts';
import './relic-forge.css';

const name=(id:string)=>reworkRelic(id)?.name||id;

/** Bag section: known recipes, with a forge button once both materials are in the bag. */
export function RelicForge({run,busy,action}:{run:RpgRun,busy:boolean,action:(action:string,extra?:Record<string,unknown>)=>void}){
 const known=knownRecipes(run);
 return <section className="relic-forge" aria-label="유물 합성">
  <h4>유물 합성 <small>조합법 {known.length}/{RELIC_RECIPES.length}</small></h4>
  {!known.length&&<p className="relic-forge-hint">조합법은 주점의 피오나 각 영역의 보스에게서 알 수 있어요.</p>}
  {known.map(recipe=>{const blocked=forgeBlocker(run,recipe.id),result=reworkRelic(recipe.id);return <div key={recipe.id} className="relic-forge-recipe" data-ready={blocked?undefined:''}>
   <div className="relic-forge-formula" aria-label={`${name(recipe.materials[0])} + ${name(recipe.materials[1])} → ${result?.name}`}>
    {recipe.materials.map((id,index)=><span key={id} className="relic-forge-material" data-owned={run.relics.includes(id)?'':undefined}>{index>0&&<i aria-hidden="true">+</i>}<img src={relicImage(id)} alt=""/><small>{name(id)}</small></span>)}
    <i aria-hidden="true">→</i><span className="relic-forge-result"><img src={relicImage(recipe.id)} alt=""/><small>{result?.name}</small></span>
   </div>
   <p>{result?.effect}</p>
   <button className="secondary" disabled={busy||!!blocked} onClick={()=>action('rpg-relic-forge',{id:recipe.id})}>{blocked?blocked:'합성하기 · 재료 두 개가 사라져요'}</button>
  </div>;})}
 </section>;
}

/** Equipped-tag synergies and how to wake the rest. */
export function RelicSynergyNote({run}:{run:RpgRun}){
 const active=reworkSynergies(run);
 return <div className="relic-synergy-note"><h4>공명</h4>
  {(['scout','heart','mend'] as const).map(tag=>{const count=run.equipped.filter(id=>RELIC_TAGS[id]===tag).length;return <p key={tag} data-active={active.includes(tag)?'':undefined}><b>{RELIC_SYNERGIES[tag].name}</b> · {RELIC_TAG_NAMES[tag]} 유물 {count}/2 장착 · {RELIC_SYNERGIES[tag].effect}</p>;})}
 </div>;
}

/** Rumor notebook entries for the recipes heard so far. */
export function RecipeNotes({run}:{run:RpgRun}){
 const known=knownRecipes(run);if(!run.rework||!known.length)return null;
 return <>{known.map(recipe=><div key={recipe.id}><h4>조합법 · {name(recipe.id)}</h4><p>{name(recipe.materials[0])} + {name(recipe.materials[1])} → {name(recipe.id)}. 여행 가방에서 합칠 수 있다.</p></div>)}</>;
}
