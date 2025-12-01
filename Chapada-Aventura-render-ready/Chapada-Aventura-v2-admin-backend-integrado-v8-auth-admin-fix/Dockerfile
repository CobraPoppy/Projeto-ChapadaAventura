# Imagem base do Node
FROM node:22-alpine

# Diretório de trabalho dentro do container
WORKDIR /app

# Copia configs do backend
COPY backend/package*.json backend/tsconfig.json ./backend/

# Instala dependências do backend
WORKDIR /app/backend
RUN npm install

# Copia código fonte do backend
COPY backend/src ./src
COPY backend/data ./data

# Copia o frontend (pasta public) para /app/public
COPY public /app/public

# Build do TypeScript
RUN npm run build

# Variáveis padrão
ENV NODE_ENV=production
ENV PORT=3333

# Expõe a porta da aplicação
EXPOSE 3333

# Comando para rodar em produção
CMD ["npm", "start"]
