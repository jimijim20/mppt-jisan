// Konstanta base API, diambil dari .env.local
const API_BASE = process.env.NEXT_PUBLIC_API_BASE || location.origin;

export type Pt = { ts: number; value: number };

// --- Telemetry: latest ---
export async function latestTelemetry() {
  const u = new URL('/api/telemetry_latest.php', API_BASE);
  const res = await fetch(u.toString(), { cache: 'no-store' });
  if (!res.ok) throw new Error('latestTelemetry failed');
  return res.json();
}

// --- Telemetry: range ---
export async function rangeTelemetry(
  start: string,
  end: string,
  limit = 1000,
  offset = 0
) {
  const u = new URL('/api/telemetry_range.php', API_BASE);
  u.searchParams.set('start', start);
  u.searchParams.set('end', end);
  u.searchParams.set('limit', String(limit));
  u.searchParams.set('offset', String(offset));

  const res = await fetch(u.toString(), { cache: 'no-store' });
  if (!res.ok) throw new Error('rangeTelemetry failed');
  return res.json();
}

// --- Setparams ---
export type Setparams = {
  id: number;
  batteryVoltageSetting: number | null;
  batteryType: string | null;
  maxChargeCurrent: number | null;
  absorptionVoltage: number | null;
  absorptionTime: number | null;
  floatVoltage: number | null;
  reBulkVoltageOffset: number | null;
};

export async function getSetparams(
  id = 1
): Promise<{ row: Setparams }> {
  const u = new URL('/api/setparams_get.php', API_BASE);
  u.searchParams.set('id', String(id));
  const r = await fetch(u.toString(), { cache: 'no-store' });
  if (!r.ok) throw new Error('getSetparams failed');
  return r.json();
}

export async function updateSetparams(
  body: Partial<Setparams> & { id: number }
) {
  const r = await fetch(`${API_BASE}/api/setparams_update.php`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!r.ok) throw new Error('updateSetparams failed');
  return r.json();
}

// --- COMPAT SHIM untuk kode lama ---
export async function queryTelemetry(
  _device: string,
  start: string,
  end: string,
  limit = 1000,
  offset = 0
) {
  return rangeTelemetry(start, end, limit, offset);
}
