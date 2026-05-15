from app import app
from extensions import db
from models.user import User
from models.product import Product
from werkzeug.security import generate_password_hash

with app.app_context():

    # =========================
    # ADMIN
    # =========================
    admin_email = "admin@tienda.com"

    admin = User.query.filter_by(email=admin_email).first()

    if not admin:
        admin = User(
            name="Admin",
            email=admin_email,
            password=generate_password_hash("1234"),
            role="admin"
        )
        db.session.add(admin)
        print("✅ Admin creado")
    else:
        print("ℹ️ Admin ya existe")

    db.session.commit()
    print("🎉 Seed completado correctamente")
