from django.db import models
from django.core.exceptions import ValidationError

from apps.clientes.models import Cliente
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
    pagado = models.BooleanField(default=False)  # SOLO se modifica manualmente desde la API/UI
    estado = models.ForeignKey(PedidoEstado, on_delete=models.PROTECT, default=1)
    tipo_pago = models.CharField(max_length=10, choices=TIPO_PAGO_CHOICES, default='unico')

    def actualizar_monto_total(self):
        total = sum([pp.precio_total() for pp in self.productos.all()])
        self.monto_total = total
        # No modificamos 'pagado' automáticamente aquí
        self.save(update_fields=['monto_total'])

    @property
    def total_pagado_cuotas(self):
        return sum(c.monto for c in self.cuotas.filter(pagado=True))

    def actualizar_pago_desde_cuotas(self):
        """
        Actualiza únicamente el campo 'pago' con la suma de cuotas pagadas.
        NO modifica el flag 'pagado' — ese debe ser controlado manualmente.
        """
        if self.tipo_pago == 'cuotas':
            total_cuotas = self.total_pagado_cuotas
            self.pago = total_cuotas
            self.save(update_fields=['pago'])
            # No cambiamos self.pagado aquí.

    @property
    def monto_pendiente(self):
        pendiente = self.monto_total - self.pago
        return pendiente if pendiente > 0 else 0

    def cantidad_producto(self, producto_id):
        pedido_producto = self.productos.filter(producto_id=producto_id).first()
        return pedido_producto.cantidad if pedido_producto else 0

    def actualizar_estado(self):
        """
        Actualiza el estado según los flags actuales pagado y entregado.
        'estado_id' cambia solo si ambos flags indican 'completado'.
        No modifica el flag 'pagado' ni otros campos.
        """
        if self.pagado and self.entregado:
            self.estado_id = 2  # estado "completado"
        else:
            self.estado_id = 1  # estado "pendiente"
        self.save(update_fields=['estado_id'])

    def save(self, *args, **kwargs):
        # Guardado simple; lógica de negocio (pagado/entregado) debe venir desde la API/UI
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
        """
        Guardamos la cuota y actualizamos el campo 'pago' del pedido (suma de cuotas pagadas).
        NO modificamos el flag 'pagado' del pedido automáticamente.
        """
        super().save(*args, **kwargs)
        # Actualizar solo el campo pago del pedido (suma de cuotas pagadas)
        try:
            self.pedido.actualizar_pago_desde_cuotas()
        except Exception:
            # evitar que errores en actualización de pedido rompan la creación de la cuota
            pass

    def delete(self, *args, **kwargs):
        super().delete(*args, **kwargs)
        try:
            self.pedido.actualizar_pago_desde_cuotas()
        except Exception:
            pass

    def __str__(self):
        estado = "Pagado" if self.pagado else "Pendiente"
        return f"Cuota {self.numero}: ${self.monto} - {estado}"
