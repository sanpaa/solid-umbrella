# Frontend - Sistema de Gestão de Serviços

Interface web responsiva desenvolvida com Next.js e React para o sistema de gestão de serviços.

## 🚀 Início Rápido

### Pré-requisitos

- Node.js 20+ e npm
- Backend rodando em `http://localhost:5000`

### Instalação

```bash
# Instalar dependências
npm install

# Configurar variáveis de ambiente
cp .env.example .env.local
# Edite .env.local conforme necessário

# Iniciar servidor de desenvolvimento
npm run dev
```

Acesse: http://localhost:3000

## 📁 Estrutura de Diretórios

```
frontend/
├── src/
│   ├── app/              # App Router do Next.js
│   │   ├── page.js       # Página inicial
│   │   ├── login/        # Página de login
│   │   ├── dashboard/    # Dashboard
│   │   └── layout.js     # Layout raiz
│   ├── components/       # Componentes reutilizáveis
│   ├── lib/              # Utilidades e helpers
│   ├── hooks/            # Custom React Hooks
│   └── styles/           # Estilos globais
├── public/               # Arquivos estáticos
│   ├── manifest.json     # PWA manifest
│   └── favicon.ico       # Favicon
├── package.json
├── next.config.js
├── tailwind.config.js
└── Dockerfile
```

## 🎨 Telas Implementadas

### ✅ Página Inicial (`/`)
- Overview do sistema
- Features principais
- Credenciais de teste

### ✅ Login (`/login`)
- Autenticação JWT
- Credenciais pré-preenchidas para teste
- Validação de formulário
- Tratamento de erros

### ✅ Dashboard (`/dashboard`)
- Cartões de estatísticas
- Próximas visitas
- Ações rápidas
- Logout

### 🚧 A Implementar
- `/clients` - Gestão de clientes
- `/orders` - Ordens de serviço
- `/quotes` - Orçamentos
- `/financial` - Financeiro
- `/technicians` - Técnicos
- `/whatsapp` - WhatsApp

## 🔐 Autenticação

O sistema usa JWT armazenado no `localStorage`:

```javascript
// Login
const response = await fetch(`${API_URL}/auth/login`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email, password }),
});

// Requisições autenticadas
const token = localStorage.getItem('token');
fetch(url, {
  headers: { 'Authorization': `Bearer ${token}` },
});
```

## 🎨 Estilização

### Tailwind CSS

O projeto usa Tailwind CSS para estilização:

```jsx
<button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
  Botão
</button>
```

### Cores do Tema

Definidas em `tailwind.config.js`:

- **Primary**: Azul (#2563eb)
- **Secondary**: Verde (#10b981)
- **Danger**: Vermelho (#ef4444)
- **Warning**: Amarelo (#f59e0b)

## 📱 PWA (Progressive Web App)

Para habilitar PWA:

```bash
npm install next-pwa
```

Configure em `next.config.js`:

```javascript
const withPWA = require('next-pwa')({
  dest: 'public',
  disable: process.env.NODE_ENV === 'development',
});

module.exports = withPWA({
  // ... next config
});
```

Crie `public/manifest.json`:

```json
{
  "name": "Sistema de Gestão de Serviços",
  "short_name": "Gestão",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#2563eb",
  "icons": [
    {
      "src": "/icon-192x192.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "/icon-512x512.png",
      "sizes": "512x512",
      "type": "image/png"
    }
  ]
}
```

## 🧩 Componentes

### Criar novo componente:

```jsx
// src/components/Button.js
export default function Button({ children, onClick, variant = 'primary' }) {
  const variants = {
    primary: 'bg-blue-600 hover:bg-blue-700',
    secondary: 'bg-gray-200 hover:bg-gray-300',
  };

  return (
    <button
      onClick={onClick}
      className={`${variants[variant]} px-4 py-2 rounded-lg transition`}
    >
      {children}
    </button>
  );
}
```

## 🪝 Hooks

### useAuth Hook (exemplo):

```javascript
// src/hooks/useAuth.js
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export function useAuth() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }

    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }

    setLoading(false);
  }, [router]);

  const logout = () => {
    localStorage.clear();
    router.push('/login');
  };

  return { user, loading, logout };
}
```

## 📊 Dados e State

### TanStack Query (React Query):

```bash
npm install @tanstack/react-query
```

```jsx
// src/app/layout.js
'use client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient();

export default function RootLayout({ children }) {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}
```

```jsx
// Usando em um componente
import { useQuery } from '@tanstack/react-query';

function ClientsList() {
  const { data, isLoading } = useQuery({
    queryKey: ['clients'],
    queryFn: async () => {
      const res = await fetch(`${API_URL}/clients`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return res.json();
    },
  });

  if (isLoading) return <div>Carregando...</div>;

  return <div>{/* Renderizar clientes */}</div>;
}
```

## 🚢 Build e Deploy

### Build para Produção:

```bash
npm run build
npm start
```

### Docker:

```bash
# Na raiz do projeto
docker-compose up -d frontend
```

### Vercel (recomendado para Next.js):

```bash
npm install -g vercel
vercel
```

## 📱 Responsividade

O design é mobile-first com breakpoints Tailwind:

- `sm:` 640px+
- `md:` 768px+
- `lg:` 1024px+
- `xl:` 1280px+

```jsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
  {/* Responsivo: 1 coluna mobile, 2 tablet, 4 desktop */}
</div>
```

## 🔍 SEO

Next.js App Router facilita SEO:

```jsx
// src/app/page.js
export const metadata = {
  title: 'Dashboard - Gestão de Serviços',
  description: 'Sistema completo para gestão de serviços',
};
```

## 🧪 Testes

```bash
# Instalar Jest e Testing Library
npm install --save-dev jest @testing-library/react @testing-library/jest-dom

# Executar testes
npm test
```

## 🎨 Ícones

Use Lucide React para ícones:

```bash
npm install lucide-react
```

```jsx
import { Home, User, Settings } from 'lucide-react';

<Home className="w-6 h-6" />
```

## 📖 Documentação Adicional

- [Next.js Docs](https://nextjs.org/docs)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)
- [React Hook Form](https://react-hook-form.com/)
- [TanStack Query](https://tanstack.com/query/latest)

## 🤝 Contribuindo

1. Crie componentes reutilizáveis em `src/components/`
2. Siga a estrutura de App Router do Next.js
3. Use TypeScript quando possível
4. Mantenha código limpo e documentado

## 📄 Licença

MIT - Veja LICENSE para mais detalhes
