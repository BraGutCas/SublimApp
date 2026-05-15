document.addEventListener("DOMContentLoaded", () => {

    const BASE_URL = "http://192.168.100.2:5000";

    const cartItemsContainer = document.getElementById("cart-items");
    const totalEl = document.getElementById("cart-total");
    const checkoutBtn = document.getElementById("checkoutBtn");

    const token = localStorage.getItem("token");

    // ===============================
    // 🔐 VALIDACIÓN
    // ===============================
    if (!token) {
        alert("Debes iniciar sesión");
        window.location.href = "login.html";
        return;
    }

    // ===============================
    // 📦 CARGAR CARRITO
    // ===============================
    async function loadCart() {
        try {

            const response = await fetch(`${BASE_URL}/api/cart/`, {
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            });

            if (!response.ok) {
                throw new Error("Error al obtener carrito");
            }

            const data = await response.json();

            renderCart(data);

        } catch (error) {
            console.error("Error cargando carrito:", error);
        }
    }

    // ===============================
    // 🎨 RENDERIZAR
    // ===============================
    function renderCart(data) {

        cartItemsContainer.innerHTML = "";

        if (!data.items || data.items.length === 0) {
            cartItemsContainer.innerHTML = "<p>Tu carrito está vacío 😢</p>";
            totalEl.textContent = "$0.00";
            return;
        }

        data.items.forEach(item => {

            const div = document.createElement("div");
            div.className = "cart-item";

            // 🔥 INFO EXTRA
            let extraInfo = "";

            if (item.size) {
                extraInfo = `<p><strong>Talla:</strong> ${item.size}</p>`;
            } 
            else if (item.cup_type) {
                extraInfo = `<p><strong>Tipo:</strong> ${item.cup_type}</p>`;
            }

            // 🔥 IMAGEN CORRECTA
            let imageUrl = "";

            if (item.image) {
                imageUrl = item.image.startsWith("http")
                    ? item.image
                    : `${BASE_URL}/${item.image}`;
            }

            div.innerHTML = `
                ${imageUrl ? `<img src="${imageUrl}" alt="producto">` : ""}

                <div class="cart-info">

                    <h3>${item.name}</h3>

                    ${extraInfo}

                    <p>Cantidad: ${item.quantity}</p>
                    <p>Precio: $${item.price.toFixed(2)}</p>
                    <p><strong>Subtotal: $${item.subtotal.toFixed(2)}</strong></p>

                </div>

                <button class="remove-btn">✕</button>
            `;

            // 🔥 ELIMINAR ITEM
            div.querySelector(".remove-btn")
                .addEventListener("click", () => removeItem(item.id));

            cartItemsContainer.appendChild(div);
        });

        totalEl.textContent = `$${data.total.toFixed(2)}`;
    }

    // ===============================
    // ❌ ELIMINAR ITEM
    // ===============================
    async function removeItem(id) {

        try {

            const response = await fetch(`${BASE_URL}/api/cart/${id}`, {
                method: "DELETE",
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            });

            if (!response.ok) {
                throw new Error("Error al eliminar");
            }

            loadCart();

        } catch (error) {
            console.error("Error eliminando item:", error);
        }
    }

    // ===============================
    // 🧾 CHECKOUT
    // ===============================
    checkoutBtn?.addEventListener("click", () => {
        window.location.href = "checkout.html";
    });

    // ===============================
    // 🚀 INIT
    // ===============================
    loadCart();
});