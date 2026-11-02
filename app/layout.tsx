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
export const metadata:Metadata={title:"턴테일 TURNTALE | 한 장의 선택, 새로운 이야기",description:"네 가지 색의 패로 펼치는 전략 게임. AI 대전, 친구 대전, 공중섬 스테이지 도전과 전체 순위."};
export const viewport:Viewport={width:"device-width",initialScale:1,viewportFit:"cover",themeColor:"#101c19"};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="ko"><body>{children}</body></html>;}
