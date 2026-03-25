from extensions import db

class CartItem(db.Model):
    __tablename__ = "cart_item"

    id = db.Column(db.Integer, primary_key=True)

    user_id = db.Column(
        db.Integer,
        db.ForeignKey("users.id"),
        nullable=False
    )

    product_id = db.Column(
        db.Integer,
        db.ForeignKey("products.id"),  # 🔥 ESTA LÍNEA ES CLAVE
        nullable=False
    )

    quantity = db.Column(db.Integer, nullable=False)
    size = db.Column(db.String(10))
    cup_type = db.Column(db.String(50), nullable=True)
    image = db.Column(db.String(255))

    # 🔥 RELACIÓN CORRECTA
    product = db.relationship("Product", backref="cart_items")