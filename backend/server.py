from flask import Flask, request, jsonify
from flask_cors import CORS
import mysql.connector
from werkzeug.security import generate_password_hash, check_password_hash
from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import os
from werkzeug.utils import secure_filename
from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import mysql.connector
from flask import send_file
from PIL import Image
from io import BytesIO
from email.mime.image import MIMEImage
import mimetypes

app = Flask(__name__)
CORS(app)

# Configuración
UPLOAD_FOLDER = 'uploads/discapacidad'
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER


db = mysql.connector.connect(
    host="localhost",
    user="root",
    password="",
    database="buystickets"
)
cursor = db.cursor(dictionary=True)

import base64

@app.route('/login', methods=['POST'])
def login():
    data = request.json
    user = data.get('user')
    password = data.get('password')

    cursor.execute("SELECT * FROM users WHERE user = %s", (user,))
    user_data = cursor.fetchone()

    if user_data and check_password_hash(user_data['password'], password):
        # Convertir imagen a base64 si existe
        profile_base64 = None
        if user_data['profile']:
            profile_base64 = f"data:image/png;base64,{base64.b64encode(user_data['profile']).decode('utf-8')}"

        return jsonify(success=True, 
                    nombre=user_data['name'], 
                    apellido=user_data['surname'], 
                    role=user_data['role'], 
                    profile=profile_base64,
                    email=user_data['email'])

    return jsonify(success=False, message="Usuario o contraseña incorrectos.")


import re  # Importamos el módulo para expresiones regulares

# Verifica que el archivo sea una imagen válida antes de proceder
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif'}

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

# Actualización del registro para verificar si el archivo tiene una extensión válida
@app.route('/register', methods=['POST'])
def register():
    user = request.form['user']
    password = request.form['password']
    nombre = request.form['nombre']
    apellido = request.form['apellido']
    email = request.form['email']
    role = "estandar"

    # Verificar que el archivo de imagen tenga una extensión válida
    if 'profile' in request.files:
        file = request.files['profile']
        if not allowed_file(file.filename):
            return jsonify(success=False, message="Formato de archivo no permitido. Solo se permiten imágenes PNG, JPG, JPEG y GIF.")

        profile = file.read()  # Leer la imagen en binario
    else:
        profile = None

    forbidden_pattern = r".*admin.*|.*administrador.*|.*root.*|.*super.*"
    if re.search(forbidden_pattern, user, re.IGNORECASE):
        return jsonify(success=False, message="El nombre de usuario no está permitido. Por favor, elige otro.")

    # Verificar si el usuario ya existe
    cursor.execute("SELECT * FROM users WHERE user = %s", (user,))
    if cursor.fetchone():
        return jsonify(success=False, message="El nombre de usuario ya está en uso. Por favor, elige otro.")

    # Verificar si el correo ya existe
    cursor.execute("SELECT * FROM users WHERE email = %s", (email,))
    if cursor.fetchone():
        return jsonify(success=False, message="Este correo ya está registrado. Por favor, usa otro.")

    hashed_password = generate_password_hash(password, method='pbkdf2:sha256')

    try:
        cursor.execute("""
            INSERT INTO users (user, password, name, surname, email, role, profile)
            VALUES (%s, %s, %s, %s, %s, %s, %s)
        """, (user, hashed_password, nombre, apellido, email, role, profile))
        db.commit()
        return jsonify(success=True)
    except mysql.connector.Error as err:
        return jsonify(success=False, message="Error al registrar el usuario: " + str(err))


UPLOAD_FOLDER = 'uploads/'  # Define donde se guardarán las imágenes
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif'}

app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

# Verifica si la extensión del archivo es válida
def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

