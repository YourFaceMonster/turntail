import type { Metadata, Viewport } from "next";
import "./globals.css";
import "./item-match.css";
import "./combat-refinements.css";
import "./item-shop.css";
import "./ui-polish.css";
import "./rpg-phase-one.css";
import "./rpg-journey.css";
import "./tavern-characters.css";
import "./rpg-prologue.css";
import "./relic-rail.css";
import "./journey-polish.css";
import "./journey-hud.css";
import "./landscape-stacked.css";
const SITE_DESCRIPTION="네 가지 문양의 패로 겨루는 카드 게임. 10스테이지 스토리 여정, 요트다이스, 오늘의 판 순위와 친구 대전.";
export const metadata:Metadata={
 metadataBase:new URL("https://turntail.yousexybaby.workers.dev"),
 title:"턴테일 TURNTALE | 한 장의 선택, 새로운 이야기",
 description:SITE_DESCRIPTION,
 icons:{icon:[{url:"/favicon.ico",sizes:"32x32 48x48"},{url:"/icon-512.png",type:"image/png",sizes:"512x512"}],apple:"/apple-touch-icon.png"},
 openGraph:{type:"website",siteName:"턴테일 TURNTALE",title:"턴테일 TURNTALE | 한 장의 선택, 새로운 이야기",description:SITE_DESCRIPTION,locale:"ko_KR",images:[{url:"/og-turntale-v1.jpg",width:1200,height:630,alt:"턴테일 — 왕관·열쇠·성화·철문 패가 놓인 밤의 서재"}]},
 twitter:{card:"summary_large_image",title:"턴테일 TURNTALE",description:SITE_DESCRIPTION,images:["/og-turntale-v1.jpg"]},
};
export const viewport:Viewport={width:"device-width",initialScale:1,viewportFit:"cover",themeColor:"#101c19"};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="ko"><body>{children}</body></html>;}
