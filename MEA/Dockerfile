# Dockerfile para Django en DonWeb
FROM python:3.11-slim

# Evitar buffers en logs y archivos .pyc
ENV PYTHONUNBUFFERED=1
ENV PYTHONDONTWRITEBYTECODE=1

# Directorio de la app
WORKDIR /app

# Instalar dependencias del sistema necesarias para psycopg2 y herramientas básicas
RUN apt-get update && apt-get install -y \
    libpq-dev \
    gcc \
    && rm -rf /var/lib/apt/lists/*

# Copiar e instalar requirements
COPY requirements.txt .
RUN pip install --upgrade pip
RUN pip install --no-cache-dir -r requirements.txt

# Copiar todo el proyecto
COPY . .

# Exponer puerto Django
EXPOSE 8000

# Comando para levantar Django con Gunicorn (Producción)
# MEA.wsgi corresponde a tu carpeta principal donde está el archivo wsgi.py
CMD ["gunicorn", "--bind", "0.0.0.0:8000", "--workers", "3", "MEA.wsgi:application"]
