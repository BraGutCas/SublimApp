import pickle
import unicodedata
from sklearn.metrics import classification_report, accuracy_score

# ==============================
# 🔤 NORMALIZACIÓN
# ==============================
def normalize_text(text):
    text = text.lower().strip()
    text = unicodedata.normalize("NFD", text)
    text = "".join(c for c in text if unicodedata.category(c) != "Mn")
    return text

# ==============================
# 📦 CARGAR MODELO
# ==============================
try:
    with open("model.pkl", "rb") as f:
        vectorizer, model = pickle.load(f)
    print("✅ Modelo cargado correctamente.\n")
except FileNotFoundError:
    print("❌ Error: No se encontró model.pkl. Ejecuta primero tu script de entrenamiento.")
    exit()

# ==============================
# 🧪 DATASET DE PRUEBA EXPANDIDO (30 FRASES)
# ==============================
test_data = [
    # 1. Saludo
    ("que onda como estas", "saludo"),
    ("buen dia chatbot", "saludo"),
    ("hola hay alguien ahi", "saludo"),
    
    # 2. Ver Productos
    ("que cosas vendes", "ver_productos"),
    ("muestrame que hay disponible", "ver_productos"),
    ("quiero ver el inventario", "ver_productos"),
    
    # 3. Precio
    ("¿cual es el costo?", "precio"),
    ("dime los precios por favor", "precio"),
    ("cuanto dinero seria de todo", "precio"),
    
    # 4. Producto Taza
    ("me gustaria una tazita", "producto_taza"),
    ("quiero ver los diseños de tazas", "producto_taza"),
    ("necesito un mug para cafe", "producto_taza"),
    
    # 5. Producto Playera
    ("necesito una remera personalizada", "producto_playera"),
    ("busco camisas con mi diseño", "producto_playera"),
    ("quiero una t-shirt sublimada", "producto_playera"),
    
    # 6. Producto Lamina
    ("quiero un poster para mi cuarto", "producto_lamina"),
    ("enseñame los cuadros decorativos", "producto_lamina"),
    ("tienes lienzos personalizados", "producto_lamina"),
    
    # 7. Carrito
    ("ponlo en mi carrito", "carrito"),
    ("lo quiero comprar ya", "carrito"),
    ("añadir a la canasta", "carrito"),
    
    # 8. Personalización
    ("puedo ponerle una foto mia?", "personalizacion"),
    ("quiero un diseño propio", "personalizacion"),
    ("se puede editar con mi nombre", "personalizacion"),
    
    # 9. Tiempo de Entrega
    ("¿cuantos dias tarda en llegar?", "tiempo_entrega"),
    ("en cuanto tiempo hacen el envio", "tiempo_entrega"),
    ("cuando llegaria mi paquete", "tiempo_entrega"),
    
    # 10. Despedida
    ("muchas gracias por todo adios", "despedida"),
    ("ya me voy gracias", "despedida"),
    ("chao nos vemos luego", "despedida")
]

# Separar frases y etiquetas
test_sentences = [normalize_text(pair[0]) for pair in test_data]
y_true = [pair[1] for pair in test_data]

# ==============================
# 🚀 PREDICCIÓN Y MÉTRICAS
# ==============================
X_test = vectorizer.transform(test_sentences)
y_pred = model.predict(X_test)

print("=== REPORTE DE CLASIFICACIÓN (MÉTRICAS IA) ===")
# zero_division=0 evita errores si el modelo falla totalmente en una clase
print(classification_report(y_true, y_pred, zero_division=0))

accuracy = accuracy_score(y_true, y_pred)
print(f"Exactitud Final (Accuracy): {accuracy * 100:.2f}%")