from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated

from .models import Pedido
from .serializers import PedidoSerializer, PedidoDetalleSerializer


class PedidoViewSet(viewsets.ModelViewSet):
    """ViewSet para pedidos activos (estado = 1)"""
    serializer_class = PedidoSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return (
            Pedido.objects
            .filter(estado__id=1)
            .select_related("cliente", "estado")
            .prefetch_related(
                "productos__producto",
                "cuotas"
            )
        )


class PedidoEntregadoPagadoViewSet(viewsets.ModelViewSet):
    """ViewSet para pedidos entregados y pagados (estado = 2)"""
    serializer_class = PedidoSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return (
            Pedido.objects
            .filter(estado__id=2)
            .select_related("cliente", "estado")
            .prefetch_related(
                "productos__producto",
                "cuotas"
            )
        )


class PedidoDetalleViewSet(viewsets.ReadOnlyModelViewSet):
    """ViewSet solo lectura para ver detalle completo de pedidos"""
    queryset = Pedido.objects.all()
    serializer_class = PedidoDetalleSerializer
    permission_classes = [IsAuthenticated]
