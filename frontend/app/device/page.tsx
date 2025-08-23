"use client";

import { useEffect, useState } from "react";
import WifiBadge from "@/components/WifiBadge";
import Card from "@/components/Card";
import LiveChart from "@/components/LiveChart";
import SetparamsForm from "@/components/SetparamsForm";
import { queryTelemetry } from "@/lib/api";

const DEVICE_ID = "esp32-01"; // sesuaikan dengan device kamu

export default function DevicePage() {
  const [hist, setHist] = useState<any[]>([]);
  const [live, setLive] = useState<any>(null);
  const [openForm, setOpenForm] = useState(false);
  const [via, setVia] = useState<string>("none");
  const [isOnline, setIsOnline] = useState(false);
  const [lastTs, setLastTs] = useState<number>(0);

  const liveSafe = live || {
    solarVoltage: 0,
    solarCurrent: 0,
    batteryVoltage: 0,
    batteryCurrent: 0,
    power: 0,
    batteryState: "Unknown",
    todayYield: 0,
    lifetimeYield: 0,
    wifistatus: "Disconnected",
  };

  async function loadHistory(d: string) {
    const res = await queryTelemetry(
      DEVICE_ID,
      `${d} 00:00:00`,
      `${d} 23:59:59`,
      2000,
      0
    );
    setHist(res.rows || []);
  }

  useEffect(() => {
    loadHistory(new Date().toISOString().slice(0, 10));
  }, []);

  return (
    <div className="space-y-6">
      <div className="glass p-4 flex items-center gap-3">
        <h2 className="text-lg font-semibold">Perangkat: {DEVICE_ID}</h2>

        {/* Status realtime */}
        <WifiBadge
          online={isOnline}
          rssi={typeof live?.wifi?.rssi === "number" ? live.wifi.rssi : undefined}
          lastTsMs={lastTs}
          staleTimeoutMs={15000}
        />

        <div className="ml-auto flex gap-2">
          <input
            type="date"
            className="input"
            onChange={(e) =>
              loadHistory((e.target as HTMLInputElement).value)
            }
          />
          <a
            className="btn btn-outline"
            href={`/api/export_csv.php?device=${DEVICE_ID}`}
          >
            Ekspor CSV
          </a>
          <button
            onClick={() => setOpenForm(true)}
            className="btn btn-primary"
          >
            Ubah Setparams
          </button>
        </div>
      </div>

      <div className="text-xs text-gray-400">
        Live source:{" "}
        <b>
          {via === "mqtt"
            ? "MQTT (realtime)"
            : via === "polling"
            ? "DB polling (3 dtk)"
            : "None"}
        </b>
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
        <Card
          title="Wi-Fi Status"
          value={
            liveSafe.wifistatus ?? (isOnline ? "Connected" : "Disconnected")
          }
        />
      </div>

      <LiveChart
        livePoint={
          isOnline
            ? { ts: Date.now(), value: Number(liveSafe.power) || 0 }
            : undefined
        }
        data={hist.map((r: any) => ({
          ts: new Date(r.ts).getTime(),
          value: Number(r.power) || 0,
        }))}
        title="Daya (W)"
	yUnit="W"
      />

      {openForm && <SetparamsForm id={1} onClose={() => setOpenForm(false)} />}
    </div>
  );
}
