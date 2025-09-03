import os
from pathlib import Path
from dotenv import load_dotenv

# Cargar variables del archivo .env
load_dotenv()

# BASE_DIR
BASE_DIR = Path(__file__).resolve().parent.parent

# Clave secreta
SECRET_KEY = os.getenv('DJANGO_SECRET_KEY', 'django-insecure-default-key-para-dev')

# Modo debug
DEBUG = os.getenv('DJANGO_DEBUG', 'True') == 'True'

# Hosts permitidos (para producción podés leer del .env)
ALLOWED_HOSTS = ['localhost', '127.0.0.1']

# Aplicaciones instaladas
INSTALLED_APPS = [
    'jazzmin',
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',

    # Terceros
    'corsheaders',
    'rest_framework',
    'rest_framework.authtoken',

    # Apps propias
    'apps.accounts',
    'apps.clientes',
    'apps.marcas',
    'apps.productos',
    'apps.pedidos',
]

# Middleware
MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',  # debe ir primero
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF = 'MEA.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [BASE_DIR.parent / 'apps' / 'accounts' / 'templates'],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'MEA.wsgi.application'

# Base de datos
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': os.getenv('DB_NAME', 'inventario'),
        'USER': os.getenv('DB_USER', 'mea_user'),
        'PASSWORD': os.getenv('DB_PASSWORD', ''),
        'HOST': os.getenv('DB_HOST', 'localhost'),
        'PORT': os.getenv('DB_PORT', '5432'),
    }
}

# Validadores de contraseña
AUTH_PASSWORD_VALIDATORS = [
    {'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator'},
    {'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator'},
    {'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator'},
    {'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator'},
]

# Localización
LANGUAGE_CODE = 'es-ar'
TIME_ZONE = 'America/Argentina/Buenos_Aires'
USE_I18N = True
USE_TZ = True

# Archivos estáticos
STATIC_URL = 'static/'

# Asegura que Django sepa dónde están tus archivos estáticos
STATICFILES_DIRS = [BASE_DIR / 'static']

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

# === 🔐 CORS ===
CORS_ALLOW_CREDENTIALS = True

CORS_ALLOWED_ORIGINS = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]

# === 🔐 CSRF Trusted Origins ===
CSRF_TRUSTED_ORIGINS = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]

# === 🔐 Cookies ===
CSRF_COOKIE_HTTPONLY = False       # JavaScript puede leerla si es necesario
CSRF_COOKIE_SAMESITE = 'Lax'       # 'Lax' es suficiente en localhost
CSRF_COOKIE_SECURE = False         # True en producción con HTTPS
SESSION_COOKIE_SAMESITE = 'Lax'    # Evita que se bloqueen las cookies de sesión
SESSION_COOKIE_SECURE = False      # True en producción

# === 🔐 Django Rest Framework ===
REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': [
        'rest_framework_simplejwt.authentication.JWTAuthentication',
    ],
    'DEFAULT_PERMISSION_CLASSES': [
        'rest_framework.permissions.IsAuthenticated',
    ],
}

# === 🔐 Redirecciones login/logout ===
LOGIN_REDIRECT_URL = "http://localhost:5173/dashboard"
LOGOUT_REDIRECT_URL = "http://localhost:5173/login"

# Expiración de sesión: 6 horas
SESSION_COOKIE_AGE = 21600  # 6 * 60 * 60 segundos

# Que la sesión expire incluso si el navegador está abierto
SESSION_EXPIRE_AT_BROWSER_CLOSE = False

# Opcional: renovar la sesión en cada request
# SESSION_SAVE_EVERY_REQUEST = True

JAZZMIN_SETTINGS = {
    "site_logo": "img/logo.jpeg",  # Ruta relativa a STATICFILES_DIRS
    "site_title": "MEA Admin",
    "site_header": "MEA Administración",
    "site_brand": "MEA Admin",
    "welcome_sign": "Bienvenido al panel de administración MEA",
    "show_ui_builder": True,
    "theme": "darkly",  # tema bootstrap: 'darkly', 'flatly', 'cerulean', etc.
    "icons": {
        "productos.Stock": "fas fa-boxes",        # cajas (boxes)
        "pedidos.Pedido": "fas fa-truck",         # camión (truck)
        "marcas.Marca": "fas fa-tag",
        "clientes.Cliente": "fas fa-users",
        "pedidos.CuotaPago": "fas fa-credit-card",
    },

    # Enlace en el top menu (barra superior)
    "topmenu_links": [
        {
            "name": "Ir al sitio web",
            "url": "http://localhost:5173/login",
            "new_window": True,
            "permissions": ["auth.view_user"],  # Opcional: solo usuarios con permiso
        },
    ],

    # Enlace en el menú lateral dentro de la app 'auth' (puedes cambiar 'auth' por cualquier app que tengas)
    "custom_links": {
        "auth": [
            {
                "name": "Ir al sitio web",
                "url": "http://localhost:5173/login",
                "icon": "fas fa-external-link-alt",
                "new_window": True,
            },
        ],
    },

    "copyright": "MEA © 2025",
}