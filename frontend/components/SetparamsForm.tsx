'use client';import {useEffect,useState} from 'react';import Modal from '@/components/Modal';import {getSetparams,updateSetparams,Setparams} from '@/lib/api';
export default function SetparamsForm({id,onClose}:{id:number;onClose:()=>void}){const [loading,setLoading]=useState(true);const [saving,setSaving]=useState(false);
const [form,setForm]=useState<Setparams>({id,batteryVoltageSetting:null,batteryType:'',maxChargeCurrent:null,absorptionVoltage:null,absorptionTime:null,floatVoltage:null,reBulkVoltageOffset:null});
useEffect(()=>{(async()=>{try{const res=await getSetparams(id);if(res?.row){setForm(res.row as Setparams)}}finally{setLoading(false)}})()},[id]);
function setK(key: keyof Setparams,val:any){setForm(prev=>({...prev,[key]:val}))}
async function onSubmit(e:React.FormEvent){e.preventDefault();if(!confirm('Simpan perubahan parameter ke database?'))return;setSaving(true);try{
const body:any={id:form.id,batteryVoltageSetting:numOrNull(form.batteryVoltageSetting),batteryType:form.batteryType||null,maxChargeCurrent:numOrNull(form.maxChargeCurrent),
absorptionVoltage:numOrNull(form.absorptionVoltage),absorptionTime:numOrNull(form.absorptionTime),floatVoltage:numOrNull(form.floatVoltage),reBulkVoltageOffset:numOrNull(form.reBulkVoltageOffset)};
await updateSetparams(body);alert('Setparams tersimpan. Pastikan ESP32 polling endpoint setparams_latest.php');onClose();}finally{setSaving(false)}}
return(<Modal open={true} onClose={onClose}><form onSubmit={onSubmit} className="space-y-3"><div className="text-lg font-semibold">Ubah Parameter (setparams)</div>
{loading?<div>Memuat…</div>:(<div className="grid md:grid-cols-2 gap-3">
<Field label="Battery Voltage Setting (V)"><input type="number" step="0.01" value={val(form.batteryVoltageSetting)} onChange={e=>setK('batteryVoltageSetting',num(e.target.value))} className="input" placeholder="mis. 12.0"/></Field>
<Field label="Battery Type"><input list="battery-types" value={form.batteryType||''} onChange={e=>setK('batteryType',e.target.value)} className="input" placeholder="LeadAcid / LiFePO4 / Lithium-Ion"/>
<datalist id="battery-types"><option>LeadAcid</option><option>LiFePO4</option><option>Lithium-Ion</option><option>Gel</option><option>AGM</option></datalist></Field>
<Field label="Max Charge Current (A)"><input type="number" step="0.1" value={val(form.maxChargeCurrent)} onChange={e=>setK('maxChargeCurrent',num(e.target.value))} className="input" placeholder="mis. 10"/></Field>
<Field label="Absorption Voltage (V)"><input type="number" step="0.01" value={val(form.absorptionVoltage)} onChange={e=>setK('absorptionVoltage',num(e.target.value))} className="input" placeholder="mis. 14.4"/></Field>
<Field label="Absorption Time (menit)"><input type="number" step="1" value={val(form.absorptionTime)} onChange={e=>setK('absorptionTime',num(e.target.value))} className="input" placeholder="mis. 120"/></Field>
<Field label="Float Voltage (V)"><input type="number" step="0.01" value={val(form.floatVoltage)} onChange={e=>setK('floatVoltage',num(e.target.value))} className="input" placeholder="mis. 13.6"/></Field>
<Field label="Re-Bulk Voltage Offset (V)"><input type="number" step="0.01" value={val(form.reBulkVoltageOffset)} onChange={e=>setK('reBulkVoltageOffset',num(e.target.value))} className="input" placeholder="mis. 0.3"/></Field>
</div>)}<div className="flex justify-end gap-2"><button type="button" onClick={onClose} className="btn btn-outline">Batal</button>
<button disabled={saving} className="btn btn-primary">{saving?'Menyimpan…':'Simpan'}</button></div>
<p className="text-xs text-gray-400">Perubahan akan tersimpan ke tabel <code>setparams</code> (id=1). ESP32 sebaiknya polling endpoint <code>/api/setparams_latest.php?id=1</code>.</p></form></Modal>);}
function Field({label,children}:{label:string;children:React.ReactNode}){return(<label className="block"><div className="label">{label}</div>{children}</label>);}
function num(v:string){const n=parseFloat(v);return Number.isFinite(n)?n:null}function val(n:any){return n??''}function numOrNull(x:any){const n=typeof x==='string'?parseFloat(x):x;return Number.isFinite(n)?n:null}
