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
        desc = attrs.get('desc')  # ← ESTE es el nombre correcto del campo

        # Si estamos editando, obtener ID del producto actual
        instance_id = self.instance.id if self.instance else None

        # Verificar duplicado EXCLUYENDO el producto actual
        if Stock.objects.filter(
            nombre_producto__iexact=nombre_producto,
            marca=marca,
            desc__iexact=desc
        ).exclude(id=instance_id).exists():
            raise serializers.ValidationError(
                {"non_field_errors": ["El producto que intenta agregar ya existe en su stock."]}
            )

        return attrs
