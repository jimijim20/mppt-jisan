'use client';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

export type Pt = { ts: number; value: number };

export default function LiveChart({
  title, data, yUnit,
}: { title: string; data: Pt[]; yUnit?: string; livePoint?: Pt; }) {
  return (
    <div className="rounded-xl p-4 bg-[#0f2a44] border border-gray-700">
      <div className="mb-2 text-sm text-gray-300">{title}</div>
      <div style={{ width: '100%', height: 260 }}>
        <ResponsiveContainer>
          <LineChart data={data} margin={{ left: 10, right: 10, top: 5, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="ts"
              type="number"
              domain={['auto', 'auto']}
              tickFormatter={(v) => new Date(v as number).toLocaleTimeString('id-ID', { hour12: false })}
            />
            <YAxis unit={yUnit ? ` ${yUnit}` : undefined} />
            <Tooltip
              labelFormatter={(v) => new Date(v as number).toLocaleString('id-ID', { hour12: false })}
              formatter={(val: any) => [val, '']}
            />
            <Line type="monotone" dataKey="value" dot={false} isAnimationActive={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
