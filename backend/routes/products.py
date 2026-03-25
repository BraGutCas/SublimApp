from flask import Blueprint, jsonify
from flask_jwt_extended import jwt_required
from models.product import Product
from extensions import db  # donde tengas tu db

products_bp = Blueprint('products', __name__, url_prefix='/api/products')


@products_bp.route('/', methods=['GET'])
def get_products():
    products = Product.query.all()
    return jsonify([p.to_dict() for p in products])


# 🔥 NUEVA RUTA PARA ACTIVAR/DESACTIVAR
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