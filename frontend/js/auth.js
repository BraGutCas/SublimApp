// ==============================
// 🌐 CONFIGURACIÓN
// ==============================
const API_BASE = "http://192.168.100.2:5000/api/auth";

// ==============================
// 📌 HELPERS
// ==============================
function showError(message) {
    alert(message);
}

// ==============================
// 📝 REGISTRO
// ==============================
const registerForm = document.getElementById("registerForm");

if (registerForm) {
    registerForm.addEventListener("submit", async (e) => {
        e.preventDefault();       

        const nameInput = document.getElementById("name");
        const emailInput = document.getElementById("email");
        const passwordInput = document.getElementById("password");

        const name = nameInput.value.trim();
        const email = emailInput.value.trim();
        const password = passwordInput.value;

        if (!name || !email || !password) {
            showError("Completa todos los campos");
            return;
        }

        try {
            const response = await fetch(`${API_BASE}/register`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ name, email, password })
            });

            let data;
            try {
                data = await response.json();
            } catch {
                throw new Error("Respuesta inválida del servidor");
            }

            if (!response.ok) {
                throw new Error(data.message || "Error al registrar");
            }       
            
            window.location.href = "login.html";
            alert("Cuenta creada correctamente ✅");

        } catch (error) {
            console.error("REGISTER ERROR:", error);
            showError(error.message || "Error de conexión con el servidor");
        }
    });
}

// ==============================
// 🔐 LOGIN
// ==============================
const loginForm = document.getElementById("loginForm");

if (loginForm) {
    loginForm.addEventListener("submit", async (e) => {
        e.preventDefault();

        const email = document.getElementById("email")?.value.trim();
        const password = document.getElementById("password")?.value;

        if (!email || !password) {
            showError("Completa todos los campos");
            return;
        }

        try {
            const response = await fetch(`${API_BASE}/login`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ email, password })
            });

            let data;
            try {
                data = await response.json();
            } catch {
                throw new Error("Respuesta inválida del servidor");
            }

            if (!response.ok) {
                throw new Error(data.message || "Credenciales incorrectas");
            }

            // ==============================
            // ✅ GUARDAR SESIÓN
            // ==============================
            localStorage.setItem("token", data.access_token);
            localStorage.setItem("user", JSON.stringify(data.user));

            console.log("LOGIN OK:", data.user);

            // ==============================
            // 🔀 REDIRECCIÓN POR ROL
            // ==============================
            if (data.user.role === "admin") {
                window.location.href = "admin-products.html";
            } else {
                window.location.href = "index.html";
            }

        } catch (error) {
            console.error("LOGIN ERROR:", error);
            showError(error.message || "Error de conexión con el servidor");
        }
    });
}