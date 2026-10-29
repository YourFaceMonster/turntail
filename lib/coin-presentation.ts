import type {FloorCoinDiscovery,FloorCoinPickup} from './floor-coins';
import {COIN_DISCOVERY_MS,COIN_PRESENTATION_MS,COIN_EVENT_GAP_MS} from './pickup-presentation';
export type PublicCoinEvent=FloorCoinDiscovery|FloorCoinPickup;
export function isCoinPickup(event:PublicCoinEvent):event is FloorCoinPickup{return 'who' in event;}
export function coinEventDuration(event:PublicCoinEvent){return isCoinPickup(event)?COIN_PRESENTATION_MS:COIN_DISCOVERY_MS;}
export function publicCoinEvents(state?:{events:FloorCoinPickup[],lastDiscovery?:FloorCoinDiscovery,discoveries?:FloorCoinDiscovery[]}){
 const unique=new Map<string,PublicCoinEvent>();for(const event of [...(state?.discoveries||[]),...(state?.lastDiscovery?[state.lastDiscovery]:[]),...(state?.events||[])])unique.set(event.id,event);
 return [...unique.values()].sort((a,b)=>a.at-b.at||Number(isCoinPickup(a))-Number(isCoinPickup(b)));
}
export function nextCoinPresentationAt(events:readonly PublicCoinEvent[],eventId:string,earliest:number){return Math.max(earliest,...events.filter(event=>event.id!==eventId).map(event=>event.at+coinEventDuration(event)+COIN_EVENT_GAP_MS));}
/** Never truncate a new arrival because rendering/networking started late. */
export function queueCoinPresentation(event:PublicCoinEvent,now:number,previousEnd?:number){const start=Math.max(now,event.at,previousEnd===undefined?0:previousEnd+COIN_EVENT_GAP_MS);return {start,end:start+coinEventDuration(event)};}
