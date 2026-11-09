'use client';
import {useState,type ReactNode} from 'react';
import YachtDiceTable from './YachtDiceTable';
import {newYachtPractice,playYachtPractice,type YachtPracticeState} from '../../lib/yacht-practice';

/** Single-play menu Yacht Dice against Haro: the side-quest table with nothing staked, kept in memory only. */
export default function YachtPractice({playerName,playerAvatar,settings,close}:{playerName:string,playerAvatar?:ReactNode,settings?:()=>void,close:()=>void}){
 const [state,setState]=useState<YachtPracticeState>(newYachtPractice),[error,setError]=useState('');
 const play:Parameters<typeof YachtDiceTable>[0]['play']=action=>{try{setState(playYachtPractice(state,action));setError('');}catch(e){setError(e instanceof Error?e.message:'주사위를 굴리지 못했어요.');}};
 return <YachtDiceTable practice den={{losses:0,match:state.match,result:state.result}} match={state.match} hp={0} equipped={[]} busy={false} error={error}
  play={play} retry={()=>{setError('');setState(newYachtPractice());}} leave={close} exit={close} settings={settings} playerName={playerName} playerAvatar={playerAvatar}/>;
}
