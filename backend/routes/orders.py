from flask import Blueprint, request, jsonify
from extensions import db
from models.order import Order
from models.order_item import OrderItem
from models.product import Product
from models.user import User
from models.cart import CartItem
from flask_jwt_extended import jwt_required, get_jwt_identity

orders_bp = Blueprint("orders", __name__, url_prefix="/api/orders")


# =====================================================
# CREAR PEDIDO DESDE CARRITO (USUARIO)
# =====================================================
@orders_bp.route("/from-cart", methods=["POST"])
@jwt_required()
def create_order_from_cart():

    user_id = int(get_jwt_identity())
    data = request.get_json()  # 🔥 datos del checkout

    cart_items = CartItem.query.filter_by(user_id=user_id).all()

    if not cart_items:
        return jsonify({"message": "El carrito está vacío"}), 400

    try:

        # 🔢 Obtener último número de orden del usuario
        last_order = Order.query.filter_by(user_id=user_id) \
            .order_by(Order.order_number.desc()) \
            .first()

        new_order_number = last_order.order_number + 1 if last_order else 1

        # 🧾 Crear orden (ahora con datos de envío)
        order = Order(
            user_id=user_id,
            total=0,
            order_number=new_order_number,
            status="pendiente",

            # 🔥 DATOS DEL CHECKOUT
            customer_name=data.get("customer_name"),
            phone=data.get("phone"),
            address=data.get("address"),
            city=data.get("city"),
            notes=data.get("notes")
        )

        db.session.add(order)
        db.session.flush()  # Obtener ID sin commit

        total = 0

        for cart_item in cart_items:

            product = Product.query.get(cart_item.product_id)

            if not product:
                continue

            subtotal = product.price * cart_item.quantity
            total += subtotal

            order_item = OrderItem(
                order_id=order.id,
                product_id=product.id,
                quantity=cart_item.quantity,
                price=product.price,
                size=cart_item.size,
                cup_type=cart_item.cup_type,
                image=cart_item.image
            )

            db.session.add(order_item)

        # 🧹 Vaciar carrito
        CartItem.query.filter_by(user_id=user_id).delete()

        order.total = total

        db.session.commit()

        return jsonify({
            "message": "Pedido creado correctamente",
            "order_number": order.order_number,
            "total": order.total
        }), 201

    except Exception as e:
        db.session.rollback()
        return jsonify({
            "message": "Error al crear pedido",
            "error": str(e)
        }), 500


# =====================================================
# MIS PEDIDOS (USUARIO)
# =====================================================
@orders_bp.route("/mine", methods=["GET"])
@jwt_required()
def my_orders():

    user_id = int(get_jwt_identity())

    orders = Order.query.filter_by(user_id=user_id)\
        .order_by(Order.created_at.desc())\
        .all()

    result = []

    for order in orders:

        items_data = []

        for item in order.items:
            items_data.append({
                "product_name": item.product.name if item.product else "Producto eliminado",
                "price": item.price,
                "quantity": item.quantity,
                "subtotal": item.price * item.quantity,
                "size": item.size,
                "cup_type": item.cup_type,
                "image": item.image

            })

        result.append({
            "order_number": order.order_number,
            "total": order.total,
            "status": order.status,
            "created_at": order.created_at.isoformat(),
            "items": items_data
        })

    return jsonify(result), 200


# =====================================================
# TODOS LOS PEDIDOS (ADMIN)
# =====================================================
@orders_bp.route("/admin/all", methods=["GET"])
@jwt_required()
def get_all_orders():

    user_id = int(get_jwt_identity())
    user = User.query.get(user_id)

    if not user or user.role != "admin":
        return jsonify({"message": "Acceso denegado"}), 403

    orders = Order.query.order_by(Order.created_at.desc()).all()

    data = []

    for order in orders:

        buyer = User.query.get(order.user_id)

        items_data = []

        for item in order.items:
            items_data.append({
                "product_name": item.product.name if item.product else "Producto eliminado",
                "quantity": item.quantity,
                "price": item.price,
                "size": item.size,
                "cup_type": item.cup_type,
                "image": item.image
            })

        data.append({
            "id": order.id,
            "order_number": order.order_number,
            "buyer": buyer.name if buyer else "Desconocido",
            "email": buyer.email if buyer else "",
            "phone": order.phone,
            "address": order.address,
            "city": order.city,
            "notes": order.notes,
            "total": order.total,
            "status": order.status,
            "created_at": order.created_at.isoformat(),
            "items": items_data
        })

    return jsonify(data), 200


# =====================================================
# ACTUALIZAR ESTADO (ADMIN)
# =====================================================
@orders_bp.route("/<int:order_id>/status", methods=["PUT"])
@jwt_required()
def update_order_status(order_id):

    user_id = int(get_jwt_identity())
    user = User.query.get(user_id)

    if not user or user.role != "admin":
        return jsonify({"message": "Acceso denegado"}), 403

    order = Order.query.get(order_id)

    if not order:
        return jsonify({"message": "Pedido no encontrado"}), 404

    data = request.get_json()
    new_status = data.get("status")

    if not new_status:
        return jsonify({"message": "Estado requerido"}), 400

    order.status = new_status
    db.session.commit()

    return jsonify({"message": "Estado actualizado correctamente"}), 200