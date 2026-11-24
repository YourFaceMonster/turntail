import {type Player} from './game.ts';
import {tr} from './i18n/index.ts';
/** Only small raster photos produced by the profile editor are accepted. */
export function avatarImage(value:unknown):string{
 if(value===undefined||value===null||value==='')return '';
 if(typeof value!=='string'||value.length>18000||!/^data:image\/jpeg;base64,[A-Za-z0-9+/]+={0,2}$/.test(value))throw Error(tr('프로필 사진을 다시 선택해 주세요.'));
 return value;
}
export function updateProfile(p:Player,name:unknown,avatar:unknown){
 const clean=typeof name==='string'?name.replace(/[\u0000-\u001f\u007f]/g,'').trim().slice(0,12):p.name;
 p.name=clean||p.name;p.avatar=avatarImage(avatar);
}
// 2026-11-20: friend chat (sendChat) removed by user decision for the store age rating.
