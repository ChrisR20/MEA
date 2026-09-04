"""
WSGI config for MEA project.
"""

import importlib.util
import os

from django.core.wsgi import get_wsgi_application

# Si existe MEA/local.py usa esa configuración, de lo contrario usa production.py
if importlib.util.find_spec("MEA.local") is not None:
    os.environ.setdefault("DJANGO_SETTINGS_MODULE", "MEA.local")
else:
    os.environ.setdefault("DJANGO_SETTINGS_MODULE", "MEA.production")

application = get_wsgi_application()