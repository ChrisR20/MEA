from rest_framework import serializers
from rest_framework.exceptions import ValidationError
from .models import Pedido, PedidoProducto, CuotaPago, PedidoEstado
from apps.clientes.models import Cliente
from apps.productos.models import Stock


# ====================
# Serializers de Productos y Cuotas
# ====================

class PedidoProductoSerializer(serializers.ModelSerializer):
    producto = serializers.PrimaryKeyRelatedField(queryset=Stock.objects.all())
    producto_nombre = serializers.CharField(source='producto.nombre_producto', read_only=True)
    producto_descripcion = serializers.CharField(source='producto.desc', read_only=True)
    precio_unitario = serializers.DecimalField(max_digits=10, decimal_places=2, read_only=True)
    precio_total = serializers.SerializerMethodField()

    class Meta:
        model = PedidoProducto
        fields = [
            'producto',
            'producto_nombre',
            'producto_descripcion',
            'cantidad',
            'precio_unitario',
            'precio_total'
        ]

    def get_precio_total(self, obj):
        return obj.precio_total()


class CuotaPagoSerializer(serializers.ModelSerializer):
    class Meta:
        model = CuotaPago
        fields = ['id', 'numero', 'monto', 'pagado']


# ====================
# Serializer Principal de Pedido
# ====================

class PedidoSerializer(serializers.ModelSerializer):
    cliente = serializers.PrimaryKeyRelatedField(queryset=Cliente.objects.all())
    cliente_nombre = serializers.CharField(source='cliente.nombre', read_only=True)
    productos = PedidoProductoSerializer(many=True)
    cuotas = CuotaPagoSerializer(many=True, required=False)
    pago = serializers.DecimalField(max_digits=10, decimal_places=2, required=False, default=0)
    pago_actual = serializers.SerializerMethodField()
    monto_total = serializers.DecimalField(max_digits=10, decimal_places=2, read_only=True)
    monto_pendiente = serializers.SerializerMethodField()
    tipo_pago = serializers.ChoiceField(choices=Pedido.TIPO_PAGO_CHOICES, required=True)
    estado = serializers.PrimaryKeyRelatedField(queryset=PedidoEstado.objects.all(), required=False)
    cantidad_cuotas = serializers.SerializerMethodField()
    monto_pagado_cuotas = serializers.SerializerMethodField()

    class Meta:
        model = Pedido
        fields = [
            'id', 'cliente', 'cliente_nombre', 'pago', 'pago_actual',
            'monto_total', 'monto_pendiente', 'nota',
            'fecha', 'entregado', 'pagado', 'productos',
            'estado', 'tipo_pago', 'cuotas',
            'cantidad_cuotas', 'monto_pagado_cuotas',
        ]
        read_only_fields = [
            'fecha', 'monto_total', 'monto_pendiente',
            'cantidad_cuotas', 'monto_pagado_cuotas', 'pago_actual'
        ]

    # === Métodos de cálculo ===
    def get_pago_actual(self, obj):
        if obj.tipo_pago == 'unico':
            return obj.pago
        return obj.total_pagado_cuotas

    def get_monto_pagado_cuotas(self, obj):
        return obj.total_pagado_cuotas

    def get_monto_pendiente(self, obj):
        pagado = self.get_pago_actual(obj)
        pendiente = obj.monto_total - pagado
        return pendiente if pendiente > 0 else 0

    def get_cantidad_cuotas(self, obj):
        return obj.cuotas.count()

    # === Validación de stock ===
    def validate_productos(self, productos_data):
        for pd in productos_data:
            producto = pd['producto']
            cant_nueva = pd['cantidad']
            if producto.cantidad < cant_nueva:
                raise ValidationError(f"No hay suficiente stock para {producto.nombre_producto}.")
        return productos_data

    def validate_pago(self, value):
        return value

    # === Crear Pedido y sus productos/cuotas ===
    def create(self, validated_data):
        cliente = validated_data.get('cliente')
        
        # Verificar si ya existe un pedido pendiente para este cliente
        if Pedido.objects.filter(cliente=cliente, estado__id=1).exists():
            raise ValidationError(f"El cliente {cliente.nombre} ya tiene un pedido pendiente.")
        
        productos_data = validated_data.pop('productos')
        cuotas_data = validated_data.pop('cuotas', [])
        
        # Crear el pedido
        pedido = Pedido.objects.create(**validated_data)

        # Crear los productos del pedido y actualizar el stock
        for producto_data in productos_data:
            producto = producto_data['producto']
            cantidad = producto_data['cantidad']
            
            # Verificar y reducir stock
            if producto.cantidad < cantidad:
                raise ValidationError(f"No hay suficiente stock para {producto.nombre_producto}.")
            producto.cantidad -= cantidad
            producto.save()

            # Crear el PedidoProducto
            PedidoProducto.objects.create(pedido=pedido, **producto_data)

        # Crear las cuotas si las hay
        for cuota_data in cuotas_data:
            CuotaPago.objects.create(pedido=pedido, **cuota_data)

        # Actualizar el monto total del pedido
        pedido.actualizar_monto_total()

        # Actualizar estado
        pedido.actualizar_estado()

        return pedido

    # === Actualizar Pedido y sus productos/cuotas ===
    def update(self, instance, validated_data):
        productos_data = validated_data.pop('productos', None)
        cuotas_data = validated_data.pop('cuotas', None)

        # Actualizar los campos del pedido
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()

        # Procesar productos
        if productos_data is not None:
            productos_antiguos = {pp.producto.id: pp for pp in instance.productos.all()}

            for producto_data in productos_data:
                producto = producto_data['producto']
                cantidad = producto_data['cantidad']

                if producto.id in productos_antiguos:
                    pp = productos_antiguos[producto.id]
                    cantidad_antigua = pp.cantidad

                    if cantidad > cantidad_antigua:
                        # Si la cantidad ha aumentado, restar la diferencia del stock
                        diferencia = cantidad - cantidad_antigua
                        if producto.cantidad < diferencia:
                            raise ValidationError(f"No hay suficiente stock para {producto.nombre_producto}.")
                        producto.cantidad -= diferencia  # Restar la diferencia del stock
                        producto.save()

                    elif cantidad < cantidad_antigua:
                        # Devolver el stock si la cantidad ha disminuido
                        diferencia = cantidad_antigua - cantidad
                        producto.cantidad += diferencia
                        producto.save()

                    # Actualizar la cantidad en el PedidoProducto
                    pp.cantidad = cantidad
                    pp.save()
                    productos_antiguos.pop(producto.id)
                else:
                    # Si es un producto nuevo, verificar y restar stock
                    if producto.cantidad < cantidad:
                        raise ValidationError(f"No hay suficiente stock para {producto.nombre_producto}.")
                    producto.cantidad -= cantidad
                    producto.save()

                    # Crear el nuevo PedidoProducto
                    PedidoProducto.objects.create(pedido=instance, **producto_data)

            # Eliminar productos que ya no están en el pedido y devolver el stock
            for pp in productos_antiguos.values():
                pp.producto.cantidad += pp.cantidad
                pp.producto.save()
                pp.delete()

        # Actualizar cuotas
        if cuotas_data is not None:
            # Eliminar cuotas antiguas y añadir nuevas
            instance.cuotas.all().delete()
            for cuota_data in cuotas_data:
                CuotaPago.objects.create(pedido=instance, **cuota_data)

        # Actualizar monto total
        instance.actualizar_monto_total()

        # Actualizar estado
        instance.actualizar_estado()

        return instance