# Actualización de los datos del usuario, incluyendo la imagen de perfil como binario
@app.route('/update-user', methods=['POST'])
def update_user():
    data = request.form
    user = data.get('user')
    nombre = data.get('nombre')
    apellido = data.get('apellido')
    email = data.get('email')
    new_password = data.get('newPassword')

    # Obtener el archivo de perfil si existe
    profile = request.files.get('profile')

    if not user:
        return jsonify(success=False, message="Falta el nombre de usuario.")

    # Si se proporciona una nueva contraseña, generamos el hash
    hashed_password = generate_password_hash(new_password, method='pbkdf2:sha256') if new_password else None

    # Intentamos actualizar los datos
    try:
        if nombre and apellido:
            cursor.execute("UPDATE users SET name=%s, surname=%s WHERE user=%s", (nombre, apellido, user))
        if email:
            cursor.execute("UPDATE users SET email=%s WHERE user=%s", (email, user))
        if hashed_password:
            cursor.execute("UPDATE users SET password=%s WHERE user=%s", (hashed_password, user))

        # Si hay una nueva imagen de perfil, la guardamos como BLOB en la base de datos
        if profile:
            profile_data = profile.read()  # Lee el contenido del archivo como binario
            cursor.execute("UPDATE users SET profile=%s WHERE user=%s", (profile_data, user))  # Almacena la imagen como BLOB

        db.commit()
        return jsonify(success=True, message="Datos actualizados correctamente.")
    except mysql.connector.Error as err:
        return jsonify(success=False, message=str(err))

    
def enviar_correo_eliminacion(destinatario, nombre_usuario):
    remitente = "buystickets.customer@gmail.com"
    contraseña = "ikch pecb cuzu dkdn"  # Contraseña de aplicación de Gmail

    mensaje = MIMEMultipart("alternative")
    mensaje["Subject"] = "Cuenta eliminada"
    mensaje["From"] = remitente
    mensaje["To"] = destinatario

    texto = f"""
Hola {nombre_usuario},

Tu cuenta ha sido eliminada correctamente de BuyTickets.

Si no realizaste esta acción o tienes dudas, por favor contáctanos.

Atentamente,
El equipo de BuyTickets
"""
    mensaje.attach(MIMEText(texto, "plain"))

    try:
        servidor = smtplib.SMTP("smtp.gmail.com", 587)
        servidor.ehlo()
        servidor.starttls()
        servidor.login(remitente, contraseña)
        servidor.sendmail(remitente, destinatario, mensaje.as_string())
        servidor.quit()
        print(f"✅ Correo enviado a {destinatario}")
    except Exception as e:
        print(f"❌ Error al enviar correo: {e}")

@app.route('/delete-user', methods=['DELETE'])
def delete_user():
    data = request.get_json()
    user = data.get('user')
    password = data.get('password')

    print("📥 Solicitud para eliminar usuario:", user)

    if not user or not password:
        return jsonify(success=False, message="Faltan datos necesarios.")

    try:
        cursor.execute("SELECT * FROM users WHERE user = %s", (user,))
        user_data = cursor.fetchone()

        if not user_data:
            print("❌ Usuario no encontrado en la base de datos")
            return jsonify(success=False, message="Usuario no encontrado.")

        if not check_password_hash(user_data['password'], password):
            print("❌ Contraseña incorrecta")
            return jsonify(success=False, message="Contraseña incorrecta.")

        cursor.execute("DELETE FROM users WHERE user = %s", (user,))
        db.commit()

        if cursor.rowcount == 0:
            print("❌ No se eliminó ninguna fila (¿ya estaba borrado?)")
            return jsonify(success=False, message="No se pudo eliminar el usuario.")

        print("✅ Usuario eliminado correctamente")

        # Enviar correo si hay un email registrado
        if user_data.get("email"):
            enviar_correo_eliminacion(user_data["email"], user_data["user"])

        return jsonify(success=True, message="Cuenta eliminada permanentemente.")

    except mysql.connector.Error as err:
        print("❌ Error en MySQL:", err)
        return jsonify(success=False, message="Error de base de datos.")

@app.route('/verify-user', methods=['POST'])
def verify_user():
    data = request.get_json()
    user = data.get('user')

    if not user:
        return jsonify(exists=False, message="Falta el nombre de usuario.")

    cursor.execute("SELECT * FROM users WHERE user = %s", (user,))
    user_data = cursor.fetchone()

    if user_data:
        return jsonify(exists=True)
    else:
        return jsonify(exists=False)

from datetime import datetime, timedelta

