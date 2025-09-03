from django.contrib.auth import authenticate, login, logout
from django.http import JsonResponse
from django.middleware.csrf import get_token
from django.views.decorators.csrf import ensure_csrf_cookie
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny

@ensure_csrf_cookie
@api_view(['GET'])
@permission_classes([AllowAny])
def get_csrf_token(request):
    return JsonResponse({'csrfToken': get_token(request)})

@api_view(['POST'])
@permission_classes([AllowAny])
def api_login(request):
    try:
        data = request.data
        username = data.get('username')
        password = data.get('password')

        user = authenticate(request, username=username, password=password)
        if user:
            login(request, user)
            return JsonResponse({'success': True, 'username': user.username})
        else:
            return JsonResponse({'success': False, 'error': 'Credenciales inválidas'}, status=401)
    except Exception as e:
        return JsonResponse({'success': False, 'error': str(e)}, status=400)

@api_view(['POST'])
@permission_classes([AllowAny])
def api_logout(request):
    logout(request)
    return JsonResponse({'success': True})

@api_view(['GET'])
@permission_classes([AllowAny])
def usuario_logueado(request):
    if request.user.is_authenticated:
        return JsonResponse({'authenticated': True, 'username': request.user.username})
    else:
        return JsonResponse({'authenticated': False}, status=401)
