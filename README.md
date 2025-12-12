# Sistema de Gestão de Serviços - Refrigeração e Elétrica

Sistema web completo e responsivo (mobile-first PWA) para gerenciamento de ordens de serviço, clientes, orçamentos e comunicação via WhatsApp para empresas de refrigeração e elétrica.

## 🎯 Características Principais

- **100% Web e Mobile-First**: Design responsivo que funciona perfeitamente em desktop e mobile
- **PWA (Progressive Web App)**: Pode ser instalado como app no Android/iPhone
- **Offline-First**: Funciona offline e sincroniza quando conectado
- **Integração WhatsApp Gratuita**: Usando Baileys (API não-oficial, 100% gratuita)
- **Gestão Completa**: Clientes, OS, Orçamentos, Financeiro, Técnicos

## 📱 Funcionalidades

### Dashboard
- Visão geral de atendimentos do dia
- Serviços pendentes/concluídos
- Próximas visitas agendadas
- Alertas automáticos

### Gestão de Clientes
- Cadastro completo de clientes
- Histórico de serviços
- Múltiplos endereços
- Contatos (WhatsApp, telefone, email)

### Ordens de Serviço (OS)
- Criar OS com tipo (Refrigeração/Elétrica)
- Equipamento e problema reportado
- Upload de fotos/vídeos
- Localização via mapa
- Status: Aberto, Em atendimento, Aguardando peça, Concluído, Cancelado
- Envio automático via WhatsApp

### Integração WhatsApp
- Confirmação de agendamento
- Lembrete de visita
- Envio de orçamento
- OS finalizada
- Recebimento de mensagens

### Orçamentos
- Criação detalhada
- Envio via WhatsApp
- Aprovação online
- Conversão automática em OS

### Controle Financeiro
- Serviços concluídos
- Valores pagos/pendentes
- Relatórios mensais
- Gráficos e análises

### Gestão de Técnicos
- Cadastro de técnicos
- Agenda de trabalho
- OS atribuídas
- Registro de horários

## 🛠️ Stack Tecnológica

### Backend
- **Runtime**: Node.js 20+
- **Framework**: Express.js
- **ORM**: Sequelize
- **Banco de Dados**: PostgreSQL
- **WhatsApp**: Baileys (gratuito)
- **Autenticação**: JWT
- **Validação**: Joi

### Frontend
- **Framework**: Next.js 14+
- **UI Library**: React 18+
- **Estilização**: Tailwind CSS
- **Componentes**: Shadcn/ui
- **Estado**: Context API + Local Storage
- **PWA**: next-pwa
- **Mapas**: Leaflet (OpenStreetMap)
- **Upload**: React Dropzone

### DevOps
- **Containerização**: Docker + Docker Compose
- **Proxy Reverso**: Nginx
- **Process Manager**: PM2

## 📁 Estrutura do Projeto

```
solid-umbrella/
├── backend/                 # API Node.js + Express
│   ├── src/
│   │   ├── config/         # Configurações
│   │   ├── models/         # Models do Sequelize
│   │   ├── controllers/    # Lógica de negócio
│   │   ├── routes/         # Rotas da API
│   │   ├── middleware/     # Middlewares
│   │   ├── services/       # Serviços (WhatsApp, etc)
│   │   └── utils/          # Utilidades
│   ├── migrations/         # Migrations do banco
│   ├── seeders/            # Seeds de dados
│   └── package.json
├── frontend/               # Next.js + React
│   ├── src/
│   │   ├── app/           # Pages (App Router)
│   │   ├── components/    # Componentes React
│   │   ├── lib/           # Utilidades
│   │   ├── hooks/         # Custom hooks
│   │   └── styles/        # Estilos globais
│   ├── public/            # Arquivos estáticos
│   └── package.json
├── database/              # Scripts SQL
│   ├── schema.sql         # Schema completo
│   └── seed.sql           # Dados de exemplo
├── docs/                  # Documentação detalhada
│   ├── ARCHITECTURE.md    # Arquitetura do sistema
│   ├── DATABASE.md        # Modelo de dados
│   ├── API.md             # Documentação da API
│   ├── WIREFRAMES.md      # Wireframes e fluxos
│   └── WHATSAPP_INTEGRATION.md  # Integração WhatsApp
├── docker-compose.yml     # Orquestração dos serviços
└── README.md             # Este arquivo
```

