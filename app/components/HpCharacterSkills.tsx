"use client";
import {useEffect,useRef,useState,type CSSProperties} from 'react';
import {createPortal} from 'react-dom';
import {Coins,Shield,Swords} from 'lucide-react';
import type {view} from '../../lib/game.ts';
import {HP_CHARACTERS,hasHpSkills,hpCharacter,hpSkillAvailability,type HpCharacterId,type HpSkillUse} from '../../lib/hp-item-skills.ts';
import SeatPortrait from './SeatPortrait';
type View=ReturnType<typeof view>;
function SkillIcon({kind}:{kind:string}){return kind==='attack'?<Swords aria-hidden="true"/>:kind==='guard'?<Shield aria-hidden="true"/>:<Coins aria-hidden="true"/>;}
export function HpCharacterPicker({selected,choose}:{selected:HpCharacterId,choose:(id:HpCharacterId)=>void}){
 return <section className="hp-character-picker" aria-labelledby="hp-character-title"><h3 id="hp-character-title">내 전투 캐릭터</h3><p>고유스킬 매판 1회 · 프로필 사진과 닉네임은 그대로 사용해요.</p><div>{HP_CHARACTERS.map(character=><button type="button" key={character.id} className={selected===character.id?'chosen':''} aria-pressed={selected===character.id} onClick={()=>choose(character.id)}><SeatPortrait avatar={character.avatar}/><strong>{character.name}<small>{character.role}</small></strong><b><SkillIcon kind={character.kind}/>{character.skill}</b><span>{character.effect}</span></button>)}</div><small>첫 싸움 이후 내 차례에 준비 · 같은 차례 아이템과 함께 사용 불가</small></section>;
}
export function HpSkillBadge({game,seat}:{game:View,seat:number}){
 if(!hasHpSkills(game))return null;
 const skills=game.hpItemMatch!.skills!,state=skills.seats[seat],character=hpCharacter(skills.characters[seat]);
 return <span className={`hp-skill-badge ${state.armed?'is-armed':state.used?'is-spent':''}`} title={`${character.name} · ${character.skill} · ${character.effect}`}><SkillIcon kind={character.kind}/><span>{seat===game.me?`${character.name} · `:''}{state.armed?'준비됨':state.used?'사용 완료':'스킬 대기'}</span></span>;
}
export function HpSkillControl({game,enabled,busy,use}:{game:View,enabled:boolean,busy:boolean,use:()=>void}){
 if(!hasHpSkills(game))return null;
 const skills=game.hpItemMatch!.skills!,character=hpCharacter(skills.characters[game.me]),state=skills.seats[game.me],availability=hpSkillAvailability(game,game.me,enabled);
 return <div className={`hp-skill-control ${state.armed?'is-armed':''}`}><button type="button" disabled={busy||!availability.usable} onClick={use} title={availability.reason} aria-label={`${character.name} 고유스킬 ${character.skill} · ${availability.reason}`}><SkillIcon kind={character.kind}/><span><b>{character.skill}</b><small>{state.armed?'준비됨':state.used?'사용 완료':'스킬 준비 · 1회'}</small></span></button><small>{state.used?availability.reason:availability.usable?character.effect:availability.reason}</small></div>;
}
export function HpSkillNotice({game}:{game:View}){
 const event=game.hpItemMatch?.skills?.lastEvent,seen=useRef(event?.id),[shown,setShown]=useState<HpSkillUse|null>(null);
 useEffect(()=>{if(!event||event.round!==game.round){setShown(null);return;}if(seen.current===event.id)return;seen.current=event.id;setShown(event);const timer=setTimeout(()=>setShown(null),1100);return()=>clearTimeout(timer);},[event?.id,game.round]);
 if(!shown||typeof document==='undefined')return null;
 const character=hpCharacter(shown.character),anchor=document.querySelector<HTMLElement>(shown.actor===game.me?'.own-status-card':`[data-seat="${shown.actor}"] .seat-card`)?.getBoundingClientRect();
 const style={left:Math.max(105,Math.min(innerWidth-105,anchor?anchor.left+anchor.width/2:innerWidth/2)),top:shown.actor===game.me?Math.max(15,(anchor?.top||innerHeight*.7)-85):(anchor?.bottom||90)+6} as CSSProperties;
 return createPortal(<div className="hp-skill-notice" role="status" style={style}><SkillIcon kind={character.kind}/><strong>{game.players[shown.actor].name} · {character.skill}</strong><small>준비 완료 · 다음 싸움에 적용</small></div>,document.body);
}
