'use client';
import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import NavBar from '@/components/NavBar';
import BigButton from '@/components/BigButton';
import StatusBadge from '@/components/StatusBadge';
import { obs } from '@/lib/api';
import { addLog } from '@/lib/db';

interface OBSStatus {
  connected: boolean;
  streaming: boolean;
  recording: boolean;
  currentScene: string;
  scenes: string[];
}

export default function LivePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [obsStatus, setObsStatus] = useState<OBSStatus | null>(null);
  const [loadingAction, setLoadingAction] = useState<string | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/login');
  }, [status, router]);

  const fetchStatus = useCallback(async () => {
    try {
      const s = await obs.status();
      setObsStatus(s);
      setError('');
    } catch {
      setError('OBS desconectado ou backend offline');
    }
  }, []);

  useEffect(() => {
    fetchStatus();
    const interval = setInterval(fetchStatus, 5000);
    return () => clearInterval(interval);
  }, [fetchStatus]);

  async function action(name: string, fn: () => Promise<unknown>) {
    if (loadingAction) return;
    setLoadingAction(name);
    const usuario = session?.user?.name ?? 'Desconhecido';
    try {
      await fn();
      await addLog({ data: new Date().toISOString(), acao: `OBS: ${name}`, usuario, resultado: 'sucesso' });
      await fetchStatus();
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      await addLog({ data: new Date().toISOString(), acao: `OBS: ${name}`, usuario, resultado: 'erro', detalhes: msg });
      setError(msg);
    } finally {
      setLoadingAction(null);
    }
  }

  return (
    <div className="min-h-screen bg-slate-900 pb-20">
      <header className="bg-slate-800/80 backdrop-blur sticky top-0 z-40 border-b border-slate-700">
        <div className="flex items-center gap-3 px-4 py-3 max-w-lg mx-auto">
          <button onClick={() => router.back()} className="text-slate-400 hover:text-white text-xl">←</button>
          <div>
            <h1 className="text-lg font-bold text-white">🎥 Controle Live</h1>
            <StatusBadge
              status={obsStatus?.connected ? 'online' : 'offline'}
              label={obsStatus?.connected ? 'OBS conectado' : 'OBS desconectado'}
            />
          </div>
        </div>
      </header>

      <main className="px-4 py-6 max-w-lg mx-auto space-y-4">
        {error && (
          <div className="bg-red-900/40 border border-red-700 text-red-300 rounded-xl px-4 py-3 text-sm">
            {error}
          </div>
        )}

        {/* Stream */}
        <section className="bg-slate-800 rounded-2xl p-4 space-y-3">
          <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wide">Transmissão ao vivo</h2>
          {obsStatus?.streaming ? (
            <BigButton label="Parar Live" icon="⏹️" variant="danger"
              loading={loadingAction === 'StopStream'}
              onClick={() => action('StopStream', obs.streamStop)}
            />
          ) : (
            <BigButton label="Iniciar Live" icon="📡" variant="success"
              loading={loadingAction === 'StartStream'}
              onClick={() => action('StartStream', obs.streamStart)}
            />
          )}
        </section>

        {/* Gravação */}
        <section className="bg-slate-800 rounded-2xl p-4 space-y-3">
          <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wide">Gravação</h2>
          {obsStatus?.recording ? (
            <BigButton label="Parar Gravação" icon="⏹️" variant="danger"
              loading={loadingAction === 'StopRecord'}
              onClick={() => action('StopRecord', obs.recordStop)}
            />
          ) : (
            <BigButton label="Iniciar Gravação" icon="🔴" variant="warning"
              loading={loadingAction === 'StartRecord'}
              onClick={() => action('StartRecord', obs.recordStart)}
            />
          )}
        </section>

        {/* Cenas */}
        {obsStatus?.scenes && obsStatus.scenes.length > 0 && (
          <section className="bg-slate-800 rounded-2xl p-4 space-y-3">
            <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wide">
              Cena atual: <span className="text-white">{obsStatus.currentScene}</span>
            </h2>
            <div className="space-y-2">
              {obsStatus.scenes.map(scene => (
                <button
                  key={scene}
                  onClick={() => action(`Cena: ${scene}`, () => obs.setScene(scene))}
                  disabled={!!loadingAction || obsStatus.currentScene === scene}
                  className={`w-full text-left px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                    obsStatus.currentScene === scene
                      ? 'bg-brand-500/20 text-brand-400 border border-brand-500/30'
                      : 'bg-slate-700 hover:bg-slate-600 text-white disabled:opacity-50'
                  }`}
                >
                  {obsStatus.currentScene === scene ? '▶ ' : ''}{scene}
                </button>
              ))}
            </div>
          </section>
        )}
      </main>

      <NavBar />
    </div>
  );
}
