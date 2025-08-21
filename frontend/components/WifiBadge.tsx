'use client';
import React from 'react';

type WifiBadgeProps = {
  /** Status online dari sumber data (mis. device/broker) */
  online?: boolean;
  /** Nilai RSSI Wi-Fi dalam dBm, contoh: -62 */
  rssi?: number | null;
  /** Timestamp data terakhir (ms since epoch). Jika lebih tua dari staleTimeoutMs, dianggap offline */
  lastTsMs?: number | null;
  /** Batas stale (default 10 detik) */
  staleTimeoutMs?: number;
  /** Tampilkan angka RSSI di badge */
  showRssi?: boolean;
  /** Kelas tambahan (opsional) */
  className?: string;
};

export default function WifiBadge({
  online,
  rssi,
  lastTsMs,
  staleTimeoutMs = 10_000,
  showRssi = true,
  className,
}: WifiBadgeProps) {
  const now = Date.now();
  const fresh = typeof lastTsMs === 'number' ? (now - lastTsMs) <= staleTimeoutMs : true;
  const isOnline = Boolean(online && fresh);
  const bars = signalBars(rssi);

  const bg = isOnline ? 'rgba(34,197,94,.15)' : 'rgba(239,68,68,.15)';
  const border = isOnline ? 'rgba(34,197,94,.35)' : 'rgba(239,68,68,.35)';
  const color = isOnline ? '#86efac' : '#fca5a5';

  const title = [
    `Wi-Fi: ${isOnline ? 'Online' : 'Disconnected'}`,
    typeof rssi === 'number' ? `RSSI ${rssi} dBm` : null,
    typeof lastTsMs === 'number' ? `last ${new Date(lastTsMs).toLocaleString('id-ID', { hour12:false })}` : null,
    fresh ? null : '(stale)',
  ].filter(Boolean).join(' • ');

  return (
    <span
      aria-live="polite"
      title={title}
      className={className}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 8,
        padding: '6px 12px',
        borderRadius: 9999,
        border: `1px solid ${border}`,
        background: bg,
        color,
        fontSize: 12,
        lineHeight: 1,
        userSelect: 'none',
      }}
    >
      <SignalIcon bars={bars} active={isOnline} />
      <strong style={{ fontWeight: 600 }}>Wi-Fi:</strong>
      <span>{isOnline ? 'Online' : 'Disconnected'}</span>
      {showRssi && typeof rssi === 'number' ? <span>({rssi} dBm)</span> : null}
    </span>
  );
}

/** Hitung bar sinyal dari RSSI */
function signalBars(rssi?: number | null): 0 | 1 | 2 | 3 | 4 {
  if (typeof rssi !== 'number') return 0;
  // Ambang umum: > -55 (sangat kuat), > -67 (kuat), > -70 (sedang), > -80 (lemah)
  if (rssi >= -55) return 4;
  if (rssi >= -67) return 3;
  if (rssi >= -70) return 2;
  if (rssi >= -80) return 1;
  return 0;
}

/** Ikon bar sinyal kecil (SVG), mewarnai bar aktif */
function SignalIcon({ bars, active }: { bars: 0 | 1 | 2 | 3 | 4; active: boolean }) {
  const baseFill = active ? 'currentColor' : 'rgba(252,165,165,.9)'; // red-ish saat offline
  const inactiveFill = 'rgba(255,255,255,.25)';
  const width = 18, height = 12, gap = 2, barW = 3;
  const levels = [3, 6, 9, 12]; // tinggi tiap bar

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      width="16"
      height="12"
      aria-hidden="true"
      focusable="false"
      style={{ display: 'block' }}
    >
      {levels.map((h, i) => {
        const x = i * (barW + gap);
        const y = height - h;
        const on = i < bars;
        return (
          <rect
            key={i}
            x={x}
            y={y}
            width={barW}
            height={h}
            rx="1"
            fill={on ? baseFill : inactiveFill}
          />
        );
      })}
    </svg>
  );
}
