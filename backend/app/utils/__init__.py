from flask import Flask
from flask_sqlalchemy import SQLAlchemy


# Crear una instancia de la base de datos
db = SQLAlchemy()

# Crear una instancia para el manejo de correos

def create_app(config_object='app.config.Config'):
    # Crear la instancia de la aplicación Flask
    app = Flask(__name__)

    # Configurar la aplicación con la configuración definida
    app.config.from_object(config_object)

    # Inicializar las extensiones
    db.init_app(app)

    # Registrar las rutas
    from app.routes.auth import auth_bp
    from app.routes.user import user_bp
    from app.routes.premium import premium_bp


    app.register_blueprint(auth_bp)
    app.register_blueprint(user_bp)
    app.register_blueprint(premium_bp)


    # Puedes agregar más configuraciones, como manejadores de errores o señales

    return app
