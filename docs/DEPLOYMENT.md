# Guia de Deployment

Este guia cobre diferentes formas de fazer deploy do sistema completo.

## 🚀 Opções de Deploy

### 1. Docker Compose (Recomendado - Mais Simples)
### 2. VPS Manual (Digital Ocean, Linode, AWS EC2)
### 3. Plataformas Separadas (Backend e Frontend em serviços diferentes)
### 4. Kubernetes (Para produção em escala)

---

## 📦 1. Docker Compose (Recomendado)

### Pré-requisitos
- Docker 20+ instalado
- Docker Compose 2+ instalado
- Servidor com no mínimo 2GB RAM

### Passo a Passo

```bash
# 1. Clone o repositório
git clone https://github.com/sanpaa/solid-umbrella.git
cd solid-umbrella

# 2. Configure as variáveis de ambiente

# Backend
cp backend/.env.example backend/.env
nano backend/.env  # Edite as configurações

# Frontend
cp frontend/.env.example frontend/.env.local
nano frontend/.env.local  # Edite NEXT_PUBLIC_API_URL

# 3. Inicie todos os serviços
docker-compose up -d

# 4. Verifique os logs
docker-compose logs -f

# 5. Acesse o sistema
# Frontend: http://seu-ip:3000
# Backend API: http://seu-ip:5000
# PostgreSQL: localhost:5432
```

### Parar os Serviços

```bash
docker-compose down

# Para remover volumes também (CUIDADO: apaga o banco)
docker-compose down -v
```

### Atualizar o Sistema

```bash
git pull
docker-compose build
docker-compose up -d
```

---

## 🖥️ 2. VPS Manual (Ubuntu 22.04)

### Pré-requisitos
- Servidor Ubuntu 22.04+
- Acesso SSH root
- Domínio apontando para o servidor (opcional, mas recomendado)

### Instalação do Ambiente

```bash
# Atualizar sistema
sudo apt update && sudo apt upgrade -y

# Instalar Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Instalar PostgreSQL 14
sudo apt install -y postgresql postgresql-contrib

# Instalar PM2 (Process Manager)
sudo npm install -g pm2

# Instalar Nginx
sudo apt install -y nginx

# Instalar Certbot (SSL gratuito)
sudo apt install -y certbot python3-certbot-nginx
```

### Configurar PostgreSQL

```bash
# Entrar no PostgreSQL
sudo -u postgres psql

# Criar banco e usuário
CREATE DATABASE service_management;
CREATE USER seuusuario WITH PASSWORD 'suasenha';
GRANT ALL PRIVILEGES ON DATABASE service_management TO seuusuario;
\q

# Executar schema
psql -U seuusuario -d service_management -f database/schema.sql
psql -U seuusuario -d service_management -f database/seed.sql
```

### Deploy do Backend

```bash
# Clone o repositório
cd /var/www
git clone https://github.com/sanpaa/solid-umbrella.git
cd solid-umbrella/backend

# Instalar dependências
npm install --production

# Configurar .env
cp .env.example .env
nano .env  # Configure suas variáveis

# Iniciar com PM2
pm2 start src/server.js --name api-service-management
pm2 save
pm2 startup

# Ver logs
pm2 logs api-service-management
```

### Deploy do Frontend

```bash
cd /var/www/solid-umbrella/frontend

# Instalar dependências
npm install

# Configurar .env
cp .env.example .env.local
nano .env.local  # Configure NEXT_PUBLIC_API_URL

# Build
npm run build

# Iniciar com PM2
pm2 start npm --name web-service-management -- start
pm2 save
```

### Configurar Nginx

```bash
# Criar configuração
sudo nano /etc/nginx/sites-available/service-management
```

Cole a seguinte configuração:

```nginx
# API Backend
server {
    listen 80;
    server_name api.seudominio.com;

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}

# Frontend
server {
    listen 80;
    server_name seudominio.com www.seudominio.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Ativar configuração:

```bash
# Criar link simbólico
sudo ln -s /etc/nginx/sites-available/service-management /etc/nginx/sites-enabled/

# Testar configuração
sudo nginx -t

# Recarregar Nginx
sudo systemctl reload nginx
```

### Configurar SSL (HTTPS)

```bash
# Obter certificado SSL gratuito com Let's Encrypt
sudo certbot --nginx -d seudominio.com -d www.seudominio.com -d api.seudominio.com

# Certbot configurará SSL automaticamente
# Certificados são renovados automaticamente
```

### Firewall

```bash
# Configurar UFW
sudo ufw allow 22    # SSH
sudo ufw allow 80    # HTTP
sudo ufw allow 443   # HTTPS
sudo ufw enable
```

---

## ☁️ 3. Plataformas Separadas

### Backend: Railway / Render / Fly.io

#### Railway (Recomendado)

1. Crie conta em [railway.app](https://railway.app)
2. Conecte seu repositório GitHub
3. Crie novo projeto
4. Adicione PostgreSQL (via Railway)
5. Configure variáveis de ambiente
6. Deploy automático!

#### Variáveis de Ambiente:

```
NODE_ENV=production
PORT=5000
DATABASE_URL=<fornecido-pelo-railway>
JWT_SECRET=<gere-um-secret-forte>
JWT_REFRESH_SECRET=<gere-outro-secret>
FRONTEND_URL=https://seu-frontend.vercel.app
WHATSAPP_ENABLED=true
```

### Frontend: Vercel (Recomendado para Next.js)

```bash
# Instalar Vercel CLI
npm install -g vercel

