'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import NavBar from '@/components/NavBar';
import BigButton from '@/components/BigButton';
import StatusBadge from '@/components/StatusBadge';
import { executarAutomacao } from '@/lib/automation';
import { health } from '@/lib/api';

const secoes = [
  {
    titulo: 'Controle Geral',
    cor: 'border-slate-700',
    itens: [
      { id: 'iniciar-culto',  label: 'Iniciar Culto',   icon: '▶️',  variant: 'success' as const },
      { id: 'encerrar-culto', label: 'Encerrar Culto',  icon: '⏹️',  variant: 'danger'  as const },
    ],
  },
  {
    titulo: 'Momentos do Culto',
    cor: 'border-slate-700',
    itens: [
      { id: 'pre-culto',      label: 'Pré-Culto',       icon: '🕐',  variant: 'ghost'   as const },
      { id: 'abertura',       label: 'Abertura',         icon: '🙏',  variant: 'primary' as const },
      { id: 'modo-louvor',    label: 'Louvor',           icon: '🎵',  variant: 'primary' as const },
      { id: 'modo-pregacao',  label: 'Pregação',         icon: '📖',  variant: 'warning' as const },
      { id: 'modo-oferta',    label: 'Oferta',           icon: '🙌',  variant: 'warning' as const },
      { id: 'modo-oracao',    label: 'Oração',           icon: '✝️',  variant: 'primary' as const },
      { id: 'modo-santa-ceia',label: 'Santa Ceia',       icon: '🍷',  variant: 'primary' as const },
      { id: 'modo-avisos',    label: 'Avisos',           icon: '📢',  variant: 'ghost'   as const },
      { id: 'intervalo',      label: 'Intervalo',        icon: '☕',  variant: 'ghost'   as const },
    ],
  },
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
      showToast(
        erros.length === 0 ? 'Executado com sucesso!' : `${erros.length} ação(ões) falharam.`,
        erros.length === 0
      );
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
            <StatusBadge
              status={backendStatus}
              label={backendStatus === 'online' ? 'Sistema online' : 'Backend offline'}
            />
          </div>
          <div className="flex gap-3">
            <button onClick={() => router.push('/logs')} className="text-slate-400 hover:text-white text-xl p-1" title="Logs">📋</button>
            <button onClick={() => router.push('/dispositivos')} className="text-slate-400 hover:text-white text-xl p-1" title="Dispositivos">⚙️</button>
          </div>
        </div>
      </header>

      <main className="px-4 py-4 max-w-lg mx-auto space-y-6">
        {secoes.map(secao => (
          <section key={secao.titulo}>
            <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-3">{secao.titulo}</h2>
            <div className="space-y-3">
              {secao.itens.map(a => (
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
            </div>
          </section>
        ))}
      </main>

      {/* Toast */}
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
