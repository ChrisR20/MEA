from django.db import models
from django_cryptography.fields import encrypt

# Cliente con teléfono encriptado
class Cliente(models.Model):
    nombre = models.CharField(max_length=150)
    telefono = encrypt(models.CharField(max_length=150))

    def __str__(self):
        return self.nombre