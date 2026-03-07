'use client';
import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import NavBar from '@/components/NavBar';
import LogItem from '@/components/LogItem';
import { getLogs, LogEntry } from '@/lib/db';

export default function LogsPage() {
  const { status } = useSession();
  const router = useRouter();
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [filter, setFilter] = useState<'todos' | 'sucesso' | 'erro'>('todos');

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/login');
  }, [status, router]);

  useEffect(() => {
    getLogs(200).then(setLogs);
  }, []);

  const filtered = logs.filter(l => {
    if (filter === 'todos') return true;
    return l.resultado === filter;
  });

  return (
    <div className="min-h-screen bg-slate-900 pb-20">
      <header className="bg-slate-800/80 backdrop-blur sticky top-0 z-40 border-b border-slate-700">
        <div className="px-4 pt-3 max-w-lg mx-auto">
          <div className="flex items-center gap-3 pb-3">
            <button onClick={() => router.back()} className="text-slate-400 hover:text-white text-xl">←</button>
            <h1 className="text-lg font-bold text-white">📋 Logs de Ações</h1>
          </div>
          <div className="flex gap-2 pb-3">
            {(['todos', 'sucesso', 'erro'] as const).map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium capitalize transition-colors ${
                  filter === f
                    ? 'bg-brand-500 text-white'
                    : 'bg-slate-700 text-slate-400 hover:bg-slate-600'
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>
      </header>

      <main className="px-4 py-4 max-w-lg mx-auto">
        {filtered.length === 0 ? (
          <div className="text-center py-12 text-slate-500">
            <p className="text-3xl mb-2">📋</p>
            <p>Nenhum log registrado.</p>
          </div>
        ) : (
          <div className="bg-slate-800 rounded-2xl px-4">
            {filtered.map(log => (
              <LogItem key={log.id} log={log} />
            ))}
          </div>
        )}
      </main>

      <NavBar />
    </div>
  );
}
