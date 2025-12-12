'use client';

export default function Error({ error, reset }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-red-100">
      <div className="max-w-md mx-auto px-4 py-16 text-center">
        <div className="text-6xl mb-6">⚠️</div>
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Algo deu errado
        </h1>
        <p className="text-gray-700 mb-6">
          {error?.message || 'Ocorreu um erro inesperado. Por favor, tente novamente.'}
        </p>
        <button
          onClick={() => reset()}
          className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
        >
          Tentar novamente
        </button>
      </div>
    </div>
  );
}
