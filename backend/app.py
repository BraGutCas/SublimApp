from flask import Flask, jsonify, send_from_directory
from flask_cors import CORS
from config import Config
from extensions import db
from flask_jwt_extended import JWTManager
from datetime import timedelta
import os

# 📁 BASE DEL PROYECTO
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
UPLOADS_DIR = os.path.join(BASE_DIR, "uploads")


def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    app.config["JWT_ACCESS_TOKEN_EXPIRES"] = timedelta(hours=24)

    # 🔐 JWT
    JWTManager(app)

    # 🌐 CORS (🔥 CORREGIDO)
    CORS(
        app,
        resources={r"/api/*": {"origins": "*"}},
        allow_headers=["Content-Type", "Authorization"],
        methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        supports_credentials=True
    )

    # 🗄️ DB
    db.init_app(app)

    # 📁 Crear carpeta uploads
    os.makedirs(UPLOADS_DIR, exist_ok=True)

    # 🔹 IMPORTAR MODELOS
    from models.user import User
    from models.product import Product
    from models.order import Order
    from models.order_item import OrderItem
    from models.cart import CartItem

    # 🔹 IMPORTAR BLUEPRINTS
    from routes.auth import auth_bp
    from routes.products import products_bp
    from routes.orders import orders_bp
    from routes.chatbot import chatbot_bp
    from routes.carts import cart_bp

    app.register_blueprint(auth_bp)
    app.register_blueprint(products_bp)
    app.register_blueprint(orders_bp)
    app.register_blueprint(chatbot_bp)
    app.register_blueprint(cart_bp)

    # =========================
    # 🖼️ SERVIR IMÁGENES
    # =========================
    @app.route("/uploads/<path:filename>")
    def serve_uploads(filename):
        return send_from_directory(UPLOADS_DIR, filename)

    # =========================
    # 🏠 HOME
    # =========================
    @app.route("/")
    def home():
        return jsonify({"message": "API funcionando correctamente 🚀"})

    # =========================
    # 🧱 CREAR TABLAS
    # =========================
    with app.app_context():
        db.create_all()

    return app


app = create_app()

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)