# Arquitetura do Sistema

## 📐 Visão Geral

O sistema é construído em uma arquitetura de três camadas (3-tier architecture) com separação clara entre apresentação, lógica de negócio e dados.

```
┌─────────────────────────────────────────────────────────┐
│                     CAMADA DE APRESENTAÇÃO               │
│                                                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐ │
│  │   Desktop    │  │    Tablet    │  │    Mobile    │ │
│  │   Browser    │  │    Browser   │  │    Browser   │ │
│  └──────────────┘  └──────────────┘  └──────────────┘ │
│                                                          │
│         Next.js + React (PWA com Service Worker)        │
└─────────────────────────────────────────────────────────┘
                            ↕ HTTPS/REST API
┌─────────────────────────────────────────────────────────┐
│                   CAMADA DE APLICAÇÃO                    │
│                                                          │
│  ┌────────────┐  ┌──────────────┐  ┌────────────────┐ │
│  │   REST     │  │  WhatsApp    │  │  Autenticação  │ │
│  │    API     │  │   Service    │  │      JWT       │ │
│  └────────────┘  └──────────────┘  └────────────────┘ │
│                                                          │
│              Node.js + Express + Baileys                │
└─────────────────────────────────────────────────────────┘
                            ↕ SQL/ORM
┌─────────────────────────────────────────────────────────┐
│                      CAMADA DE DADOS                     │
│                                                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐ │
│  │  PostgreSQL  │  │ File Storage │  │    Cache     │ │
│  │   Database   │  │  (uploads)   │  │   (Redis*)   │ │
│  └──────────────┘  └──────────────┘  └──────────────┘ │
└─────────────────────────────────────────────────────────┘
```

*Redis é opcional para cache e melhor performance

## 🏗️ Componentes Principais

### 1. Frontend (Next.js + React)

#### Estrutura de Diretórios
```
frontend/src/
├── app/                    # App Router do Next.js
│   ├── (auth)/            # Grupo de rotas autenticadas
│   │   ├── dashboard/     # Página do dashboard
│   │   ├── clients/       # Gestão de clientes
│   │   ├── orders/        # Ordens de serviço
│   │   ├── quotes/        # Orçamentos
│   │   ├── financial/     # Financeiro
│   │   └── technicians/   # Técnicos
│   ├── login/             # Página de login
│   ├── layout.tsx         # Layout raiz
│   └── page.tsx           # Página inicial
├── components/            # Componentes reutilizáveis
│   ├── ui/               # Componentes base (botões, inputs)
│   ├── forms/            # Formulários específicos
│   ├── layouts/          # Layouts (Sidebar, Header)
│   └── charts/           # Gráficos
├── lib/                  # Utilitários
│   ├── api.ts           # Cliente API
│   ├── auth.ts          # Helpers de autenticação
│   └── db.ts            # IndexedDB (offline storage)
├── hooks/                # Custom React Hooks
│   ├── useAuth.ts
│   ├── useOffline.ts
│   └── useNotifications.ts
└── styles/               # Estilos globais
```

#### PWA Features
- **Service Worker**: Cache de assets e API responses
- **Manifest**: Permite instalação como app nativo
- **Offline Mode**: Sincronização automática quando conectado
- **Push Notifications**: Alertas importantes

#### Tecnologias Chave
- **Next.js 14**: Framework React com App Router
- **Tailwind CSS**: Estilização utility-first
- **Shadcn/ui**: Componentes acessíveis
- **React Hook Form**: Gerenciamento de formulários
- **TanStack Query**: Cache e sincronização de dados
- **Leaflet**: Mapas interativos
- **Chart.js**: Gráficos e visualizações

### 2. Backend (Node.js + Express)