@app.route('/update-role-to-premium', methods=['POST'])
def update_role_to_premium():
    data = request.get_json()
    user_id = data.get('user_id')
    payment_status = data.get('payment_status')  # El estado del pago, 'COMPLETED' en caso de éxito

    if not user_id or not payment_status:
        return jsonify(success=False, message="Faltan datos necesarios.")

    # Verificar si el pago fue exitoso
    if payment_status != "COMPLETED":
        return jsonify(success=False, message="El pago no fue exitoso.")

    try:
        # Calcular la fecha de expiración (3 meses a partir de ahora)
        expiry_date = datetime.now() + timedelta(weeks=13)  # 3 meses

        # Cambiar el rol a 'premium' en la base de datos y actualizar la fecha de expiración
        cursor.execute("""
            UPDATE users
            SET role = %s, subscription_expiry_date = %s
            WHERE id = %s
        """, ("premium", expiry_date, user_id))
        db.commit()

        # Verificar si el cambio fue exitoso
        if cursor.rowcount > 0:
            return jsonify(success=True, message="Rol actualizado a Premium.", expiry_date=expiry_date.strftime("%Y-%m-%d"))
        else:
            return jsonify(success=False, message="No se pudo actualizar el rol.")

    except mysql.connector.Error as err:
        return jsonify(success=False, message="Error al actualizar el rol: " + str(err))

import random

# Mapeo temporal de usuarios a códigos (puedes usar una tabla en BD si prefieres)
reset_codes = {}

def enviar_codigo_correo(destinatario, nombre_usuario, codigo):
    remitente = "buystickets.customer@gmail.com"
    contraseña = "ikch pecb cuzu dkdn"  # Contraseña de aplicación de Gmail

    mensaje = MIMEMultipart("alternative")
    mensaje["Subject"] = "Código de recuperación de contraseña"
    mensaje["From"] = remitente
    mensaje["To"] = destinatario

    texto = f"""
Hola {nombre_usuario},

Has solicitado recuperar tu contraseña. Este es tu código de verificación:

🔐 Código: {codigo}

Si no solicitaste este cambio, ignora este mensaje.

El equipo de BuyTickets
"""
    mensaje.attach(MIMEText(texto, "plain"))

    try:
        servidor = smtplib.SMTP("smtp.gmail.com", 587)
        servidor.ehlo()
        servidor.starttls()
        servidor.login(remitente, contraseña)
        servidor.sendmail(remitente, destinatario, mensaje.as_string())
        servidor.quit()
        print(f"✅ Código de recuperación enviado a {destinatario}")
    except Exception as e:
        print(f"❌ Error al enviar el código: {e}")

@app.route('/send-recovery-code', methods=['POST'])
def send_recovery_code():
    data = request.get_json()
    user = data.get("user")

    cursor.execute("SELECT * FROM users WHERE user=%s", (user,))
    user_data = cursor.fetchone()

    if not user_data:
        return jsonify(success=False, message="Usuario no encontrado.")

    codigo = str(random.randint(10000000, 99999999))  # Código de 8 dígitos
    reset_codes[user] = codigo

    enviar_codigo_correo(user_data["email"], user, codigo)
    return jsonify(success=True, message="Código enviado.")

@app.route('/verify-recovery-code', methods=['POST'])
def verify_recovery_code():
    data = request.get_json()
    user = data.get("user")
    code = data.get("code")

    if reset_codes.get(user) == code:
        return jsonify(success=True)
    return jsonify(success=False, message="Código incorrecto o expirado.")


@app.route('/change-password', methods=['POST'])
def change_password():
    data = request.get_json()
    user = data.get("user")
    new_password = data.get("new_password")

    hashed = generate_password_hash(new_password)

    try:
        cursor.execute("UPDATE users SET password=%s WHERE user=%s", (hashed, user))
        db.commit()

        # Notificar al usuario por email (opcional)
        cursor.execute("SELECT email FROM users WHERE user=%s", (user,))
        email_result = cursor.fetchone()
        if email_result:
            enviar_notificacion_cambio(email_result["email"], user)

        # Eliminar código usado
        if user in reset_codes:
            del reset_codes[user]

        return jsonify(success=True, message="Contraseña actualizada.")
    except:
        return jsonify(success=False, message="Error al cambiar la contraseña.")

