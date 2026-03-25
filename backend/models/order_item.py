from extensions import db

class OrderItem(db.Model):
    __tablename__ = "order_items"

    id = db.Column(db.Integer, primary_key=True)

    order_id = db.Column(
        db.Integer,
        db.ForeignKey("orders.id"),
        nullable=False
    )

    product_id = db.Column(
        db.Integer,
        db.ForeignKey("products.id"),
        nullable=False
    )

    quantity = db.Column(db.Integer, nullable=False)
    price = db.Column(db.Float, nullable=False)
    size = db.Column(db.String(50), nullable=True)
    cup_type = db.Column(db.String(50), nullable=True)
    image = db.Column(db.String(255))
    product = db.relationship("Product")

    def to_dict(self):
        return {
            "product_id": self.product_id,
            "name": self.product.name,
            "price": self.price,
            "quantity": self.quantity
        }
