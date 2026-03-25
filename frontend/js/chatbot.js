const chatMessages = document.getElementById("chat-messages");
const chatInput = document.getElementById("chat-input");
const sendBtn = document.getElementById("send-btn");
const chatToggle = document.getElementById("chat-toggle");
const chatbot = document.getElementById("chatbot");

function addMessage(sender, text) {
    const messageWrapper = document.createElement("div");
    messageWrapper.classList.add("message");

    if (sender === "Tú") {
        messageWrapper.classList.add("user-message");
    } else {
        messageWrapper.classList.add("bot-message");
    }

    messageWrapper.innerHTML = `
        <div class="bubble">
            ${text}
        </div>
    `;

    chatMessages.appendChild(messageWrapper);
    chatMessages.scrollTop = chatMessages.scrollHeight;
    return messageWrapper;
}

// 🔹 Mostrar indicador de escribiendo
function showTypingIndicator() {
    const typing = document.createElement("div");
    typing.classList.add("message", "bot-message");
    typing.id = "typing-indicator";

    typing.innerHTML = `
        <div class="bubble typing">
            escribiendo...
        </div>
    `;

    chatMessages.appendChild(typing);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

function removeTypingIndicator() {
    const typing = document.getElementById("typing-indicator");
    if (typing) typing.remove();
}

sendBtn.addEventListener("click", async () => {
    const message = chatInput.value.trim();
    if (!message) return;

    addMessage("Tú", message);
    chatInput.value = "";

    showTypingIndicator();

    try {
        const response = await fetch("http://127.0.0.1:5000/api/chatbot/", {
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
        addMessage("Bot", error.message || "No se pudo conectar 🤖❌");
    }
});

// Enviar con Enter
chatInput.addEventListener("keypress", function (e) {
    if (e.key === "Enter") {
        sendBtn.click();
    }
});

chatToggle.addEventListener("click", () => {
    const isVisible = chatbot.classList.contains("chat-visible");

    if (isVisible) {
        chatbot.classList.remove("chat-visible");
        chatbot.classList.add("chat-hidden");
        chatToggle.textContent = "💬";
    } else {
        chatbot.classList.remove("chat-hidden");
        chatbot.classList.add("chat-visible");
        chatToggle.textContent = "✖";
    }
});