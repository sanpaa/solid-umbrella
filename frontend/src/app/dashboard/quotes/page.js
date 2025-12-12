'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/useAuth';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/DashboardLayout';
import { quotesApi } from '@/lib/api';

const statusColors = {
  pending: 'bg-gray-100 text-gray-800',
  sent: 'bg-blue-100 text-blue-800',
  approved: 'bg-green-100 text-green-800',
  rejected: 'bg-red-100 text-red-800',
  expired: 'bg-orange-100 text-orange-800',
};

const statusLabels = {
  pending: 'Pendente',
  sent: 'Enviado',
  approved: 'Aprovado',
  rejected: 'Rejeitado',
  expired: 'Expirado',
};

export default function QuotesPage() {
  const { loading: authLoading, isAuth } = useAuth(true);
  const router = useRouter();
  const [quotes, setQuotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    if (isAuth) {
      fetchQuotes();
    }
  }, [isAuth, statusFilter]);

  const fetchQuotes = async () => {
    try {
      setLoading(true);
      const params = {};
      if (statusFilter) params.status = statusFilter;
      const response = await quotesApi.list(params);
      setQuotes(response.data.data.quotes);
      setError(null);
    } catch (err) {
      console.error('Error fetching quotes:', err);
      setError('Erro ao carregar orçamentos');
    } finally {
      setLoading(false);
    }
  };

  const handleSendQuote = async (id) => {
    if (!confirm('Deseja enviar este orçamento para o cliente via WhatsApp?')) {
      return;
    }

    try {
      await quotesApi.send(id);
      alert('Orçamento enviado com sucesso!');
      fetchQuotes();
    } catch (err) {
      console.error('Error sending quote:', err);
      alert('Erro ao enviar orçamento');
    }
  };

  const handleApproveQuote = async (id) => {
    if (!confirm('Deseja aprovar este orçamento? Uma OS será criada automaticamente.')) {
      return;
    }

    try {
      await quotesApi.approve(id);
      alert('Orçamento aprovado e OS criada com sucesso!');
      fetchQuotes();
    } catch (err) {
      console.error('Error approving quote:', err);
      alert('Erro ao aprovar orçamento');
    }
  };

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
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-3xl font-bold text-gray-900">Orçamentos</h1>
            <button
              onClick={() => router.push('/dashboard/quotes/new')}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
            >
              + Novo Orçamento
            </button>
          </div>

          {/* Filter */}
          <div className="flex gap-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
            >
              <option value="">Todos os Status</option>
              <option value="pending">Pendente</option>
              <option value="sent">Enviado</option>
              <option value="approved">Aprovado</option>
              <option value="rejected">Rejeitado</option>
              <option value="expired">Expirado</option>
            </select>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
            {error}
          </div>
        )}

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          </div>
        ) : quotes.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <p className="text-gray-600">Nenhum orçamento encontrado</p>
          </div>
        ) : (
          <div className="grid gap-6">
            {quotes.map((quote) => (
              <div key={quote.id} className="bg-white rounded-lg shadow p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">{quote.quote_number}</h3>
                    <p className="text-sm text-gray-600">{quote.client?.name}</p>
                    <p className="text-sm text-gray-500">{quote.client?.whatsapp}</p>
                  </div>
                  <span className={`px-3 py-1 text-xs font-semibold rounded-full ${statusColors[quote.status]}`}>
                    {statusLabels[quote.status]}
                  </span>
                </div>

                <div className="mb-4">
                  <p className="text-sm text-gray-700">{quote.description}</p>
                </div>

                <div className="flex justify-between items-center border-t pt-4">
                  <div>
                    <p className="text-2xl font-bold text-gray-900">
                      R$ {parseFloat(quote.total).toFixed(2)}
                    </p>
                    <p className="text-sm text-gray-500">
                      Criado em {new Date(quote.created_at).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => router.push(`/dashboard/quotes/${quote.id}`)}
                      className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition text-sm"
                    >
                      Ver Detalhes
                    </button>
                    {quote.status === 'pending' && (
                      <button
                        onClick={() => handleSendQuote(quote.id)}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition text-sm"
                      >
                        📱 Enviar WhatsApp
                      </button>
                    )}
                    {quote.status === 'sent' && (
                      <button
                        onClick={() => handleApproveQuote(quote.id)}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm"
                      >
                        ✓ Aprovar
                      </button>
                    )}
                    {quote.status === 'approved' && quote.order && (
                      <button
                        onClick={() => router.push(`/dashboard/orders/${quote.order.id}`)}
                        className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition text-sm"
                      >
                        Ver OS
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
