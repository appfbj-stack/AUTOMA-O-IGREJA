'use client';
import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import NavBar from '@/components/NavBar';
import StatusBadge from '@/components/StatusBadge';
import { sonoff } from '@/lib/api';
import { getDispositivos, addLog, Dispositivo } from '@/lib/db';

export default function IluminacaoPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [dispositivos, setDispositivos] = useState<Dispositivo[]>([]);
  const [estados, setEstados] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState<string | null>(null);

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/login');
  }, [status, router]);

  useEffect(() => {
    getDispositivos().then(devs => {
      const luzes = devs.filter(d => d.tipo === 'sonoff' && d.nome.toLowerCase().includes('luz'));
      setDispositivos(luzes);
    });
  }, []);

  async function toggle(dispositivo: Dispositivo) {
    if (loading) return;
    setLoading(dispositivo.id);
    const on = !estados[dispositivo.id];
    const usuario = session?.user?.name ?? 'Desconhecido';
    try {
      await sonoff.toggle(dispositivo.ip, on);
      setEstados(prev => ({ ...prev, [dispositivo.id]: on }));
      await addLog({
        data: new Date().toISOString(),
        acao: `Luz ${dispositivo.nome}: ${on ? 'LIGOU' : 'DESLIGOU'}`,
        usuario,
        resultado: 'sucesso',
      });
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      await addLog({
        data: new Date().toISOString(),
        acao: `Luz ${dispositivo.nome}: ${on ? 'LIGOU' : 'DESLIGOU'}`,
        usuario,
        resultado: 'erro',
        detalhes: msg,
      });
    } finally {
      setLoading(null);
    }
  }

  return (
    <div className="min-h-screen bg-slate-900 pb-20">
      <header className="bg-slate-800/80 backdrop-blur sticky top-0 z-40 border-b border-slate-700">
        <div className="flex items-center gap-3 px-4 py-3 max-w-lg mx-auto">
          <button onClick={() => router.back()} className="text-slate-400 hover:text-white text-xl">←</button>
          <h1 className="text-lg font-bold text-white">💡 Iluminação</h1>
        </div>
      </header>

      <main className="px-4 py-6 max-w-lg mx-auto">
        {dispositivos.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-4xl mb-3">💡</p>
            <p className="text-slate-400">Nenhuma luz cadastrada.</p>
            <button
              onClick={() => router.push('/dispositivos')}
              className="mt-4 text-brand-500 hover:text-brand-400 text-sm underline"
            >
              Cadastrar dispositivos Sonoff
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {dispositivos.map(d => {
              const on = estados[d.id] ?? false;
              return (
                <button
                  key={d.id}
                  onClick={() => toggle(d)}
                  disabled={loading === d.id}
                  className={`w-full flex items-center justify-between px-5 py-4 rounded-2xl transition-all active:scale-[0.98] ${
                    on
                      ? 'bg-amber-500/20 border border-amber-500/40'
                      : 'bg-slate-800 border border-slate-700'
                  } disabled:opacity-50`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">{on ? '💡' : '🔦'}</span>
                    <div className="text-left">
                      <p className="font-semibold text-white">{d.nome}</p>
                      <p className="text-xs text-slate-400">{d.ip}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {loading === d.id ? (
                      <svg className="animate-spin h-5 w-5 text-slate-400" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
                      </svg>
                    ) : (
                      <StatusBadge status={on ? 'ativo' : 'inativo'} label={on ? 'Ligado' : 'Desligado'} />
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </main>

      <NavBar />
    </div>
  );
}
