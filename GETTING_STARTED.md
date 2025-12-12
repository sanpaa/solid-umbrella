# 🚀 Guia de Início Rápido

Bem-vindo ao **Sistema de Gestão de Serviços** para empresas de refrigeração e elétrica!

Este guia vai te ajudar a colocar o sistema no ar em **menos de 10 minutos**.

## 📋 O que você vai ter

✅ Sistema completo de gestão de serviços  
✅ Dashboard com métricas em tempo real  
✅ Gestão de clientes e ordens de serviço  
✅ Orçamentos com aprovação online  
✅ Integração WhatsApp **100% GRATUITA**  
✅ Controle financeiro completo  
✅ App web responsivo (funciona no celular)  

## ⚡ Início Rápido (Docker)

### Passo 1: Pré-requisitos

Você precisa ter instalado:
- [Docker](https://docs.docker.com/get-docker/) (versão 20+)
- [Docker Compose](https://docs.docker.com/compose/install/) (versão 2+)
- [Git](https://git-scm.com/downloads)

### Passo 2: Clonar e Configurar

```bash
# Clone o repositório
git clone https://github.com/sanpaa/solid-umbrella.git
cd solid-umbrella

# Configure as variáveis de ambiente
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env.local
```

**IMPORTANTE**: Edite os arquivos `.env` com suas configurações:

```bash
# backend/.env
JWT_SECRET=COLOQUE_UM_SECRET_FORTE_AQUI_USE_64_CARACTERES_ALEATORIOS
JWT_REFRESH_SECRET=COLOQUE_OUTRO_SECRET_FORTE_AQUI_DIFERENTE_DO_ANTERIOR
```

Para gerar secrets seguros, use:
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

### Passo 3: Iniciar o Sistema

```bash
# Inicie todos os serviços (PostgreSQL + Backend + Frontend)
docker-compose up -d

# Acompanhe os logs (Ctrl+C para sair)
docker-compose logs -f
```

### Passo 4: Acessar o Sistema

Aguarde cerca de 30 segundos para tudo iniciar, então acesse:

🌐 **Frontend**: http://localhost:3000  
🔌 **Backend API**: http://localhost:5000  
📊 **PostgreSQL**: localhost:5432  

### Passo 5: Fazer Login

Na tela inicial, clique em **"Fazer Login"** e use as credenciais de teste:

**Administrador:**
- Email: `admin@empresa.com`
- Senha: `senha123`

**Gerente:**
- Email: `gerente@empresa.com`
- Senha: `senha123`

**Técnico:**
- Email: `joao.tecnico@empresa.com`
- Senha: `senha123`

## 📱 Configurar WhatsApp (Opcional)

O sistema já está configurado para usar WhatsApp gratuitamente com **Baileys**.

### Como conectar:

1. Acesse os logs do backend:
   ```bash
   docker-compose logs -f backend
   ```

2. Um **QR Code** aparecerá no terminal

3. Abra o WhatsApp no seu celular

4. Vá em **Configurações → Aparelhos conectados → Conectar um aparelho**

5. Escaneie o QR Code

6. Pronto! O sistema agora pode enviar mensagens automáticas

**Nota**: A sessão fica salva, você só precisa fazer isso uma vez.

## 🎯 Próximos Passos

Agora que o sistema está rodando, você pode:

### 1. Explorar o Dashboard
- Veja estatísticas do dia
- Próximas visitas agendadas
- Ações rápidas

### 2. Cadastrar Clientes
- Acesse "Clientes" no menu
- Adicione informações completas
- Salve múltiplos endereços

### 3. Criar Ordens de Serviço
- Clique em "Nova OS"
- Preencha os dados
- Sistema envia confirmação automática via WhatsApp

### 4. Enviar Orçamentos
- Crie orçamento detalhado
- Envie para cliente via WhatsApp
- Cliente aprova com um clique

## 📚 Documentação Completa

Para entender o sistema em profundidade, consulte:

- **[README.md](README.md)** - Visão geral do projeto
- **[ARCHITECTURE.md](docs/ARCHITECTURE.md)** - Arquitetura técnica detalhada
- **[DATABASE.md](docs/DATABASE.md)** - Modelo de banco de dados
- **[API.md](docs/API.md)** - Documentação de todos os endpoints
- **[WIREFRAMES.md](docs/WIREFRAMES.md)** - Wireframes e fluxos de tela
- **[WHATSAPP_INTEGRATION.md](docs/WHATSAPP_INTEGRATION.md)** - Integração WhatsApp
- **[DEPLOYMENT.md](docs/DEPLOYMENT.md)** - Guias de deployment

## 🛠️ Comandos Úteis

### Gerenciar Containers Docker

```bash
# Ver status dos containers
docker-compose ps

# Parar todos os serviços
docker-compose down

# Reiniciar um serviço específico
docker-compose restart backend

# Ver logs de um serviço
docker-compose logs -f backend

# Entrar no container
docker-compose exec backend sh

# Reconstruir após mudanças
docker-compose build
docker-compose up -d
```

### Acessar o Banco de Dados

```bash
# Via Docker
docker-compose exec postgres psql -U postgres -d service_management

# Queries úteis
SELECT * FROM users;
SELECT * FROM clients;
SELECT * FROM service_orders ORDER BY created_at DESC LIMIT 10;
```

### Backend (Desenvolvimento Local)

```bash
cd backend

# Instalar dependências
npm install

# Iniciar em modo desenvolvimento
npm run dev

# Ver logs
tail -f logs/combined.log
```

### Frontend (Desenvolvimento Local)

```bash
cd frontend

# Instalar dependências
npm install

# Iniciar em modo desenvolvimento
npm run dev

# Build para produção
npm run build
npm start
```

## 🐛 Solução de Problemas

### Porta já está em uso

Se alguma porta já estiver em uso (3000, 5000, 5432), edite `docker-compose.yml`:

```yaml
# Exemplo: mudar frontend de 3000 para 3001
frontend:
  ports:
    - "3001:3000"  # host:container
```

### Banco de dados não inicia

```bash
# Remover volumes e recriar
docker-compose down -v
docker-compose up -d
```

### Frontend não conecta ao backend

Verifique `frontend/.env.local`:
```
NEXT_PUBLIC_API_URL=http://localhost:5000/api/v1
```

### WhatsApp não conecta

1. Verifique se Baileys está instalado no backend
2. Veja logs: `docker-compose logs backend`
3. Certifique-se que `WHATSAPP_ENABLED=true` no backend/.env

### Mais ajuda

Consulte [DEPLOYMENT.md](docs/DEPLOYMENT.md) seção Troubleshooting.

## 🔄 Atualizar o Sistema

```bash
# Obter atualizações
git pull origin main

# Reconstruir e reiniciar
docker-compose build
docker-compose up -d
```

## 🗑️ Desinstalar

```bash
# Parar e remover containers
docker-compose down

# Remover também os dados (CUIDADO!)
docker-compose down -v

# Remover pasta do projeto
cd ..
rm -rf solid-umbrella
```

## 🚀 Deploy em Produção

Quando estiver pronto para colocar em produção, veja:

- **[DEPLOYMENT.md](docs/DEPLOYMENT.md)** - Guia completo de deployment
  - Docker Compose em servidor
  - VPS com Nginx + SSL
  - Plataformas gerenciadas (Railway, Vercel)
  - Kubernetes

## 📊 Dados de Exemplo

O sistema vem com dados de exemplo pré-carregados:

- 4 usuários (admin, gerente, 2 técnicos)
- 8 clientes
- 13 ordens de serviço (em diferentes status)
- 3 orçamentos
- 8 pagamentos
- Histórico de mensagens WhatsApp

Esses dados são úteis para testar o sistema. Em produção, você pode limpá-los.

## 🎨 Personalizar

### Logo e Cores

Edite `frontend/tailwind.config.js`:

```javascript
theme: {
  extend: {
    colors: {
      primary: { ... },  // Cor primária
      secondary: { ... } // Cor secundária
    },
  },
}
```

### Informações da Empresa

Edite os arquivos:
- `frontend/src/app/page.js` - Página inicial
- `frontend/public/manifest.json` - Nome do app

## 💡 Dicas

1. **Backup Regular**: Configure backup automático do banco (veja DEPLOYMENT.md)
2. **SSL em Produção**: Sempre use HTTPS em produção
3. **Senhas Fortes**: Mude as senhas padrão imediatamente
4. **WhatsApp**: Teste bem antes de usar em produção
5. **Monitoramento**: Configure logs e alertas

## 🤝 Suporte

- 📖 Documentação: `/docs` na pasta do projeto
- 🐛 Issues: https://github.com/sanpaa/solid-umbrella/issues
- 💬 Discussões: https://github.com/sanpaa/solid-umbrella/discussions

## ✨ Funcionalidades Futuras

Este é um sistema base completo. Você pode estender com:

- [ ] App mobile nativo (React Native / Flutter)
- [ ] Notificações push
- [ ] Integração com GPS para rastreamento de técnicos
- [ ] Sistema de avaliação de serviços
- [ ] Integração com gateways de pagamento
- [ ] Agendamento automático inteligente
- [ ] Relatórios avançados com BI
- [ ] Multi-empresas (SaaS)

---

## 🎉 Pronto!

Você agora tem um sistema completo de gestão de serviços rodando!

**Explore, teste e personalize conforme sua necessidade.**

Qualquer dúvida, consulte a documentação em `/docs` ou abra uma issue no GitHub.

**Bom trabalho! 🚀**

---

Desenvolvido com ❤️ para empresas de refrigeração e elétrica
