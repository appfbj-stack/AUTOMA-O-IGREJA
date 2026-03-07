'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import clsx from 'clsx';

const links = [
  { href: '/dashboard',    label: 'Início',      icon: '🏠' },
  { href: '/live',         label: 'Live',        icon: '🎥' },
  { href: '/som',          label: 'Som',         icon: '🎚️' },
  { href: '/iluminacao',   label: 'Luz',         icon: '💡' },
  { href: '/automacoes',   label: 'Auto',        icon: '⚡' },
];

export default function NavBar() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-slate-800/95 backdrop-blur border-t border-slate-700 safe-bottom z-50">
      <div className="flex justify-around items-center h-16 max-w-lg mx-auto px-2">
        {links.map(link => {
          const active = pathname === link.href;
          return (
            <Link
              key={link.href}
              href={link.href}
              className={clsx(
                'flex flex-col items-center gap-0.5 px-3 py-1 rounded-xl transition-colors min-w-0',
                active
                  ? 'text-brand-500'
                  : 'text-slate-400 hover:text-slate-200'
              )}
            >
              <span className="text-xl leading-none">{link.icon}</span>
              <span className={clsx('text-[10px] font-medium', active ? 'text-brand-500' : 'text-slate-500')}>
                {link.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
