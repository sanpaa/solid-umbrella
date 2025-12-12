'use client';

import { useAuth } from '@/lib/useAuth';
import DashboardLayout from '@/components/DashboardLayout';

export default function WhatsAppPage() {
  const { loading: authLoading, isAuth } = useAuth(true);

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!isAuth) return null;

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">WhatsApp</h1>
          <p className="text-gray-600 mt-2">Gerenciar mensagens e integrações do WhatsApp</p>
        </div>

        <div className="bg-white rounded-lg shadow p-8">
          <div className="text-center">
            <span className="text-6xl mb-4 block">📱</span>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Integração WhatsApp
            </h2>
            <p className="text-gray-600 mb-6">
              A integração com WhatsApp permite enviar orçamentos, notificações de OS e 
              manter contato com os clientes de forma automatizada.
            </p>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 text-left">
              <h3 className="font-semibold text-blue-900 mb-2">📋 Funcionalidades Disponíveis:</h3>
              <ul className="space-y-2 text-blue-800 text-sm">
                <li>✓ Envio automático de orçamentos para aprovação</li>
                <li>✓ Notificações de criação de OS</li>
                <li>✓ Lembretes de visitas agendadas</li>
                <li>✓ Confirmação de conclusão de serviços</li>
                <li>✓ Link direto para aprovação de orçamentos</li>
              </ul>
            </div>
            <div className="mt-6 text-sm text-gray-500">
              <p>
                Os envios de WhatsApp são realizados automaticamente ao enviar orçamentos 
                pela página de Orçamentos ou ao criar novas OS.
              </p>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
