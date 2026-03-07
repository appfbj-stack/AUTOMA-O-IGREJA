'use client';
import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import NavBar from '@/components/NavBar';
import StatusBadge from '@/components/StatusBadge';
import { getDispositivos, saveDispositivo, deleteDispositivo, Dispositivo } from '@/lib/db';

const tipoLabels: Record<string, string> = { obs: '🎥 OBS', xr12: '🎚️ XR12', sonoff: '🔌 Sonoff' };

const emptyForm = (): Omit<Dispositivo, 'id' | 'status'> => ({
  nome: '', tipo: 'sonoff', ip: '', porta: 80,
});

export default function DispositivosPage() {
  const { status } = useSession();
  const router = useRouter();
  const [dispositivos, setDispositivos] = useState<Dispositivo[]>([]);
  const [form, setForm] = useState(emptyForm());
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/login');
  }, [status, router]);

  useEffect(() => { loadDevices(); }, []);

  async function loadDevices() {
    setDispositivos(await getDispositivos());
  }

  async function handleSave() {
    if (!form.nome || !form.ip) return;
    const id = editingId ?? `${form.tipo}-${Date.now()}`;
    await saveDispositivo({ id, ...form, status: 'desconhecido' });
    setForm(emptyForm());
    setEditingId(null);
    setShowForm(false);
    await loadDevices();
  }

  async function handleDelete(id: string) {
    if (!confirm('Remover dispositivo?')) return;
    await deleteDispositivo(id);
    await loadDevices();
  }

  function handleEdit(d: Dispositivo) {
    setForm({ nome: d.nome, tipo: d.tipo, ip: d.ip, porta: d.porta });
    setEditingId(d.id);
    setShowForm(true);
  }

  return (
    <div className="min-h-screen bg-slate-900 pb-20">
      <header className="bg-slate-800/80 backdrop-blur sticky top-0 z-40 border-b border-slate-700">
        <div className="flex items-center justify-between px-4 py-3 max-w-lg mx-auto">
          <div className="flex items-center gap-3">
            <button onClick={() => router.back()} className="text-slate-400 hover:text-white text-xl">←</button>
            <h1 className="text-lg font-bold text-white">⚙️ Dispositivos</h1>
          </div>
          <button
            onClick={() => { setForm(emptyForm()); setEditingId(null); setShowForm(true); }}
            className="bg-brand-500 hover:bg-brand-600 text-white text-sm font-medium px-3 py-1.5 rounded-xl"
          >
            + Novo
          </button>
        </div>
      </header>

      <main className="px-4 py-6 max-w-lg mx-auto space-y-4">
        {/* Formulário */}
        {showForm && (
          <div className="bg-slate-800 rounded-2xl p-4 space-y-3 border border-slate-600">
            <h2 className="font-semibold text-white">{editingId ? 'Editar' : 'Novo'} dispositivo</h2>

            <div>
              <label className="text-xs text-slate-400">Nome</label>
              <input
                className="w-full mt-1 bg-slate-700 text-white rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-brand-500"
                value={form.nome}
                onChange={e => setForm(f => ({ ...f, nome: e.target.value }))}
                placeholder="Ex: Sonoff Luz Altar"
              />
            </div>

            <div>
              <label className="text-xs text-slate-400">Tipo</label>
              <select
                className="w-full mt-1 bg-slate-700 text-white rounded-xl px-3 py-2 text-sm outline-none"
                value={form.tipo}
                onChange={e => setForm(f => ({ ...f, tipo: e.target.value as Dispositivo['tipo'] }))}
              >
                <option value="obs">OBS WebSocket</option>
                <option value="xr12">Behringer XR12</option>
                <option value="sonoff">Sonoff (LAN)</option>
              </select>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div className="col-span-2">
                <label className="text-xs text-slate-400">IP</label>
                <input
                  className="w-full mt-1 bg-slate-700 text-white rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-brand-500"
                  value={form.ip}
                  onChange={e => setForm(f => ({ ...f, ip: e.target.value }))}
                  placeholder="192.168.1.x"
                />
              </div>
              <div>
                <label className="text-xs text-slate-400">Porta</label>
                <input
                  type="number"
                  className="w-full mt-1 bg-slate-700 text-white rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-brand-500"
                  value={form.porta}
                  onChange={e => setForm(f => ({ ...f, porta: Number(e.target.value) }))}
                />
              </div>
            </div>

            <div className="flex gap-2 pt-1">
              <button
                onClick={handleSave}
                className="flex-1 bg-brand-500 hover:bg-brand-600 text-white font-medium py-2 rounded-xl text-sm"
              >
                Salvar
              </button>
              <button
                onClick={() => { setShowForm(false); setEditingId(null); }}
                className="flex-1 bg-slate-700 hover:bg-slate-600 text-white font-medium py-2 rounded-xl text-sm"
              >
                Cancelar
              </button>
            </div>
          </div>
        )}

        {/* Lista */}
        {dispositivos.length === 0 && !showForm ? (
          <div className="text-center py-12 text-slate-500">
            <p className="text-3xl mb-2">📡</p>
            <p>Nenhum dispositivo cadastrado.</p>
          </div>
        ) : (
          dispositivos.map(d => (
            <div key={d.id} className="bg-slate-800 rounded-2xl px-4 py-3 flex items-center gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-white truncate">{d.nome}</span>
                  <StatusBadge status={d.status} />
                </div>
                <p className="text-xs text-slate-400 mt-0.5">
                  {tipoLabels[d.tipo]} · {d.ip}:{d.porta}
                </p>
              </div>
              <div className="flex gap-2 shrink-0">
                <button onClick={() => handleEdit(d)} className="text-slate-400 hover:text-white p-1 text-lg">✏️</button>
                <button onClick={() => handleDelete(d.id)} className="text-slate-400 hover:text-red-400 p-1 text-lg">🗑️</button>
              </div>
            </div>
          ))
        )}
      </main>

      <NavBar />
    </div>
  );
}
