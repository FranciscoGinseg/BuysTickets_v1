from flask import Blueprint, request, jsonify
from werkzeug.security import check_password_hash, generate_password_hash
from app.utils.db import cursor, db
import base64, re

auth_bp = Blueprint('auth', __name__)

# Ruta para login
@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.json
    user = data.get('user')
    password = data.get('password')

    if not user or not password:
        return jsonify(success=False, message="Usuario y contraseña son obligatorios.")

    cursor.execute("SELECT * FROM users WHERE user = %s", (user,))
    user_data = cursor.fetchone()

    if user_data and check_password_hash(user_data['password'], password):
        # Convertir imagen a base64 si existe
        profile_base64 = None
        if user_data['profile']:
            profile_base64 = f"data:image/png;base64,{base64.b64encode(user_data['profile']).decode('utf-8')}"

        return jsonify(
            success=True,
            nombre=user_data['name'],
            apellido=user_data['surname'],
            role=user_data['role'],
            profile=profile_base64,
            email=user_data['email']
        )

    return jsonify(success=False, message="Usuario o contraseña incorrectos.")

# Ruta para registro
@auth_bp.route('/register', methods=['POST'])
def register():
    user = request.form.get('user')
    password = request.form.get('password')
    nombre = request.form.get('nombre')
    apellido = request.form.get('apellido')
    email = request.form.get('email')
    role = "estandar"

    if not user or not password or not nombre or not apellido or not email:
        return jsonify(success=False, message="Todos los campos son obligatorios.")

    # Validación del nombre de usuario
    forbidden_pattern = r".*admin.*|.*administrador.*|.*root.*|.*super.*"
    if re.search(forbidden_pattern, user, re.IGNORECASE):
        return jsonify(success=False, message="El nombre de usuario no está permitido.")

    # Verificación de existencia del usuario
    cursor.execute("SELECT * FROM users WHERE user = %s", (user,))
    if cursor.fetchone():
        return jsonify(success=False, message="Nombre de usuario ya en uso.")

    # Verificación de existencia del correo
    cursor.execute("SELECT * FROM users WHERE email = %s", (email,))
    if cursor.fetchone():
        return jsonify(success=False, message="Correo ya registrado.")

    # Leer imagen si se envió
    profile = request.files['profile'].read() if 'profile' in request.files else None
    hashed_password = generate_password_hash(password, method='pbkdf2:sha256')

    try:
        cursor.execute("""
            INSERT INTO users (user, password, name, surname, email, role, profile)
            VALUES (%s, %s, %s, %s, %s, %s, %s)
        """, (user, hashed_password, nombre, apellido, email, role, profile))
        db.commit()
        return jsonify(success=True)
    except Exception as err:
        return jsonify(success=False, message=f"Error al registrar: {err}")
