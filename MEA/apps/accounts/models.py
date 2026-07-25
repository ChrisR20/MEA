from django.db import models
from django.contrib.auth.models import User
from apps.empresas.models import Empresa


class UsuarioEmpresa(models.Model):
    usuario = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="empresas"
    )

    empresa = models.ForeignKey(
        Empresa,
        on_delete=models.CASCADE,
        related_name="usuarios"
    )

    grupo = models.ForeignKey(
        "auth.Group",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="usuarios_empresa"
    )

    activo = models.BooleanField(default=True)

    fecha_alta = models.DateTimeField(
        auto_now_add=True
    )


    class Meta:
        unique_together = (
            "usuario",
            "empresa",
        )

    def __str__(self):
        return f"{self.usuario} - {self.empresa}"