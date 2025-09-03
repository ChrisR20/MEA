from django.contrib import admin
from .models import Pedido, PedidoProducto, PedidoEstado, CuotaPago

class PedidoProductoInline(admin.TabularInline):
    model = PedidoProducto
    extra = 1

@admin.register(Pedido)
class PedidoAdmin(admin.ModelAdmin):
    list_display = ['id', 'cliente', 'pago', 'fecha', 'entregado', 'pagado', 'estado']
    list_filter = ['entregado', 'fecha']
    search_fields = ['cliente__nombre']
    inlines = [PedidoProductoInline]

@admin.register(PedidoProducto)
class PedidoProductoAdmin(admin.ModelAdmin):
    list_display = ['pedido', 'producto', 'cantidad']
    search_fields = ['producto__nombre_producto']
    list_filter = ['producto']

@admin.register(PedidoEstado)
class PedidoEstadoAdmin(admin.ModelAdmin):
    list_display = ['nombre']

@admin.register(CuotaPago)
class CuotaPagoAdmin(admin.ModelAdmin):
    list_display = ['pedido', 'numero', 'monto', 'pagado']
