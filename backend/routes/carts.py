from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from werkzeug.utils import secure_filename
from extensions import db
import os

from models.cart import CartItem

cart_bp = Blueprint("cart", __name__, url_prefix="/api/cart")

UPLOAD_FOLDER = "uploads"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)


@cart_bp.route("/add", methods=["POST"])
@jwt_required()
def add_to_cart():

    user_id = get_jwt_identity()
    product_id = request.form.get("product_id")
    quantity = request.form.get("quantity")
    size = request.form.get("size")
    cup_type = request.form.get("cup_type")
    files = request.files.getlist("images")

    if not files:
        return jsonify({"error": "Debes subir al menos una imagen"}), 400

    image_paths = []

    for file in files:
        filename = secure_filename(file.filename)
        filepath = os.path.join(UPLOAD_FOLDER, filename)
        file.save(filepath)
        image_paths.append(filepath)

    new_item = CartItem(
        user_id=user_id,
        product_id=product_id,
        quantity=quantity,
        size=size,
        cup_type=cup_type,
        image=image_paths[0] if image_paths else None
    )

    db.session.add(new_item)
    db.session.commit()

    return jsonify({"message": "Producto agregado al carrito"}), 201

@cart_bp.route("/", methods=["GET"])
@jwt_required()
def get_cart():
    user_id = get_jwt_identity()

    items = CartItem.query.filter_by(user_id=user_id).all()

    cart_data = []
    total = 0

    for item in items:
        subtotal = item.quantity * item.product.price
        total += subtotal

        cart_data.append({
            "id": item.id,
            "product_id": item.product_id,
            "name": item.product.name,
            "price": item.product.price,
            "quantity": item.quantity,
            "size": item.size,
            "cup_type": item.cup_type,
            "image": item.image,
            "subtotal": subtotal
        })

    return jsonify({
        "items": cart_data,
        "total": total
    }), 200

@cart_bp.route("/<int:item_id>", methods=["DELETE"])
@jwt_required()
def remove_item(item_id):

    user_id = get_jwt_identity()

    item = CartItem.query.filter_by(id=item_id, user_id=user_id).first()

    if not item:
        return jsonify({"error": "Item no encontrado"}), 404

    db.session.delete(item)
    db.session.commit()

    return jsonify({"message": "Item eliminado"}), 200