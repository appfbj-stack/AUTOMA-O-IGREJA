'use client';
import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();
  const [form, setForm] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');
    const res = await signIn('credentials', {
      username: form.username,
      password: form.password,
      redirect: false,
    });
    setLoading(false);
    if (res?.ok) {
      router.push('/dashboard');
    } else {
      setError('Usuário ou senha incorretos.');
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900 px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="text-5xl mb-3">⛪</div>
          <h1 className="text-2xl font-bold text-white">Ekklesia Control</h1>
          <p className="text-slate-400 text-sm mt-1">Sistema de automação da igreja</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-slate-800 rounded-2xl p-6 space-y-4">
          <div>
            <label className="block text-sm text-slate-400 mb-1">Usuário</label>
            <input
              type="text"
              value={form.username}
              onChange={e => setForm(f => ({ ...f, username: e.target.value }))}
              className="w-full bg-slate-700 text-white rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-brand-500 text-base"
              placeholder="admin"
              autoComplete="username"
              required
            />
          </div>
          <div>
            <label className="block text-sm text-slate-400 mb-1">Senha</label>
            <input
              type="password"
              value={form.password}
              onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
              className="w-full bg-slate-700 text-white rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-brand-500 text-base"
              placeholder="••••••••"
              autoComplete="current-password"
              required
            />
          </div>

          {error && (
            <div className="bg-red-900/40 border border-red-700 text-red-300 rounded-xl px-4 py-3 text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-brand-500 hover:bg-brand-600 disabled:opacity-50 text-white font-semibold rounded-xl py-3 text-base transition-colors"
          >
            {loading ? 'Entrando...' : 'Entrar'}
          </button>
        </form>

        <p className="text-center text-slate-600 text-xs mt-6">
          Ekklesia Control v1.0 · Rede local
        </p>
      </div>
    </div>
  );
}
