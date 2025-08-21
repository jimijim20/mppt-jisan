'use client';

import React, { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react';
import type { MqttClient } from 'mqtt';
import { connectMqttAsync } from '@/lib/mqttClient';

type Msg = { topic: string; payload: any; ts: number };

type LiveCtx = {
  client?: MqttClient;
  msgs: Msg[];
  connected: boolean;              // true jika ada sumber live (MQTT atau polling)
  via: 'mqtt' | 'polling' | 'none';
  lastMsgTs?: number;              // waktu pesan live terakhir (ms)
};

const Ctx = createContext<LiveCtx>({ msgs: [], connected: false, via: 'none' });
export const useMqtt = () => useContext(Ctx);

export default function MqttProvider({ children }: { children: React.ReactNode }) {
  const [client, setClient] = useState<MqttClient>();
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [via, setVia] = useState<'mqtt' | 'polling' | 'none'>('none');
  const [connected, setConnected] = useState(false);
  const lastMsgTsRef = useRef<number | undefined>(undefined);

  useEffect(() => {
    let closed = false;
    let poller: any;

    (async () => {
      try {
        const c = await connectMqttAsync(); // connect hanya di browser
        if (closed) return;
        setClient(c);
        setVia('mqtt');

        const onConnect = () => { setConnected(true); };
        const onClose = () => { setConnected(false); };
        c.on('connect', onConnect);
        c.on('reconnect', onClose);
        c.on('close', onClose);
        c.on('end', onClose);
        c.subscribe('proj/garut/+/telemetry', { qos: 0 });
        c.subscribe('proj/garut/+/status/online', { qos: 0 });
        c.on('message', (topic, buf) => {
          let payload: any;
          try { payload = JSON.parse(buf.toString()); } catch { payload = buf.toString(); }
          const ts = Date.now();
          lastMsgTsRef.current = ts;
          setMsgs(m => (m.length > 2000 ? m.slice(-1000) : m).concat([{ topic, payload, ts }]));
        });
      } catch (e) {
        // Fallback ke polling DB
        setVia('polling');
        setConnected(true);
        const device = 'esp32-01'; // single device sesuai kebutuhanmu
        poller = setInterval(async () => {
          try {
            const res = await fetch(`/api/telemetry_latest.php?device=${device}`, { cache: 'no-store' });
            if (!res.ok) return;
            const payload = await res.json();
            const ts = Date.now();
            lastMsgTsRef.current = ts;
            setMsgs(m => (m.length > 2000 ? m.slice(-1000) : m).concat([{
              topic: `proj/garut/${device}/telemetry`,
              payload,
              ts,
            }]));
          } catch (_) { /* abaikan */ }
        }, 3000);
      }
    })();

    return () => {
      closed = true;
      try { client?.end(true); } catch {}
      if (poller) clearInterval(poller);
    };
  }, []); // eslint-disable-line

  const value = useMemo<LiveCtx>(() => ({
    client, msgs, connected, via, lastMsgTs: lastMsgTsRef.current,
  }), [client, msgs, connected, via]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}