#### Estrutura de Diretórios
```
backend/src/
├── config/
│   ├── database.js        # Configuração do Sequelize
│   ├── whatsapp.js        # Configuração do Baileys
│   └── auth.js            # Configuração JWT
├── models/                # Models do Sequelize
│   ├── User.js
│   ├── Client.js
│   ├── ServiceOrder.js
│   ├── Quote.js
│   ├── Payment.js
│   ├── Technician.js
│   ├── Photo.js
│   └── WhatsAppLog.js
├── controllers/           # Lógica de negócio
│   ├── authController.js
│   ├── clientController.js
│   ├── orderController.js
│   ├── quoteController.js
│   ├── financialController.js
│   └── technicianController.js
├── routes/               # Definição de rotas
│   ├── auth.routes.js
│   ├── client.routes.js
│   ├── order.routes.js
│   ├── quote.routes.js
│   ├── financial.routes.js
│   └── technician.routes.js
├── middleware/           # Middlewares
│   ├── auth.middleware.js      # Verificação JWT
│   ├── validation.middleware.js # Validação de dados
│   ├── upload.middleware.js    # Upload de arquivos
│   └── errorHandler.middleware.js
├── services/            # Serviços externos
│   ├── whatsappService.js  # Integração WhatsApp
│   ├── emailService.js     # Envio de emails
│   └── notificationService.js
├── utils/               # Utilitários
│   ├── logger.js
│   ├── validators.js
│   └── helpers.js
└── app.js              # Configuração do Express
```

#### API REST

**Padrão de URLs**:
```
/api/v1/auth/*           # Autenticação
/api/v1/clients/*        # Clientes
/api/v1/orders/*         # Ordens de serviço
/api/v1/quotes/*         # Orçamentos
/api/v1/financial/*      # Financeiro
/api/v1/technicians/*    # Técnicos
/api/v1/dashboard/*      # Dashboard
```

**Padrão de Resposta**:
```json
{
  "success": true,
  "data": { ... },
  "message": "Operação realizada com sucesso",
  "timestamp": "2024-12-12T00:00:00Z"
}
```

**Padrão de Erro**:
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Dados inválidos",
    "details": [...]
  },
  "timestamp": "2024-12-12T00:00:00Z"
}
```

#### Autenticação e Autorização

**Fluxo de Autenticação**:
1. Cliente envia credenciais para `/api/v1/auth/login`
2. Servidor valida credenciais e gera JWT
3. JWT é retornado com refresh token
4. Cliente armazena JWT e envia em todas as requisições
5. Middleware verifica JWT antes de processar requisições

**JWT Payload**:
```json
{
  "userId": 123,
  "email": "user@example.com",
  "role": "admin|technician|user",
  "iat": 1234567890,
  "exp": 1234571490
}
```

**Roles e Permissões**:
- **Admin**: Acesso total ao sistema
- **Manager**: Gerenciar OS, clientes, orçamentos
- **Technician**: Ver e atualizar suas OS
- **Client**: Ver apenas seus dados (portal do cliente)

### 3. WhatsApp Integration (Baileys)

#### Como Funciona

Baileys conecta-se ao WhatsApp Web usando WebSocket, simulando um navegador. É 100% gratuito e não requer API oficial.

**Fluxo de Conexão**:
```
1. Backend inicia → Baileys tenta conectar
2. Se não autenticado → Gera QR Code
3. Usuário escaneia QR Code
4. Sessão salva em arquivo/banco
5. Reconecta automaticamente
```

**Envio de Mensagens**:
```javascript
// Pseudo-código
whatsappService.sendMessage(phoneNumber, message)
  → Valida número
  → Formata mensagem
  → Envia via Baileys
  → Registra em WhatsAppLog
  → Retorna status
