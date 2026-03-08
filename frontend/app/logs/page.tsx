'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import NavBar from '@/components/NavBar';
import LogItem from '@/components/LogItem';
import { apiLogs } from '@/lib/api';
import { getLogs } from '@/lib/db';
import type { LogEntry } from '@/lib/db';

export default function LogsPage() {
  const router = useRouter();
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [filter, setFilter] = useState<'todos' | 'sucesso' | 'erro'>('todos');
  const [fonte, setFonte] = useState<'remoto' | 'local'>('remoto');

  useEffect(() => { loadLogs(); }, [fonte, filter]);

  async function loadLogs() {
    if (fonte === 'remoto') {
      const resultado = filter !== 'todos' ? filter : undefined;
      const data = await apiLogs.buscar(200, resultado);
      if (Array.isArray(data) && data.length > 0) {
        setLogs(data as LogEntry[]);
        return;
      }
    }
    // fallback: IndexedDB local
    const local = await getLogs(200);
    const filtered = local.filter(l => filter === 'todos' || l.resultado === filter);
    setLogs(filtered);
  }

  return (
    <div className="min-h-screen bg-slate-900 pb-20">
      <header className="bg-slate-800/80 backdrop-blur sticky top-0 z-40 border-b border-slate-700">
        <div className="px-4 pt-3 max-w-lg mx-auto">
          <div className="flex items-center justify-between pb-2">
            <div className="flex items-center gap-3">
              <button onClick={() => router.back()} className="text-slate-400 hover:text-white text-xl">←</button>
              <h1 className="text-lg font-bold text-white">📋 Logs</h1>
            </div>
            <div className="flex gap-1 bg-slate-700 rounded-xl p-1">
              <button onClick={() => setFonte('remoto')}
                className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${fonte === 'remoto' ? 'bg-brand-500 text-white' : 'text-slate-400'}`}>
                ☁️ Banco
              </button>
              <button onClick={() => setFonte('local')}
                className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${fonte === 'local' ? 'bg-brand-500 text-white' : 'text-slate-400'}`}>
                📱 Local
              </button>
            </div>
          </div>
          <div className="flex gap-2 pb-3">
            {(['todos', 'sucesso', 'erro'] as const).map(f => (
              <button key={f} onClick={() => setFilter(f)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium capitalize transition-colors ${
                  filter === f ? 'bg-brand-500 text-white' : 'bg-slate-700 text-slate-400 hover:bg-slate-600'
                }`}>
                {f}
              </button>
            ))}
          </div>
        </div>
      </header>

      <main className="px-4 py-4 max-w-lg mx-auto">
        {logs.length === 0 ? (
          <div className="text-center py-12 text-slate-500">
            <p className="text-3xl mb-2">📋</p>
            <p>Nenhum log registrado.</p>
          </div>
        ) : (
          <div className="bg-slate-800 rounded-2xl px-4">
            {logs.map(log => <LogItem key={log.id} log={log} />)}
          </div>
        )}
      </main>
      <NavBar />
    </div>
  );
}
