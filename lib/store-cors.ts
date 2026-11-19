/** Exact, operator-configured origins only. No wildcard or credential cookies. */
export function allowedGameOrigin(req:Request,configured:string):string|null {
 const origin=req.headers.get('Origin');if(!origin)return null;
 if(origin===new URL(req.url).origin)return origin;
 const allowed=configured.split(',').map(x=>x.trim()).filter(Boolean);
 return origin!=='null'&&allowed.includes(origin)?origin:null;
}
export function gameCorsHeaders(req:Request,configured:string):Headers {
 const headers=new Headers({'Cache-Control':'no-store','Vary':'Origin'}),origin=allowedGameOrigin(req,configured);
 if(origin){headers.set('Access-Control-Allow-Origin',origin);headers.set('Access-Control-Allow-Methods','POST, OPTIONS');headers.set('Access-Control-Allow-Headers','Content-Type');}
 return headers;
}