def enviar_notificacion_cambio(destinatario, nombre_usuario):
    remitente = "buystickets.customer@gmail.com"
    contraseña = "ikch pecb cuzu dkdn"

    mensaje = MIMEMultipart("alternative")
    mensaje["Subject"] = "Contraseña cambiada"
    mensaje["From"] = remitente
    mensaje["To"] = destinatario

    texto = f"""
Hola {nombre_usuario},

Tu contraseña ha sido cambiada correctamente.

Si no realizaste este cambio, contacta con nosotros inmediatamente.

El equipo de BuyTickets
"""
    mensaje.attach(MIMEText(texto, "plain"))

    try:
        servidor = smtplib.SMTP("smtp.gmail.com", 587)
        servidor.ehlo()
        servidor.starttls()
        servidor.login(remitente, contraseña)
        servidor.sendmail(remitente, destinatario, mensaje.as_string())
        servidor.quit()
        print(f"✅ Correo de confirmación enviado a {destinatario}")
    except Exception as e:
        print(f"❌ Error al enviar correo de confirmación: {e}")

@app.route('/solicitar-discapacidad', methods=['POST'])
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
        return jsonify(success=False, message="Error en la solicitud: " + str(err))

@app.route('/solicitudes-discapacidad', methods=['GET'])
def listar_solicitudes_discapacidad():
    try:
        cursor.execute("""
            SELECT id, nombre, apellido, dni, grado_discapacidad, archivo_nombre, estado
            FROM solicitudes_discapacidad
        """)
        solicitudes = cursor.fetchall()

        if not solicitudes:
            return jsonify(success=False, message="No hay solicitudes de discapacidad disponibles.")

        return jsonify(solicitudes)

    except mysql.connector.Error as err:
        return jsonify(success=False, message=f"Error al obtener solicitudes: {str(err)}"), 500


@app.route('/archivo-solicitud/<int:solicitud_id>', methods=['GET'])
def descargar_archivo_blob(solicitud_id):
    try:
        cursor.execute("SELECT archivo, archivo_nombre FROM solicitudes_discapacidad WHERE id = %s", (solicitud_id,))
        result = cursor.fetchone()
        if not result:
            return "Archivo no encontrado", 404

        archivo_bytes = result['archivo']
        archivo_nombre = result.get('archivo_nombre', f"archivo_{solicitud_id}.pdf")  # nombre por defecto

        return send_from_directory(
            directory='.',
            path='',  # No se usa porque usamos `BytesIO`
            as_attachment=True,
            download_name=archivo_nombre,
            mimetype='application/octet-stream',
            data=archivo_bytes
        )
    except Exception as e:
        print(f"❌ Error al servir el archivo: {e}")
        return "Error al descargar archivo", 500

# Definición de la función que envía el correo
def enviar_correo_estado(destinatario, nombre_usuario, estado):
    remitente = "buystickets.customer@gmail.com"
    contraseña = "ikch pecb cuzu dkdn"  # Contraseña de aplicación de Gmail

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
        servidor.login(remitente, contraseña)
        servidor.sendmail(remitente, destinatario, mensaje.as_string())
        servidor.quit()
        print(f"✅ Correo de notificación enviado a {destinatario}")
    except Exception as e:
        print(f"❌ Error al enviar correo de estado: {e}")

# Ruta para actualizar el estado de la solicitud
@app.route('/actualizar-estado-solicitud', methods=['POST'])
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
                # Aquí es donde se invoca la función correctamente
                enviar_correo_estado(email, usuario, nuevo_estado)

            return jsonify(success=True, message="Estado de la solicitud actualizado")
        else:
            return jsonify(success=False, message="No se pudo actualizar el estado de la solicitud.")

    except mysql.connector.Error as err:
        return jsonify(success=False, message="Error al actualizar el estado: " + str(err))
        
@app.route('/estado-solicitud/<dni>', methods=['GET'])
def obtener_estado_solicitud(dni):
    try:
        cursor.execute("SELECT estado FROM solicitudes_discapacidad WHERE dni = %s", (dni,))
        result = cursor.fetchone()
        if result:
            return jsonify(success=True, estado=result["estado"])
        else:
            return jsonify(success=False, message="No se encontró la solicitud.")
    except mysql.connector.Error as err:
        return jsonify(success=False, message="Error al consultar el estado: " + str(err))

