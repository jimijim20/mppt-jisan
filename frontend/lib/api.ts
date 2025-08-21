export type TelemetryRow = {
  ts?: string;        // "YYYY-MM-DD HH:MM:SS" dari DB
  ts_ms?: number;     // jika backend kirim ms
  solarVoltage?: number; solarCurrent?: number;
  batteryVoltage?: number; batteryCurrent?: number;
  power?: number; todayYield?: number; lifetimeYield?: number;
  batteryState?: string; wifistatus?: string;
};

export async function latestTelemetry(){
  const res = await fetch('/api/telemetry_latest.php', { cache:'no-store' });
  if(!res.ok) throw new Error('latestTelemetry failed');
  return res.json();
}
export async function rangeTelemetry(start:string,end:string,limit=10000,offset=0){
  const u=new URL('/api/telemetry_range.php', location.origin);
  u.searchParams.set('start', start); u.searchParams.set('end', end);
  u.searchParams.set('limit', String(limit)); u.searchParams.set('offset', String(offset));
  const res = await fetch(u.toString(), { cache:'no-store' });
  if(!res.ok) throw new Error('rangeTelemetry failed');
  return res.json();
}
export type Setparams={id:number;batteryVoltageSetting:number|null;batteryType:string|null;maxChargeCurrent:number|null;absorptionVoltage:number|null;absorptionTime:number|null;floatVoltage:number|null;reBulkVoltageOffset:number|null;};
export async function getSetparams(id=1):Promise<{row:Setparams}>{ const u=new URL('/api/setparams_get.php', location.origin); u.searchParams.set('id', String(id));
  const r=await fetch(u.toString(), { cache:'no-store' }); if(!r.ok) throw new Error('getSetparams failed'); return r.json(); }
export async function updateSetparams(body:Partial<Setparams>&{id:number}){
  const r=await fetch('/api/setparams_update.php', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(body) });
  if(!r.ok) throw new Error('updateSetparams failed'); return r.json();
}

// --- COMPAT SHIM untuk kode lama ---
// Signature lama: queryTelemetry(device, start, end, limit?, offset?)
// Di mode DB-only, parameter `device` tidak dipakai.
export async function queryTelemetry(
  _device: string,
  start: string,
  end: string,
  limit = 1000,
  offset = 0
){
  return rangeTelemetry(start, end, limit, offset);
}