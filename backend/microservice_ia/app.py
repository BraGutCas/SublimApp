from flask import Flask, request, jsonify
from flask_cors import CORS  # 👈 IMPORTANTE
from chatbot.chatbot import get_intent, get_response

app = Flask(__name__)

# ==============================
# 🔥 ACTIVAR CORS
# ==============================
CORS(app)  # permite conexiones desde frontend

# (opcional más controlado)
# CORS(app, resources={r"/predict": {"origins": "*"}})

# ==============================
# 🚀 ENDPOINT PRINCIPAL
# ==============================
@app.route("/predict", methods=["POST"])
def predict():
    data = request.get_json()

    # Validación básica
    if not data or "message" not in data:
        return jsonify({"error": "Mensaje inválido"}), 400

    message = data.get("message", "").strip()

    if not message:
        return jsonify({"error": "Mensaje vacío"}), 400

    # Obtener intención y respuesta
    intent, confidence = get_intent(message)
    response_text = get_response(message)

    return jsonify({
        "intent": intent,
        "confidence": float(confidence),
        "response": response_text
    })

# ==============================
# ▶️ RUN SERVER
# ==============================
if __name__ == "__main__":
    app.run(host="0.0.0.0", port=7000, debug=True)