from flask import Blueprint, jsonify, request, send_file
from werkzeug.utils import secure_filename
import mysql.connector
from io import BytesIO
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import os
from utils.db import cursor, db  # Asegúrate de que `db` esté correctamente importado

# Configuración de la contraseña de Gmail desde una variable de entorno
GMAIL_PASSWORD = os.getenv("GMAIL_PASSWORD")

solicitudes_bp = Blueprint('solicitudes', __name__)

@solicitudes_bp.route('/solicitar-discapacidad', methods=['POST'])
def solicitar_discapacidad():
    nombre = request.form.get("nombre")
    apellido = request.form.get("apellido")
    dni = request.form.get("dni")
    grado_discapacidad = request.form.get("grado_discapacidad")
    usuario = request.form.get("usuario")
    archivo = request.files.get("archivo")

    if not all([nombre, apellido, dni, grado_discapacidad, usuario]):
        return jsonify(success=False, message="Faltan datos obligatorios.")

    # Verificamos si el archivo existe
    archivo_bytes = None
    archivo_nombre = None
    if archivo:
        archivo_nombre = secure_filename(archivo.filename)
        archivo_bytes = archivo.read()  # Se guarda como BLOB

    try:
        # Verificar si ya existe una solicitud con ese DNI o usuario
        cursor.execute("SELECT id FROM solicitudes_discapacidad WHERE dni = %s OR usuario = %s", (dni, usuario))
        if cursor.fetchone():
            return jsonify(success=False, message="Ya existe una solicitud para este usuario o DNI.")

        # Insertar solicitud con archivo como BLOB
        cursor.execute(""" 
            INSERT INTO solicitudes_discapacidad 
            (nombre, apellido, dni, grado_discapacidad, archivo, archivo_nombre, estado, fecha_solicitud, usuario) 
            VALUES (%s, %s, %s, %s, %s, %s, %s, NOW(), %s)
        """, (nombre, apellido, dni, grado_discapacidad, archivo_bytes, archivo_nombre, "pendiente", usuario))

        # Marcar al usuario como cuenta con discapacidad
        cursor.execute("UPDATE users SET discapacidad = %s WHERE user = %s", ("sí", usuario))

        db.commit()
        return jsonify(success=True)
    except mysql.connector.Error as err:
        db.rollback()  # Hacer rollback en caso de error
        return jsonify(success=False, message="Error en la solicitud: " + str(err))

@solicitudes_bp.route('/solicitudes-discapacidad', methods=['GET'])
def listar_solicitudes_discapacidad():
    try:
        cursor.execute(""" 
            SELECT id, nombre, apellido, dni, grado_discapacidad, archivo_nombre, estado 
            FROM solicitudes_discapacidad
        """)
        solicitudes = cursor.fetchall()

        if not solicitudes:
            return jsonify(success=False, message="No hay solicitudes de discapacidad disponibles.")

        # Formatear las solicitudes para respuesta JSON
        solicitudes_formateadas = [{
            'id': solicitud['id'],
            'nombre': solicitud['nombre'],
            'apellido': solicitud['apellido'],
            'dni': solicitud['dni'],
            'grado_discapacidad': solicitud['grado_discapacidad'],
            'archivo_nombre': solicitud['archivo_nombre'],
            'estado': solicitud['estado']
        } for solicitud in solicitudes]

        return jsonify(success=True, solicitudes=solicitudes_formateadas), 200

    except mysql.connector.Error as err:
        return jsonify(success=False, message=f"Error al obtener solicitudes: {str(err)}"), 500

@solicitudes_bp.route('/archivo-solicitud/<int:solicitud_id>', methods=['GET'])
def descargar_archivo_blob(solicitud_id):
    try:
        cursor.execute("SELECT archivo, archivo_nombre FROM solicitudes_discapacidad WHERE id = %s", (solicitud_id,))
        result = cursor.fetchone()
        if not result:
            return "Archivo no encontrado", 404

        archivo_bytes = result['archivo']
        archivo_nombre = result.get('archivo_nombre', f"archivo_{solicitud_id}.pdf")  # nombre por defecto

        return send_file(
            BytesIO(archivo_bytes),
            download_name=archivo_nombre,
            as_attachment=True
        )
    except Exception as e:
        print(f"❌ Error al servir el archivo: {e}")
        return "Error al descargar archivo", 500

