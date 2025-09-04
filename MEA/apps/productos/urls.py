from rest_framework.routers import DefaultRouter
from .views import StockViewSet, MarcaViewSet  
from django.urls import path, include

router = DefaultRouter()
router.register(r'productos', StockViewSet, basename="productos")
router.register(r'marcas', MarcaViewSet, basename="marcas")  

urlpatterns = [
    path('', include(router.urls)),
]
