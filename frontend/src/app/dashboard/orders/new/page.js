'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/useAuth';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/DashboardLayout';
import { ordersApi, clientsApi } from '@/lib/api';

export default function NewOrderPage() {
  const { loading: authLoading, isAuth } = useAuth(true);
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [clients, setClients] = useState([]);
  const [formData, setFormData] = useState({
    client_id: '',
    service_type: 'refrigeration',
    equipment: '',
    problem: '',
    priority: 'normal',
    scheduled_date: '',
    estimated_cost: '',
    notes: '',
  });

  useEffect(() => {
    if (isAuth) {
      fetchClients();
    }
  }, [isAuth]);

  const fetchClients = async () => {
    try {
      const response = await clientsApi.list({ limit: 100 });
      setClients(response.data.data.clients);
    } catch (err) {
      console.error('Error fetching clients:', err);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.client_id || !formData.problem) {
      setError('Cliente e descrição do problema são obrigatórios');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      await ordersApi.create(formData);
      router.push('/dashboard/orders');
    } catch (err) {
      console.error('Error creating order:', err);
      setError(err.response?.data?.message || 'Erro ao criar ordem de serviço');
    } finally {
      setLoading(false);
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
      <div className="max-w-3xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Nova Ordem de Serviço</h1>
          <p className="text-gray-600 mt-2">Crie uma nova OS para um cliente</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6 space-y-6">
          <div>
            <label htmlFor="client_id" className="block text-sm font-medium text-gray-700 mb-2">
              Cliente *
            </label>
            <select
              id="client_id"
              name="client_id"
              value={formData.client_id}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
            >
              <option value="">Selecione um cliente</option>
              {clients.map((client) => (
                <option key={client.id} value={client.id}>
                  {client.name}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="service_type" className="block text-sm font-medium text-gray-700 mb-2">
                Tipo de Serviço *
              </label>
              <select
                id="service_type"
                name="service_type"
                value={formData.service_type}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
              >
                <option value="refrigeration">❄️ Refrigeração</option>
                <option value="electrical">⚡ Elétrica</option>
              </select>
            </div>

            <div>
              <label htmlFor="priority" className="block text-sm font-medium text-gray-700 mb-2">
                Prioridade
              </label>
              <select
                id="priority"
                name="priority"
                value={formData.priority}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
              >
                <option value="low">Baixa</option>
                <option value="normal">Normal</option>
                <option value="high">Alta</option>
                <option value="urgent">Urgente</option>
              </select>
            </div>
          </div>

          <div>
            <label htmlFor="equipment" className="block text-sm font-medium text-gray-700 mb-2">
              Equipamento
            </label>
            <input
              type="text"
              id="equipment"
              name="equipment"
              value={formData.equipment}
              onChange={handleChange}
              placeholder="Ex: Ar Condicionado Split 12000 BTUs"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
            />
          </div>

          <div>
            <label htmlFor="problem" className="block text-sm font-medium text-gray-700 mb-2">
              Problema Relatado *
            </label>
            <textarea
              id="problem"
              name="problem"
              value={formData.problem}
              onChange={handleChange}
              required
              rows={4}
              placeholder="Descreva o problema relatado pelo cliente..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="scheduled_date" className="block text-sm font-medium text-gray-700 mb-2">
                Data Agendada
              </label>
              <input
                type="datetime-local"
                id="scheduled_date"
                name="scheduled_date"
                value={formData.scheduled_date}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
              />
            </div>

            <div>
              <label htmlFor="estimated_cost" className="block text-sm font-medium text-gray-700 mb-2">
                Custo Estimado (R$)
              </label>
              <input
                type="number"
                id="estimated_cost"
                name="estimated_cost"
                value={formData.estimated_cost}
                onChange={handleChange}
                step="0.01"
                placeholder="0.00"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
              />
            </div>
          </div>

          <div>
            <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-2">
              Observações
            </label>
            <textarea
              id="notes"
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
            />
          </div>

          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={() => router.push('/dashboard/orders')}
              className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
            >
              {loading ? 'Criando...' : 'Criar OS'}
            </button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
}
