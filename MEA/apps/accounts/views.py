from django.contrib.auth import authenticate, login, logout
from django.http import JsonResponse
from django.middleware.csrf import get_token
from django.views.decorators.csrf import ensure_csrf_cookie
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated


# ======================================================
# 🔐 Vista para obtener el token CSRF
# ======================================================
# Esta vista:
# - Genera el token CSRF
# - Lo devuelve en la respuesta JSON
# - Además asegura que la cookie CSRF se envíe al navegador
#
# Se utiliza normalmente antes de hacer login desde el frontend
# cuando se trabaja con autenticación basada en sesión.
@ensure_csrf_cookie
@api_view(['GET'])
@permission_classes([AllowAny])
def get_csrf_token(request):
    return JsonResponse({
        'csrfToken': get_token(request)
    })


# ======================================================
# 🔐 Vista para login de usuario
# ======================================================
# Esta vista:
# - Recibe username y password desde el frontend
# - Autentica al usuario
# - Si las credenciales son válidas, inicia sesión
# - Devuelve información básica del usuario autenticado
#
# Usa autenticación basada en sesión (login de Django).
@api_view(['POST'])
@permission_classes([AllowAny])
def api_login(request):
    data = request.data
    username = data.get('username')
    password = data.get('password')

    user = authenticate(request, username=username, password=password)

    if user is not None:
        login(request, user)
        return JsonResponse({
            'success': True,
            'username': user.username
        })
    
    return JsonResponse({
        'success': False,
        'error': 'Credenciales inválidas'
    }, status=401)


# ======================================================
# 🔐 Vista para cerrar sesión
# ======================================================
# Esta vista:
# - Cierra la sesión del usuario autenticado
# - Elimina la sesión activa
# - Devuelve confirmación de logout
@api_view(['POST'])
@permission_classes([AllowAny])
def api_logout(request):
    logout(request)
    return JsonResponse({
        'success': True
    })


# ======================================================
# 🔑 Verificar permisos de usuario
# ======================================================
# Devuelve true si el usuario es admin, staff o superuser
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def is_permission(request):
    user = request.user
    has_permission = user.is_staff or user.is_superuser or user.is_superuser
    print("tiene permiso",has_permission)
    return JsonResponse({'hasPermission': has_permission})