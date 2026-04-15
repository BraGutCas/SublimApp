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
// 🚀 ENVIAR MENSAJE
// ==============================
async function sendMessage() {
    const message = chatInput.value.trim();
    console.log("ENVIANDO:", message);
    if (!message) return;

    addMessage("Tú", message);
    chatInput.value = "";

    showTypingIndicator();

    try {
        const response = await fetch("http://127.0.0.1:7000/predict", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ message })
        });

        const data = await response.json();
        removeTypingIndicator();

        if (!response.ok) {
            throw new Error(data.response || "Error del servidor");
        }

        addMessage("Bot", data.response);

    } catch (error) {
        removeTypingIndicator();
        addMessage("Bot", "No se pudo conectar con el servidor 🤖❌");
        console.error(error);
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