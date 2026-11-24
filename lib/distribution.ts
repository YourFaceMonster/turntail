/** Replaced only by the standalone store build; the Cloudflare app keeps its defaults. */
declare const __TURNTALE_TARGET__: 'itch'|'onestore'|'play'|'web';
declare const __TURNTALE_API__: string;
declare const __TURNTALE_AD_PLACEMENT__: string;
export const distributionTarget = typeof __TURNTALE_TARGET__ === 'undefined' ? 'web' : __TURNTALE_TARGET__;
export const apiBase = typeof __TURNTALE_API__ === 'undefined' ? '' : __TURNTALE_API__;
export const adPlacement = typeof __TURNTALE_AD_PLACEMENT__ === 'undefined' ? '' : __TURNTALE_AD_PLACEMENT__;
export function gameFetch(input: string, init?: RequestInit): Promise<Response> {
 return fetch(apiBase + input, init);
}
export function inviteUrl(kind:'room'|'yacht', code:string):string {
 // The Play app runs at https://localhost inside the APK, so its invites point at the public site.
 const base = distributionTarget === 'web' ? location.origin+'/' : distributionTarget === 'play' ? apiBase+'/' : new URL('./index.html',location.href).href;
 return `${base}?${kind}=${encodeURIComponent(code)}`;
}
