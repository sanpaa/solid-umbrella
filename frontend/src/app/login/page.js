'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!data.success) {
        setError(data.error?.message || 'Erro ao fazer login');
        setLoading(false);
        return;
      }

      // Salvar token no localStorage
      localStorage.setItem('token', data.data.token);
      localStorage.setItem('refreshToken', data.data.refreshToken);
      localStorage.setItem('user', JSON.stringify(data.data.user));

      // Redirecionar para dashboard
      router.push('/dashboard');
    } catch (err) {
      console.error('Erro:', err);
      setError('Erro ao conectar com o servidor. Verifique se o backend está rodando.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100 px-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-xl p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            🔧 Gestão de Serviços
          </h1>
          <p className="text-gray-600">
            Faça login para acessar o sistema
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              Email
            </label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="seu@email.com"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
              Senha
            </label>
            <input
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Entrando...' : 'Entrar'}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-gray-200">
          <p className="text-sm text-gray-600 text-center mb-4">
            <strong>Credenciais de teste:</strong>
          </p>
          
          <div className="grid grid-cols-1 gap-3 text-sm">
            <button
              onClick={() => {
                setEmail('admin@empresa.com');
                setPassword('senha123');
              }}
              className="p-3 bg-gray-50 rounded-lg hover:bg-gray-100 text-left transition"
            >
              <div className="font-semibold text-gray-900">👤 Admin</div>
              <div className="text-gray-600 text-xs mt-1">
                admin@empresa.com / senha123
              </div>
            </button>

            <button
              onClick={() => {
                setEmail('gerente@empresa.com');
                setPassword('senha123');
              }}
              className="p-3 bg-gray-50 rounded-lg hover:bg-gray-100 text-left transition"
            >
              <div className="font-semibold text-gray-900">👔 Gerente</div>
              <div className="text-gray-600 text-xs mt-1">
                gerente@empresa.com / senha123
              </div>
            </button>

            <button
              onClick={() => {
                setEmail('joao.tecnico@empresa.com');
                setPassword('senha123');
              }}
              className="p-3 bg-gray-50 rounded-lg hover:bg-gray-100 text-left transition"
            >
              <div className="font-semibold text-gray-900">🔧 Técnico</div>
              <div className="text-gray-600 text-xs mt-1">
                joao.tecnico@empresa.com / senha123
              </div>
            </button>
          </div>
        </div>

        <p className="mt-6 text-center text-sm text-gray-500">
          Não tem uma conta?{' '}
          <a href="#" className="text-blue-600 hover:underline">
            Entre em contato
          </a>
        </p>
      </div>
    </div>
  );
}
