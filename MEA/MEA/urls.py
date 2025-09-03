from django.contrib import admin
from django.urls import path, include
from django.views.generic import RedirectView
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('apps.productos.urls')),  
    path('api/', include('apps.marcas.urls')),
    path('api/', include('apps.clientes.urls')),
    path('api/', include('apps.pedidos.urls')),
    path('accounts/', include('apps.accounts.urls')),
    path('', RedirectView.as_view(url='/admin/', permanent=False)),
]

urlpatterns += static(settings.STATIC_URL, document_root=settings.STATICFILES_DIRS[0])