# Función para enviar el correo de notificación
def enviar_correo_estado(destinatario, nombre_usuario, estado):
    remitente = "buystickets.customer@gmail.com"

    asunto = "Resultado de solicitud de cuenta con discapacidad"
    if estado == "aprobada":
        cuerpo = f"""Hola {nombre_usuario},

        Tu solicitud de cuenta con discapacidad ha sido APROBADA.
        Ya puedes acceder a los beneficios asociados a este tipo de cuenta.

        Gracias por confiar en BuyTickets.

        El equipo de BuyTickets
        """
    else:  # En caso de que sea "rechazada"
        cuerpo = f"""Hola {nombre_usuario},

        Lamentamos informarte que tu solicitud de cuenta con discapacidad ha sido RECHAZADA.

        Si tienes dudas o deseas más información, no dudes en contactarnos.

        El equipo de BuyTickets
        """

    mensaje = MIMEMultipart("alternative")
    mensaje["Subject"] = asunto
    mensaje["From"] = remitente
    mensaje["To"] = destinatario
    mensaje.attach(MIMEText(cuerpo, "plain"))

    try:
        servidor = smtplib.SMTP("smtp.gmail.com", 587)
        servidor.starttls()
        servidor.login(remitente, GMAIL_PASSWORD)
        servidor.sendmail(remitente, destinatario, mensaje.as_string())
        servidor.quit()
        print(f"✅ Correo de notificación enviado a {destinatario}")
    except Exception as e:
        print(f"❌ Error al enviar correo de estado: {e}")

# Ruta para actualizar el estado de la solicitud
@solicitudes_bp.route('/actualizar-estado-solicitud', methods=['POST'])
def actualizar_estado_solicitud():
    data = request.get_json()
    solicitud_id = data.get("id")
    nuevo_estado = data.get("estado")

    if not solicitud_id or not nuevo_estado:
        return jsonify(success=False, message="Datos incompletos")

    try:
        # Obtener usuario vinculado a la solicitud
        cursor.execute("SELECT usuario FROM solicitudes_discapacidad WHERE id = %s", (solicitud_id,))
        result = cursor.fetchone()
        if not result:
            return jsonify(success=False, message="Solicitud no encontrada")
        
        usuario = result["usuario"]

        # Actualizar el estado de la solicitud
        cursor.execute("UPDATE solicitudes_discapacidad SET estado = %s WHERE id = %s", (nuevo_estado, solicitud_id))
        db.commit()

        # Verificar si la actualización fue exitosa
        if cursor.rowcount > 0:
            # Enviar correo de notificación al usuario
            cursor.execute("SELECT email FROM users WHERE user = %s", (usuario,))
            user_info = cursor.fetchone()
            email = user_info["email"] if user_info else None

            if email:
                enviar_correo_estado(email, usuario, nuevo_estado)

            return jsonify(success=True, message="Estado de la solicitud actualizado")
        else:
            return jsonify(success=False, message="No se pudo actualizar el estado de la solicitud.")

    except mysql.connector.Error as err:
        return jsonify(success=False, message="Error al actualizar el estado: " + str(err))

@solicitudes_bp.route('/estado-solicitud/<dni>', methods=['GET'])
def obtener_estado_solicitud(dni):
    try:
        cursor.execute("SELECT estado FROM solicitudes_discapacidad WHERE dni = %s", (dni,))
        result = cursor.fetchone()
        if result:
            return jsonify(success=True, estado=result["estado"])
        else:
            return jsonify(success=False, message="No se encontró la solicitud."), 404
    except mysql.connector.Error as err:
        return jsonify(success=False, message="Error al consultar el estado: " + str(err)), 500
