/**
 * 오늘의 판 (daily table). Everyone gets the same 3-player deal on the same Korean calendar date; one round;
 * the server records the round score itself (the browser never sends a score), first finished round per device.
 */
export const DAILY_SIZE=3;
export const DAILY_AI_NAMES=['달빛','해솔'] as const;
const KST_MS=9*60*60*1000;
/** Korean date, YYYY-MM-DD. The new daily table opens at midnight KST. */
export function dailyDate(now=Date.now()){return new Date(now+KST_MS).toISOString().slice(0,10);}
export function isDailyDate(value:unknown):value is string{return typeof value==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(value);}
/** FNV-1a → mulberry32: small, deterministic, identical on server and in tests. */
export function dailySeed(date:string){let h=0x811c9dc5;for(const ch of `turntale-daily:${date}`){h^=ch.charCodeAt(0);h=Math.imul(h,0x01000193);}return h>>>0;}
export function seededRandom(seed:number){let a=seed>>>0;return ()=>{a=(a+0x6d2b79f5)>>>0;let t=a;t=Math.imul(t^(t>>>15),t|1);t^=t+Math.imul(t^(t>>>7),t|61);return ((t^(t>>>14))>>>0)/4294967296;};}
export function shuffleDaily<T>(deck:T[],date:string){const random=seededRandom(dailySeed(date));for(let i=deck.length-1;i>0;i--){const j=Math.floor(random()*(i+1));[deck[i],deck[j]]=[deck[j],deck[i]];}return deck;}

/* ---------- Server table (created on first use; tile records and the regular leaderboard stay separate) ---------- */
/**
 * One row per device and date, written when the day's FIRST daily table is created (done=0) and filled in when
 * that table's round ends (done=1). Later tables that day are practice only, so nobody can peek at the deal,
 * quit and replay it for the board. Rows with done=0 never show on the board.
 */
export const DAILY_TABLE_SQL="CREATE TABLE IF NOT EXISTS daily_scores (id TEXT PRIMARY KEY NOT NULL,device TEXT NOT NULL,name TEXT NOT NULL,date TEXT NOT NULL,code TEXT NOT NULL,score INTEGER NOT NULL DEFAULT 0,win INTEGER NOT NULL DEFAULT 0,at INTEGER NOT NULL,done INTEGER NOT NULL DEFAULT 0)";
export const DAILY_INDEX_SQL="CREATE INDEX IF NOT EXISTS daily_scores_date_score ON daily_scores (date,score DESC,at)";
/** Keep about two weeks of daily boards. */
export const DAILY_PRUNE_SQL="DELETE FROM daily_scores WHERE date < ?";
export function dailyPruneBefore(now=Date.now()){return dailyDate(now-14*24*60*60*1000);}
export const DAILY_PAGE=20;
