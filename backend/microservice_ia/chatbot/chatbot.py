import pickle
import json
import random
import os
import unicodedata

BASE_DIR = os.path.dirname(__file__)

# Cargar modelo y vectorizador
with open(os.path.join(BASE_DIR, "model.pkl"), "rb") as f:
    vectorizer, model = pickle.load(f)

# Cargar intents
with open(os.path.join(BASE_DIR, "intents.json"), encoding="utf-8") as f:
    intents = json.load(f)

def normalize_text(text):
    text = text.lower()
    text = unicodedata.normalize("NFD", text)
    text = "".join(c for c in text if unicodedata.category(c) != "Mn")
    return text

# -------------------------------
# Función para obtener intención
# -------------------------------
def get_intent(message):
    message = normalize_text(message)

    X = vectorizer.transform([message])
    probs = model.predict_proba(X)[0]

    max_prob = max(probs)
    intent_index = probs.argmax()
    intent = model.classes_[intent_index]

    return intent, max_prob

# ----------------------------------
# Función para respuesta genérica
# ----------------------------------
def get_response(message, threshold=0.2):
    intent, confidence = get_intent(message)

    # Si el modelo no está seguro, responde de forma natural
    if confidence < threshold:
        return ("No estoy seguro de haber entendido 🤔 "
    "Puedo ayudarte con precios, productos o pedidos.")

    for i in intents["intents"]:
        if i["tag"] == intent:
            # Si hay respuestas predefinidas
            if i.get("responses"):
                return random.choice(i["responses"])

    return "No entendí tu mensaje 😅"
