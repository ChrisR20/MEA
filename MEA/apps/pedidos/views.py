from rest_framework import viewsets
from .models import Pedido
from .serializers import PedidoSerializer


class PedidoViewSet(viewsets.ModelViewSet):
    queryset = Pedido.objects.filter(estado__id=1)
    serializer_class = PedidoSerializer
    
class PedidoEntregadoPagadoViewSet(viewsets.ModelViewSet):
    queryset = Pedido.objects.filter(estado__id=2)
    serializer_class = PedidoSerializer
