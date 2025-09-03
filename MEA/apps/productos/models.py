from django.db import models
from django_cryptography.fields import encrypt
from django.core.exceptions import ValidationError
from apps.marcas.models import Marca

# Producto en stock
class Stock(models.Model):
    nombre_producto = models.CharField(max_length=150)
    marca = models.ForeignKey(Marca, on_delete=models.CASCADE)
    desc = models.CharField(max_length=150, blank=True, null=True)
    color = models.CharField(max_length=150, blank=True, null=True)
    aroma = models.CharField(max_length=150, blank=True, null=True)
    cantidad = models.IntegerField(blank=True, null=True)
    peso_neto = models.CharField(max_length=50, blank=True, null=True)
    codigo = models.BigIntegerField(blank=True, null=True)
    precio = models.DecimalField(max_digits=10, decimal_places=2)  # Precio actual del producto

    class Meta:
        verbose_name = 'Stock'
        verbose_name_plural = 'Stock'

    def __str__(self):
        return self.nombre_producto