@app.route('/descargar-archivo/<int:solicitud_id>', methods=['GET'])
def descargar_archivo_por_id(solicitud_id):
    try:
        cursor.execute("SELECT archivo, archivo_nombre FROM solicitudes_discapacidad WHERE id = %s", (solicitud_id,))
        result = cursor.fetchone()

        if not result or not result["archivo"]:
            return jsonify(success=False, message="Archivo no encontrado."), 404

        archivo_blob = result["archivo"]
        nombre_archivo = result.get("archivo_nombre", f"archivo_{solicitud_id}.pdf")

        return send_file(
            BytesIO(archivo_blob),
            download_name=nombre_archivo,
            as_attachment=True
        )
    except mysql.connector.Error as err:
        return jsonify(success=False, message=f"Error al obtener archivo: {str(err)}"), 500

@app.route('/estado-discapacidad/<usuario>', methods=['GET'])
def obtener_estado_discapacidad_usuario(usuario):
    try:
        cursor.execute("SELECT discapacidad FROM users WHERE user = %s", (usuario,))
        result = cursor.fetchone()
        if result:
            estado = result["discapacidad"]
            if estado == "sí":
                return jsonify(success=True, estado="aprobada")
            elif estado == "no":
                return jsonify(success=True, estado="rechazada")
            else:
                return jsonify(success=True, estado="pendiente")
        else:
            return jsonify(success=False, message="Usuario no encontrado.")
    except mysql.connector.Error as err:
        return jsonify(success=False, message="Error de base de datos: " + str(err))

@app.route('/reportar-error', methods=['POST'])
def reportar_error():
    data = request.get_json()
    
    usuario = data.get('user')
    reporte = data.get('reporte')
    
    if not usuario or not reporte:
        return jsonify({"success": False, "message": "Faltan datos."}), 400
    
    # Crear el nuevo reporte
    try:
        cursor.execute("""
            INSERT INTO reportes (usuario, reporte, estado)
            VALUES (%s, %s, 'pendiente')
        """, (usuario, reporte))
        db.commit()
        return jsonify({"success": True, "message": "Reporte enviado correctamente."}), 200
    except mysql.connector.Error as err:
        db.rollback()
        return jsonify({"success": False, "message": f"Error al guardar el reporte: {str(err)}"}), 500

@app.route('/reportes', methods=['GET'])
def obtener_reportes():
    estado = request.args.get('estado')  # Puede ser 'pendiente', 'arreglada' o 'resuelta'

    try:
        if estado:
            cursor.execute("SELECT * FROM reportes WHERE estado = %s", (estado,))
        else:
            cursor.execute("SELECT * FROM reportes")

        reportes = cursor.fetchall()

        if not reportes:
            return jsonify(success=False, message="No hay reportes disponibles.")

        reportes_data = [
            {
                "id": r["id"],
                "usuario": r["usuario"],
                "reporte": r["reporte"],
                "estado": r["estado"],
                "fecha_creacion": r["fecha_creacion"].strftime('%Y-%m-%d %H:%M:%S')
            } for r in reportes
        ]

        return jsonify(success=True, reportes=reportes_data), 200

    except mysql.connector.Error as err:
        return jsonify(success=False, message=f"Error al obtener los reportes: {str(err)}"), 500

@app.route('/actualizar-reporte', methods=['POST'])
def actualizar_reporte():
    data = request.get_json()
    
    reporte_id = data.get('id')
    nuevo_estado = data.get('estado')
    
    if not reporte_id or not nuevo_estado:
        return jsonify({"success": False, "message": "Faltan datos."}), 400
    
    # Validar el estado
    if nuevo_estado not in ['pendiente', 'arreglada', 'resuelta', 'eliminado']:
        return jsonify({"success": False, "message": "Estado inválido."}), 400
    
    try:
        # Si el estado es "eliminado", eliminamos el reporte
        if nuevo_estado == 'eliminado':
            cursor.execute("DELETE FROM reportes WHERE id = %s", (reporte_id,))
            db.commit()
            return jsonify({"success": True, "message": "Reporte eliminado."}), 200
        
        # Si no es eliminado, actualizamos el estado
        cursor.execute("UPDATE reportes SET estado = %s WHERE id = %s", (nuevo_estado, reporte_id))
        db.commit()

        if cursor.rowcount == 0:
            return jsonify({"success": False, "message": "Reporte no encontrado."}), 404
        
        return jsonify({"success": True, "message": "Estado del reporte actualizado."}), 200
    except mysql.connector.Error as err:
        db.rollback()
        return jsonify({"success": False, "message": f"Error al actualizar el reporte: {str(err)}"}), 500


