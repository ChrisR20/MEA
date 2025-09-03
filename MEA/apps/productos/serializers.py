from rest_framework import serializers
from .models import Stock

class StockSerializer(serializers.ModelSerializer):
    marca = serializers.StringRelatedField()

    class Meta:
        model = Stock
        fields = '__all__'
