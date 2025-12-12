import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100">
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <h1 className="text-5xl font-bold text-gray-900 mb-6">
          🔧 Sistema de Gestão de Serviços
        </h1>
        
        <p className="text-xl text-gray-700 mb-8">
          Solução completa para empresas de refrigeração e elétrica
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <div className="text-4xl mb-4">📱</div>
            <h3 className="text-xl font-semibold mb-2">Mobile-First</h3>
            <p className="text-gray-600">
              Interface responsiva que funciona perfeitamente em todos os dispositivos
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-lg">
            <div className="text-4xl mb-4">💬</div>
            <h3 className="text-xl font-semibold mb-2">WhatsApp</h3>
            <p className="text-gray-600">
              Integração gratuita com WhatsApp usando Baileys
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-lg">
            <div className="text-4xl mb-4">📊</div>
            <h3 className="text-xl font-semibold mb-2">Dashboard</h3>
            <p className="text-gray-600">
              Visão completa do seu negócio em tempo real
            </p>
          </div>
        </div>

        <div className="space-x-4">
          <Link
            href="/login"
            className="inline-block bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
          >
            Fazer Login
          </Link>
          
          <Link
            href="/dashboard"
            className="inline-block bg-gray-200 text-gray-800 px-8 py-3 rounded-lg font-semibold hover:bg-gray-300 transition"
          >
            Ver Dashboard
          </Link>
        </div>

        <div className="mt-16 text-sm text-gray-600">
          <p className="mb-2">
            <strong>Credenciais de teste:</strong>
          </p>
          <p>
            Email: <code className="bg-gray-200 px-2 py-1 rounded">admin@empresa.com</code><br />
            Senha: <code className="bg-gray-200 px-2 py-1 rounded">senha123</code>
          </p>
        </div>

        <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600">
          <div>
            <h4 className="font-semibold mb-2">Gestão</h4>
            <ul className="space-y-1">
              <li>✓ Clientes</li>
              <li>✓ Ordens de Serviço</li>
              <li>✓ Orçamentos</li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold mb-2">Financeiro</h4>
            <ul className="space-y-1">
              <li>✓ Pagamentos</li>
              <li>✓ Relatórios</li>
              <li>✓ Gráficos</li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold mb-2">Técnicos</h4>
            <ul className="space-y-1">
              <li>✓ Agenda</li>
              <li>✓ Performance</li>
              <li>✓ Localização</li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold mb-2">Comunicação</h4>
            <ul className="space-y-1">
              <li>✓ WhatsApp Auto</li>
              <li>✓ Notificações</li>
              <li>✓ Histórico</li>
            </ul>
          </div>
        </div>

        <div className="mt-12 border-t pt-8 text-gray-500 text-sm">
          <p>
            📚 Documentação completa disponível em{' '}
            <a href="/docs" className="text-blue-600 hover:underline">
              /docs
            </a>
          </p>
          <p className="mt-2">
            Desenvolvido com ❤️ para empresas de refrigeração e elétrica
          </p>
        </div>
      </div>
    </div>
  );
}
