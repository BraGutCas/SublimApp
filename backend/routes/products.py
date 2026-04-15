from flask import Blueprint, jsonify, request, send_from_directory
from flask_jwt_extended import jwt_required
from models.product import Product
from extensions import db
import os
import uuid
from werkzeug.utils import secure_filename

products_bp = Blueprint('products', __name__, url_prefix='/api/products')

# 📁 Carpeta de imágenes
UPLOAD_FOLDER = "uploads"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)


# =========================
# 📦 OBTENER PRODUCTOS
# =========================
@products_bp.route('/', methods=['GET'])
def get_products():
    products = Product.query.all()
    return jsonify([p.to_dict() for p in products])


# =========================
# ➕ AGREGAR PRODUCTO
# =========================
@products_bp.route('/', methods=['POST'])
@jwt_required()
def add_product():
    try:
        print(request.form)
        name = request.form.get("name")
        description = request.form.get("description") or ""
        price = request.form.get("price")
        category = request.form.get("category") or "General"
        image = request.files.get("image")

        if not name or not price:
            return jsonify({"error": "Faltan datos"}), 400

        image_url = None

        if image:
            filename = f"{uuid.uuid4()}_{secure_filename(image.filename)}"
            filepath = os.path.join(UPLOAD_FOLDER, filename)
            image.save(filepath)

            image_url = f"http://127.0.0.1:5000/uploads/{filename}"

        # 🔥 CREAR PRODUCTO COMPLETO
        product = Product(
            name=name,
            description=description,
            price=float(price),
            image_url=image_url,
            category=category,
            is_active=True
        )

        db.session.add(product)
        db.session.commit()

        return jsonify(product.to_dict()), 201

    except Exception as e:
        return jsonify({"error": str(e)}), 500


# =========================
# 🔄 ACTIVAR / DESACTIVAR
# =========================
@products_bp.route('/<int:id>/toggle', methods=['PUT'])
@jwt_required()
def toggle_product(id):
    product = Product.query.get_or_404(id)

    product.is_active = not product.is_active
    db.session.commit()

    return jsonify({
        "message": "Producto actualizado",
        "is_active": product.is_active
    })


# =========================
# 📂 SERVIR IMÁGENES
# =========================
@products_bp.route('/uploads/<filename>')
def uploaded_file(filename):
    return send_from_directory(UPLOAD_FOLDER, filename)