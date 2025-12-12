'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/useAuth';
import { useRouter, useParams } from 'next/navigation';
import DashboardLayout from '@/components/DashboardLayout';
import { clientsApi, ordersApi, quotesApi } from '@/lib/api';

export default function ClientDetailPage() {
  const { loading: authLoading, isAuth } = useAuth(true);
  const router = useRouter();
  const params = useParams();
  const clientId = params.id;

  const [client, setClient] = useState(null);
  const [orders, setOrders] = useState([]);
  const [quotes, setQuotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('info');

  useEffect(() => {
    if (isAuth && clientId) {
      fetchClientData();
    }
  }, [isAuth, clientId]);

  const fetchClientData = async () => {
    try {
      setLoading(true);
      const [clientResponse, ordersResponse, quotesResponse] = await Promise.all([
        clientsApi.get(clientId),
        ordersApi.list({ client_id: clientId }),
        quotesApi.list({ client_id: clientId }),
      ]);

      setClient(clientResponse.data.data.client);
      setOrders(ordersResponse.data.data.orders || []);
      setQuotes(quotesResponse.data.data.quotes || []);
      setError(null);
    } catch (err) {
      console.error('Error fetching client data:', err);
      setError('Erro ao carregar dados do cliente');
    } finally {
      setLoading(false);
    }
  };

  const openWhatsApp = (number) => {
    const cleanNumber = number.replace(/\D/g, '');
    window.open(`https://wa.me/${cleanNumber}`, '_blank');
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!isAuth) return null;

  if (loading) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        </div>
      </DashboardLayout>
    );
  }

  if (error || !client) {
    return (
      <DashboardLayout>
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error || 'Cliente não encontrado'}
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6 flex justify-between items-center">
          <div>
            <button
              onClick={() => router.push('/dashboard/clients')}
              className="text-blue-600 hover:text-blue-800 mb-2 flex items-center"
            >
              ← Voltar para Clientes
            </button>
            <h1 className="text-3xl font-bold text-gray-900">{client.name}</h1>
            <p className="text-gray-600">
              {client.client_type === 'individual' ? 'Pessoa Física' : 'Empresa'}
            </p>
          </div>
          <button
            onClick={() => router.push(`/dashboard/clients/${clientId}/edit`)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
          >
            ✏️ Editar Cliente
          </button>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 mb-6">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('info')}
              className={`${
                activeTab === 'info'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            >
              📋 Informações
            </button>
            <button
              onClick={() => setActiveTab('orders')}
              className={`${
                activeTab === 'orders'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            >
              🔧 Ordens de Serviço ({orders.length})
            </button>
            <button
              onClick={() => setActiveTab('quotes')}
              className={`${
                activeTab === 'quotes'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            >
              💰 Orçamentos ({quotes.length})
            </button>
          </nav>
        </div>

        {/* Tab Content */}
        {activeTab === 'info' && (
          <div className="bg-white rounded-lg shadow p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Basic Info */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Informações Básicas</h3>
                <dl className="space-y-3">
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Nome</dt>
                    <dd className="mt-1 text-sm text-gray-900">{client.name}</dd>
                  </div>
                  {client.cpf_cnpj && (
                    <div>
                      <dt className="text-sm font-medium text-gray-500">CPF/CNPJ</dt>
                      <dd className="mt-1 text-sm text-gray-900">{client.cpf_cnpj}</dd>
                    </div>
                  )}
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Tipo</dt>
                    <dd className="mt-1">
                      <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                        {client.client_type === 'individual' ? 'Pessoa Física' : 'Empresa'}
                      </span>
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Status</dt>
                    <dd className="mt-1">
                      <span
                        className={`px-2 py-1 text-xs font-semibold rounded-full ${
                          client.is_active
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {client.is_active ? 'Ativo' : 'Inativo'}
                      </span>
                    </dd>
                  </div>
                </dl>
              </div>

              {/* Contact Info */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Contato</h3>
                <dl className="space-y-3">
                  {client.whatsapp && (
                    <div>
                      <dt className="text-sm font-medium text-gray-500">WhatsApp</dt>
                      <dd className="mt-1 text-sm text-gray-900 flex items-center gap-2">
                        {client.whatsapp}
                        <button
                          onClick={() => openWhatsApp(client.whatsapp)}
                          className="ml-2 bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600 transition text-xs"
                        >
                          📱 Abrir WhatsApp
                        </button>
                      </dd>
                    </div>
                  )}
                  {client.phone && (
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Telefone</dt>
                      <dd className="mt-1 text-sm text-gray-900">{client.phone}</dd>
                    </div>
                  )}
                  {client.email && (
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Email</dt>
                      <dd className="mt-1 text-sm text-gray-900">
                        <a href={`mailto:${client.email}`} className="text-blue-600 hover:text-blue-800">
                          {client.email}
                        </a>
                      </dd>
                    </div>
                  )}
                </dl>
              </div>
            </div>

            {/* Notes */}
            {client.notes && (
              <div className="mt-6 pt-6 border-t border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Observações</h3>
                <p className="text-sm text-gray-700 whitespace-pre-wrap">{client.notes}</p>
              </div>
            )}

            {/* Timestamps */}
            <div className="mt-6 pt-6 border-t border-gray-200">
              <dl className="grid grid-cols-2 gap-4">
                <div>
                  <dt className="text-sm font-medium text-gray-500">Cadastrado em</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {new Date(client.created_at).toLocaleString('pt-BR')}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Última atualização</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {new Date(client.updated_at).toLocaleString('pt-BR')}
                  </dd>
                </div>
              </dl>
            </div>
          </div>
        )}

        {activeTab === 'orders' && (
          <div className="bg-white rounded-lg shadow">
            {orders.length === 0 ? (
              <div className="p-8 text-center text-gray-600">
                Nenhuma ordem de serviço encontrada para este cliente
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Número
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Tipo
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Data
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Ações
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {orders.map((order) => (
                      <tr key={order.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {order.order_number}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {order.service_type === 'refrigeration' ? '❄️ Refrigeração' : '⚡ Elétrica'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {order.status}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(order.created_at).toLocaleDateString('pt-BR')}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <button
                            onClick={() => router.push(`/dashboard/orders/${order.id}`)}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            Ver Detalhes
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {activeTab === 'quotes' && (
          <div className="bg-white rounded-lg shadow">
            {quotes.length === 0 ? (
              <div className="p-8 text-center text-gray-600">
                Nenhum orçamento encontrado para este cliente
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Número
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Descrição
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Total
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Data
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Ações
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {quotes.map((quote) => (
                      <tr key={quote.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {quote.quote_number}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">
                          {quote.description?.substring(0, 50) || '-'}
                          {quote.description?.length > 50 && '...'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {quote.status}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          R$ {parseFloat(quote.total).toFixed(2)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(quote.created_at).toLocaleDateString('pt-BR')}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <button
                            onClick={() => router.push(`/dashboard/quotes/${quote.id}`)}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            Ver Detalhes
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
