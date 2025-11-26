# Dockerfile para Django
FROM python:3.11-slim

# Evitar buffers en logs
ENV PYTHONUNBUFFERED=1

# Directorio de la app
WORKDIR /app

# Copiar requirements
COPY requirements.txt .

# Instalar dependencias
RUN pip install --upgrade pip
RUN pip install -r requirements.txt

# Copiar todo el proyecto
COPY . .

# Exponer puerto Django
EXPOSE 8000

# Comando para levantar Django
CMD ["python", "manage.py", "runserver", "0.0.0.0:8000"]
