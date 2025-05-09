from flask import Blueprint, request, jsonify
from ..utils.db import cursor, db  # Importar cursor y db desde utils/db.py
from utils.helpers import hash_password, verify_password
from app.utils.mail import enviar_correo_eliminacion
import base64

user_bp = Blueprint('user', __name__)

@user_bp.route('/login', methods=['POST'])
def login():
    data = request.json
    user = data.get('user')
    password = data.get('password')

    cursor.execute("SELECT * FROM users WHERE user = %s", (user,))
    user_data = cursor.fetchone()

    if user_data and verify_password(user_data['password'], password):
        profile_base64 = f"data:image/png;base64,{base64.b64encode(user_data['profile']).decode('utf-8')}" if user_data['profile'] else None
        return jsonify(success=True, nombre=user_data['name'], apellido=user_data['surname'],
                       role=user_data['role'], profile=profile_base64, email=user_data['email'])

    return jsonify(success=False, message="Usuario o contraseña incorrectos.")

@user_bp.route('/verify-user', methods=['POST'])
def verify_user():
    user = request.get_json().get('user')
    cursor.execute("SELECT * FROM users WHERE user = %s", (user,))
    return jsonify(exists=bool(cursor.fetchone()))

@user_bp.route('/delete-user', methods=['DELETE'])
def delete_user():
    data = request.get_json()
    user, password = data.get('user'), data.get('password')

    cursor.execute("SELECT * FROM users WHERE user = %s", (user,))
    user_data = cursor.fetchone()
    if not user_data or not verify_password(user_data['password'], password):
        return jsonify(success=False, message="Credenciales inválidas.")

    cursor.execute("DELETE FROM users WHERE user = %s", (user,))
    db.commit()

    if cursor.rowcount > 0 and user_data.get("email"):
        enviar_correo_eliminacion(user_data["email"], user)

    return jsonify(success=True, message="Cuenta eliminada.")