## 🚀 Início Rápido

### Pré-requisitos
- Node.js 20+ e npm
- PostgreSQL 14+
- Docker e Docker Compose (opcional)

### Instalação com Docker (Recomendado)

```bash
# Clone o repositório
git clone https://github.com/sanpaa/solid-umbrella.git
cd solid-umbrella

# Inicie todos os serviços
docker-compose up -d

# Acesse:
# Frontend: http://localhost:3000
# Backend API: http://localhost:5000
# PostgreSQL: localhost:5432
```

### Instalação Manual

#### 1. Configurar Banco de Dados

```bash
# Criar banco de dados
psql -U postgres
CREATE DATABASE service_management;
\q

# Executar migrations
cd database
psql -U postgres -d service_management -f schema.sql
psql -U postgres -d service_management -f seed.sql
```

#### 2. Configurar Backend

```bash
cd backend

# Instalar dependências
npm install

# Configurar variáveis de ambiente
cp .env.example .env
# Edite .env com suas configurações

# Executar migrations
npm run migrate

# Iniciar servidor de desenvolvimento
npm run dev
# API rodando em http://localhost:5000
```

#### 3. Configurar Frontend

```bash
cd frontend

# Instalar dependências
npm install

# Configurar variáveis de ambiente
cp .env.example .env.local
# Edite .env.local com suas configurações

# Iniciar servidor de desenvolvimento
npm run dev
# Frontend rodando em http://localhost:3000
```

## 📱 WhatsApp Integration

O sistema usa **Baileys**, uma biblioteca 100% gratuita para integração com WhatsApp Web. 

### Configuração Rápida:

1. Na primeira execução, um QR Code será gerado no console do backend
2. Escaneie o QR Code com seu WhatsApp
3. A sessão será salva e persistida automaticamente
4. O sistema enviará mensagens automáticas conforme configurado

**Nota**: Esta é uma solução gratuita e não-oficial. Para uso comercial em larga escala, considere a API oficial do Meta (paga).

Veja mais detalhes em: [docs/WHATSAPP_INTEGRATION.md](docs/WHATSAPP_INTEGRATION.md)

## 📚 Documentação Completa

- **[🚀 Guia de Início Rápido](GETTING_STARTED.md)**: Colocar no ar em 10 minutos
- **[🐳 Docker Troubleshooting](DOCKER_TROUBLESHOOTING.md)**: Solução rápida para problemas comuns
- **[Arquitetura do Sistema](docs/ARCHITECTURE.md)**: Diagramas e explicações técnicas
- **[Modelo de Banco de Dados](docs/DATABASE.md)**: Schema completo e relacionamentos
- **[Documentação da API](docs/API.md)**: Todos os endpoints REST
- **[Wireframes e Fluxos](docs/WIREFRAMES.md)**: Telas e navegação
- **[Integração WhatsApp](docs/WHATSAPP_INTEGRATION.md)**: Guia completo de integração

## 🔐 Segurança

- Autenticação JWT com refresh tokens
- Senhas criptografadas com bcrypt
- Rate limiting nas APIs
- Validação de entrada em todas as rotas
- CORS configurado
- Helmet.js para headers de segurança

## 📊 Features Avançadas

- **Offline Mode**: Service Workers para cache e funcionamento offline
- **Push Notifications**: Notificações web para eventos importantes
- **Export/Import**: Exportar dados para Excel/PDF
- **Multi-tenant**: Suporte para múltiplas empresas (opcional)
- **Backup Automático**: Backup diário do banco de dados
- **Logs**: Sistema completo de auditoria

## 🤝 Contribuindo

Contribuições são bem-vindas! Por favor:

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo `LICENSE` para mais detalhes.

## 📞 Suporte

Para dúvidas e suporte:
- Abra uma [issue](https://github.com/sanpaa/solid-umbrella/issues)
- Consulte a [documentação completa](docs/)

## 🎨 Preview

O sistema possui uma interface moderna e intuitiva:

- Dashboard com gráficos e métricas em tempo real
- Listagens com filtros avançados
- Formulários intuitivos com validação
- Design responsivo que se adapta a qualquer tela
- Modo escuro/claro
- Ícones e feedback visual

---

**Desenvolvido com ❤️ para empresas de refrigeração e elétrica**