"""
WSGI config for MEA project.
"""

import os
from django.core.wsgi import get_wsgi_application

# Ajustado para que apunte directamente al archivo production.py en la carpeta MEA
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'MEA.production')

application = get_wsgi_application()
