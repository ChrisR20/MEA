from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import PedidoViewSet, PedidoEntregadoPagadoViewSet, PedidoDetalleViewSet  # <-- agregar PedidoDetalleViewSet

router = DefaultRouter()
router.register(r'pedidos', PedidoViewSet, basename='pedidos')
router.register(r'pedidos-entregados-pagados', PedidoEntregadoPagadoViewSet, basename='pedidos-entregados-pagados')
router.register(r'pedidodetalle', PedidoDetalleViewSet, basename='pedidodetalle')  # detalle

urlpatterns = [
    path('', include(router.urls)),
]
