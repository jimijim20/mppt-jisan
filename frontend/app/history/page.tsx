'use client';
import { useEffect, useRef, useState } from 'react';
import { latestTelemetry, rangeTelemetry } from '@/lib/api';
import LiveChart from '@/components/LiveChart';

type Pt = { ts: number; value: number };
const VARS = [
  { key: 'power',          label: 'Power (W)' },
  { key: 'solarVoltage',   label: 'Solar Voltage (V)' },
  { key: 'solarCurrent',   label: 'Solar Current (A)' },
  { key: 'batteryVoltage', label: 'Battery Voltage (V)' },
  { key: 'batteryCurrent', label: 'Battery Current (A)' },
  { key: 'todayYield',     label: 'Today Yield (kWh)' },
  { key: 'lifetimeYield',  label: 'Lifetime Yield (kWh)' },
] as const;

const WINDOW_MS = 30 * 60 * 1000; // 1 jam

export default function HistoryPage() {
  const [mode, setMode] = useState<'realtime' | 'range'>('realtime');
  const [data, setData] = useState<Record<string, Pt[]>>({});
  const timer = useRef<any>(null);
  const lastTsRef = useRef<number>(0);

  const [start, setStart] = useState('');
  const [end, setEnd] = useState('');

  // Helper
  const pad = (n: number) => String(n).padStart(2, '0');
  const fmtLocal = (d: Date) =>
    `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  const toTsMs = (r: any): number => {
    if (typeof r?.ts_ms === 'number') return r.ts_ms;
    if (r?.ts) {
      const t = Date.parse(String(r.ts).replace(' ', 'T'));
      return Number.isFinite(t) ? t : Date.now();
    }
    return Date.now();
  };

  // Default range = 1 jam terakhir
  useEffect(() => {
    const now = new Date();
    setEnd(fmtLocal(now));
    setStart(fmtLocal(new Date(now.getTime() - WINDOW_MS)));
  }, []);

  // Muat data awal 1 jam saat masuk mode realtime, lalu append tiap detik
  useEffect(() => {
    async function initRealtime() {
      // 1) load 1 jam terakhir sebagai baseline
      const now = new Date();
      const startSql = `${fmtLocal(new Date(now.getTime() - WINDOW_MS)).replace('T', ' ')}:00`;
      const endSql = `${fmtLocal(now).replace('T', ' ')}:59`;
      try {
        const res = await rangeTelemetry(startSql, endSql, 20000, 0);
        const rows: any[] = res?.rows || [];
        const nd: Record<string, Pt[]> = {};
        for (const v of VARS) nd[v.key] = [];
        let maxTs = 0;
        for (const row of rows) {
          const ts = toTsMs(row);
          maxTs = Math.max(maxTs, ts);
          for (const v of VARS) {
            const val = Number(row[v.key]) || 0;
            nd[v.key].push({ ts, value: val });
          }
        }
        lastTsRef.current = maxTs;
        setData(nd);
      } catch {
        // abaikan error awal
      }

      // 2) mulai polling latest tiap 1 detik + sliding window 1 jam
      if (timer.current) clearInterval(timer.current);
      const tick = async () => {
        try {
          const r = await latestTelemetry();
          const ts = toTsMs(r);
          if (ts <= lastTsRef.current) return; // skip duplikat/mundur
          lastTsRef.current = ts;

          const cutoff = Math.max(Date.now(), ts) - WINDOW_MS; // jaga window 1 jam
          setData((prev) => {
            const next: Record<string, Pt[]> = { ...prev };
            for (const v of VARS) {
              const val = Number((r as any)[v.key]) || 0;
              const arr = (next[v.key] ? [...next[v.key]] : []);
              arr.push({ ts, value: val });
              // trim data di luar window
              while (arr.length && arr[0].ts < cutoff) arr.shift();
              next[v.key] = arr;
            }
            return next;
          });
        } catch {
          // boleh diabaikan sementara
        }
      };
      tick();
      timer.current = setInterval(tick, 1000);
    }

    if (mode === 'realtime') {
      if (timer.current) clearInterval(timer.current);
      initRealtime();
      return () => { if (timer.current) clearInterval(timer.current); };
    } else {
      if (timer.current) clearInterval(timer.current);
    }
  }, [mode]);

  // Load histori berdasarkan rentang
  async function loadRange() {
    if (!start || !end) { alert('Isi start & end'); return; }
    const s = start.replace('T', ' ') + ':00';
    const e = end.replace('T', ' ') + ':59';
    try {
      const res = await rangeTelemetry(s, e, 20000, 0);
      const rows = res.rows || [];
      const nd: Record<string, Pt[]> = {};
      for (const v of VARS) {
        nd[v.key] = rows.map((r: any) => ({
          ts: new Date(r.ts).getTime(),
          value: Number(r[v.key]) || 0
        }));
      }
      setData(nd);
      // set lastTsRef agar bila kembali ke realtime tidak salah deteksi
      const maxTs = rows.length ? Math.max(...rows.map((r: any) => new Date(r.ts).getTime())) : 0;
      if (maxTs) lastTsRef.current = maxTs;
    } catch {
      alert('Gagal memuat histori');
    }
  }

  return (
    <main className="space-y-4">
      <div className="glass p-4 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div className="text-sm text-gray-300">Mode</div>
        <div className="flex gap-2">
          <button className={`btn ${mode === 'realtime' ? 'btn-primary' : ''}`} onClick={() => setMode('realtime')}>
            Latest 30 min
          </button>
          <button className={`btn ${mode === 'range' ? 'btn-primary' : ''}`} onClick={() => setMode('range')}>
            Filter History
          </button>
        </div>
      </div>

      {mode === 'range' && (
        <div className="glass p-4 grid md:grid-cols-4 gap-3 items-end">
          <div>
            <div className="label">Start</div>
            <input type="datetime-local" className="input" value={start} onChange={e => setStart(e.target.value)} />
          </div>
          <div>
            <div className="label">End</div>
            <input type="datetime-local" className="input" value={end} onChange={e => setEnd(e.target.value)} />
          </div>
          <div className="md:col-span-2">
            <button className="btn btn-primary w-full" onClick={loadRange}>Tampilkan Histori</button>
          </div>
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-4">
        {VARS.map(v => (
          <LiveChart key={v.key} title={`Grafik: ${v.label}`} data={data[v.key] || []} />
        ))}
      </div>
    </main>
  );
}