# ====================
# Serializer para Detalle de Pedido
# ====================

class PedidoDetalleSerializer(serializers.ModelSerializer):
    productos = serializers.SerializerMethodField()
    cuotas = serializers.SerializerMethodField()
    cliente_nombre = serializers.CharField(source="cliente.nombre", read_only=True)
    pago_actual = serializers.SerializerMethodField()
    monto_pendiente = serializers.SerializerMethodField()

    class Meta:
        model = Pedido
        fields = [
            "id",
            "cliente_nombre",
            "nota",
            "fecha",
            "entregado",
            "pagado",
            "pago_actual",
            "monto_total",
            "monto_pendiente",
            "productos",
            "cuotas",
        ]

    def get_productos(self, obj):
        return [
            {
                "producto": pp.id,
                "producto_nombre": pp.producto.nombre_producto,
                "producto_descripcion": pp.producto.desc,
                "cantidad": pp.cantidad,
                "precio_unitario": pp.precio_unitario,
                "precio_total": pp.precio_total(),
            }
            for pp in obj.productos.all()
        ]

    def get_cuotas(self, obj):
        return [
            {
                "id": c.id,
                "numero": c.numero,
                "monto": c.monto,
                "pagado": c.pagado,
            }
            for c in obj.cuotas.all()
        ]

    def get_pago_actual(self, obj):
        if obj.tipo_pago == 'unico':
            return obj.pago
        return obj.total_pagado_cuotas

    def get_monto_pendiente(self, obj):
        pagado = self.get_pago_actual(obj)
        pendiente = obj.monto_total - pagado
        return pendiente if pendiente > 0 else 0
