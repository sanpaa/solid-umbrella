'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/useAuth';
import { useRouter, useParams } from 'next/navigation';
import DashboardLayout from '@/components/DashboardLayout';
import { ordersApi, usersApi } from '@/lib/api';

const statusColors = {
  open: 'bg-blue-100 text-blue-800',
  assigned: 'bg-purple-100 text-purple-800',
  in_progress: 'bg-yellow-100 text-yellow-800',
  waiting_part: 'bg-orange-100 text-orange-800',
  completed: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
};

const statusLabels = {
  open: 'Aberto',
  assigned: 'Atribuído',
  in_progress: 'Em Andamento',
  waiting_part: 'Aguardando Peça',
  completed: 'Concluído',
  cancelled: 'Cancelado',
};

export default function OrderDetailPage() {
  const { loading: authLoading, isAuth } = useAuth(true);
  const router = useRouter();
  const params = useParams();
  const orderId = params.id;

  const [order, setOrder] = useState(null);
  const [technicians, setTechnicians] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [newStatus, setNewStatus] = useState('');
  const [selectedTechnicianId, setSelectedTechnicianId] = useState('');

  useEffect(() => {
    if (isAuth && orderId) {
      fetchOrderData();
      fetchTechnicians();
    }
  }, [isAuth, orderId]);

  const fetchOrderData = async () => {
    try {
      setLoading(true);
      const response = await ordersApi.get(orderId);
      setOrder(response.data.data.order);
      setError(null);
    } catch (err) {
      console.error('Error fetching order:', err);
      setError('Erro ao carregar ordem de serviço');
    } finally {
      setLoading(false);
    }
  };

  const fetchTechnicians = async () => {
    try {
      const response = await usersApi.listTechnicians();
      setTechnicians(response.data.data.technicians || []);
    } catch (err) {
      console.error('Error fetching technicians:', err);
    }
  };

  const handleStatusUpdate = async () => {
    if (!newStatus) {
      alert('Por favor, selecione um status');
      return;
    }

    try {
      await ordersApi.updateStatus(orderId, newStatus);
      alert('Status atualizado com sucesso!');
      setShowStatusModal(false);
      fetchOrderData();
    } catch (err) {
      console.error('Error updating status:', err);
      alert('Erro ao atualizar status');
    }
  };

  const handleAssignTechnician = async () => {
    if (!selectedTechnicianId) {
      alert('Por favor, selecione um técnico');
      return;
    }

    try {
      await ordersApi.assignTechnician(orderId, selectedTechnicianId);
      alert('Técnico atribuído com sucesso!');
      setShowAssignModal(false);
      fetchOrderData();
    } catch (err) {
      console.error('Error assigning technician:', err);
      alert('Erro ao atribuir técnico');
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

  if (error || !order) {
    return (
      <DashboardLayout>
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error || 'Ordem de serviço não encontrada'}
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
            onClick={() => router.push('/dashboard/orders')}
            className="text-blue-600 hover:text-blue-800 mb-2 flex items-center"
          >
            ← Voltar para Ordens de Serviço
          </button>
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{order.order_number}</h1>
              <p className="text-gray-600">
                {order.service_type === 'refrigeration' ? '❄️ Refrigeração' : '⚡ Elétrica'}
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setShowStatusModal(true)}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
              >
                🔄 Atualizar Status
              </button>
              {order.client?.whatsapp && (
                <button
                  onClick={() => openWhatsApp(order.client.whatsapp)}
                  className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition"
                >
                  📱 WhatsApp
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Status Badge */}
        <div className="mb-6">
          <span className={`px-4 py-2 text-sm font-semibold rounded-full ${statusColors[order.status]}`}>
            {statusLabels[order.status]}
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Service Details */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Detalhes do Serviço</h2>
              <dl className="space-y-3">
                {order.equipment && (
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Equipamento</dt>
                    <dd className="mt-1 text-sm text-gray-900">{order.equipment}</dd>
                  </div>
                )}
                <div>
                  <dt className="text-sm font-medium text-gray-500">Problema Reportado</dt>
                  <dd className="mt-1 text-sm text-gray-900 whitespace-pre-wrap">{order.problem}</dd>
                </div>
                {order.diagnosis && (
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Diagnóstico</dt>
                    <dd className="mt-1 text-sm text-gray-900 whitespace-pre-wrap">{order.diagnosis}</dd>
                  </div>
                )}
                {order.solution && (
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Solução</dt>
                    <dd className="mt-1 text-sm text-gray-900 whitespace-pre-wrap">{order.solution}</dd>
                  </div>
                )}
                {order.notes && (
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Observações</dt>
                    <dd className="mt-1 text-sm text-gray-900 whitespace-pre-wrap">{order.notes}</dd>
                  </div>
                )}
              </dl>
            </div>

            {/* Scheduling & Costs */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Agendamento e Custos</h2>
              <dl className="grid grid-cols-2 gap-4">
                <div>
                  <dt className="text-sm font-medium text-gray-500">Prioridade</dt>
                  <dd className="mt-1">
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                      order.priority === 'urgent' ? 'bg-red-100 text-red-800' :
                      order.priority === 'high' ? 'bg-orange-100 text-orange-800' :
                      order.priority === 'normal' ? 'bg-blue-100 text-blue-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {order.priority === 'urgent' ? 'Urgente' :
                       order.priority === 'high' ? 'Alta' :
                       order.priority === 'normal' ? 'Normal' : 'Baixa'}
                    </span>
                  </dd>
                </div>
                {order.scheduled_date && (
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Data Agendada</dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      {new Date(order.scheduled_date).toLocaleString('pt-BR')}
                    </dd>
                  </div>
                )}
                {order.started_at && (
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Iniciado em</dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      {new Date(order.started_at).toLocaleString('pt-BR')}
                    </dd>
                  </div>
                )}
                {order.completed_at && (
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Concluído em</dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      {new Date(order.completed_at).toLocaleString('pt-BR')}
                    </dd>
                  </div>
                )}
                {order.estimated_cost && (
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Custo Estimado</dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      R$ {parseFloat(order.estimated_cost).toFixed(2)}
                    </dd>
                  </div>
                )}
                {order.final_cost && (
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Custo Final</dt>
                    <dd className="mt-1 text-sm font-medium text-gray-900">
                      R$ {parseFloat(order.final_cost).toFixed(2)}
                    </dd>
                  </div>
                )}
              </dl>
              {order.cancellation_reason && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <dt className="text-sm font-medium text-gray-500">Motivo do Cancelamento</dt>
                  <dd className="mt-1 text-sm text-red-700 whitespace-pre-wrap">
                    {order.cancellation_reason}
                  </dd>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Client Info */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Cliente</h2>
              {order.client ? (
                <div>
                  <p className="font-medium text-gray-900">{order.client.name}</p>
                  {order.client.whatsapp && (
                    <p className="text-sm text-gray-600 mt-2">📱 {order.client.whatsapp}</p>
                  )}
                  {order.client.phone && (
                    <p className="text-sm text-gray-600">📞 {order.client.phone}</p>
                  )}
                  {order.client.email && (
                    <p className="text-sm text-gray-600">✉️ {order.client.email}</p>
                  )}
                  <button
                    onClick={() => router.push(`/dashboard/clients/${order.client.id}`)}
                    className="mt-4 w-full bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition text-sm"
                  >
                    Ver Perfil do Cliente
                  </button>
                </div>
              ) : (
                <p className="text-sm text-gray-500">Cliente não encontrado</p>
              )}
            </div>

            {/* Technician Info */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-bold text-gray-900">Técnico</h2>
                <button
                  onClick={() => setShowAssignModal(true)}
                  className="text-blue-600 hover:text-blue-800 text-sm"
                >
                  {order.technician ? 'Alterar' : 'Atribuir'}
                </button>
              </div>
              {order.technician?.user ? (
                <div>
                  <p className="font-medium text-gray-900">{order.technician.user.name}</p>
                  <p className="text-sm text-gray-600">{order.technician.user.email}</p>
                  {order.technician.specialties && (
                    <div className="mt-2">
                      <span className="text-xs text-gray-500">Especialidades:</span>
                      <p className="text-sm text-gray-700">{order.technician.specialties}</p>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-sm text-gray-500">Nenhum técnico atribuído</p>
              )}
            </div>

            {/* Creation Info */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Informações</h2>
              <dl className="space-y-3">
                <div>
                  <dt className="text-sm font-medium text-gray-500">Criado em</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {new Date(order.created_at).toLocaleString('pt-BR')}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Última atualização</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {new Date(order.updated_at).toLocaleString('pt-BR')}
                  </dd>
                </div>
              </dl>
            </div>
          </div>
        </div>
      </div>

      {/* Status Update Modal */}
      {showStatusModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Atualizar Status</h2>
            <select
              value={newStatus}
              onChange={(e) => setNewStatus(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent mb-4"
            >
              <option value="">Selecione um status</option>
              <option value="open">Aberto</option>
              <option value="assigned">Atribuído</option>
              <option value="in_progress">Em Andamento</option>
              <option value="waiting_part">Aguardando Peça</option>
              <option value="completed">Concluído</option>
              <option value="cancelled">Cancelado</option>
            </select>
            <div className="flex gap-2">
              <button
                onClick={() => setShowStatusModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleStatusUpdate}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Atualizar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Assign Technician Modal */}
      {showAssignModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Atribuir Técnico</h2>
            <select
              value={selectedTechnicianId}
              onChange={(e) => setSelectedTechnicianId(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent mb-4"
            >
              <option value="">Selecione um técnico</option>
              {technicians.map((tech) => (
                <option key={tech.id} value={tech.id}>
                  {tech.user?.name || 'Sem nome'}
                </option>
              ))}
            </select>
            <div className="flex gap-2">
              <button
                onClick={() => setShowAssignModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleAssignTechnician}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Atribuir
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
