from django.db import models
from django.core.exceptions import ValidationError

from apps.clientes.models  import Cliente
from apps.productos.models import Stock


class PedidoEstado(models.Model):
    nombre = models.CharField(max_length=50)

    def __str__(self):
        return self.nombre


# Pedido general (cliente, fecha, nota, si fue entregado, etc.)
class Pedido(models.Model):
    TIPO_PAGO_CHOICES = [
        ('unico', 'Pago Único'),
        ('cuotas', 'En Cuotas'),
    ]

    cliente = models.ForeignKey(Cliente, on_delete=models.CASCADE)
    pago = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    monto_total = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    nota = models.TextField(blank=True, null=True)
    fecha = models.DateTimeField(auto_now_add=True)
    entregado = models.BooleanField(default=False)
    pagado = models.BooleanField(default=False)
    estado = models.ForeignKey(PedidoEstado, on_delete=models.PROTECT, default=1)
    tipo_pago = models.CharField(max_length=10, choices=TIPO_PAGO_CHOICES, default='unico')

    def actualizar_monto_total(self):
        total = sum([pp.precio_total() for pp in self.productos.all()])
        self.monto_total = total
        self.save(update_fields=['monto_total'])

    @property
    def total_pagado_cuotas(self):
        return sum(c.monto for c in self.cuotas.filter(pagado=True))

    def actualizar_pago_desde_cuotas(self):
        if self.tipo_pago == 'cuotas':
            total_cuotas = self.total_pagado_cuotas
            # Actualizar el pago con la suma de cuotas pagadas
            self.pago = total_cuotas
            # Actualizar estado 'pagado' según si cubre el total
            self.pagado = (self.monto_total > 0 and total_cuotas >= self.monto_total)
            self.save(update_fields=['pago', 'pagado'])
            self.actualizar_estado()

    @property
    def monto_pendiente(self):
        pendiente = self.monto_total - self.pago
        return pendiente if pendiente > 0 else 0

    def cantidad_producto(self, producto_id):
        pedido_producto = self.productos.filter(producto_id=producto_id).first()
        return pedido_producto.cantidad if pedido_producto else 0

    def actualizar_estado(self):
        if self.pagado and self.entregado:
            self.estado_id = 2  # estado "completado"
        else:
            self.estado_id = 1  # estado "pendiente"
        self.save(update_fields=['pagado', 'estado_id'])

    def save(self, *args, **kwargs):
        # Simple save sin doble llamada ni manipulación de force_insert
        super().save(*args, **kwargs)

    def __str__(self):
        return f'Pedido {self.id} - {self.cliente}'


# Relación de productos dentro de un pedido
class PedidoProducto(models.Model):
    pedido = models.ForeignKey(Pedido, on_delete=models.CASCADE, related_name='productos')
    producto = models.ForeignKey(Stock, on_delete=models.CASCADE)
    cantidad = models.PositiveIntegerField()
    precio_unitario = models.DecimalField(max_digits=10, decimal_places=2)

    def save(self, *args, **kwargs):
        # Solo asignar precio_unitario si es nuevo objeto (no tiene id todavía)
        if not self.pk:
            self.precio_unitario = self.producto.precio
        super().save(*args, **kwargs)

    def precio_total(self):
        return self.precio_unitario * self.cantidad

    def __str__(self):
        return f'{self.producto.nombre_producto} x{self.cantidad} - ${self.precio_total():.2f}'


class CuotaPago(models.Model):
    pedido = models.ForeignKey(Pedido, on_delete=models.CASCADE, related_name='cuotas')
    numero = models.PositiveIntegerField()
    monto = models.DecimalField(max_digits=10, decimal_places=2)
    pagado = models.BooleanField(default=False)

    class Meta:
        ordering = ['numero']

    def save(self, *args, **kwargs):
        super().save(*args, **kwargs)
        self.pedido.actualizar_pago_desde_cuotas()

    def delete(self, *args, **kwargs):
        super().delete(*args, **kwargs)
        self.pedido.actualizar_pago_desde_cuotas()
        self.pedido.actualizar_estado()

    def __str__(self):
        estado = "Pagado" if self.pagado else "Pendiente"
        return f"Cuota {self.numero}: ${self.monto} - {estado}"
