'use client';
import { useEffect, useState } from 'react';
import { latestTelemetry } from '@/lib/api';
import WifiBadge from '@/components/WifiBadge';
import Card from '@/components/Card';

type Tele = {
  ts_ms?: number;
  solarVoltage?: number; solarCurrent?: number;
  batteryVoltage?: number; batteryCurrent?: number;
  power?: number; todayYield?: number; lifetimeYield?: number;
  batteryState?: string; wifistatus?: string; wifi?: { rssi?: number } | null;
};

export default function MainPage(){
  const [tele, setTele] = useState<Tele|undefined>(undefined);
  const [lastTs, setLastTs] = useState<number|undefined>(undefined);
  const [err, setErr] = useState<string>("");

  useEffect(()=>{
    let t:any;
    const tick = async ()=>{
      try{
        const r = await latestTelemetry();
        setTele(r||undefined);
        setLastTs(r?.ts_ms);
        setErr("");
      }catch(e:any){
        setErr(e?.message || "latestTelemetry error");
      }
    };
    tick(); t=setInterval(tick, 1000);
    return ()=>clearInterval(t);
  },[]);

  const now = Date.now();
  const fresh = typeof lastTs==='number' && (now - lastTs <= 10000);
  const isOnline = fresh;
  const safe = isOnline && tele ? tele : {
    solarVoltage:0, solarCurrent:0, batteryVoltage:0, batteryCurrent:0,
    power:0, todayYield:0, lifetimeYield:0, batteryState:'—', wifistatus:'Disconnected', wifi:null
  };

  return(
    <main className="space-y-6">
      <div className="glass p-4 flex items-center gap-3">
        <h2 className="text-lg font-semibold">Perangkat: ESP-32</h2>
        <WifiBadge online={isOnline} rssi={typeof tele?.wifi?.rssi==='number'? tele!.wifi!.rssi : undefined} />
        {/*lastSeenTs={lastTs} staleMs={10000} kasih di ujung line 48*/}
      </div>

      {err && <div className="glass p-3 border-red-400/40 text-red-300">
        <div className="text-sm font-medium">API Error</div>
        <div className="text-xs break-all">{err}</div>
      </div>}

      <div className="grid md:grid-cols-3 gap-4">
        <Card title="Solar Voltage" value={safe.solarVoltage} unit="V"/>
        <Card title="Solar Current" value={safe.solarCurrent} unit="A"/>
        <Card title="Battery Voltage" value={safe.batteryVoltage} unit="V"/>
        <Card title="Battery Current" value={safe.batteryCurrent} unit="A"/>
        <Card title="Power" value={safe.power} unit="W" highlight/>
        <Card title="Battery State" value={safe.batteryState}/>
        <Card title="Today Yield" value={safe.todayYield} unit="kWh"/>
        <Card title="Lifetime Yield" value={safe.lifetimeYield} unit="kWh"/>
        <Card title="Wi-Fi Status" value={safe.wifistatus ?? (isOnline?'Connected':'Disconnected')}/>
      </div>
    </main>
  );
}
