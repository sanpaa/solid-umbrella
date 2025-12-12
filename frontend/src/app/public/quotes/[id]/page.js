'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import axios from 'axios';
import { API_URL } from '@/lib/config';

export default function PublicQuoteApprovalPage() {
  const params = useParams();
  const [quote, setQuote] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [approving, setApproving] = useState(false);
  const [approved, setApproved] = useState(false);

  useEffect(() => {
    if (params.id) {
      fetchQuote();
    }
  }, [params.id]);

  const fetchQuote = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/quotes/public/${params.id}`);
      setQuote(response.data.data);
      
      // Check if already approved
      if (response.data.data.status === 'approved') {
        setApproved(true);
      }
      
      setError(null);
    } catch (err) {
      console.error('Error fetching quote:', err);
      setError('Orçamento não encontrado ou inválido');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async () => {
    if (!confirm('Deseja aprovar este orçamento? Uma ordem de serviço será criada.')) {
      return;
    }

    try {
      setApproving(true);
      await axios.post(`${API_URL}/quotes/public/${params.id}/approve`);
      setApproved(true);
      alert('Orçamento aprovado com sucesso! Entraremos em contato em breve.');
    } catch (err) {
      console.error('Error approving quote:', err);
      alert('Erro ao aprovar orçamento. Por favor, entre em contato conosco.');
    } finally {
      setApproving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-xl p-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando orçamento...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full text-center">
          <span className="text-6xl mb-4 block">❌</span>
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Erro</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <p className="text-sm text-gray-500">Entre em contato conosco para mais informações.</p>
        </div>
      </div>
    );
  }

  if (approved || quote?.status === 'approved') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-500 to-green-700 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full text-center">
          <span className="text-6xl mb-4 block">✅</span>
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Orçamento Aprovado!</h1>
          <p className="text-gray-600 mb-6">
            Obrigado por aprovar o orçamento <strong>{quote.quote_number}</strong>!
          </p>
          <p className="text-sm text-gray-600 mb-4">
            Uma ordem de serviço foi criada e nossa equipe entrará em contato em breve para agendar a visita.
          </p>
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <p className="text-green-800 text-sm">
              📱 Em caso de dúvidas, entre em contato pelo WhatsApp.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (quote?.status === 'rejected') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-500 to-red-700 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full text-center">
          <span className="text-6xl mb-4 block">🚫</span>
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Orçamento Rejeitado</h1>
          <p className="text-gray-600 mb-4">
            Este orçamento foi rejeitado anteriormente.
          </p>
          <p className="text-sm text-gray-500">
            Entre em contato conosco para solicitar um novo orçamento.
          </p>
        </div>
      </div>
    );
  }

  const items = Array.isArray(quote?.items) ? quote.items : [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full overflow-hidden">
        <div className="bg-blue-600 text-white p-6">
          <h1 className="text-2xl font-bold mb-2">🔧 Orçamento de Serviço</h1>
          <p className="text-blue-100">{quote.quote_number}</p>
        </div>

        <div className="p-6 space-y-6">
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">Cliente</h2>
            <p className="text-gray-700">{quote.client?.name}</p>
          </div>

          {quote.description && (
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-2">Descrição</h2>
              <p className="text-gray-700">{quote.description}</p>
            </div>
          )}

          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">Itens</h2>
            <div className="space-y-2">
              {items.map((item, index) => (
                <div key={index} className="flex justify-between items-start border-b border-gray-200 pb-2">
                  <div className="flex-1">
                    <p className="text-gray-900 font-medium">{item.description}</p>
                    <p className="text-sm text-gray-600">
                      Quantidade: {item.quantity} × R$ {parseFloat(item.unit_price).toFixed(2)}
                    </p>
                  </div>
                  <p className="text-gray-900 font-semibold ml-4">
                    R$ {parseFloat(item.total).toFixed(2)}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="border-t border-gray-300 pt-4 space-y-2">
            <div className="flex justify-between text-gray-700">
              <span>Subtotal:</span>
              <span>R$ {parseFloat(quote.subtotal).toFixed(2)}</span>
            </div>
            {quote.discount > 0 && (
              <div className="flex justify-between text-green-600">
                <span>Desconto:</span>
                <span>- R$ {parseFloat(quote.discount).toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between text-2xl font-bold text-gray-900 pt-2 border-t">
              <span>Total:</span>
              <span>R$ {parseFloat(quote.total).toFixed(2)}</span>
            </div>
          </div>

          {quote.valid_until && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <p className="text-yellow-800 text-sm">
                ⏰ Válido até: {new Date(quote.valid_until).toLocaleDateString('pt-BR')}
              </p>
            </div>
          )}

          {quote.notes && (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 mb-2">Observações:</h3>
              <p className="text-gray-700 text-sm">{quote.notes}</p>
            </div>
          )}

          <div className="pt-4">
            <button
              onClick={handleApprove}
              disabled={approving}
              className="w-full bg-green-600 text-white py-4 px-6 rounded-lg hover:bg-green-700 transition font-semibold text-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {approving ? 'Aprovando...' : '✅ Aprovar Orçamento'}
            </button>
            <p className="text-center text-sm text-gray-500 mt-4">
              Ao aprovar, você autoriza a execução do serviço conforme descrito acima.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
