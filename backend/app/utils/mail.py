import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

def enviar_correo_eliminacion(destinatario, nombre_usuario):
    remitente = "buystickets.customer@gmail.com"
    contraseña = "ikch pecb cuzu dkdn"  # Contraseña de aplicación Gmail

    mensaje = MIMEMultipart("alternative")
    mensaje["Subject"] = "Cuenta eliminada"
    mensaje["From"] = remitente
    mensaje["To"] = destinatario

    texto = f"""Hola {nombre_usuario},

Tu cuenta ha sido eliminada correctamente de BuyTickets.

Si no realizaste esta acción o tienes dudas, por favor contáctanos.

Atentamente,
El equipo de BuyTickets
"""
    mensaje.attach(MIMEText(texto, "plain"))

    try:
        servidor = smtplib.SMTP("smtp.gmail.com", 587)
        servidor.starttls()
        servidor.login(remitente, contraseña)
        servidor.sendmail(remitente, destinatario, mensaje.as_string())
        servidor.quit()
        print(f"✅ Correo enviado a {destinatario}")
    except Exception as e:
        print(f"❌ Error al enviar correo: {e}")
