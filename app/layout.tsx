import type { Metadata, Viewport } from "next";
import "./globals.css";
export const metadata:Metadata={title:"렉시오 장성 | 친구들과 한 판",description:"패를 내거나, 길을 열거나. 2·3·4인 장성룰 타일 게임."};
export const viewport:Viewport={width:"device-width",initialScale:1,viewportFit:"cover",themeColor:"#101c19"};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="ko"><body>{children}</body></html>;}
