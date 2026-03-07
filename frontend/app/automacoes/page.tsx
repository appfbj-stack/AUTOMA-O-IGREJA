'use client';
import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import NavBar from '@/components/NavBar';
import { getAutomacoes, Automacao } from '@/lib/db';
import { executarAutomacao } from '@/lib/automation';

export default function AutomacoesPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [automacoes, setAutomacoes] = useState<Automacao[]>([]);
  const [loading, setLoading] = useState<string | null>(null);
  const [resultado, setResultado] = useState<{ id: string; ok: boolean; msg: string } | null>(null);

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/login');
  }, [status, router]);

  useEffect(() => {
    getAutomacoes().then(setAutomacoes);
  }, []);

  async function run(id: string) {
    if (loading) return;
    setLoading(id);
    setResultado(null);
    const usuario = session?.user?.name ?? 'Desconhecido';
    try {
      const resultados = await executarAutomacao(id, usuario);
      const erros = resultados.filter(r => !r.success);
      setResultado({
        id,
        ok: erros.length === 0,
        msg: erros.length === 0
          ? `${resultados.length} ação(ões) executadas com sucesso`
          : `${erros.length} erro(s): ${erros.map(e => e.tipo).join(', ')}`,
      });
    } catch (e: unknown) {
      setResultado({ id, ok: false, msg: e instanceof Error ? e.message : String(e) });
    } finally {
      setLoading(null);
      setTimeout(() => setResultado(null), 4000);
    }
  }

  const icons: Record<string, string> = {
    'iniciar-culto': '▶️',
    'modo-louvor': '🎵',
    'modo-pregacao': '📖',
    'encerrar-culto': '⏹️',
  };

  return (
    <div className="min-h-screen bg-slate-900 pb-20">
      <header className="bg-slate-800/80 backdrop-blur sticky top-0 z-40 border-b border-slate-700">
        <div className="flex items-center gap-3 px-4 py-3 max-w-lg mx-auto">
          <button onClick={() => router.back()} className="text-slate-400 hover:text-white text-xl">←</button>
          <h1 className="text-lg font-bold text-white">⚡ Automações</h1>
        </div>
      </header>

      <main className="px-4 py-6 max-w-lg mx-auto space-y-3">
        {resultado && (
          <div className={`rounded-xl px-4 py-3 text-sm font-medium ${
            resultado.ok ? 'bg-emerald-900/40 border border-emerald-700 text-emerald-300' : 'bg-red-900/40 border border-red-700 text-red-300'
          }`}>
            {resultado.ok ? '✅' : '❌'} {resultado.msg}
          </div>
        )}

        {automacoes.map(a => (
          <div key={a.id} className="bg-slate-800 rounded-2xl p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{icons[a.id] ?? '⚡'}</span>
                  <h3 className="font-semibold text-white">{a.nome}</h3>
                </div>
                {a.descricao && (
                  <p className="text-xs text-slate-400 mt-1 ml-9">{a.descricao}</p>
                )}
                <div className="mt-2 ml-9 flex flex-wrap gap-1">
                  {a.acoes.map((ac, i) => (
                    <span key={i} className="text-xs bg-slate-700 text-slate-400 px-2 py-0.5 rounded-full">
                      {ac.tipo}
                    </span>
                  ))}
                </div>
              </div>
              <button
                onClick={() => run(a.id)}
                disabled={!!loading}
                className="shrink-0 bg-brand-500 hover:bg-brand-600 disabled:opacity-40 text-white font-semibold px-4 py-2 rounded-xl text-sm transition-colors"
              >
                {loading === a.id ? '...' : 'Executar'}
              </button>
            </div>
          </div>
        ))}
      </main>

      <NavBar />
    </div>
  );
}
