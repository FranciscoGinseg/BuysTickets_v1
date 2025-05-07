from flask import Blueprint, request, jsonify
from werkzeug.security import check_password_hash, generate_password_hash
from app.utils.db import cursor, db
import base64, re

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/login', methods=['POST'])
def login():
    # lógica que ya tienes, igual
    ...

@auth_bp.route('/register', methods=['POST'])
def register():
    # lógica que ya tienes, igual
    ...