```

**Tipos de Mensagens Suportadas**:
- Texto simples
- Imagens (logo da empresa, fotos da OS)
- Documentos PDF (orçamentos, OS)
- Mensagens interativas com botões
- Links clicáveis

**Eventos Recebidos**:
- Mensagens recebidas do cliente
- Status de entrega (enviado, entregue, lido)
- Respostas a orçamentos

### 4. Banco de Dados (PostgreSQL)

#### Características
- **Relacional**: Integridade referencial garantida
- **ACID**: Transações confiáveis
- **Índices**: Performance otimizada
- **Full-Text Search**: Busca avançada
- **JSON Support**: Armazenar dados semi-estruturados

#### Estratégia de Backup
```bash
# Backup diário automático (cron)
0 2 * * * pg_dump -U postgres service_management > backup_$(date +\%Y\%m\%d).sql

# Retenção: 30 dias
# Backup semanal mantido por 3 meses
# Backup mensal mantido por 1 ano
```

## 🔄 Fluxos Principais

### Fluxo 1: Criar Ordem de Serviço

```
[Frontend]
  ↓ Cliente preenche formulário de OS
  ↓ Upload de fotos (se houver)
  ↓ Seleciona localização no mapa
  ↓ POST /api/v1/orders
[Backend]
  ↓ Valida dados (middleware)
  ↓ Verifica autenticação (middleware)
  ↓ Salva OS no banco
  ↓ Upload de fotos para storage
  ↓ Cria log de criação
  ↓ Trigger: Enviar WhatsApp
[WhatsApp Service]
  ↓ Formata mensagem de confirmação
  ↓ Envia para cliente via Baileys
  ↓ Registra em WhatsAppLog
[Response]
  ↓ Retorna OS criada + confirmação envio
[Frontend]
  ↓ Atualiza lista
  ↓ Mostra notificação de sucesso
  ↓ Salva em IndexedDB (offline)
```

### Fluxo 2: Aprovar Orçamento via WhatsApp

```
[WhatsApp]
  ↓ Cliente recebe orçamento com link
  ↓ Clica no link de aprovação
[Frontend - Landing Page]
  ↓ Página de aprovação (/approve/:token)
  ↓ Mostra detalhes do orçamento
  ↓ Botões: Aprovar / Rejeitar / Negociar
  ↓ Cliente clica "Aprovar"
  ↓ POST /api/v1/quotes/:id/approve
[Backend]
  ↓ Valida token
  ↓ Verifica se orçamento existe e está pendente
  ↓ Atualiza status para "Aprovado"
  ↓ Cria OS automaticamente
  ↓ Envia confirmação via WhatsApp
[Response]
  ↓ Redireciona para página de sucesso
  ↓ Técnico recebe notificação de nova OS
```

### Fluxo 3: Sincronização Offline

```
[Frontend - Offline]
  ↓ Detecta que está offline
  ↓ Mostra banner de modo offline
  ↓ Usuário cria/edita OS
  ↓ Salva em IndexedDB
  ↓ Marca como "pendente sincronização"
[Frontend - Online Novamente]
  ↓ Detecta conexão restaurada
  ↓ Service Worker verifica pendências
  ↓ Para cada item pendente:
  ↓   → Envia para backend
  ↓   → Aguarda confirmação
  ↓   → Remove de IndexedDB
  ↓   → Atualiza UI
  ↓ Mostra notificação: "X itens sincronizados"
