const BASE = '/api/backend';

async function request(path: string, options?: RequestInit) {
  const res = await fetch(`${BASE}${path}`, {
    ...options,
    headers: { 'Content-Type': 'application/json', ...options?.headers },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`);
  return data;
}

// ---- OBS ----
export const obs = {
  status: () => request('/obs/status'),
  streamStart: () => request('/obs/stream/start', { method: 'POST' }),
  streamStop: () => request('/obs/stream/stop', { method: 'POST' }),
  recordStart: () => request('/obs/record/start', { method: 'POST' }),
  recordStop: () => request('/obs/record/stop', { method: 'POST' }),
  setScene: (scene: string) =>
    request('/obs/scene', { method: 'POST', body: JSON.stringify({ scene }) }),
};

// ---- XR12 ----
export const xr12 = {
  preset: (nome: string) =>
    request('/xr12/preset', { method: 'POST', body: JSON.stringify({ nome }) }),
  mute: (channel: number, mute: boolean) =>
    request('/xr12/mute', { method: 'POST', body: JSON.stringify({ channel, mute }) }),
  fader: (channel: number, level: number) =>
    request('/xr12/fader', { method: 'POST', body: JSON.stringify({ channel, level }) }),
  snapshot: (index: number) =>
    request('/xr12/snapshot', { method: 'POST', body: JSON.stringify({ index }) }),
};

// ---- Sonoff ----
export const sonoff = {
  toggle: (ip: string, on: boolean) =>
    request('/sonoff/toggle', { method: 'POST', body: JSON.stringify({ ip, on }) }),
  status: (ip: string) => request(`/sonoff/status?ip=${encodeURIComponent(ip)}`),
  batch: (devices: { ip: string; on: boolean }[]) =>
    request('/sonoff/batch', { method: 'POST', body: JSON.stringify({ devices }) }),
};

// ---- Health ----
export const health = () => request('/health').catch(() => ({ status: 'offline' }));
