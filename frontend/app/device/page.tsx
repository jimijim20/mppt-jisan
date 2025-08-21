'use client';
import { useEffect, useMemo, useState } from 'react';
import { useMqtt } from '@/components/MqttProvider';
import { queryTelemetry } from '@/lib/api';
import LiveChart from '@/components/LiveChart';
import WifiBadge from '@/components/WifiBadge';
import SetparamsForm from '@/components/SetparamsForm';
import Card from '@/components/Card';

const DEVICE_ID = 'esp32-01';
const TOPIC = (s: string) => `proj/garut/${DEVICE_ID}/${s}`;

export default function DevicePage() {
  const { msgs, via, lastMsgTs } = useMqtt();  // ⬅️ pastikan MqttProvider meng-expose via & lastMsgTs
  const [hist, setHist] = useState<any[]>([]);
  const [openForm, setOpenForm] = useState(false);

  // pesan telemetry terakhir
  const teleMsg = useMemo(
    () => [...msgs].reverse().find(m => m.topic === TOPIC('telemetry')),
    [msgs]
  );

  // retained online (jika ada dari MQTT)
  const retainedOnline = useMemo(() => {
    const st = [...msgs].reverse().find(m => m.topic === TOPIC('status/online'));
    return st?.payload === 1 || st?.payload === '1' || st?.payload === true;
  }, [msgs]);

  // Tentukan ONLINE dengan benar:
  // - jika via === 'polling': online jika ada telemetry baru ≤ 15 dtk
  // - jika via === 'mqtt'   : butuh retainedOnline && telemetry baru ≤ 15 dtk
  const now = Date.now();
  const lastTs = teleMsg?.ts ?? lastMsgTs;
  const hasFreshTelemetry = typeof lastTs === 'number' ? (now - lastTs <= 15000) : false;
  const isOnline = (via === 'polling')
    ? hasFreshTelemetry
    : (Boolean(retainedOnline) && hasFreshTelemetry);

  // Data live: jika offline, fallback ke 0 & Wi-Fi Disconnected
  const live = teleMsg?.payload;
  const liveSafe = isOnline && live ? live : {
    solarVoltage: 0,
    solarCurrent: 0,
    batteryVoltage: 0,
    batteryCurrent: 0,
    power: 0,
    todayYield: 0,
    lifetimeYield: 0,
    batteryState: '—',
    wifistatus: 'Disconnected',
    wifi: null,
  };

  async function loadHistory(d: string) {
    const res = await queryTelemetry(DEVICE_ID, `${d} 00:00:00`, `${d} 23:59:59`, 2000, 0);
    setHist(res.rows || []);
  }
  useEffect(() => { loadHistory(new Date().toISOString().slice(0, 10)); }, []);

  return (
    <div className="space-y-6">
      <div className="glass p-4 flex items-center gap-3">
        <h2 className="text-lg font-semibold">Perangkat: {DEVICE_ID}</h2>

        {/* Status realtime */}
        <WifiBadge
          online={isOnline}
          rssi={typeof live?.wifi?.rssi === 'number' ? live.wifi.rssi : undefined}
          lastSeenTs={lastTs}
          staleMs={15000}
        />

        <div className="ml-auto flex gap-2">
          <input type="date" className="input" onChange={e => loadHistory((e.target as HTMLInputElement).value)} />
          <a className="btn btn-outline" href={`/api/export_csv.php?device=${DEVICE_ID}`}>Ekspor CSV</a>
          <button onClick={() => setOpenForm(true)} className="btn btn-primary">Ubah Setparams</button>
        </div>
      </div>

      {/* Banner info sumber live */}
      <div className="text-xs text-gray-400">
        Live source: <b>{via === 'mqtt' ? 'MQTT (realtime)' : via === 'polling' ? 'DB polling (3 dtk)' : 'None'}</b>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        <Card title="Solar Voltage" value={liveSafe.solarVoltage} unit="V" />
        <Card title="Solar Current" value={liveSafe.solarCurrent} unit="A" />
        <Card title="Battery Voltage" value={liveSafe.batteryVoltage} unit="V" />
        <Card title="Battery Current" value={liveSafe.batteryCurrent} unit="A" />
        <Card title="Power" value={liveSafe.power} unit="W" highlight />
        <Card title="Battery State" value={liveSafe.batteryState} />
        <Card title="Today Yield" value={liveSafe.todayYield} unit="kWh" />
        <Card title="Lifetime Yield" value={liveSafe.lifetimeYield} unit="kWh" />
        <Card title="Wi-Fi Status" value={liveSafe.wifistatus ?? (isOnline ? 'Connected' : 'Disconnected')} />
      </div>

      <LiveChart
        livePoint={isOnline ? { ts: Date.now(), value: Number(liveSafe.power) || 0 } : undefined}
        history={hist.map((r: any) => ({ ts: new Date(r.ts).getTime(), value: Number(r.power) || 0 }))}
        title="Daya (W)"
      />

      {openForm && <SetparamsForm id={1} onClose={() => setOpenForm(false)} />}
    </div>
  );
}