# Deploy
cd frontend
vercel

# Seguir instruções
# Configurar NEXT_PUBLIC_API_URL para apontar para o backend
```

Ou conecte via GitHub:
1. Vá em [vercel.com](https://vercel.com)
2. Importe seu repositório
3. Configure variáveis de ambiente
4. Deploy automático!

### Frontend: Netlify (Alternativa)

```bash
# Instalar Netlify CLI
npm install -g netlify-cli

# Build
cd frontend
npm run build

# Deploy
netlify deploy --prod
```

---

## ⚙️ 4. Kubernetes (Produção em Escala)

### Pré-requisitos
- Cluster Kubernetes (EKS, GKE, AKS, ou local com Minikube)
- kubectl configurado
- Conhecimento básico de Kubernetes

### Estrutura

```
k8s/
├── namespace.yaml
├── postgresql/
│   ├── statefulset.yaml
│   ├── service.yaml
│   └── pvc.yaml
├── backend/
│   ├── deployment.yaml
│   ├── service.yaml
│   ├── configmap.yaml
│   └── secret.yaml
├── frontend/
│   ├── deployment.yaml
│   └── service.yaml
├── ingress.yaml
└── cert-manager.yaml
```

### Deploy Básico

```bash
# Criar namespace
kubectl create namespace service-management

# PostgreSQL
kubectl apply -f k8s/postgresql/ -n service-management

# Backend
kubectl apply -f k8s/backend/ -n service-management

# Frontend
kubectl apply -f k8s/frontend/ -n service-management

# Ingress (com SSL)
kubectl apply -f k8s/ingress.yaml -n service-management
```

---

## 🔐 Segurança em Produção

### Checklist de Segurança

- [ ] Usar HTTPS (SSL/TLS)
- [ ] Configurar CORS corretamente
- [ ] Usar secrets fortes para JWT
- [ ] Habilitar rate limiting
- [ ] Configurar firewall
- [ ] Usar variáveis de ambiente (não hardcode)
- [ ] Manter dependências atualizadas
- [ ] Fazer backup regular do banco
- [ ] Monitorar logs
- [ ] Usar helmet.js no backend

### Exemplo de .env Seguro

```bash
# Gerar secrets fortes
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

# Use outputs diferentes para JWT_SECRET e JWT_REFRESH_SECRET
```

---

## 📊 Monitoramento

### PM2 Plus (Grátis para pequenos projetos)

```bash
pm2 link <secret> <public>
pm2 web
```

### Logs

```bash
# PM2
pm2 logs

# Docker
docker-compose logs -f

# Sistema
tail -f /var/log/nginx/access.log
tail -f /var/log/nginx/error.log
```

### Uptim Monitoring

Use serviços como:
- UptimeRobot (grátis)
- Pingdom
- StatusCake

---

## 🔄 Backup e Restore

### Backup do Banco

```bash
# Backup automático diário (crontab)
0 2 * * * pg_dump -U postgres service_management > /backups/db_$(date +\%Y\%m\%d).sql

# Fazer backup manual
pg_dump -U postgres -d service_management -F c -b -v -f backup.dump

# Backup com Docker
docker exec postgres pg_dump -U postgres service_management > backup.sql
```

### Restore do Banco

```bash
# Restore
psql -U postgres -d service_management < backup.sql

# Restore custom format
pg_restore -U postgres -d service_management backup.dump

# Restore com Docker
docker exec -i postgres psql -U postgres service_management < backup.sql
```

---

## 🚨 Troubleshooting

### Backend não conecta ao banco

```bash
# Verificar se PostgreSQL está rodando
sudo systemctl status postgresql

# Verificar logs
sudo journalctl -u postgresql

# Testar conexão
psql -U postgres -d service_management -c "SELECT 1;"
```

### Frontend não conecta ao backend

1. Verifique NEXT_PUBLIC_API_URL
2. Verifique CORS no backend
3. Verifique firewall
4. Teste a API diretamente: `curl http://seu-backend/health`

### WhatsApp não conecta

1. Verifique se Baileys está instalado
2. Veja logs do backend
3. Escaneie QR Code novamente
4. Verifique pasta `auth_info/`

### Performance lenta

1. Adicione índices no banco
2. Use Redis para cache
3. Otimize queries
4. Use CDN para frontend
5. Habilite compressão gzip

---

## 📖 Recursos Adicionais

- [Docker Docs](https://docs.docker.com/)
- [Nginx Docs](https://nginx.org/en/docs/)
- [PM2 Docs](https://pm2.keymetrics.io/docs/)
- [PostgreSQL Docs](https://www.postgresql.org/docs/)
- [Next.js Deploy](https://nextjs.org/docs/deployment)

---

## 💰 Custos Estimados

### Opção 1: VPS Compartilhado
- Digital Ocean Droplet 2GB: ~$12/mês
- Total: **$12/mês**

### Opção 2: Plataformas Gerenciadas (Hobby)
- Railway: Grátis (limite de uso)
- Vercel: Grátis (hobby)
- Total: **$0 - $20/mês**

### Opção 3: Produção
- VPS 4GB: ~$24/mês
- Banco gerenciado: ~$15/mês
- CDN: ~$5/mês
- Total: **$44/mês**

---

**Escolha a opção que melhor se adequa ao seu caso de uso e orçamento!**
