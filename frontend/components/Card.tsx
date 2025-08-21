'use client';export default function Card({title,value,unit,highlight=false}:{title:string;value:any;unit?:string;highlight?:boolean}){
return(<div className={`glass p-4 ${highlight?'ring-1 ring-accent-500/30':''}`}><div className="text-sm text-gray-300">{title}</div>
<div className="mt-1 text-2xl font-semibold tracking-tight">{value??'—'} {unit}</div></div>);}