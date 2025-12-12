# 🐳 Docker Troubleshooting - Guia Rápido

## ⚠️ Container Reiniciando - Node.js Version Mismatch

### Problema
Container `service_management_api` com status **"Restarting"** e erro:
```
npm error ❌ This package requires Node.js 20+ to run reliably.
npm error    You are using Node.js 18.x.x
```

### Solução Rápida
```bash
# Copie e cole este bloco inteiro:
docker-compose down && \
docker rmi solid-umbrella-backend:latest && \
docker-compose build --no-cache backend && \
docker-compose up -d

# Verificar se funcionou:
docker-compose exec backend node --version
docker-compose logs -f backend
```

### Por que isso acontece?
- O **Dockerfile** usa `FROM node:20-alpine` (correto)
- Mas você está rodando uma **imagem antiga** construída com Node 18
- Docker usa cache de imagens antigas se você não forçar rebuild

### Prevenção
Sempre que modificar `Dockerfile` ou `package.json`, reconstrua:
```bash
docker-compose down
docker-compose build --no-cache
docker-compose up -d
```

---

## 🔧 Outros Problemas Comuns

### 1. Porta já em uso
```bash
# Erro: "port is already allocated"
# Ver o que está usando a porta:
lsof -i :5000  # ou :3000, :5432

# Parar o processo ou mudar a porta no docker-compose.yml:
# "3001:3000" ao invés de "3000:3000"
```

### 2. Container não inicia
```bash
# Ver logs detalhados:
docker-compose logs -f backend

# Ver todos os containers (incluindo parados):
docker-compose ps -a

# Remover containers antigos:
docker-compose down
docker-compose up -d
```

### 3. Banco de dados não conecta
```bash
# Verificar se PostgreSQL está rodando:
docker-compose ps postgres

# Ver logs do banco:
docker-compose logs postgres

# Resetar banco (CUIDADO: apaga dados!):
docker-compose down -v
docker-compose up -d
```

### 4. Mudanças no código não aparecem
```bash
# Se mudou código dentro de src/:
# Apenas reinicie (volumes estão montados):
docker-compose restart backend

# Se mudou package.json ou Dockerfile:
docker-compose down
docker-compose build --no-cache backend
docker-compose up -d
```

### 5. "No space left on device"
```bash
# Limpar containers parados:
docker container prune

# Limpar imagens não utilizadas:
docker image prune -a

# Limpar volumes não utilizados:
docker volume prune

# Limpar tudo (CUIDADO!):
docker system prune -a --volumes
```

### 6. Frontend não conecta ao backend
```bash
# Verificar variável de ambiente:
cat frontend/.env.local
# Deve ter: NEXT_PUBLIC_API_URL=http://localhost:5000/api/v1

# Verificar se backend está rodando:
curl http://localhost:5000/health

# Ver logs de ambos:
docker-compose logs backend frontend
```

---

## 📋 Comandos Úteis

### Status e Logs
```bash
# Ver status de todos os containers
docker-compose ps

# Ver logs em tempo real
docker-compose logs -f

# Ver logs de um serviço específico
docker-compose logs -f backend

# Ver últimas 100 linhas
docker-compose logs --tail=100 backend
```

### Rebuild e Restart
```bash
# Restart simples (código mudou)
docker-compose restart backend

# Rebuild completo (Dockerfile/package.json mudou)
docker-compose down
docker-compose build --no-cache
docker-compose up -d

# Rebuild apenas um serviço
docker-compose build --no-cache backend
docker-compose up -d backend
```

### Entrar no Container
```bash
# Abrir shell no container do backend
docker-compose exec backend sh

# Executar comando específico
docker-compose exec backend node --version
docker-compose exec backend npm list
docker-compose exec postgres psql -U postgres -d service_management
```

### Limpar e Resetar
```bash
# Parar tudo
docker-compose down

# Parar e remover volumes (APAGA DADOS!)
docker-compose down -v

# Remover imagem específica
docker rmi solid-umbrella-backend:latest

# Remover todas as imagens do projeto
docker rmi $(docker images -q solid-umbrella*)
```

---

## 🆘 Checklist de Troubleshooting

Quando algo não funciona, siga esta ordem:

1. ✅ **Ver os logs**: `docker-compose logs -f`
2. ✅ **Verificar status**: `docker-compose ps`
3. ✅ **Verificar variáveis de ambiente**: Ver arquivos `.env`
4. ✅ **Verificar versões**: 
   - `docker --version` (20+)
   - `docker-compose --version` (2+)
   - `docker-compose exec backend node --version` (20+)
5. ✅ **Rebuild se necessário**: `docker-compose build --no-cache`
6. ✅ **Verificar portas**: `lsof -i :5000`
7. ✅ **Limpar cache**: `docker system prune`
8. ✅ **Consultar documentação**: Ver `/docs`

---

## 📞 Ainda com Problemas?

1. **Veja a documentação completa**:
   - [GETTING_STARTED.md](GETTING_STARTED.md) - Guia de início
   - [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) - Deploy e troubleshooting
   - [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) - Arquitetura

2. **Abra uma issue**:
   - https://github.com/sanpaa/solid-umbrella/issues

3. **Verifique issues existentes**:
   - Talvez alguém já teve o mesmo problema

---

**🎯 Lembre-se**: Quando em dúvida, rebuild sem cache resolve 90% dos problemas!

```bash
docker-compose down && \
docker-compose build --no-cache && \
docker-compose up -d
```
