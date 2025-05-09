from flask import Flask
from .routes.user import user_bp
from .routes.auth import auth_bp
from .routes.premium import premium_bp
from .routes.solicitudes import solicitudes_bp
from flask_cors import CORS

def create_app():
    app = Flask(__name__)
    CORS(app)  # ← Esto es importante

    app.register_blueprint(user_bp)
    app.register_blueprint(auth_bp)
    app.register_blueprint(premium_bp)
    app.register_blueprint(solicitudes_bp)
    


    return app
