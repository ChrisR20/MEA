from django.db import models
from django.db.models import Sum

from apps.clientes.models import Cliente
from apps.productos.models import Stock


class PedidoEstado(models.Model):
    nombre = models.CharField(max_length=50)

    def __str__(self):
        return self.nombre


class Pedido(models.Model):
    TIPO_PAGO_CHOICES = [
        ('unico', 'Pago Único'),
        ('cuotas', 'En Cuotas'),
    ]

    cliente = models.ForeignKey(Cliente, on_delete=models.CASCADE)
    pago = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=0,
        help_text="Usado SOLO para pago único"
    )
    monto_total = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    nota = models.TextField(blank=True, null=True)
    fecha = models.DateTimeField(auto_now_add=True)
    entregado = models.BooleanField(default=False)
    pagado = models.BooleanField(default=False)  # manual desde UI/API
    estado = models.ForeignKey(PedidoEstado, on_delete=models.PROTECT, default=1)
    tipo_pago = models.CharField(max_length=10, choices=TIPO_PAGO_CHOICES, default='unico')

    # =========================
    # CÁLCULOS
    # =========================

    def actualizar_monto_total(self):
        self.monto_total = sum(pp.precio_total() for pp in self.productos.all())
        self.save(update_fields=['monto_total'])

    @property
    def total_pagado_cuotas(self):
        return (
            self.cuotas
            .filter(pagado=True)
            .aggregate(total=Sum('monto'))['total'] or 0
        )

    @property
    def pago_actual(self):
        """
        Fuente ÚNICA de verdad para el frontend
        """
        if self.tipo_pago == 'unico':
            return self.pago
        return self.total_pagado_cuotas

    @property
    def monto_pendiente(self):
        pendiente = self.monto_total - self.pago_actual
        return pendiente if pendiente > 0 else 0

    def actualizar_estado(self):
        if self.pagado and self.entregado:
            self.estado_id = 2
        else:
            self.estado_id = 1
        self.save(update_fields=['estado_id'])

    def __str__(self):
        return f'Pedido {self.id} - {self.cliente}'


class PedidoProducto(models.Model):
    pedido = models.ForeignKey(Pedido, on_delete=models.CASCADE, related_name='productos')
    producto = models.ForeignKey(Stock, on_delete=models.CASCADE)
    cantidad = models.PositiveIntegerField()
    precio_unitario = models.DecimalField(max_digits=10, decimal_places=2)

    def save(self, *args, **kwargs):
        if not self.pk:
            self.precio_unitario = self.producto.precio
        super().save(*args, **kwargs)

    def precio_total(self):
        return self.precio_unitario * self.cantidad

    def __str__(self):
        return f'{self.producto.nombre_producto} x{self.cantidad}'


class CuotaPago(models.Model):
    pedido = models.ForeignKey(Pedido, on_delete=models.CASCADE, related_name='cuotas')
    numero = models.PositiveIntegerField()
    monto = models.DecimalField(max_digits=10, decimal_places=2)
    pagado = models.BooleanField(default=False)

    class Meta:
        ordering = ['numero']

    def save(self, *args, **kwargs):
        super().save(*args, **kwargs)
        # No tocar campos del pedido aquí
        # El cálculo es dinámico vía properties

    def delete(self, *args, **kwargs):
        super().delete(*args, **kwargs)

    def __str__(self):
        estado = "Pagado" if self.pagado else "Pendiente"
        return f"Cuota {self.numero}: ${self.monto} - {estado}"
