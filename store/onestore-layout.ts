/**
 * ONE store build only (2026-11-20).
 * The ONE store app floats its own menu button over the top right corner (about 40px wide, ending ~56px from
 * the top of the screen). Any game button that lands there, on any screen, slides left out from under it.
 * When the button sits in a small button group (a top bar's right side), the whole group slides together.
 */
// Measured on a device screenshot: the host button covers x 339..375 of a 375px-wide screen.
const HOST_MENU_WIDTH=38,HOST_MENU_BOTTOM=58,CLEAR_RIGHT=40;
const nudgeOf=(el:Element|null)=>{const host=el?.closest<HTMLElement>('[data-store-nudge]');return host?Number(host.style.getPropertyValue('--store-nudge').replace('px',''))||0:0;};

function clearHostMenu(){
 const nudged=new Set<HTMLElement>();
 if(innerWidth<=innerHeight)for(const button of document.body.querySelectorAll<HTMLElement>('button,a[href],[role="button"]')){
  let r=button.getBoundingClientRect();
  // Judge by where the button would be without an earlier nudge, so a nudged button stays nudged.
  if(!r.width||r.top>HOST_MENU_BOTTOM||r.bottom<0||r.right-nudgeOf(button)<innerWidth-HOST_MENU_WIDTH)continue;
  let target=button;
  for(let parent=button.parentElement;parent&&parent!==document.body;parent=parent.parentElement){
   const p=parent.getBoundingClientRect();if(p.width>innerWidth*.6||p.right<r.right-2)break;target=parent;
  }
  if(nudged.has(target))continue;
  const current=Number(target.style.getPropertyValue('--store-nudge').replace('px',''))||0;
  r=target.getBoundingClientRect();const shift=Math.round(current-(r.right-(innerWidth-CLEAR_RIGHT)));
  if(shift<current){target.style.setProperty('--store-nudge',`${shift}px`);target.dataset.storeNudge='';}
  nudged.add(target);
 }
 // Undo nudges on elements that no longer need them (screen rotated, layout changed).
 for(const el of document.body.querySelectorAll<HTMLElement>('[data-store-nudge]'))if(!nudged.has(el)){el.style.removeProperty('--store-nudge');delete el.dataset.storeNudge;}
}

export function startOneStoreLayout(){
 let timer=0;
 const schedule=()=>{if(timer)return;timer=window.setTimeout(()=>{timer=0;if(!document.hidden)try{clearHostMenu();}catch{/* layout helper only */}},400);};
 new MutationObserver(schedule).observe(document.body,{subtree:true,childList:true,attributes:true,attributeFilter:['class','data-stage']});
 addEventListener('resize',schedule);document.addEventListener('visibilitychange',schedule);
 schedule();
}
