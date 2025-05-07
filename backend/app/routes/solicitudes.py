from flask import Blueprint, jsonify
from utils.db import cursor

solicitudes_bp = Blueprint('solicitudes', __name__)

@solicitudes_bp.route('/solicitudes-discapacidad', methods=['GET'])
def listar_solicitudes_discapacidad():
    try:
        cursor.execute("SELECT id, nombre, apellido, dni, grado_discapacidad, archivo_nombre, estado FROM solicitudes_discapacidad")
        solicitudes = cursor.fetchall()

        if not solicitudes:
            return jsonify(success=False, message="No hay solicitudes de discapacidad disponibles.")

        return jsonify(success=True, solicitudes=solicitudes), 200

    except Exception as e:
        return jsonify(success=False, message=str(e)), 500
