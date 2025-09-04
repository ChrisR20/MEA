from rest_framework import serializers
from rest_framework.permissions import IsAuthenticated

from .models import Stock
from apps.marcas.models import Marca

class MarcaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Marca
        fields = '__all__'
        permission_classes = [IsAuthenticated]

class StockSerializer(serializers.ModelSerializer):
    # Para mostrar el nombre de la marca en el listado
    marca_nombre = serializers.CharField(source="marca.nombre", read_only=True)

    class Meta:
        model = Stock
        fields = '__all__'
        permission_classes = [IsAuthenticated]

    def validate(self, attrs):
        nombre_producto = attrs.get('nombre_producto')
        marca = attrs.get('marca')

        # Verifica si ya existe un producto con el mismo nombre y marca
        if Stock.objects.filter(nombre_producto__iexact=nombre_producto, marca=marca).exists():
            raise serializers.ValidationError(
                {"non_field_errors": ["El producto que intenta agregar ya existe en su stock."]}
            )
        return attrs
