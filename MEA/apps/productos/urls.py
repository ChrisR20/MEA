from rest_framework.routers import DefaultRouter
from .views import StockViewSet
from django.urls import path, include

router = DefaultRouter()
router.register(r'productos', StockViewSet)

urlpatterns = [
    path('', include(router.urls)),
]
