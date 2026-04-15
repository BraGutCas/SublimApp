import pickle
import json
import random
import os
import unicodedata

BASE_DIR = os.path.dirname(__file__)

# ==============================
# 📦 Cargar modelo y vectorizador
# ==============================
with open(os.path.join(BASE_DIR, "model.pkl"), "rb") as f:
    vectorizer, model = pickle.load(f)

# ==============================
# 📄 Cargar intents
# ==============================
with open(os.path.join(BASE_DIR, "intents.json"), encoding="utf-8") as f:
    intents = json.load(f)

# ==============================
# 🧠 Memoria simple (contexto)
# ==============================
context = {
    "last_product": None
}

# ==============================
# 🔤 Normalizar texto
# ==============================
def normalize_text(text):
    text = text.lower().strip()
    text = unicodedata.normalize("NFD", text)
    text = "".join(c for c in text if unicodedata.category(c) != "Mn")
    return text

# ==============================
# 🧠 Obtener intención
# ==============================
def get_intent(message):
    message = normalize_text(message)

    X = vectorizer.transform([message])
    probs = model.predict_proba(X)[0]

    max_prob = max(probs)
    intent_index = probs.argmax()
    intent = model.classes_[intent_index]

    return intent, max_prob

# ==============================
# 💬 Obtener respuesta
# ==============================
def get_response(message, threshold=0.25):
    normalized_message = normalize_text(message)
    intent, confidence = get_intent(message)

    print(f"\nMensaje: {message}")
    print(f"Intent detectado: {intent}")
    print(f"Confianza: {confidence}")

    # ==============================
    # 🧠 PRODUCTOS VÁLIDOS
    # ==============================
    productos_validos = ["taza", "playera", "lamina"]

    producto_detectado = None

    for producto in productos_validos:
        if producto in normalized_message:
            producto_detectado = producto
            context["last_product"] = producto
            break

    # ==============================
    # 💰 RESPUESTA DE PRECIO INTELIGENTE
    # ==============================
    if intent == "precio" or any(word in normalized_message for word in ["cuanto", "precio", "vale"]):

        # ✅ Si menciona producto directamente
        if producto_detectado:
            if producto_detectado == "taza":
                return "💰 La taza cuesta $100 MXN ☕"
            elif producto_detectado == "playera":
                return "💰 La playera cuesta $200 MXN 👕"
            elif producto_detectado == "lamina":
                return "💰 La lámina cuesta $150 MXN 🖼️"

        # ✅ Si no menciona producto → usar contexto
        if context["last_product"]:
            if context["last_product"] == "taza":
                return "💰 La taza cuesta $100 MXN ☕"
            elif context["last_product"] == "playera":
                return "💰 La playera cuesta $200 MXN 👕"
            elif context["last_product"] == "lamina":
                return "💰 La lámina cuesta $150 MXN 🖼️"

        # ❌ Producto no válido
        return "🤔 No tengo ese producto. Solo manejo:\n- Tazas ☕\n- Playeras 👕\n- Láminas 🖼️"

    # ==============================
    # 🛒 CARRITO CON CONTEXTO
    # ==============================
    if intent == "carrito":
        if context["last_product"]:
            return f"🛒 Puedes agregar tu {context['last_product']} desde el catálogo usando el botón de carrito."
        else:
            return "🛒 Primero elige un producto para poder agregarlo al carrito."

    # ==============================
    # 🔥 INTENTS IMPORTANTES
    # ==============================
    important_intents = [
        "ver_productos",
        "producto_taza",
        "producto_playera",
        "producto_lamina",
        "carrito",
        "pedido",
        "precio"
    ]

    # ==============================
    # 🚨 FALLBACK INTELIGENTE
    # ==============================
    if confidence < threshold and intent not in important_intents:
        for i in intents["intents"]:
            if i["tag"] == "fallback":
                return random.choice(i["responses"])

    # ==============================
    # 🎯 RESPUESTA NORMAL
    # ==============================
    for i in intents["intents"]:
        if i["tag"] == intent:
            if i.get("responses"):
                return random.choice(i["responses"])

    # ==============================
    # ❌ RESPUESTA FINAL
    # ==============================
    return "No entendí tu mensaje 😅"