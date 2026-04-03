# Estágio 1: Build (Compilação do Angular)
FROM node:20-alpine AS build
WORKDIR /app

# Copia os arquivos de dependências e instala
COPY package*.json ./
RUN npm install

# Copia todo o código do frontend e gera o build de produção
COPY . .
RUN npm run build -- --configuration production

# Estágio 2: Runtime (Servidor Nginx com Proxy Reverso)
FROM nginx:stable-alpine

# 1. REMOVE a configuração padrão do Nginx
RUN rm /etc/nginx/conf.d/default.conf

# 2. COPIA o arquivo nginx.conf personalizado para dentro do container
COPY nginx.conf /etc/nginx/conf.d/default.conf

# 3. COPIA os arquivos compilados do estágio anterior para a pasta do Nginx
COPY --from=build /app/dist/frontend/browser /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]