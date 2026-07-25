from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import get_empresa_info # Tu función de vista

router = DefaultRouter()
# Aquí registrarías otros ViewSets si los tienes (ej: router.register('productos', ProductoViewSet))

urlpatterns = [
    # Ruta directa para /api/empresa/
    path('empresa/', get_empresa_info, name='empresa-info'),
    
    # Las rutas automáticas del router
    path('', include(router.urls)),
]