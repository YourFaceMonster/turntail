import assert from 'node:assert/strict';
import {renderToStaticMarkup} from 'react-dom/server';
import useTileGestures from '../app/components/useTileGestures';
let callbacks:ReturnType<typeof useTileGestures>,selected:number[]=[],sent:number[]=[];
function Harness({can=true}:{can?:boolean}){
 callbacks=useTileGestures({kind:'hand',enabled:true,rotation:0,contextKey:'hand:selection',tapContextKey:'hand:turn',canStart:()=>false,canCommit:()=>false,canDoubleCommit:id=>can&&selected.length===1&&selected[0]===id,onDoubleCommit:id=>sent.push(id),onTap:id=>selected=selected.includes(id)?[]:[id],onCommit:()=>{throw Error('Swipe handler must not submit the double tap');}});return null;
}
const click=(at:number,detail:number)=>({timeStamp:at,detail,clientX:100,clientY:100,preventDefault(){},stopPropagation(){}} as any);
renderToStaticMarkup(<Harness/>);const button=callbacks!.bind(7);button.onClick(click(100,1));assert.deepEqual(selected,[7]);button.onClick(click(250,2));assert.deepEqual(sent,[7]);
selected=[];sent=[];renderToStaticMarkup(<Harness can={false}/>);const illegal=callbacks!.bind(9);illegal.onClick(click(100,1));illegal.onClick(click(250,2));assert.deepEqual(sent,[]);
console.log('PASS: a legal hand single submits exactly once on the second click; illegal singles and the swipe handler do not submit.');
