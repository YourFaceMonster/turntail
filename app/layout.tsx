import type { Metadata } from "next";
import "./globals.css";
export const metadata:Metadata={title:"렉시오 장성 | 친구들과 한 판",description:"패를 내거나, 길을 열거나. 3인 장성룰 타일 게임."};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="ko"><body>{children}</body></html>;}
