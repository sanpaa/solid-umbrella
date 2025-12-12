# 🎯 Solução: Node.js Version Mismatch

## O Problema

Seu container Docker está reiniciando constantemente com o erro:
```
npm error ❌ This package requires Node.js 20+ to run reliably.
npm error    You are using Node.js 18.20.8
```

## Por Que Isso Aconteceu?

1. O **Dockerfile** JÁ está correto - usa `FROM node:20-alpine`
2. O **package.json** JÁ especifica Node 20+ corretamente
3. O problema é que você está rodando uma **imagem Docker antiga** que foi construída quando o projeto usava Node 18
4. Docker usa cache de imagens antigas por padrão

## A Solução (ESCOLHA UMA)

### ✅ Opção 1: Script Automático (RECOMENDADO)

```bash
cd /caminho/para/solid-umbrella
./fix-node-version.sh
```

Este script faz tudo automaticamente:
- Para os containers
- Remove a imagem antiga
- Reconstrói com Node 20
- Inicia os containers
- Verifica a versão do Node

### ✅ Opção 2: Comandos Manuais

```bash
cd /caminho/para/solid-umbrella

# Parar containers
docker-compose down

# Remover imagem antiga (IMPORTANTE!)
docker rmi solid-umbrella-backend:latest

# Reconstruir SEM cache (IMPORTANTE o --no-cache!)
docker-compose build --no-cache backend

# Iniciar
docker-compose up -d

# Verificar
docker-compose exec backend node --version
docker-compose logs -f backend
```

## Verificação Final

Depois de executar a solução, verifique:

```bash
# 1. Versão do Node deve ser 20+
docker-compose exec backend node --version

# 2. Container deve estar rodando (não "Restarting")
docker-compose ps

# 3. Logs não devem ter erros de Node version
docker-compose logs backend

# 4. API deve responder
curl http://localhost:5000/health
```

## ⚠️ IMPORTANTE: Sempre Reconstrua Quando...

- Mudar o `Dockerfile`
- Mudar `package.json` (adicionar/remover dependências)
- Atualizar versão do Node
- Pull de updates do repositório que mudem essas coisas

**Comando rápido para rebuild**:
```bash
docker-compose down && docker-compose build --no-cache && docker-compose up -d
```

## 📚 Documentação Atualizada

Criamos/atualizamos os seguintes arquivos para evitar este problema no futuro:

1. **DOCKER_TROUBLESHOOTING.md** - Guia completo de troubleshooting Docker
2. **GETTING_STARTED.md** - Seção de troubleshooting atualizada
3. **backend/README.md** - Requisito de Node 20+ em destaque
4. **docs/DEPLOYMENT.md** - Troubleshooting detalhado
5. **fix-node-version.sh** - Script automático de correção
6. **README.md** - Links para todos os guias

## 🆘 Se Ainda Não Funcionar

1. Remova TODAS as imagens do projeto:
```bash
docker-compose down
docker rmi $(docker images -q solid-umbrella*)
docker system prune -a
docker-compose build --no-cache
docker-compose up -d
```

2. Verifique se Docker está atualizado:
```bash
docker --version  # Deve ser 20+
docker-compose --version  # Deve ser 2+
```

3. Consulte a documentação completa:
   - [DOCKER_TROUBLESHOOTING.md](DOCKER_TROUBLESHOOTING.md)
   - [GETTING_STARTED.md](GETTING_STARTED.md)

4. Abra uma issue no GitHub se o problema persistir

---

## ✅ Resumo da Correção

**O que estava errado**: Imagem Docker antiga com Node 18  
**O que foi feito**: Documentação completa + script automático de correção  
**Como resolver**: Execute `./fix-node-version.sh` OU reconstrua manualmente  
**Como prevenir**: Sempre reconstrua após mudanças no Dockerfile/package.json  

---

**Boa sorte! 🚀**