```

## 🔒 Segurança

### Medidas Implementadas

1. **Autenticação**
   - JWT com expiração de 1 hora
   - Refresh tokens com expiração de 7 dias
   - Logout invalida tokens

2. **Autorização**
   - Verificação de role em cada endpoint
   - Usuários só acessam seus próprios dados
   - Técnicos só veem suas OS

3. **Validação de Entrada**
   - Joi para validação de schemas
   - Sanitização de HTML
   - Validação de tipos de arquivo

4. **Proteção de API**
   - Rate limiting (100 req/min por IP)
   - CORS restrito a domínios permitidos
   - Helmet.js para headers de segurança

5. **Banco de Dados**
   - Prepared statements (proteção contra SQL injection)
   - Senhas com bcrypt (salt rounds: 10)
   - Dados sensíveis criptografados

6. **Upload de Arquivos**
   - Limite de tamanho: 10MB por arquivo
   - Tipos permitidos: jpg, png, pdf
   - Scan de vírus (opcional: ClamAV)

## 📊 Performance e Escalabilidade

### Otimizações

1. **Frontend**
   - Code splitting por rota
   - Lazy loading de componentes
   - Image optimization (Next.js)
   - Service Worker cache

2. **Backend**
   - Connection pooling no banco
   - Cache de queries frequentes (Redis)
   - Compressão de responses (gzip)
   - CDN para assets estáticos

3. **Banco de Dados**
   - Índices em colunas frequentemente buscadas
   - Paginação em todas as listagens
   - Queries otimizadas (Explain Analyze)

### Capacidade

**Configuração Mínima** (pequena empresa):
- 1 vCPU, 2GB RAM
- ~100 usuários simultâneos
- ~1000 OS/mês

**Configuração Recomendada** (média empresa):
- 2 vCPU, 4GB RAM
- ~500 usuários simultâneos
- ~5000 OS/mês

**Escalabilidade Horizontal**:
- Load balancer (Nginx)
- Múltiplas instâncias do backend
- Banco de dados com read replicas
- Redis cluster para cache distribuído

## 🚀 Deployment

### Opções de Deploy

#### 1. Docker Compose (Simples)
```bash
docker-compose up -d
```
Ideal para: Testes, desenvolvimento, pequenas empresas

#### 2. Cloud VPS (Digital Ocean, Linode, AWS EC2)
```bash
# Backend com PM2
pm2 start npm --name "api" -- start

# Frontend com PM2
pm2 start npm --name "web" -- start

# Nginx como proxy reverso
```

#### 3. Plataformas PaaS (Heroku, Railway, Render)
- Deploy automático via Git
- SSL gratuito
- Escalabilidade automática

#### 4. Kubernetes (Empresarial)
- Alta disponibilidade
- Auto-scaling
- Rolling updates sem downtime

### Monitoramento

**Logs**:
- Winston para logs estruturados
- Rotação diária de arquivos
- Níveis: error, warn, info, debug

**Métricas**:
- Tempo de resposta das APIs
- Taxa de erro
- Uso de CPU/RAM
- Queries lentas no banco

**Alertas**:
- Email quando erro crítico
- Slack/Discord integração
- Dashboard de status

## 🧪 Testes

### Estratégia de Testes

1. **Unitários**: Jest para funções isoladas
2. **Integração**: Supertest para APIs
3. **E2E**: Playwright para fluxos completos
4. **Performance**: k6 para load testing

### Cobertura Mínima

- Controllers: 80%
- Services: 90%
- Utilitários: 95%
- Frontend: 60%

## 📱 Progressive Web App (PWA)

### Features PWA

1. **Instalável**
   - Botão "Adicionar à tela inicial"
   - Ícones para todas as resoluções
   - Splash screen personalizada

2. **Offline-First**
   - Cache de assets essenciais
   - IndexedDB para dados
   - Sincronização em background

3. **Push Notifications**
   - Nova OS atribuída
   - Atualização de status
   - Lembrete de visita

4. **Responsivo**
   - Mobile: 320px+
   - Tablet: 768px+
   - Desktop: 1024px+

## 🔄 Versionamento

### Semantic Versioning

- **Major (1.x.x)**: Breaking changes
- **Minor (x.1.x)**: Novos recursos
- **Patch (x.x.1)**: Bug fixes

### Changelog

Manter CHANGELOG.md atualizado com todas as mudanças.

---

## 📚 Próximos Passos

Para implementar:
1. Veja DATABASE.md para estrutura do banco
2. Veja API.md para endpoints detalhados
3. Veja WIREFRAMES.md para design das telas
4. Veja WHATSAPP_INTEGRATION.md para integração
