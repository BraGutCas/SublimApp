document.addEventListener("DOMContentLoaded", () => {

    // =====================================
    // MOSTRAR ALERT SI VIENE DE CHECKOUT
    // =====================================
    if (localStorage.getItem("orderSuccess")) {

        alert("🎉 Pedido completado con éxito");

        localStorage.removeItem("orderSuccess");
    }

    const userSection = document.getElementById("user-section");

    // Si la página no tiene navbar, no hacer nada
    if (!userSection) return;

    const user = JSON.parse(localStorage.getItem("user"));

    // =====================================
    // SI NO HAY USUARIO
    // =====================================
    if (!user) {

        userSection.innerHTML = `
            <a href="login.html" class="login-btn">Login</a>
        `;
        return;
    }

    // =====================================
    // OBTENER NOMBRE DE USUARIO
    // =====================================
    const userName = user.name || user.username || "Usuario";

    // =====================================
    // OBTENER INICIALES
    // =====================================
    const initials = userName
        .split(" ")
        .map(n => n[0])
        .join("")
        .toUpperCase();

    // =====================================
    // CREAR MENÚ DE USUARIO
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
    // ABRIR / CERRAR MENÚ
    // =====================================
    avatar.addEventListener("click", (e) => {

        e.stopPropagation();

        menu.style.display =
            menu.style.display === "block" ? "none" : "block";
    });

    // =====================================
    // CERRAR MENÚ SI SE HACE CLICK FUERA
    // =====================================
    document.addEventListener("click", () => {

        if (menu) {
            menu.style.display = "none";
        }

    });

    // =====================================
    // LOGOUT
    // =====================================
    logoutBtn.addEventListener("click", () => {

        localStorage.removeItem("token");
        localStorage.removeItem("user");

        window.location.href = "index.html";
    });

});