'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/useAuth';
import { useRouter, useParams } from 'next/navigation';
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

export default function QuoteDetailPage() {
  const { loading: authLoading, isAuth } = useAuth(true);
  const router = useRouter();
  const params = useParams();
  const quoteId = params.id;

  const [quote, setQuote] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showSendModal, setShowSendModal] = useState(false);
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState(null);

  useEffect(() => {
    if (isAuth && quoteId) {
      fetchQuoteData();
    }
  }, [isAuth, quoteId]);

  const fetchQuoteData = async () => {
    try {
      setLoading(true);
      const response = await quotesApi.get(quoteId);
      setQuote(response.data.data.quote);
      setError(null);
    } catch (err) {
      console.error('Error fetching quote:', err);
      setError('Erro ao carregar orçamento');
    } finally {
      setLoading(false);
    }
  };

  const handleSendQuote = async () => {
    setActionLoading(true);
    setActionError(null);

    try {
      await quotesApi.send(quoteId);
      setShowSendModal(false);
      fetchQuoteData();
    } catch (err) {
      console.error('Error sending quote:', err);
      setActionError('Erro ao enviar orçamento. Tente novamente.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleApproveQuote = async () => {
    setActionLoading(true);
    setActionError(null);

    try {
      await quotesApi.approve(quoteId);
      setShowApproveModal(false);
      fetchQuoteData();
    } catch (err) {
      console.error('Error approving quote:', err);
      setActionError('Erro ao aprovar orçamento. Tente novamente.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleRejectQuote = async () => {
    if (!rejectionReason.trim()) {
      setActionError('Por favor, informe o motivo da rejeição');
      return;
    }

    setActionLoading(true);
    setActionError(null);

    try {
      await quotesApi.reject(quoteId, rejectionReason);
      setShowRejectModal(false);
      fetchQuoteData();
    } catch (err) {
      console.error('Error rejecting quote:', err);
      setActionError('Erro ao rejeitar orçamento. Tente novamente.');
    } finally {
      setActionLoading(false);
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

  if (error || !quote) {
    return (
      <DashboardLayout>
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error || 'Orçamento não encontrado'}
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => router.push('/dashboard/quotes')}
            className="text-blue-600 hover:text-blue-800 mb-2 flex items-center"
          >
            ← Voltar para Orçamentos
          </button>
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{quote.quote_number}</h1>
              <p className="text-gray-600">Orçamento</p>
            </div>
            <div className="flex gap-2">
              {quote.status === 'pending' && (
                <button
                  onClick={() => setShowSendModal(true)}
                  className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition"
                >
                  📱 Enviar WhatsApp
                </button>
              )}
              {quote.status === 'sent' && (
                <>
                  <button
                    onClick={() => setShowApproveModal(true)}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
                  >
                    ✓ Aprovar
                  </button>
                  <button
                    onClick={() => setShowRejectModal(true)}
                    className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition"
                  >
                    ✗ Rejeitar
                  </button>
                </>
              )}
              {quote.status === 'approved' && quote.order && (
                <button
                  onClick={() => router.push(`/dashboard/orders/${quote.order.id}`)}
                  className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition"
                >
                  Ver OS Criada
                </button>
              )}
              {quote.client?.whatsapp && (
                <button
                  onClick={() => openWhatsApp(quote.client.whatsapp)}
                  className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition"
                >
                  💬 WhatsApp
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Status Badge */}
        <div className="mb-6">
          <span className={`px-4 py-2 text-sm font-semibold rounded-full ${statusColors[quote.status]}`}>
            {statusLabels[quote.status]}
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Description */}
            {quote.description && (
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Descrição</h2>
                <p className="text-gray-700 whitespace-pre-wrap">{quote.description}</p>
              </div>
            )}

            {/* Items */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Itens do Orçamento</h2>
              {quote.items && quote.items.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Descrição
                        </th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Quantidade
                        </th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Preço Unit.
                        </th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Total
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {quote.items.map((item, index) => (
                        <tr key={index}>
                          <td className="px-4 py-4 text-sm text-gray-900">{item.description}</td>
                          <td className="px-4 py-4 text-sm text-gray-900 text-right">{item.quantity}</td>
                          <td className="px-4 py-4 text-sm text-gray-900 text-right">
                            R$ {parseFloat(item.unit_price).toFixed(2)}
                          </td>
                          <td className="px-4 py-4 text-sm font-medium text-gray-900 text-right">
                            R$ {(parseFloat(item.quantity) * parseFloat(item.unit_price)).toFixed(2)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot className="bg-gray-50">
                      <tr>
                        <td colSpan="3" className="px-4 py-3 text-right text-sm font-medium text-gray-900">
                          Subtotal
                        </td>
                        <td className="px-4 py-3 text-right text-sm font-medium text-gray-900">
                          R$ {parseFloat(quote.subtotal).toFixed(2)}
                        </td>
                      </tr>
                      {parseFloat(quote.discount) > 0 && (
                        <tr>
                          <td colSpan="3" className="px-4 py-3 text-right text-sm font-medium text-gray-900">
                            Desconto
                          </td>
                          <td className="px-4 py-3 text-right text-sm font-medium text-red-600">
                            - R$ {parseFloat(quote.discount).toFixed(2)}
                          </td>
                        </tr>
                      )}
                      <tr className="bg-gray-100">
                        <td colSpan="3" className="px-4 py-3 text-right text-lg font-bold text-gray-900">
                          Total
                        </td>
                        <td className="px-4 py-3 text-right text-lg font-bold text-gray-900">
                          R$ {parseFloat(quote.total).toFixed(2)}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              ) : (
                <p className="text-gray-500">Nenhum item adicionado</p>
              )}
            </div>

            {/* Notes */}
            {quote.notes && (
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Observações</h2>
                <p className="text-gray-700 whitespace-pre-wrap">{quote.notes}</p>
              </div>
            )}

            {/* Rejection Reason */}
            {quote.status === 'rejected' && quote.rejection_reason && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                <h2 className="text-lg font-bold text-red-900 mb-2">Motivo da Rejeição</h2>
                <p className="text-red-700 whitespace-pre-wrap">{quote.rejection_reason}</p>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Client Info */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Cliente</h2>
              {quote.client ? (
                <div>
                  <p className="font-medium text-gray-900">{quote.client.name}</p>
                  {quote.client.cpf_cnpj && (
                    <p className="text-sm text-gray-600 mt-1">{quote.client.cpf_cnpj}</p>
                  )}
                  {quote.client.whatsapp && (
                    <p className="text-sm text-gray-600 mt-2">📱 {quote.client.whatsapp}</p>
                  )}
                  {quote.client.phone && (
                    <p className="text-sm text-gray-600">📞 {quote.client.phone}</p>
                  )}
                  {quote.client.email && (
                    <p className="text-sm text-gray-600">✉️ {quote.client.email}</p>
                  )}
                  <button
                    onClick={() => router.push(`/dashboard/clients/${quote.client.id}`)}
                    className="mt-4 w-full bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition text-sm"
                  >
                    Ver Perfil do Cliente
                  </button>
                </div>
              ) : (
                <p className="text-sm text-gray-500">Cliente não encontrado</p>
              )}
            </div>

            {/* Validity */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Validade</h2>
              <dl className="space-y-3">
                {quote.valid_until && (
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Válido até</dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      {new Date(quote.valid_until).toLocaleDateString('pt-BR')}
                    </dd>
                  </div>
                )}
                {quote.sent_at && (
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Enviado em</dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      {new Date(quote.sent_at).toLocaleString('pt-BR')}
                    </dd>
                  </div>
                )}
                {quote.approved_at && (
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Aprovado em</dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      {new Date(quote.approved_at).toLocaleString('pt-BR')}
                    </dd>
                  </div>
                )}
                {quote.rejected_at && (
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Rejeitado em</dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      {new Date(quote.rejected_at).toLocaleString('pt-BR')}
                    </dd>
                  </div>
                )}
              </dl>
            </div>

            {/* Creation Info */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Informações</h2>
              <dl className="space-y-3">
                <div>
                  <dt className="text-sm font-medium text-gray-500">Criado em</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {new Date(quote.created_at).toLocaleString('pt-BR')}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Última atualização</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {new Date(quote.updated_at).toLocaleString('pt-BR')}
                  </dd>
                </div>
              </dl>
            </div>
          </div>
        </div>
      </div>

      {/* Send Modal */}
      {showSendModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Enviar Orçamento</h2>
            <p className="text-gray-700 mb-4">
              Deseja enviar este orçamento para o cliente via WhatsApp?
            </p>
            {actionError && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-2 rounded-lg text-sm mb-4">
                {actionError}
              </div>
            )}
            <div className="flex gap-2">
              <button
                onClick={() => {
                  setShowSendModal(false);
                  setActionError(null);
                }}
                disabled={actionLoading}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleSendQuote}
                disabled={actionLoading}
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
              >
                {actionLoading ? 'Enviando...' : 'Enviar'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Approve Modal */}
      {showApproveModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Aprovar Orçamento</h2>
            <p className="text-gray-700 mb-4">
              Deseja aprovar este orçamento? Uma Ordem de Serviço será criada automaticamente.
            </p>
            {actionError && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-2 rounded-lg text-sm mb-4">
                {actionError}
              </div>
            )}
            <div className="flex gap-2">
              <button
                onClick={() => {
                  setShowApproveModal(false);
                  setActionError(null);
                }}
                disabled={actionLoading}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleApproveQuote}
                disabled={actionLoading}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {actionLoading ? 'Aprovando...' : 'Aprovar'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Rejeitar Orçamento</h2>
            <textarea
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="Informe o motivo da rejeição..."
              rows="4"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent mb-4"
              disabled={actionLoading}
            />
            {actionError && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-2 rounded-lg text-sm mb-4">
                {actionError}
              </div>
            )}
            <div className="flex gap-2">
              <button
                onClick={() => {
                  setShowRejectModal(false);
                  setActionError(null);
                  setRejectionReason('');
                }}
                disabled={actionLoading}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleRejectQuote}
                disabled={actionLoading}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
              >
                {actionLoading ? 'Rejeitando...' : 'Rejeitar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
