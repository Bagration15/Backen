# Etapa 1: Construcción
FROM node:20-alpine AS builder

WORKDIR /app

# Copiar archivos de dependencias
COPY package*.json ./
COPY tsconfig.json ./
COPY nest-cli.json ./

# Instalar dependencias
RUN npm ci

# Copiar código fuente
COPY src ./src

# Construir la aplicación
RUN npm run build

# Etapa 2: Producción
FROM node:20-alpine

WORKDIR /app

# Copiar archivos de dependencias
COPY package*.json ./

# Instalar solo dependencias de producción
RUN npm ci --only=production && npm cache clean --force

# Copiar archivos construidos desde la etapa de construcción
COPY --from=builder /app/dist ./dist

# Exponer el puerto
EXPOSE 3000

# Comando para iniciar la aplicación
CMD ["node", "dist/main.js"]

