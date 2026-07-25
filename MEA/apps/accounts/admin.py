from django.contrib import admin

from .models import UsuarioEmpresa

@admin.register(UsuarioEmpresa)
class UsuarioEmpresaAdmin(admin.ModelAdmin):

    list_display = (
        "usuario",
        "empresa",
        "grupo",
        "activo",
        "fecha_alta",
    )

    list_filter = (
        "empresa",
        "grupo",
        "activo",
    )

    search_fields = (
        "usuario__username",
        "empresa__nombre",
    )