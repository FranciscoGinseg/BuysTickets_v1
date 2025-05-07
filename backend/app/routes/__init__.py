# app/routes/__init__.py

# Aquí puedes inicializar cualquier cosa que sea necesario en esta carpeta
# Por lo general, no es necesario colocar nada en este archivo, pero puedes poner configuraciones globales si es necesario

from .auth import auth_bp
from .user import user_bp
from .premium import premium_bp
