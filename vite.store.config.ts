import {defineConfig} from 'vite';
import react from '@vitejs/plugin-react';
import {fileURLToPath} from 'node:url';
import {readdirSync} from 'node:fs';
const root=fileURLToPath(new URL('.',import.meta.url)),publicPath=fileURLToPath(new URL('./public/',import.meta.url));
const prefixes=readdirSync(publicPath).map(x=>x.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')).join('|');
const assets=new RegExp('([\'"`])/(('+prefixes+')(?:/|(?=[\'"`?#])))','g');
export default defineConfig(()=>{
 const target=process.env.TURNTALE_TARGET||'itch';if(!['itch','onestore'].includes(target))throw Error('Unknown store target');
 const api=process.env.TURNTALE_API_ORIGIN||'https://turntail.yousexybaby.workers.dev';
 if(!/^https:\/\/[^/]+$/.test(api)&&!/^http:\/\/(localhost|127\.0\.0\.1):\d+$/.test(api))throw Error('Expected an HTTPS API origin');
 return {root:fileURLToPath(new URL('./store/',import.meta.url)),base:'./',publicDir:publicPath,
  define:{__TURNTALE_TARGET__:JSON.stringify(target),__TURNTALE_API__:JSON.stringify(api),__TURNTALE_AD_PLACEMENT__:JSON.stringify(target==='onestore'?process.env.TURNTALE_ONESTORE_PLACEMENT||'':'')},
  // ONE store: the host WebView reports safe-area-inset-top as 0 although the camera punch hole covers the top,
  // so every env(safe-area-inset-top) in the game CSS uses --store-safe-top instead (store/onestore-safe-area.css).
  plugins:[...(target==='onestore'?[{name:'turntale-onestore-safe-top',enforce:'pre' as const,transform(code:string,id:string){if(!/\.css(\?|$)/.test(id)||id.includes('onestore-safe-area.css'))return;return code.replace(/env\(\s*safe-area-inset-top\s*(,[^()]*)?\)/g,'var(--store-safe-top,0px)');}}]:[]),{name:'turntale-relative-public-assets',enforce:'pre',transform(code,id){if(id.replaceAll('\\','/').toLowerCase().startsWith(root.replaceAll('\\','/').toLowerCase())&&!id.includes('node_modules')&&/\.[cm]?[jt]sx?$/.test(id))return code.replace(assets,'$1./$2');}},react()],
  build:{outDir:fileURLToPath(new URL(`./outputs/stores/${target}/game/`,import.meta.url)),emptyOutDir:false,copyPublicDir:false,sourcemap:false,assetsInlineLimit:0,
   rollupOptions:{output:{manualChunks(id){if(id.includes('node_modules'))return 'vendor';}}}},
 };
});
