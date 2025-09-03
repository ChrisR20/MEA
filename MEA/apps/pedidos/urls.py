from rest_framework.routers import DefaultRouter
from .views import PedidoViewSet, PedidoEntregadoPagadoViewSet
from django.urls import path, include

router = DefaultRouter()
router.register(r'pedidos', PedidoViewSet)
router.register(r'pedidos-entregados-pagados', PedidoEntregadoPagadoViewSet, basename='pedidos-entregados-pagados')

urlpatterns = [
    path('', include(router.urls)),
]