@app.route('/enviar-correo-estado', methods=['POST'])
def enviar_correo_estado():
    data = request.get_json()
    usuario = data.get('usuario')
    estado = data.get('estado')
    mensaje = data.get('mensaje')

    if not usuario or not estado:
        return jsonify(success=False, message="Faltan datos."), 400

    # Buscar el correo del usuario
    cursor.execute("SELECT email FROM users WHERE user = %s", (usuario,))
    user_data = cursor.fetchone()

    if not user_data:
        return jsonify(success=False, message="Usuario no encontrado."), 404

    email = user_data["email"]

    # Crear el asunto y cuerpo del correo
    if estado == "arreglada":
        asunto = "Reporte arreglado"
        cuerpo = f"Tu reporte ha sido arreglado.\n\nMensaje del administrador:\n{mensaje}"
    elif estado == "resuelta":
        asunto = "Reporte resuelto"
        cuerpo = f"Tu reporte ha sido marcado como resuelto.\n\nMensaje del administrador:\n{mensaje}"
    else:
        return jsonify(success=False, message="Estado inválido."), 400

    # Configuración del correo
    remitente = "buystickets.customer@gmail.com"
    contraseña = "ikch pecb cuzu dkdn"  # Contraseña de aplicación de Gmail

    mensaje_correo = MIMEMultipart("alternative")
    mensaje_correo["Subject"] = asunto
    mensaje_correo["From"] = remitente
    mensaje_correo["To"] = email
    mensaje_correo.attach(MIMEText(cuerpo, "plain"))

    try:
        servidor = smtplib.SMTP("smtp.gmail.com", 587)
        servidor.starttls()
        servidor.login(remitente, contraseña)
        servidor.sendmail(remitente, email, mensaje_correo.as_string())
        servidor.quit()
        return jsonify(success=True, message="Correo enviado correctamente.")
    except Exception as e:
        return jsonify(success=False, message=f"Error al enviar el correo: {str(e)}"), 500

