from flask import Blueprint, request, jsonify
from models.product import Product
import requests

chatbot_bp = Blueprint('chatbot', __name__, url_prefix='/api/chatbot')


@chatbot_bp.route('/', methods=['POST'])
def chatbot():
    user_message = request.json.get("message", "").lower()

    # =========================
    # 1️⃣ REGLAS DE PRIORIDAD
    # =========================

    # Tiempo de entrega (PRIORIDAD ALTA)
    if any(p in user_message for p in ["tarda", "tiempo", "entrega", "dias", "días"]):
        intent = "tiempo_entrega"
        confidence = 1.0

    # Precio
    elif any(p in user_message for p in ["precio", "cuesta", "vale", "costo"]):
        intent = "precio"
        confidence = 1.0

    # IA (texto libre)
    else:
        try:
            response = requests.post(
                "http://localhost:6000/predict",
                json={"message": user_message},
                timeout=3
            )
            data = response.json()
            intent = data["intent"]
            confidence = data["confidence"]
            response = data["response"]

        except requests.exceptions.RequestException:
            return jsonify({
                "response": "El servicio de IA no está disponible en este momento 🤖❌"
            }), 503


    # =========================
    # 2️⃣ RESPUESTAS POR INTENCIÓN
    # =========================

    # ---- PRECIO ----
    if intent == "precio":
        products = []

        if "taza" in user_message:
            products = Product.query.filter_by(category="taza").all()

        elif "playera" in user_message:
            products = Product.query.filter_by(category="playera").all()

        elif "lamina" in user_message or "lámina" in user_message:
            products = Product.query.filter_by(category="lamina").all()

        if products:
            precios = [p.price for p in products]
            minimo = min(precios)

            response = (
                f"El precio de las {products[0].category}s "
                f"comienza desde ${minimo} MXN 😊. "
                "El costo final puede variar según el diseño."
            )
        else:
            response = (
                "¿De qué producto te gustaría conocer el precio? 💰\n"
                "Tenemos:\n"
                "- Tazas\n"
                "- Playeras\n"
                "- Láminas"
            )

    # ---- TIEMPO DE ENTREGA ----
    elif intent == "tiempo_entrega":
        response = (
            "El tiempo de entrega es de **2 a 4 días hábiles** ⏱️.\n"
            "Puede variar según la cantidad y el diseño solicitado."
        )

    # ---- OTRAS INTENCIONES (IA) ----
    else:
        if confidence < 0.2:
            response = (
                "No estoy seguro de haber entendido 🤔\n"
                "Puedo ayudarte con:\n"
                "- Precios 💰\n"
                "- Productos 🛍️\n"
                "- Personalización 🎨\n"
                "- Pedidos 🧾"
            )

    return jsonify({"response": response})
