from flask import Flask
from .routes.user import user_bp
from flask_cors import CORS

def create_app():
    app = Flask(__name__)
    CORS(app)  # ← Esto es importante

    app.register_blueprint(user_bp)

    return app
