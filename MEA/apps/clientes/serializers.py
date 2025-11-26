from rest_framework import serializers
from .models import Cliente

class ClienteSerializer(serializers.ModelSerializer):
    telefono = serializers.CharField()  

    class Meta:
        model = Cliente
        fields = ['id', 'nombre', 'telefono']