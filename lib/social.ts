import {uid,type Game,type Player} from './game.ts';
/** Only small raster photos produced by the profile editor are accepted. */
export function avatarImage(value:unknown):string{
 if(value===undefined||value===null||value==='')return '';
 if(typeof value!=='string'||value.length>18000||!/^data:image\/jpeg;base64,[A-Za-z0-9+/]+={0,2}$/.test(value))throw Error('프로필 사진을 다시 선택해 주세요.');
 return value;
}
export function updateProfile(p:Player,name:unknown,avatar:unknown){
 const clean=typeof name==='string'?name.replace(/[\u0000-\u001f\u007f]/g,'').trim().slice(0,12):p.name;
 p.name=clean||p.name;p.avatar=avatarImage(avatar);
}
export function sendChat(g:Game,who:number,value:unknown,now=Date.now(),messageId=uid()){
 if(!g.players[who])throw Error('입장 정보가 없어요.');
 if(typeof value!=='string')throw Error('메시지를 입력해 주세요.');
 const text=value.replace(/[\u0000-\u001f\u007f]/g,' ').trim();
 if(!text||text.length>160)throw Error('메시지는 1~160자로 입력해 주세요.');
 const messages=g.chat||[];
 if(messages.some(m=>m.id===messageId))return;
 const last=[...messages].reverse().find(m=>m.who===who);
 if(last&&now-last.at<800)throw Error('잠시 후 메시지를 보내 주세요.');
 g.chat=[...messages,{id:messageId,who,name:g.players[who].name,text,at:now}].slice(-60);
}
