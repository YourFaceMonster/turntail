"use client";
import {createContext,useContext,type ReactNode} from 'react';
const BombEditionContext=createContext(false);
export const useBombEdition=()=>useContext(BombEditionContext);
export function BombMarketEdition({children}:{children:ReactNode}){return <BombEditionContext.Provider value>{children}</BombEditionContext.Provider>;}
