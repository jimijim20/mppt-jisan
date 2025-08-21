'use client';
import { useEffect, useState } from 'react';
import { getSetparams, updateSetparams, type Setparams } from '@/lib/api';

export default function SettingPage(){
  const [form, setForm] = useState<Setparams>({ id:1, batteryVoltageSetting:null, batteryType:'', maxChargeCurrent:null, absorptionVoltage:null, absorptionTime:null, floatVoltage:null, reBulkVoltageOffset:null });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(()=>{(async()=>{ try{ const r=await getSetparams(1); if(r?.row) setForm(r.row as any);} finally{ setLoading(false);} })();},[]);
  function set<K extends keyof Setparams>(k:K, v:any){ setForm(prev=>({...prev,[k]:v})); }
  function num(s:string){ const n=parseFloat(s); return Number.isFinite(n)? n:null; }

  async function onSubmit(e:React.FormEvent){
    e.preventDefault();
    if(!confirm('Simpan perubahan parameter ke database?')) return;
    setSaving(true);
    try{
      const b:any={ id: form.id };
      b.batteryVoltageSetting = form.batteryVoltageSetting===null? null : Number(form.batteryVoltageSetting);
      b.batteryType = form.batteryType || null;
      b.maxChargeCurrent = form.maxChargeCurrent===null? null : Number(form.maxChargeCurrent);
      b.absorptionVoltage = form.absorptionVoltage===null? null : Number(form.absorptionVoltage);
      b.absorptionTime = form.absorptionTime===null? null : Number(form.absorptionTime);
      b.floatVoltage = form.floatVoltage===null? null : Number(form.floatVoltage);
      b.reBulkVoltageOffset = form.reBulkVoltageOffset===null? null : Number(form.reBulkVoltageOffset);
      await updateSetparams(b);
      alert('Setparams tersimpan.');
    } finally { setSaving(false); }
  }

  return(<main className="space-y-4">
    <div className="glass p-4"><h2 className="text-lg font-semibold">Setting</h2><p className="text-xs text-gray-400"></p></div>
    <form onSubmit={onSubmit} className="glass p-4 grid md:grid-cols-2 gap-3">
      {loading? <div>Memuat…</div> : (<>
        <Field label="Battery Voltage Setting (V)"><input className="input" type="number" step="0.01" value={form.batteryVoltageSetting ?? ''} onChange={e=>set('batteryVoltageSetting', num(e.target.value))}/></Field>
        <Field label="Battery Type"><input className="input" list="bt" value={form.batteryType||''} onChange={e=>set('batteryType', e.target.value)}/><datalist id="bt"><option>LeadAcid</option><option>LiFePO4</option><option>Lithium-Ion</option><option>Gel</option><option>AGM</option></datalist></Field>
        <Field label="Max Charge Current (A)"><input className="input" type="number" step="0.1" value={form.maxChargeCurrent ?? ''} onChange={e=>set('maxChargeCurrent', num(e.target.value))}/></Field>
        <Field label="Absorption Voltage (V)"><input className="input" type="number" step="0.01" value={form.absorptionVoltage ?? ''} onChange={e=>set('absorptionVoltage', num(e.target.value))}/></Field>
        <Field label="Absorption Time (menit)"><input className="input" type="number" step="1" value={form.absorptionTime ?? ''} onChange={e=>set('absorptionTime', num(e.target.value))}/></Field>
        <Field label="Float Voltage (V)"><input className="input" type="number" step="0.01" value={form.floatVoltage ?? ''} onChange={e=>set('floatVoltage', num(e.target.value))}/></Field>
        <Field label="Re-Bulk Voltage Offset (V)"><input className="input" type="number" step="0.01" value={form.reBulkVoltageOffset ?? ''} onChange={e=>set('reBulkVoltageOffset', num(e.target.value))}/></Field>
      </>)}
      <div className="md:col-span-2 flex justify-end"><button disabled={saving} className="btn btn-primary">{saving? 'Menyimpan…':'Simpan'}</button></div>
    </form>
  </main>);
}
function Field({label,children}:{label:string;children:React.ReactNode}){ return(<label className="block"><div className="label">{label}</div>{children}</label>); }
