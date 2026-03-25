from flask import Blueprint, request, jsonify
from werkzeug.security import generate_password_hash, check_password_hash
from flask_jwt_extended import create_access_token
from extensions import db
from models.user import User

auth_bp = Blueprint('auth', __name__, url_prefix='/api/auth')


# ================= REGISTRO =================
@auth_bp.route('/register', methods=['POST'])
def register():
    data = request.json

    if User.query.filter_by(email=data['email']).first():
        return jsonify({"message": "El usuario ya existe"}), 400

    new_user = User(
        name=data['name'],
        email=data['email'],
        password=generate_password_hash(data['password']),
        role="user"   # 👈 por defecto todos son usuarios
    )

    db.session.add(new_user)
    db.session.commit()

    return jsonify({"message": "Usuario registrado correctamente"}), 201


# ================= LOGIN =================
@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.json

    user = User.query.filter_by(email=data['email']).first()

    if not user or not check_password_hash(user.password, data['password']):
        return jsonify({"message": "Credenciales incorrectas"}), 401

    # 🔐 Crear token JWT
    access_token = create_access_token(identity=str(user.id))

    return jsonify({
        "message": "Login exitoso",
        "access_token": access_token,   # 🔥 ESTO ES LO QUE FALTABA
        "user": {
            "id": user.id,
            "name": user.name,
            "email": user.email,
            "role": user.role
        }
    }), 200
