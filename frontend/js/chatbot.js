// ==============================
// 🌐 CONFIGURACIÓN API
// ==============================
const API_URL = "http://192.168.100.2:7000/predict";

// ==============================
// 📌 ELEMENTOS DEL DOM
// ==============================
const chatMessages = document.getElementById("chatbot-messages");
const chatInput = document.getElementById("chat-input");
const sendBtn = document.getElementById("send-btn");
const chatToggle = document.getElementById("chatbot-toggle");
const chatbot = document.getElementById("chatbot-container");

// ==============================
// 💬 AGREGAR MENSAJE
// ==============================
function addMessage(sender, text) {
    const messageWrapper = document.createElement("div");
    messageWrapper.classList.add("message");

    if (sender === "Tú") {
        messageWrapper.classList.add("user");
    } else {
        messageWrapper.classList.add("bot");
    }

    messageWrapper.textContent = text;

    chatMessages.appendChild(messageWrapper);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// ==============================
// ⏳ INDICADOR "ESCRIBIENDO"
// ==============================
function showTypingIndicator() {
    const typing = document.createElement("div");
    typing.classList.add("message", "bot");
    typing.id = "typing-indicator";

    typing.textContent = "Escribiendo...";

    chatMessages.appendChild(typing);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

function removeTypingIndicator() {
    const typing = document.getElementById("typing-indicator");
    if (typing) typing.remove();
}

// ==============================
// 🚀 ENVIAR MENSAJE (CORREGIDO)
// ==============================
async function sendMessage() {
    const message = chatInput.value.trim();
    if (!message) return;

    addMessage("Tú", message);
    chatInput.value = "";

    showTypingIndicator();

    // ⏱️ Creamos un controlador para abortar si tarda demasiado (Timeout)
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 segundos

    try {
        const response = await fetch(API_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ message }),
            signal: controller.signal // Conectamos el timeout
        });

        clearTimeout(timeoutId); // Limpiar el timer si respondió a tiempo

        let data;
        try {
            data = await response.json();
        } catch {
            throw new Error("Respuesta inválida del servidor");
        }

        if (!response.ok) {
            throw new Error(data.response || "Error del servidor");
        }

        addMessage("Bot", data.response || "Sin respuesta 🤖");

    } catch (error) {
        console.error("ERROR FETCH:", error);
        
        let errorMsg = "No se pudo conectar con el servidor 🤖❌ Inténtalo más tarde";
        
        if (error.name === 'AbortError') {
            errorMsg = "El servidor tardó demasiado en responder 🤖⏳";
        }
        
        addMessage("Bot", errorMsg);
    } finally {
        // ✅ IMPORTANTE: Esto se ejecuta SIEMPRE, ya sea que funcione o falle
        // Así aseguramos que desaparezca el "Escribiendo..." en el celular
        removeTypingIndicator();
        clearTimeout(timeoutId);
    }
}

// ==============================
// 🎯 EVENTOS
// ==============================
sendBtn.addEventListener("click", sendMessage);

chatInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
        sendMessage();
    }
});

// ==============================
// 🔄 TOGGLE CHAT
// ==============================
chatToggle.addEventListener("click", () => {
    const isOpen = chatbot.style.display === "flex";

    if (isOpen) {
        chatbot.style.display = "none";
        chatToggle.textContent = "💬";
    } else {
        chatbot.style.display = "flex";
        chatToggle.textContent = "✖";
    }
});