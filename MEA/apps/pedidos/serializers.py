from rest_framework import serializers
from rest_framework.exceptions import ValidationError

from .models import Pedido, PedidoProducto, PedidoEstado, CuotaPago
from apps.clientes.models import Cliente
from apps.marcas.models import Marca
from apps.productos.models import Stock



class PedidoProductoSerializer(serializers.ModelSerializer):
    producto = serializers.PrimaryKeyRelatedField(queryset=Stock.objects.all())
    producto_nombre = serializers.CharField(source='producto.nombre_producto', read_only=True)
    precio_unitario = serializers.DecimalField(max_digits=10, decimal_places=2, read_only=True)
    precio_total = serializers.SerializerMethodField()

    class Meta:
        model = PedidoProducto
        fields = ['producto', 'producto_nombre', 'cantidad', 'precio_unitario', 'precio_total']

    def get_precio_total(self, obj):
        return obj.precio_total()


class CuotaPagoSerializer(serializers.ModelSerializer):
    class Meta:
        model = CuotaPago
        fields = ['id', 'numero', 'monto', 'pagado']


class PedidoSerializer(serializers.ModelSerializer):
    cliente = serializers.PrimaryKeyRelatedField(queryset=Cliente.objects.all())
    cliente_nombre = serializers.CharField(source='cliente.nombre', read_only=True)
    productos = PedidoProductoSerializer(many=True)
    cuotas = CuotaPagoSerializer(many=True, required=False)

    # Pago editable que guarda el pago único o 0 si es por cuotas
    pago = serializers.DecimalField(max_digits=10, decimal_places=2, required=False, default=0)

    # Nuevo campo de solo lectura para mostrar pago efectivo (único o total cuotas)
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

    def validate(self, attrs):
        cliente = attrs.get('cliente')
        if self.instance is None and cliente is not None:
            pendiente_estado = PedidoEstado.objects.filter(nombre__iexact="Pendiente").first()
            if pendiente_estado and Pedido.objects.filter(cliente=cliente, estado=pendiente_estado).exists():
                raise ValidationError(f"El cliente {cliente.nombre} ya tiene un pedido Pendiente.")
        return attrs

    def validate_productos(self, productos_data):
        for pd in productos_data:
            producto = pd['producto']
            cant_nueva = pd['cantidad']
            cant_vieja = self.instance.cantidad_producto(producto.id) if self.instance else 0
            disponible = producto.cantidad + cant_vieja
            if cant_nueva > disponible:
                raise ValidationError(f"No hay suficiente stock para {producto.nombre_producto}.")
        return productos_data

    def validate_pago(self, value):
        tipo_pago = self.initial_data.get('tipo_pago', self.instance.tipo_pago if self.instance else None)
        monto_total = self.instance.monto_total if self.instance else None

        if tipo_pago == 'unico' and monto_total is not None and value > monto_total:
            raise ValidationError(f"El pago no puede ser mayor al monto total ({monto_total}).")
        return value

    def create(self, validated_data):
        productos_data = validated_data.pop('productos')
        cuotas_data = validated_data.pop('cuotas', None)
        tipo_pago = validated_data.get('tipo_pago', 'unico')
        pago = validated_data.get('pago', 0)

        pedido = Pedido.objects.create(**validated_data)

        for pd in productos_data:
            prod = pd['producto']
            if prod.cantidad < pd['cantidad']:
                raise ValidationError(f"No hay stock para '{prod.nombre_producto}'.")
            prod.cantidad -= pd['cantidad']
            prod.save()
            PedidoProducto.objects.create(pedido=pedido, producto=prod, cantidad=pd['cantidad'])

        pedido.actualizar_monto_total()

        if tipo_pago == 'unico':
            pedido.pago = pago
            pedido.pagado = pedido.pago >= pedido.monto_total and pedido.monto_total > 0
            pedido.save(update_fields=['pago', 'pagado'])

        elif tipo_pago == 'cuotas':
            pedido.pago = 0
            pedido.save(update_fields=['pago'])
            if cuotas_data:
                for c in cuotas_data:
                    CuotaPago.objects.create(pedido=pedido, numero=c['numero'],
                                             monto=c['monto'], pagado=c.get('pagado', False))
            else:
                cuota_monto = round(pedido.monto_total / 3, 2)
                for i in range(3):
                    CuotaPago.objects.create(pedido=pedido, numero=i+1, monto=cuota_monto, pagado=False)
            pedido.actualizar_pago_desde_cuotas()

        pedido.actualizar_estado()
        return pedido

    def update(self, instance, validated_data):
        productos_data = validated_data.pop('productos', None)
        cuotas_data = validated_data.pop('cuotas', None)
        tipo_pago = validated_data.get('tipo_pago', instance.tipo_pago)
    
        if productos_data is not None:
            # Opcional: devolver stock anterior (no implementado aquí)
            instance.productos.all().delete()
            for pd in productos_data:
                PedidoProducto.objects.create(pedido=instance,
                                              producto=pd['producto'],
                                              cantidad=pd['cantidad'])
    
        if tipo_pago == 'unico':
            instance.cuotas.all().delete()
            pago_nuevo = validated_data.get('pago', instance.pago)
            instance.pago = pago_nuevo
            instance.pagado = pago_nuevo >= instance.monto_total and instance.monto_total > 0
            # Guardar inmediatamente para actualizar campo pago
            instance.save(update_fields=['pago', 'pagado'])
    
        elif tipo_pago == 'cuotas':
            validated_data['pago'] = 0
            actuales_c = {c.numero: c for c in instance.cuotas.all()}
            enviados = set()
    
            if cuotas_data:
                for c in cuotas_data:
                    num = c['numero']
                    enviados.add(num)
                    obj = actuales_c.get(num)
                    if obj:
                        obj.monto = c['monto']
                        obj.pagado = c.get('pagado', obj.pagado)
                        obj.save()
                    else:
                        CuotaPago.objects.create(pedido=instance, numero=num,
                                                 monto=c['monto'], pagado=c.get('pagado', False))
                for num in set(actuales_c) - enviados:
                    actuales_c[num].delete()
            instance.actualizar_pago_desde_cuotas()
    
        # Actualizar otros campos
        for attr in ['cliente', 'nota', 'entregado', 'pagado', 'tipo_pago', 'estado']:
            if attr in validated_data:
                setattr(instance, attr, validated_data[attr])
    
        # Recalcular monto total (no afecta pago)
        instance.actualizar_monto_total()
    
        # Actualizar estado
        instance.actualizar_estado()
    
        # Guardar resto de cambios (excluyendo pago y pagado ya guardados)
        instance.save(update_fields=['cliente', 'nota', 'entregado', 'pagado', 'tipo_pago', 'estado'])
    
        return instance