@app.route('/enviar-anuncio', methods=['POST'])
def enviar_anuncio():
    # Obtener los datos del anuncio
    mensaje = request.form.get('mensaje')  # Mensaje del anuncio
    archivo = request.files.get('imagen')  # Imagen del anuncio

    if not mensaje and not archivo:
        return jsonify(success=False, message="Por favor, ingresa un mensaje o carga una imagen.")

    # Verificar que el archivo sea una imagen válida
    if archivo:
        archivo_nombre = archivo.filename
        archivo_bytes = archivo.read()

        # Verificar el tipo MIME del archivo antes de intentar abrirlo
        tipo_mime, _ = mimetypes.guess_type(archivo_nombre)
        if not tipo_mime or not tipo_mime.startswith('image'):
            return jsonify(success=False, message="El archivo cargado no es una imagen válida.")

        try:
            # Usamos Pillow para abrir la imagen y detectar el tipo
            imagen = Image.open(BytesIO(archivo_bytes))
            tipo_imagen = imagen.format.lower()  # "jpeg", "png", etc.

            # Creamos el MIMEImage con el tipo detectado
            imagen_mime = MIMEImage(archivo_bytes, _subtype=tipo_imagen, name=archivo_nombre)

            # Establecer un Content-ID para poder referenciar la imagen en el HTML
            imagen_mime.add_header('Content-ID', '<imagen_cid>')
        except Exception as e:
            return jsonify(success=False, message=f"Error al procesar la imagen: {e}")

    # Obtener todos los usuarios (excepto administradores)
    cursor.execute("SELECT email, user FROM users WHERE role != 'admin'")
    usuarios = cursor.fetchall()

    if not usuarios:
        return jsonify(success=False, message="No hay usuarios a los que enviar el anuncio.")

    # Enviar correo a cada usuario
    for usuario in usuarios:
        destinatario = usuario['email']
        nombre_usuario = usuario['user']

        # Crear el mensaje del correo
        asunto = "Anuncio Importante de BuyTickets"
        
        # Asegurarnos de que el mensaje se maneje como HTML
        cuerpo = f"Hola {nombre_usuario},<br><br>{mensaje}<br><br>Atentamente, el equipo de BuyTickets."

        # Crear el mensaje MIME
        mensaje_correo = MIMEMultipart("related")
        mensaje_correo['From'] = "buystickets.customer@gmail.com"
        mensaje_correo['To'] = destinatario
        mensaje_correo['Subject'] = asunto

        # Agregar el mensaje HTML al correo
        mensaje_html = MIMEText(cuerpo, 'html', _charset="utf-8")  # Especificar codificación UTF-8 para el contenido HTML
        mensaje_correo.attach(mensaje_html)

        # Adjuntar la imagen si está disponible
        if archivo:
            mensaje_correo.attach(imagen_mime)

            # Modificar el cuerpo del HTML para mostrar la imagen
            cuerpo_con_imagen = f"""
            <html>
                <body>
                    <p>Hola {nombre_usuario},</p>
                    <p>{mensaje}</p>
                    <img src="cid:imagen_cid" alt="Imagen del anuncio" />
                    <p>Atentamente, el equipo de BuyTickets</p>
                </body>
            </html>
            """
            mensaje_html.set_payload(cuerpo_con_imagen)

        try:
            # Configuración SMTP
            servidor = smtplib.SMTP("smtp.gmail.com", 587)
            servidor.starttls()
            servidor.login("buystickets.customer@gmail.com", "ikch pecb cuzu dkdn")
            servidor.sendmail("buystickets.customer@gmail.com", destinatario, mensaje_correo.as_string())
            servidor.quit()
            print(f"✅ Correo enviado a {destinatario}")
        except Exception as e:
            print(f"❌ Error al enviar correo a {destinatario}: {e}")

    return jsonify(success=True, message="Anuncio enviado a todos los usuarios.")

@app.route('/register-adminControl', methods=['POST'])
def register_adminControl():
    # Recoger los datos del formulario
    user = request.form.get('user')
    password = request.form.get('password')
    nombre = request.form.get('nombre')
    apellido = request.form.get('apellido')
    email = request.form.get('email')
    role = request.form.get('role', 'estandar')
    discapacidad = request.form.get('discapacidad', 'no')

    # Verificar si los datos esenciales están presentes
    if not all([user, password, nombre, apellido, email]):
        return jsonify(success=False, message="Faltan datos obligatorios."), 400

    # Verificar si el usuario ya existe
    cursor.execute("SELECT * FROM users WHERE user = %s", (user,))
    if cursor.fetchone():
        return jsonify(success=False, message="El nombre de usuario ya está en uso. Por favor, elige otro.")

    # Verificar si el correo ya está registrado
    cursor.execute("SELECT * FROM users WHERE email = %s", (email,))
    if cursor.fetchone():
        return jsonify(success=False, message="Este correo ya está registrado. Por favor, usa otro.")

    # Manejo del archivo de perfil (si existe)
    profile = request.files.get('profile')
    profile_filename = None
    if profile:
        profile_filename = secure_filename(profile.filename)
        profile.save(os.path.join(app.config['UPLOAD_FOLDER'], profile_filename))

    # Hashear la contraseña
    hashed_password = generate_password_hash(password, method='pbkdf2:sha256')

    # Intentar insertar el usuario en la base de datos
    try:
        cursor.execute("""
            INSERT INTO users (user, password, name, surname, email, role, discapacidad, profile)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
        """, (user, hashed_password, nombre, apellido, email, role, discapacidad, profile_filename))
        db.commit()
        return jsonify(success=True, message="Usuario creado exitosamente.")
    except mysql.connector.Error as err:
        db.rollback()
        return jsonify(success=False, message="Error al registrar el usuario: " + str(err))


