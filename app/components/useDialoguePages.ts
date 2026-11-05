import {useLayoutEffect,useState,type RefObject} from 'react';
import {questDialoguePages,type DialogueLayout} from '../../lib/quest-dialogue-pages';
import {measureDialogueText} from './DialogueText';
/** Recalculate on column/font changes; a caption never gets a guessed hard line break. */
export function useDialoguePages(lines:readonly string[],text:RefObject<HTMLParagraphElement|null>){
 const [layout,setLayout]=useState<DialogueLayout>();
 useLayoutEffect(()=>{
  const element=text.current;if(!element)return;
  const canvas=document.createElement('canvas'),context=canvas.getContext('2d');if(!context)return;
  let previous='',active=true;
  const update=()=>{
   if(!active)return;const style=getComputedStyle(element),width=element.clientWidth,font=style.font;
   const key=width+font;if(!width||key===previous)return;previous=key;context.font=font;
   const measure=(value:string)=>context.measureText(value).width;
   setLayout({width,measure:value=>measureDialogueText(value,measure,parseFloat(style.fontSize)*1.1+3)});
  };
  const observer=new ResizeObserver(update);observer.observe(element);update();
  void document.fonts.ready.then(()=>{previous='';update();});
  return()=>{active=false;observer.disconnect();};
 },[text]);
 return questDialoguePages(lines,layout?Infinity:32,layout);
}
