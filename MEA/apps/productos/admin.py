from django.contrib import admin
from .models import Stock

@admin.register(Stock)
class StockAdmin(admin.ModelAdmin):
    list_display = ['nombre_producto', 'marca', 'cantidad', 'precio']
    list_filter = ['marca']
    search_fields = ['nombre_producto', 'desc', 'codigo']
    ordering = ['nombre_producto']
