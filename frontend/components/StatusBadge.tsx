import clsx from 'clsx';

interface StatusBadgeProps {
  status: 'online' | 'offline' | 'desconhecido' | 'ativo' | 'inativo';
  label?: string;
}

const colors = {
  online:       'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  offline:      'bg-red-500/20 text-red-400 border-red-500/30',
  desconhecido: 'bg-slate-500/20 text-slate-400 border-slate-500/30',
  ativo:        'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  inativo:      'bg-slate-500/20 text-slate-400 border-slate-500/30',
};

const dots = {
  online: 'bg-emerald-400 animate-pulse',
  offline: 'bg-red-400',
  desconhecido: 'bg-slate-400',
  ativo: 'bg-emerald-400 animate-pulse',
  inativo: 'bg-slate-400',
};

export default function StatusBadge({ status, label }: StatusBadgeProps) {
  return (
    <span className={clsx(
      'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border',
      colors[status]
    )}>
      <span className={clsx('w-1.5 h-1.5 rounded-full', dots[status])} />
      {label ?? status}
    </span>
  );
}
