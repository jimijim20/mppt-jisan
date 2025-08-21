'use client';
import type { MqttClient } from 'mqtt';

/** Koneksi MQTT khusus browser (WS). */
export async function connectMqttAsync(): Promise<MqttClient> {
  // Import build browser agar tidak bentrok SSR
  const { default: mqtt } = await import('mqtt/dist/mqtt'); // <-- penting: dist/mqtt (browser bundle)
  const host = process.env.NEXT_PUBLIC_MQTT_WS || '';
  const username = process.env.NEXT_PUBLIC_MQTT_USER || 'webuser';
  const password = process.env.NEXT_PUBLIC_MQTT_PASS || 'secret';

  if (!host) {
    throw new Error('NEXT_PUBLIC_MQTT_WS belum diset. Kosongkan untuk DB-only, atau isi ws://host:port.');
  }
  return mqtt.connect(host, {
    username,
    password,
    clientId: 'dash-' + Math.random().toString(16).slice(2),
    keepalive: 30,
    reconnectPeriod: 2000,
    clean: true,
  }) as unknown as MqttClient;
}
