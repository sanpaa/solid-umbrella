'use client';

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/lib/useAuth';
import DashboardLayout from '@/components/DashboardLayout';
import { whatsappApi } from '@/lib/api';

export default function WhatsAppPage() {
  const { loading: authLoading, isAuth } = useAuth(true);
  const [connectionStatus, setConnectionStatus] = useState(null);
  const [qrCode, setQrCode] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [sendSuccess, setSendSuccess] = useState(false);
  const intervalRef = useRef(null);

  useEffect(() => {
    if (isAuth) {
      fetchStatus();
      // Poll for status updates every 5 seconds
      intervalRef.current = setInterval(fetchStatus, 5000);
      
      return () => {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
        }
      };
    }
  }, [isAuth]);

  const fetchStatus = async () => {
    try {
      const [statusResponse, qrResponse] = await Promise.all([
        whatsappApi.getStatus(),
        whatsappApi.getQR(),
      ]);

      setConnectionStatus(statusResponse.data.data);
      
      if (qrResponse.data.data.qrCode) {
        setQrCode(qrResponse.data.data.qrCode);
      } else {
        setQrCode(null);
      }
      
      setError(null);
    } catch (err) {
      console.error('Error fetching WhatsApp status:', err);
      setError('Erro ao carregar status do WhatsApp');
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    
    if (!phoneNumber || !message) {
      alert('Por favor, preencha o número e a mensagem');
      return;
    }

    setSending(true);
    setSendSuccess(false);

    try {
      await whatsappApi.sendMessage(phoneNumber, message);
      setSendSuccess(true);
      setMessage('');
      setTimeout(() => setSendSuccess(false), 3000);
    } catch (err) {
      console.error('Error sending message:', err);
      alert('Erro ao enviar mensagem');
    } finally {
      setSending(false);
    }
  };

  const handleDisconnect = async () => {
    if (!confirm('Deseja realmente desconectar o WhatsApp?')) {
      return;
    }

    try {
      await whatsappApi.disconnect();
      alert('WhatsApp desconectado com sucesso');
      fetchStatus();
    } catch (err) {
      console.error('Error disconnecting:', err);
      alert('Erro ao desconectar');
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
          <h1 className="text-3xl font-bold text-gray-900">WhatsApp</h1>
          <p className="text-gray-600 mt-2">Gerenciar mensagens e integrações do WhatsApp</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Connection Status */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Status da Conexão</h2>
            
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className={`w-4 h-4 rounded-full ${
                      connectionStatus?.connected ? 'bg-green-500' : 'bg-red-500'
                    }`}></div>
                    <span className="text-lg font-medium">
                      {connectionStatus?.connected ? 'Conectado' : 'Desconectado'}
                    </span>
                  </div>
                  {connectionStatus?.connected && (
                    <button
                      onClick={handleDisconnect}
                      className="text-red-600 hover:text-red-800 text-sm font-medium"
                    >
                      Desconectar
                    </button>
                  )}
                </div>

                {connectionStatus?.connected && connectionStatus?.phoneNumber && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                    <p className="text-sm font-medium text-green-900">Número conectado:</p>
                    <p className="text-lg font-bold text-green-700">
                      {connectionStatus.phoneNumber}
                    </p>
                  </div>
                )}

                {!connectionStatus?.connected && qrCode && (
                  <div className="space-y-4">
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <p className="text-sm text-blue-900 mb-2">
                        <strong>📱 Como conectar:</strong>
                      </p>
                      <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
                        <li>Abra o WhatsApp no seu celular</li>
                        <li>Toque em Menu (⋮) ou Configurações</li>
                        <li>Toque em "Aparelhos conectados"</li>
                        <li>Toque em "Conectar um aparelho"</li>
                        <li>Escaneie o QR Code abaixo</li>
                      </ol>
                    </div>
                    
                    <div className="bg-white border-2 border-gray-300 rounded-lg p-4 flex justify-center">
                      <img
                        src={`https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(qrCode)}`}
                        alt="QR Code WhatsApp"
                        className="w-64 h-64"
                      />
                    </div>
                    
                    <p className="text-sm text-gray-600 text-center">
                      O QR Code é atualizado automaticamente. Aguarde a conexão...
                    </p>
                  </div>
                )}

                {!connectionStatus?.connected && !qrCode && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <p className="text-sm text-yellow-900">
                      Aguardando inicialização do serviço WhatsApp...
                    </p>
                    <p className="text-xs text-yellow-700 mt-2">
                      Se o QR Code não aparecer, verifique se o backend está rodando corretamente.
                    </p>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Send Message */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Enviar Mensagem</h2>
            
            {!connectionStatus?.connected ? (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <p className="text-sm text-yellow-900">
                  ⚠️ Conecte o WhatsApp primeiro para enviar mensagens
                </p>
              </div>
            ) : (
              <form onSubmit={handleSendMessage} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Número de telefone (com DDD)
                  </label>
                  <input
                    type="text"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="5511999999999"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    disabled={sending}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Exemplo: 5511999999999 (código do país + DDD + número)
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Mensagem
                  </label>
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Digite sua mensagem..."
                    rows="5"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    disabled={sending}
                  />
                </div>

                {sendSuccess && (
                  <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-2 rounded-lg text-sm">
                    ✓ Mensagem enviada com sucesso!
                  </div>
                )}

                <button
                  type="submit"
                  disabled={sending}
                  className="w-full bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  {sending ? 'Enviando...' : '📱 Enviar Mensagem'}
                </button>
              </form>
            )}
          </div>
        </div>

        {/* Features Info */}
        <div className="mt-6 bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Funcionalidades Disponíveis</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="font-semibold text-blue-900 mb-2">📋 Envios Automáticos</h3>
              <ul className="space-y-1 text-blue-800 text-sm">
                <li>✓ Orçamentos para aprovação</li>
                <li>✓ Notificações de criação de OS</li>
                <li>✓ Lembretes de visitas agendadas</li>
                <li>✓ Confirmação de conclusão</li>
              </ul>
            </div>
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h3 className="font-semibold text-green-900 mb-2">💬 Envios Manuais</h3>
              <ul className="space-y-1 text-green-800 text-sm">
                <li>✓ Mensagens personalizadas</li>
                <li>✓ Comunicação direta com clientes</li>
                <li>✓ Notificações customizadas</li>
                <li>✓ Confirmações de agendamento</li>
              </ul>
            </div>
          </div>
          <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <p className="text-sm text-yellow-900">
              <strong>⚠️ Importante:</strong> Esta integração usa o Baileys (API não-oficial do WhatsApp).
              Para uso comercial em larga escala, considere usar a API oficial do Meta WhatsApp Business.
            </p>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
