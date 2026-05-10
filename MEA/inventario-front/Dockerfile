# ===== FRONTEND BUILD (VITE + REACT) =====
FROM node:20 AS build

WORKDIR /app

# Copiar dependencias primero (cache)
COPY package*.json ./

# Instalar dependencias
RUN npm install

# Copiar todo el proyecto
COPY . .

# Variables de entorno en build (IMPORTANTE para Vite)
ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL

# Construir la app
RUN npm run build


# ===== SERVIR CON NGINX =====
FROM nginx:alpine

# Copiar build al nginx
COPY --from=build /app/dist /usr/share/nginx/html

# Exponer puerto estándar
EXPOSE 80

# Levantar nginx
CMD ["nginx", "-g", "daemon off;"]
