'use client';import {useState} from 'react';
export default function Login(){const [u,setU]=useState(''),[p,setP]=useState('');async function onSubmit(e:React.FormEvent){e.preventDefault();
const r=await fetch('/api/login.php',{method:'POST',body:JSON.stringify({username:u,password:p})});if(r.ok){location.href='/device';}else alert('Login gagal');}
return(<main className="max-w-sm mx-auto"><form onSubmit={onSubmit} className="glass p-6 space-y-3 mt-8"><h2 className="text-lg font-semibold">Masuk</h2>
<div><div className="label">Username</div><input className="input" value={u} onChange={e=>setU(e.target.value)}/></div>
<div><div className="label">Password</div><input type="password" className="input" value={p} onChange={e=>setP(e.target.value)}/></div>
<button className="btn btn-primary w-full">Masuk</button></form></main>);}