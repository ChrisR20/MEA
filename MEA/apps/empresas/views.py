from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from .models import Empresa
from .serializers import EmpresaSerializer

@api_view(['GET'])
def get_empresa_info(request):
    # Ejemplo: Traer la primera empresa activa
    empresa = Empresa.objects.filter(activa=True).first()
    if not empresa:
        return Response({"detail": "No hay empresa configurada"}, status=404)
        
    serializer = EmpresaSerializer(empresa, context={'request': request})
    return Response(serializer.data)