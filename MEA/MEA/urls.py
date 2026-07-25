from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('apps.productos.urls')),
    path('api/', include('apps.marcas.urls')),
    path('api/', include('apps.clientes.urls')),
    path('api/', include('apps.pedidos.urls')),
    path('api/', include('apps.empresas.urls')),
    path('accounts/', include('apps.accounts.urls')),
]

# Servir estáticos y media únicamente en modo desarrollo (DEBUG = True)
if settings.DEBUG:
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)