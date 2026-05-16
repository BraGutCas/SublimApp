document.addEventListener("DOMContentLoaded", () => {

    // =====================================
    // 🍔 MENU HAMBURGUESA
    // =====================================
    const toggleBtn = document.getElementById("menu-toggle");
    const navLinks = document.getElementById("nav-links");

    if (toggleBtn && navLinks) {
        toggleBtn.addEventListener("click", () => {
            navLinks.classList.toggle("active");
        });

        // cerrar menú al hacer click en link
        document.querySelectorAll("#nav-links a").forEach(link => {
            link.addEventListener("click", () => {
                navLinks.classList.remove("active");
            });
        });
    }

    // =====================================
    // 🎉 ALERT DE CHECKOUT
    // =====================================
    if (localStorage.getItem("orderSuccess")) {
        alert("🎉 Pedido completado con éxito");
        localStorage.removeItem("orderSuccess");
    }

    // =====================================
    // 👤 USER SECTION
    // =====================================
    const userSection = document.getElementById("user-section");

    if (!userSection) return;

    const user = JSON.parse(localStorage.getItem("user"));

    // =====================================
    // ❌ SIN USUARIO
    // =====================================
    if (!user) {
        userSection.innerHTML = `
            <a href="login.html" class="login-btn">Iniciar Sesión</a>
        `;
        return;
    }

    // =====================================
    // 👤 NOMBRE E INICIALES
    // =====================================
    const userName = user.name || user.username || "Usuario";

    const initials = userName
        .split(" ")
        .map(n => n[0])
        .join("")
        .toUpperCase();

    // =====================================
    // 🎨 RENDER USER
    // =====================================
    userSection.innerHTML = `
        <div class="user-wrapper">

            <div class="user-avatar" id="avatar">
                ${initials}
            </div>

            <div class="user-menu" id="menu">

                <div class="user-name">
                    ${userName}
                </div>

                <button id="logout">
                    Cerrar sesión
                </button>

            </div>

        </div>
    `;

    const avatar = document.getElementById("avatar");
    const menu = document.getElementById("menu");
    const logoutBtn = document.getElementById("logout");

    // =====================================
    // 🔽 TOGGLE USER MENU
    // =====================================
    avatar?.addEventListener("click", (e) => {
        e.stopPropagation();
        menu.classList.toggle("active");
    });

    // =====================================
    // ❌ CERRAR MENU USER
    // =====================================
    document.addEventListener("click", (e) => {
        if (menu && avatar && !menu.contains(e.target) && !avatar.contains(e.target)) {
            menu.classList.remove("active");
        }
    });

    // =====================================
    // 🚪 LOGOUT
    // =====================================
    logoutBtn?.addEventListener("click", () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        window.location.href = "index.html";
    });

});