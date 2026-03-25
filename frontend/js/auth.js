const API_BASE = "http://127.0.0.1:5000/api/auth";

/* ================= REGISTRO ================= */
const registerForm = document.getElementById("registerForm");

if (registerForm) {
    registerForm.addEventListener("submit", async (e) => {
        e.preventDefault();

        const data = {
            name: document.getElementById("name").value.trim(),
            email: document.getElementById("email").value.trim(),
            password: document.getElementById("password").value
        };

        try {
            const response = await fetch(`${API_BASE}/register`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data)
            });

            const result = await response.json();
            alert(result.message);

            if (response.ok) {
                window.location.href = "login.html";
            }
        } catch (err) {
            console.error(err);
            alert("Error de conexión con el servidor");
        }
    });
}

/* ================= LOGIN ================= */
const loginForm = document.getElementById("loginForm");

if (loginForm) {
    loginForm.addEventListener("submit", async (e) => {
        e.preventDefault();

        const data = {
            email: document.getElementById("email").value.trim(),
            password: document.getElementById("password").value
        };

        try {
            const response = await fetch(`${API_BASE}/login`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data)
            });

            const result = await response.json();
            console.log(result)

            if (!response.ok) {
                alert(result.message || "Credenciales incorrectas");
                return;
            }


            // ✅ GUARDAR TOKEN Y USUARIO
            localStorage.setItem("token", result.access_token); // ⬅️ IMPORTANTE
            localStorage.setItem("user", JSON.stringify(result.user));

            console.log("LOGIN OK:", result.user);

            // 🔀 REDIRECCIÓN POR ROL
            if (result.user.role === "admin") {
                window.location.href = "admin-products.html";
            } else {
                window.location.href = "index.html";
            }

        } catch (err) {
            console.error(err);
            alert("Error de conexión con el servidor");
        }
    });
}
