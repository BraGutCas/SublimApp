from flask import Flask, jsonify, send_from_directory
from flask_cors import CORS
from config import Config
from extensions import db
from flask_jwt_extended import JWTManager
from datetime import timedelta
import os


def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    app.config["JWT_ACCESS_TOKEN_EXPIRES"] = timedelta(hours=24)

    # 🔐 JWT CONFIG
    JWTManager(app)

    # 🌐 CORS
    CORS(app)

    # 🗄️ DB
    db.init_app(app)

    # 📁 Crear carpeta uploads si no existe
    os.makedirs("uploads", exist_ok=True)

    # 🔹 IMPORTAR MODELOS
    from models.user import User
    from models.product import Product
    from models.order import Order
    from models.order_item import OrderItem
    from models.cart import CartItem

    # 🔹 IMPORTAR Y REGISTRAR RUTAS
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
    # SERVIR IMÁGENES UPLOADS
    # =========================
    @app.route("/uploads/<path:filename>")
    def serve_uploads(filename):
        return send_from_directory(
            os.path.join(os.getcwd(), "uploads"),
            filename
        )

    # 🔹 HOME
    @app.route("/")
    def home():
        return jsonify({"message": "API funcionando correctamente"})

    # 🧱 Crear tablas
    with app.app_context():
        db.create_all()

    return app


app = create_app()

if __name__ == "__main__":
    app.run(debug=True)