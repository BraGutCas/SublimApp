from extensions import db
from datetime import datetime
import pytz

mx_tz = pytz.timezone("America/Mexico_City")

def mexico_now():
    return datetime.now(mx_tz)


class Order(db.Model):
    __tablename__ = "orders"

    # 🔹 ID GLOBAL (solo admin debería usarlo)
    id = db.Column(db.Integer, primary_key=True)

    # 🔹 Número de pedido por usuario (contador individual)
    order_number = db.Column(db.Integer, nullable=False)

    user_id = db.Column(
        db.Integer,
        db.ForeignKey("users.id"),
        nullable=False
    )

    total = db.Column(db.Float, nullable=False)
    status = db.Column(db.String(20), default="pendiente")

    # ==============================
    # 🔥 DATOS DE ENVÍO (CHECKOUT)
    # ==============================

    customer_name = db.Column(db.String(100))
    phone = db.Column(db.String(20))
    address = db.Column(db.String(200))
    city = db.Column(db.String(100))
    notes = db.Column(db.Text)

    # ⏱ Fecha de creación (hora México)
    created_at = db.Column(
        db.DateTime,
        nullable=False,
        default=mexico_now
    )

    # Relaciones
    user = db.relationship(
        "User",
        backref=db.backref("orders", lazy=True)
    )

    items = db.relationship(
        "OrderItem",
        backref="order",
        lazy=True,
        cascade="all, delete-orphan"
    )

    # 🔹 Conversión para frontend
    def to_dict(self, is_admin=False):
        return {
            "id": self.id if is_admin else self.order_number,
            "global_id": self.id if is_admin else None,
            "order_number": self.order_number,
            "user_id": self.user_id,
            "total": self.total,
            "status": self.status,
            "created_at": self.created_at.isoformat(),

            # 🔥 ahora también enviamos datos de envío
            "customer_name": self.customer_name,
            "phone": self.phone,
            "address": self.address,
            "city": self.city,
            "notes": self.notes,

            "items": [item.to_dict() for item in self.items]
        }