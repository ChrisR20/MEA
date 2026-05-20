from .common import *
import os

# BASE DIR como string (correcto para tu caso Docker)
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

# STATIC CONFIG (CORRECTO)
STATIC_URL = "/static/"
STATIC_ROOT = os.path.join(BASE_DIR, "staticfiles")

# DEBUG
DEBUG = False

# ALLOWED HOSTS
ALLOWED_HOSTS = os.getenv("ALLOWED_HOSTS", "").split(",")

# SECRET
SECRET_KEY = os.getenv("DJANGO_SECRET_KEY")

# CORS
CORS_ALLOW_CREDENTIALS = True

CORS_ALLOWED_ORIGINS = [
    "http://179.43.120.253",
    "http://179.43.120.253:5173",
]

CSRF_TRUSTED_ORIGINS = CORS_ALLOWED_ORIGINS

# seguridad (sin HTTPS todavía)
CSRF_COOKIE_SECURE = False
SESSION_COOKIE_SECURE = False
SECURE_SSL_REDIRECT = False
