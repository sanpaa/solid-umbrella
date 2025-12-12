# Backend - Sistema de Gestão de Serviços

API REST desenvolvida com Node.js e Express para o sistema de gestão de serviços.

## 🚀 Início Rápido

### Pré-requisitos

- **Node.js 20+** (OBRIGATÓRIO - Node 18 não é suportado)
- npm 9+
- PostgreSQL 14+
- (Opcional) Redis para cache

**⚠️ IMPORTANTE**: Este projeto requer Node.js 20 ou superior. Para verificar sua versão:
```bash
node --version  # Deve mostrar v20.x.x ou superior
```

### Instalação

```bash
# Instalar dependências
npm install

# Configurar variáveis de ambiente
cp .env.example .env
# Edite .env com suas configurações

# Criar banco de dados
psql -U postgres -c "CREATE DATABASE service_management;"

# Executar migrations
cd ../database
psql -U postgres -d service_management -f schema.sql
psql -U postgres -d service_management -f seed.sql

# Voltar ao backend
cd ../backend

# Iniciar servidor de desenvolvimento
npm run dev
```

## 📁 Estrutura de Diretórios

```
backend/
├── src/
│   ├── config/           # Configurações (database, etc)
│   ├── models/           # Models do Sequelize
│   ├── controllers/      # Controllers (lógica de negócio)
│   ├── routes/           # Rotas da API
│   ├── middleware/       # Middlewares (auth, validation, etc)
│   ├── services/         # Serviços externos (WhatsApp, email)
│   ├── utils/            # Utilitários (logger, helpers)
│   ├── app.js            # Configuração do Express
│   └── server.js         # Entrada principal
├── uploads/              # Arquivos enviados (fotos, PDFs)
├── auth_info/            # Sessão do WhatsApp
├── logs/                 # Logs da aplicação
├── package.json
├── .env.example
└── Dockerfile
```

## 🔌 API Endpoints

Veja documentação completa em [/docs/API.md](../docs/API.md)

### Principais endpoints:

- `POST /api/v1/auth/login` - Login
- `GET /api/v1/clients` - Listar clientes
- `POST /api/v1/orders` - Criar ordem de serviço
- `GET /api/v1/dashboard/overview` - Dashboard
- `POST /api/v1/whatsapp/send` - Enviar WhatsApp

## 🔐 Autenticação

A API usa JWT (JSON Web Tokens) para autenticação.

```bash
# Login
curl -X POST http://localhost:5000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@empresa.com", "password": "senha123"}'

# Usar token nas requisições
curl -X GET http://localhost:5000/api/v1/clients \
  -H "Authorization: Bearer SEU_TOKEN_AQUI"
```

## 📱 WhatsApp Integration

O sistema usa **Baileys** para integração gratuita com WhatsApp.

### Primeira configuração:

1. Inicie o servidor: `npm run dev`
2. Um QR Code será exibido no console
3. Escaneie com seu WhatsApp
4. Pronto! A sessão será salva em `auth_info/`

Veja mais detalhes em [/docs/WHATSAPP_INTEGRATION.md](../docs/WHATSAPP_INTEGRATION.md)

## 🧪 Scripts Disponíveis

```bash
npm start      # Iniciar em produção
npm run dev    # Iniciar em desenvolvimento (nodemon)
npm run test   # Executar testes
npm run lint   # Verificar código
```

## 🛠️ Desenvolvimento

### Adicionar novo endpoint:

1. Criar route em `src/routes/`
2. Criar controller em `src/controllers/`
3. Criar model se necessário em `src/models/`
4. Registrar route em `src/app.js`

### Adicionar middleware:

1. Criar em `src/middleware/`
2. Aplicar em route ou globalmente em `app.js`

## 📊 Banco de Dados

### Modelos principais:

- Users
- Clients
- ServiceOrders
- Quotes
- Payments
- Technicians
- WhatsAppLogs

Veja schema completo em [/docs/DATABASE.md](../docs/DATABASE.md)

## 🚢 Deploy

### Docker (recomendado):

```bash
# Na raiz do projeto
docker-compose up -d
```

**⚠️ Se o container ficar reiniciando com erro de versão do Node.js**:

```bash
# Isso acontece quando você tem uma imagem antiga com Node 18
# Solução: Reconstruir a imagem do zero

docker-compose down
docker rmi solid-umbrella-backend:latest
docker-compose build --no-cache backend
docker-compose up -d

# Verificar que está usando Node 20+
docker-compose exec backend node --version
```

### Manual (PM2):

```bash
npm install -g pm2

# Produção
NODE_ENV=production pm2 start src/server.js --name api

# Ver logs
pm2 logs api

# Restart
pm2 restart api
```

## 🔒 Segurança

- ✅ Helmet para headers de segurança
- ✅ CORS configurado
- ✅ Rate limiting
- ✅ JWT com expiração
- ✅ Senhas com bcrypt
- ✅ Validação de entrada com Joi
- ✅ SQL injection protection (Sequelize)

## 📝 Logs

Logs são salvos em `logs/`:
- `error.log` - Apenas erros
- `combined.log` - Todos os logs

## 🤝 Contribuindo

1. Fork o projeto
2. Crie uma branch (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 Licença

MIT - Veja LICENSE para mais detalhes
