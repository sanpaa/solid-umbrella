FROM node:18-alpine

WORKDIR /app

# Instalar dependências do sistema
RUN apk add --no-cache \
    python3 \
    make \
    g++

# Copiar package files
COPY package*.json ./

# Instalar dependências (incluindo dev dependencies para nodemon)
RUN npm install

# Copiar código fonte
COPY . .

# Criar diretórios necessários
RUN mkdir -p uploads auth_info logs && \
    chmod -R 755 uploads auth_info logs

# Expor porta
EXPOSE 5000

# Comando para iniciar
CMD ["npm", "start"]