@app.route('/lista-usuarios-adminControl', methods=['GET'])
def lista_usuarios_adminControl():
    try:
        cursor.execute("SELECT id, user, role, name, surname, email, discapacidad, profile FROM users")
        users = cursor.fetchall()

        # Verificar si se obtienen usuarios
        if not users:
            return jsonify(success=False, message="No se encontraron usuarios.")

        for user in users:
            if user['profile']:
                profile_blob = user['profile']
                # Convertir el BLOB a base64
                user['profile'] = base64.b64encode(profile_blob).decode('utf-8')
            else:
                user['profile'] = None

        return jsonify(users)
    except mysql.connector.Error as err:
        return jsonify(success=False, message="Error al obtener la lista de usuarios: " + str(err))

# Ruta para obtener detalles de un usuario específico - adminControl
@app.route('/usuario-adminControl/<int:user_id>', methods=['GET'])
def obtener_usuario_adminControl(user_id):
    try:
        cursor.execute("SELECT * FROM users WHERE id = %s", (user_id,))
        user = cursor.fetchone()
        if user:
            if user['profile']:
                profile_path = os.path.join(app.config['UPLOAD_FOLDER'], user['profile'])
                with open(profile_path, "rb") as image_file:
                    user['profile'] = base64.b64encode(image_file.read()).decode('utf-8')
            return jsonify(user)
        else:
            return jsonify(success=False, message="Usuario no encontrado.")
    except mysql.connector.Error as err:
        return jsonify(success=False, message="Error al obtener los datos del usuario: " + str(err))

# Ruta para actualizar un usuario (editar) - adminControl
@app.route('/update-user-adminControl', methods=['POST'])
def update_user_adminControl():
    data = request.form
    user_id = data.get('id')
    user = data.get('user')
    password = data.get('password')
    nombre = data.get('nombre')
    apellido = data.get('apellido')
    email = data.get('email')
    role = data.get('role')
    discapacidad = data.get('discapacidad')

    try:
        if password:
            hashed_password = generate_password_hash(password, method='pbkdf2:sha256')
            cursor.execute("UPDATE users SET password = %s WHERE id = %s", (hashed_password, user_id))
        
        if nombre:
            cursor.execute("UPDATE users SET name = %s WHERE id = %s", (nombre, user_id))
        
        if apellido:
            cursor.execute("UPDATE users SET surname = %s WHERE id = %s", (apellido, user_id))
        
        if email:
            cursor.execute("UPDATE users SET email = %s WHERE id = %s", (email, user_id))
        
        if role:
            cursor.execute("UPDATE users SET role = %s WHERE id = %s", (role, user_id))
        
        if discapacidad:
            cursor.execute("UPDATE users SET discapacidad = %s WHERE id = %s", (discapacidad, user_id))
        
        # Guardar nueva foto de perfil si existe
        profile = request.files.get('profile')
        if profile:
            profile_filename = secure_filename(profile.filename)
            profile.save(os.path.join(app.config['UPLOAD_FOLDER'], profile_filename))
            cursor.execute("UPDATE users SET profile = %s WHERE id = %s", (profile_filename, user_id))

        db.commit()
        return jsonify(success=True, message="Usuario actualizado exitosamente.")
    except mysql.connector.Error as err:
        db.rollback()
        return jsonify(success=False, message="Error al actualizar el usuario: " + str(err))

# Ruta para eliminar un usuario - adminControl
@app.route('/delete-user-adminControl/<int:user_id>', methods=['DELETE'])
def delete_user_adminControl(user_id):
    try:
        cursor.execute("SELECT profile FROM users WHERE id = %s", (user_id,))
        user = cursor.fetchone()
        
        if user and user['profile']:
            os.remove(os.path.join(app.config['UPLOAD_FOLDER'], user['profile']))
        
        cursor.execute("DELETE FROM users WHERE id = %s", (user_id,))
        db.commit()
        
        return jsonify(success=True, message="Usuario eliminado exitosamente.")
    except mysql.connector.Error as err:
        db.rollback()
        return jsonify(success=False, message="Error al eliminar el usuario: " + str(err))


if __name__ == '__main__':
    app.run(debug=True)
