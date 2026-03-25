from flask import Flask, request, jsonify
from chatbot.chatbot import get_intent, get_response

app = Flask(__name__)

@app.route("/predict", methods=["POST"])
def predict():
    data = request.get_json()
    message = data.get("message", "")

    if not message:
        return jsonify({"error": "Mensaje vacío"}), 400

    intent, confidence = get_intent(message)
    response_text = get_response(message)

    return jsonify({
        "intent": intent,
        "confidence": float(confidence),
        "response": response_text
    })

if __name__ == "__main__":
    app.run(port=6000)
