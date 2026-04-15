import json
import pickle
import unicodedata
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.naive_bayes import MultinomialNB

def normalize_text(text):
    text = text.lower().strip()
    text = unicodedata.normalize("NFD", text)
    text = "".join(c for c in text if unicodedata.category(c) != "Mn")
    return text

with open("intents.json", encoding="utf-8") as f:
    data = json.load(f)

texts = []
labels = []

for intent in data["intents"]:
    for pattern in intent["patterns"]:
        texts.append(normalize_text(pattern))
        labels.append(intent["tag"])

vectorizer = TfidfVectorizer(ngram_range=(1, 2))

X = vectorizer.fit_transform(texts)

model = MultinomialNB()
model.fit(X, labels)

with open("model.pkl", "wb") as f:
    pickle.dump((vectorizer, model), f)

print("✅ Modelo entrenado correctamente")
