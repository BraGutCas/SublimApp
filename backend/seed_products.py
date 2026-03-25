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

    # =========================
    # PRODUCTOS
    # =========================
    products_data = [
        {
            "name": "Taza personalizada",
            "description": "Taza blanca sublimada personalizada",
            "price": 100,
            "category": "taza",
            "image_url": "/frontend/assets/products/Taza.png"
        },
        {
            "name": "Playera personalizada",
            "description": "Playera blanca sublimada",
            "price": 250,
            "category": "playera",
            "image_url": "/frontend/assets/products/Playera.png"
        },
        {
            "name": "Lámina decorativa",
            "description": "Lámina decorativa personalizada",
            "price":150,
            "category": "lamina",
            "image_url": "/frontend/assets/products/Lamina.png"
        }
    ]

    for data in products_data:
        exists = Product.query.filter_by(name=data["name"]).first()
        if not exists:
            product = Product(**data)
            db.session.add(product)
            print(f"✅ Producto agregado: {data['name']}")
        else:
            print(f"ℹ️ Producto ya existe: {data['name']}")

    db.session.commit()
    print("🎉 Seed completado correctamente")
