'use client';

import { useAuth } from '@/lib/useAuth';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/DashboardLayout';

export default function DashboardPage() {
  const { user, loading, isAuth } = useAuth(true);
  const router = useRouter();

  // Show loading while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Verificando autenticação...</p>
        </div>
      </div>
    );
  }

  // If not authenticated, don't render anything (redirect will happen)
  if (!isAuth) {
    return null;
  }

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-gray-600 text-sm">OS Hoje</h3>
              <span className="text-2xl">📋</span>
            </div>
            <p className="text-3xl font-bold text-gray-900">12</p>
            <p className="text-sm text-green-600 mt-2">+2 desde ontem</p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-gray-600 text-sm">Receita</h3>
              <span className="text-2xl">💰</span>
            </div>
            <p className="text-3xl font-bold text-gray-900">R$ 3.500</p>
            <p className="text-sm text-green-600 mt-2">+15% este mês</p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-gray-600 text-sm">Pendentes</h3>
              <span className="text-2xl">⏱️</span>
            </div>
            <p className="text-3xl font-bold text-gray-900">5</p>
            <p className="text-sm text-orange-600 mt-2">3 abertos</p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-gray-600 text-sm">Técnicos</h3>
              <span className="text-2xl">👨‍🔧</span>
            </div>
            <p className="text-3xl font-bold text-gray-900">2</p>
            <p className="text-sm text-green-600 mt-2">Ambos disponíveis</p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Ações Rápidas</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <button 
              onClick={() => router.push('/dashboard/orders/new')}
              className="flex flex-col items-center p-4 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition"
            >
              <span className="text-3xl mb-2">📋</span>
              <span className="text-sm font-semibold text-gray-900">Nova OS</span>
            </button>
            <button 
              onClick={() => router.push('/dashboard/clients/new')}
              className="flex flex-col items-center p-4 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition"
            >
              <span className="text-3xl mb-2">👥</span>
              <span className="text-sm font-semibold text-gray-900">Novo Cliente</span>
            </button>
            <button 
              onClick={() => router.push('/dashboard/quotes/new')}
              className="flex flex-col items-center p-4 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition"
            >
              <span className="text-3xl mb-2">💰</span>
              <span className="text-sm font-semibold text-gray-900">Orçamento</span>
            </button>
            <button 
              onClick={() => router.push('/dashboard/whatsapp')}
              className="flex flex-col items-center p-4 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition"
            >
              <span className="text-3xl mb-2">📱</span>
              <span className="text-sm font-semibold text-gray-900">WhatsApp</span>
            </button>
          </div>
        </div>

        {/* Recent Orders */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Próximas Visitas</h2>
          <div className="space-y-4">
            {[
              { time: '14:00', os: 'OS-2024-0010', client: 'Maria Santos', tech: 'João Técnico', status: 'assigned' },
              { time: '15:30', os: 'OS-2024-0011', client: 'José Silva', tech: 'Pedro Silva', status: 'in_progress' },
              { time: '17:00', os: 'OS-2024-0012', client: 'Ana Costa', tech: 'João Técnico', status: 'assigned' },
            ].map((visit, idx) => (
              <div key={idx} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
                <div className="flex items-center space-x-4">
                  <div className="text-center">
                    <div className="text-lg font-bold text-blue-600">{visit.time}</div>
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">{visit.os}</div>
                    <div className="text-sm text-gray-600">{visit.client}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-gray-600">{visit.tech}</div>
                  <div className={`text-xs px-2 py-1 rounded mt-1 ${
                    visit.status === 'in_progress' ? 'bg-yellow-100 text-yellow-800' : 'bg-blue-100 text-blue-800'
                  }`}>
                    {visit.status === 'in_progress' ? 'Em andamento' : 'Agendado'}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Info Box */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="font-semibold text-blue-900 mb-2">ℹ️ Sistema em Demonstração</h3>
          <p className="text-blue-800 text-sm mb-4">
            Este é um dashboard de demonstração. Para implementar funcionalidades completas, 
            desenvolva os componentes conforme a documentação em <code>/docs</code>.
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <strong className="block text-blue-900">Backend:</strong>
              <span className="text-blue-700">✓ Estrutura completa</span>
            </div>
            <div>
              <strong className="block text-blue-900">Banco:</strong>
              <span className="text-blue-700">✓ Schema + Seeds</span>
            </div>
            <div>
              <strong className="block text-blue-900">WhatsApp:</strong>
              <span className="text-blue-700">✓ Baileys integrado</span>
            </div>
            <div>
              <strong className="block text-blue-900">Docs:</strong>
              <span className="text-blue-700">✓ Completa</span>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
