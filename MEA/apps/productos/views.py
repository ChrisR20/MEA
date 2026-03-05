from rest_framework import viewsets, permissions
from .models import Stock
from apps.marcas.models import Marca
from apps.marcas.serializers import MarcaSerializer
from .serializers import StockSerializer, StockBulkSerializer

from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response

class StockViewSet(viewsets.ModelViewSet):
    queryset = Stock.objects.select_related('marca').order_by('marca__nombre', 'nombre_producto')

    serializer_class = StockSerializer

    @action(detail=False, methods=['post'])
    def bulk(self, request):
        serializer = StockBulkSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response({"msg": "Productos cargados correctamente"}, status=status.HTTP_201_CREATED)

class MarcaViewSet(viewsets.ModelViewSet):
    queryset = Marca.objects.all().order_by('nombre')
    serializer_class = MarcaSerializer
