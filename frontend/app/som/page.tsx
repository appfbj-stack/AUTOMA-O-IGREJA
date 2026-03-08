'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import NavBar from '@/components/NavBar';
import BigButton from '@/components/BigButton';
import { xr12 } from '@/lib/api';
import { addLog } from '@/lib/db';

const presets = [
  { id: 'louvor',   label: 'Preset Louvor',   icon: '🎵', variant: 'primary' as const },
  { id: 'pregacao', label: 'Preset Pregação',  icon: '📖', variant: 'warning' as const },
  { id: 'silencio', label: 'Preset Silêncio',  icon: '🔇', variant: 'ghost'   as const },
];

export default function SomPage() {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  async function applyPreset(nome: string) {
    if (loading) return;
    setLoading(nome);
    setError('');
    setSuccess('');
    try {
      await xr12.preset(nome);
      await addLog({ data: new Date().toISOString(), acao: `XR12 Preset: ${nome}`, usuario: 'operador', resultado: 'sucesso' });
      setSuccess(`Preset "${nome}" aplicado!`);
      setTimeout(() => setSuccess(''), 3000);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      await addLog({ data: new Date().toISOString(), acao: `XR12 Preset: ${nome}`, usuario: 'operador', resultado: 'erro', detalhes: msg });
      setError(msg);
    } finally {
      setLoading(null);
    }
  }

  return (
    <div className="min-h-screen bg-slate-900 pb-20">
      <header className="bg-slate-800/80 backdrop-blur sticky top-0 z-40 border-b border-slate-700">
        <div className="flex items-center gap-3 px-4 py-3 max-w-lg mx-auto">
          <button onClick={() => router.back()} className="text-slate-400 hover:text-white text-xl">←</button>
          <h1 className="text-lg font-bold text-white">🎚️ Controle de Som</h1>
        </div>
      </header>

      <main className="px-4 py-6 max-w-lg mx-auto space-y-4">
        {error && <div className="bg-red-900/40 border border-red-700 text-red-300 rounded-xl px-4 py-3 text-sm">{error}</div>}
        {success && <div className="bg-emerald-900/40 border border-emerald-700 text-emerald-300 rounded-xl px-4 py-3 text-sm">✅ {success}</div>}

        <p className="text-slate-400 text-sm">Snapshots do Behringer XR12:</p>

        {presets.map(p => (
          <BigButton key={p.id} label={p.label} icon={p.icon} variant={p.variant}
            loading={loading === p.id} disabled={!!loading && loading !== p.id}
            onClick={() => applyPreset(p.id)}
          />
        ))}
      </main>

      <NavBar />
    </div>
  );
}
