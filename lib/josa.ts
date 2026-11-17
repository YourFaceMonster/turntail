/** Korean particle picker (2026-11-17): chooses 이/가·을/를·은/는·과/와 by the last sound of a name or number. */
export type JosaPair='이/가'|'을/를'|'은/는'|'과/와';
/** 영 일 이 삼 사 오 육 칠 팔 구 — whether each digit's reading ends in a final consonant. */
const DIGIT_FINAL=[true,true,false,true,false,false,true,true,true,false];
export function hasFinal(word:string){
 const text=word.trim();if(!text)return false;
 const last=text[text.length-1];
 if(/\d/.test(last)){
  const digits=text.match(/\d+$/)![0];
  // 10 십, 100 백, 1000 천, 10000 만 all end in a final consonant; a lone 0 is 영.
  if(/[1-9]0+$/.test(digits))return true;
  return DIGIT_FINAL[Number(last)];
 }
 const code=last.charCodeAt(0)-0xac00;
 if(code>=0&&code<11172)return code%28!==0;
 return false;
}
export function josa(word:string,pair:JosaPair){
 const [withFinal,withoutFinal]=pair.split('/');
 return word+(hasFinal(word)?withFinal:withoutFinal);
}
