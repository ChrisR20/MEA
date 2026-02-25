import os
from pathlib import Path
from dotenv import load_dotenv

load_dotenv()

# ========================
# BASE
# ========================

BASE_DIR = Path(__file__).resolve().parent.parent.parent

SECRET_KEY = os.getenv('DJANGO_SECRET_KEY')

# ========================
# APPS
# ========================

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

# ========================
# MIDDLEWARE
# ========================

MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

# ========================
# URLS / WSGI
# ========================

ROOT_URLCONF = 'MEA.urls'
WSGI_APPLICATION = 'MEA.wsgi.application'

# ========================
# TEMPLATES
# ========================

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [BASE_DIR / 'apps' / 'accounts' / 'templates'],
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

# ========================
# DATABASE
# ========================

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': os.getenv('DB_NAME'),
        'USER': os.getenv('DB_USER'),
        'PASSWORD': os.getenv('DB_PASSWORD'),
        'HOST': os.getenv('DB_HOST'),
        'PORT': os.getenv('DB_PORT'),
    }
}

# ========================
# PASSWORD VALIDATORS
# ========================

AUTH_PASSWORD_VALIDATORS = [
    {'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator'},
    {'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator'},
    {'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator'},
    {'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator'},
]

# ========================
# INTERNATIONALIZATION
# ========================

LANGUAGE_CODE = 'es-ar'
TIME_ZONE = 'America/Argentina/Buenos_Aires'
USE_I18N = True
USE_TZ = True

# ========================
# STATIC
# ========================

import os
from pathlib import Path

# BASE_DIR sigue igual
BASE_DIR = Path(__file__).resolve().parent.parent.parent

STATIC_URL = '/static/'

# Ruta absoluta que siempre existe dentro del contenedor
STATICFILES_DIRS = ["/app/MEA/static"]  # Fijo, no relativo

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

# ========================
# DRF
# ========================

REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': [
        'rest_framework_simplejwt.authentication.JWTAuthentication',
    ],
    'DEFAULT_PERMISSION_CLASSES': [
        'rest_framework.permissions.IsAuthenticated',
    ],
}

# ========================
# SESSION
# ========================

SESSION_COOKIE_AGE = 21600
SESSION_EXPIRE_AT_BROWSER_CLOSE = False

# ========================
# JAZZMIN
# ========================

JAZZMIN_SETTINGS = {
    "site_logo": "img/logo.jpeg",
    "site_title": "MEA Admin",
    "site_header": "MEA Administración",
    "site_brand": "MEA Admin",
    "welcome_sign": "Bienvenido al panel de administración MEA",
    "show_ui_builder": True,
    "theme": "darkly",
}