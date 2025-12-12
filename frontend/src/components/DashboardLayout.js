'use client';

import { useAuth, useLogout } from '@/lib/useAuth';
import Sidebar from './Sidebar';

export default function DashboardLayout({ children }) {
  const { user } = useAuth(true);
  const handleLogout = useLogout();

  return (
    <div className="min-h-screen bg-gray-100">
      <Sidebar />
      
      {/* Main Content Area */}
      <div className="lg:ml-64">
        {/* Header */}
        <header className="bg-white shadow-sm sticky top-0 z-20">
          <div className="px-4 py-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center">
              <div className="ml-12 lg:ml-0">
                <h1 className="text-2xl font-bold text-gray-900">
                  Sistema de Gestão
                </h1>
              </div>
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-600">
                  Bem-vindo, <strong>{user?.name}</strong>
                </span>
                <button
                  onClick={handleLogout}
                  className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition text-sm"
                >
                  Sair
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="px-4 py-8 sm:px-6 lg:px-8">
          {children}
        </main>
      </div>
    </div>
  );
}
