from django.db import models


class Empresa(models.Model):
    nombre = models.CharField(max_length=200)
    logo = models.ImageField(
        upload_to="empresas/logos/",
        blank=True,
        null=True,
    )
    color = models.CharField(max_length=20, blank=True)
    url = models.CharField(max_length=100, unique=True)
    activa = models.BooleanField(default=True)

    class Meta:
        verbose_name = "Empresa"
        verbose_name_plural = "Empresas"
        ordering = ["nombre"]

    def __str__(self):
        return self.nombre