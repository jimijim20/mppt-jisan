'use client';import {ReactNode,useEffect} from 'react';export default function Modal({open,onClose,children}:{open:boolean;onClose:()=>void;children:ReactNode}){
useEffect(()=>{const onKey=(e:KeyboardEvent)=>{if(e.key==='Escape')onClose()};document.addEventListener('keydown',onKey);return()=>document.removeEventListener('keydown',onKey)},[onClose]);
if(!open)return null;return(<div className="fixed inset-0 z-50 flex items-center justify-center"><div className="absolute inset-0 bg-black/50" onClick={onClose}/>
<div className="relative glass w-full max-w-xl p-5">{children}</div></div>);}