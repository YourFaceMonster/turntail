import {createServer} from 'node:http';
import {readFile,stat} from 'node:fs/promises';
import {resolve,extname,sep} from 'node:path';
export async function serveStores(output,port=0){
 const base=resolve(output),mime={'.html':'text/html; charset=utf-8','.js':'text/javascript','.css':'text/css','.webp':'image/webp','.png':'image/png','.mp3':'audio/mpeg','.svg':'image/svg+xml','.ico':'image/x-icon'};
 const server=createServer(async(req,res)=>{try{
  const pathname=decodeURIComponent(new URL(req.url,'http://localhost').pathname);
  const path=resolve(base,'.'+pathname+(pathname.endsWith('/')?'index.html':''));
  if(!path.startsWith(base+sep))throw Error('Outside preview');
  const info=await stat(path);if(!info.isFile())throw Error('Not a file');
  res.writeHead(200,{'Content-Type':mime[extname(path)]||'application/octet-stream'});res.end(await readFile(path));
 }catch{res.writeHead(404);res.end('Not found');}});
 await new Promise(resolve=>server.listen(port,'127.0.0.1',resolve));
 return {server,origin:`http://127.0.0.1:${server.address().port}`};
}
if(process.argv[1]?.replaceAll('\\','/').endsWith('/preview-stores.mjs')){
 const {origin}=await serveStores(process.argv[2],Number(process.argv[3]||5189));
 console.log(`${origin}/itch/game/index.html\n${origin}/onestore/game/index.html`);
}
