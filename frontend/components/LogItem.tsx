import clsx from 'clsx';
import type { LogEntry } from '@/lib/db';

export default function LogItem({ log }: { log: LogEntry }) {
  const date = new Date(log.data);
  const time = date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  const day  = date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });

  return (
    <div className="flex items-start gap-3 py-3 border-b border-slate-700/50 last:border-0">
      <div className="mt-0.5">
        <span className={clsx(
          'w-2 h-2 rounded-full block mt-1',
          log.resultado === 'sucesso' ? 'bg-emerald-400' : 'bg-red-400'
        )} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-white truncate">{log.acao}</p>
        {log.detalhes && (
          <p className="text-xs text-red-400 mt-0.5 truncate">{log.detalhes}</p>
        )}
        <p className="text-xs text-slate-500 mt-0.5">{log.usuario}</p>
      </div>
      <div className="text-right shrink-0">
        <p className="text-xs text-slate-400">{time}</p>
        <p className="text-xs text-slate-600">{day}</p>
      </div>
    </div>
  );
}
