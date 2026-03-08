'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import NavBar from '@/components/NavBar';
import BigButton from '@/components/BigButton';
import StatusBadge from '@/components/StatusBadge';
import { executarAutomacao } from '@/lib/automation';
import { health } from '@/lib/api';

const automacoes = [
  { id: 'iniciar-culto',  label: 'Iniciar Culto',   icon: '▶️',  variant: 'success'  as const },
  { id: 'modo-louvor',    label: 'Modo Louvor',      icon: '🎵',  variant: 'primary'  as const },
  { id: 'modo-pregacao',  label: 'Modo Pregação',    icon: '📖',  variant: 'warning'  as const },
  { id: 'encerrar-culto', label: 'Encerrar Culto',   icon: '⏹️',  variant: 'danger'   as const },
];

export default function DashboardPage() {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);
  const [backendStatus, setBackendStatus] = useState<'online' | 'offline' | 'desconhecido'>('desconhecido');
  const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null);

  useEffect(() => {
    health().then(r => setBackendStatus(r.status === 'ok' ? 'online' : 'offline'));
    const interval = setInterval(() => {
      health().then(r => setBackendStatus(r.status === 'ok' ? 'online' : 'offline'));
    }, 15000);
    return () => clearInterval(interval);
  }, []);

  async function run(id: string) {
    if (loading) return;
    setLoading(id);
    try {
      const resultados = await executarAutomacao(id, 'operador');
      const erros = resultados.filter(r => !r.success);
      if (erros.length === 0) {
        showToast('Automação executada com sucesso!', true);
      } else {
        showToast(`${erros.length} ação(ões) falharam. Veja os logs.`, false);
      }
    } catch (e: unknown) {
      showToast(e instanceof Error ? e.message : 'Erro desconhecido', false);
    } finally {
      setLoading(null);
    }
  }

  function showToast(msg: string, ok: boolean) {
    setToast({ msg, ok });
    setTimeout(() => setToast(null), 3500);
  }

  return (
    <div className="min-h-screen bg-slate-900 pb-20">
      {/* Header */}
      <header className="bg-slate-800/80 backdrop-blur sticky top-0 z-40 border-b border-slate-700">
        <div className="flex items-center justify-between px-4 py-3 max-w-lg mx-auto">
          <div>
            <h1 className="text-lg font-bold text-white">Ekklesia Control</h1>
            <div className="flex items-center gap-2 mt-0.5">
              <StatusBadge status={backendStatus} label={backendStatus === 'online' ? 'Sistema online' : 'Backend offline'} />
            </div>
          </div>
        </div>
      </header>

      <main className="px-4 py-6 max-w-lg mx-auto space-y-4">
        <p className="text-slate-400 text-sm">Selecione uma automação para executar:</p>

        {automacoes.map(a => (
          <BigButton
            key={a.id}
            label={a.label}
            icon={a.icon}
            variant={a.variant}
            loading={loading === a.id}
            disabled={!!loading && loading !== a.id}
            onClick={() => run(a.id)}
          />
        ))}

        <div className="pt-2 grid grid-cols-2 gap-3">
          <button
            onClick={() => router.push('/logs')}
            className="bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-2xl py-4 text-sm font-medium transition-colors flex flex-col items-center gap-1"
          >
            <span className="text-2xl">📋</span>
            <span>Logs</span>
          </button>
          <button
            onClick={() => router.push('/dispositivos')}
            className="bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-2xl py-4 text-sm font-medium transition-colors flex flex-col items-center gap-1"
          >
            <span className="text-2xl">⚙️</span>
            <span>Dispositivos</span>
          </button>
        </div>
      </main>

      {toast && (
        <div className={`fixed bottom-20 left-4 right-4 max-w-lg mx-auto rounded-2xl px-4 py-3 text-sm font-medium text-white shadow-lg z-50 ${
          toast.ok ? 'bg-emerald-600' : 'bg-red-600'
        }`}>
          {toast.ok ? '✅' : '❌'} {toast.msg}
        </div>
      )}

      <NavBar />
    </div>
  );
}
