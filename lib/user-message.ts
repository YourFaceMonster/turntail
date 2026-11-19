/**
 * 2026-11-19 (QA REG-4): what the player sees when something fails.
 * Browser network failures ("Failed to fetch", "Load failed", "NetworkError…") become one Korean notice;
 * messages the game itself throws (already Korean) pass through; other English internals fall back to the caller's text.
 */
export const NETWORK_ERROR_MESSAGE='서버에 연결하지 못했어요. 인터넷 연결을 확인하고 잠시 후 다시 시도해 주세요.';
export function userMessage(error:unknown,fallback:string):string{
 const text=error instanceof Error?error.message:typeof error==='string'?error:'';
 if(/failed to fetch|load failed|networkerror|network request failed|fetch failed/i.test(text))return NETWORK_ERROR_MESSAGE;
 return /[가-힣]/.test(text)?text:fallback;
}