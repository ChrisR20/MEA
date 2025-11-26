# Usamos la imagen base de Node.js
FROM node:20

# Establecemos el directorio de trabajo
WORKDIR /app

# Copiar package.json y package-lock.json (si existe)
COPY package*.json ./

# Instalar dependencias (incluyendo dev dependencies)
RUN npm install

# Copiar todo el código del frontend al contenedor
COPY . .

# Exponer el puerto en el que Vite correrá (por defecto 5173)
EXPOSE 5173

# Comando para iniciar el servidor de desarrollo Vite
CMD ["npm", "run", "dev", "--", "--host"]
