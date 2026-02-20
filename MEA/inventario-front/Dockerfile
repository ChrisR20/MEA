# Dockerfile frontend React + Vite
FROM node:20

# Directorio de la app
WORKDIR /app

# Copiar package.json y package-lock.json primero para cachear dependencias
COPY package*.json ./

# Instalar dependencias
RUN npm install

# Copiar todo el proyecto
COPY . .

# Exponer puerto de Vite
EXPOSE 5173

# Comando por defecto para desarrollo
CMD ["npm", "run", "dev", "--", "--host"]