from rest_framework import viewsets, permissions
from .models import Stock
from apps.marcas.models import Marca
from apps.marcas.serializers import MarcaSerializer
from .serializers import StockSerializer

class StockViewSet(viewsets.ModelViewSet):
    queryset = Stock.objects.all()
    serializer_class = StockSerializer

class MarcaViewSet(viewsets.ModelViewSet):
    queryset = Marca.objects.all()
    serializer_class = MarcaSerializer
