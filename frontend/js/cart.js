document.addEventListener("DOMContentLoaded", () => {

    const cartItemsContainer = document.getElementById("cart-items");
    const totalEl = document.getElementById("cart-total");
    const checkoutBtn = document.getElementById("checkoutBtn");

    const token = localStorage.getItem("token");

    if (!token) {
        alert("Debes iniciar sesión");
        window.location.href = "login.html";
        return;
    }

    // ===============================
    // CARGAR CARRITO DESDE BACKEND
    // ===============================
    async function loadCart() {
        try {

            const response = await fetch("http://127.0.0.1:5000/api/cart/", {
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            });

            const data = await response.json();

            renderCart(data);

        } catch (error) {
            console.error("Error cargando carrito:", error);
        }
    }

    // ===============================
    // RENDERIZAR CARRITO
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

            let extraInfo = "";

            if (item.size) {
                extraInfo = `<p><strong>Talla:</strong> ${item.size}</p>`;
            } 
            else if (item.cup_type) {
                extraInfo = `<p><strong>Tipo:</strong> ${item.cup_type}</p>`;
            }

            div.innerHTML = `
                <div class="cart-info">

                    <h4>${item.name}</h4>

                    ${extraInfo}

                    <p>Cantidad: ${item.quantity}</p>
                    <p>Precio unitario: $${item.price.toFixed(2)}</p>
                    <p><strong>Subtotal: $${item.subtotal.toFixed(2)}</strong></p>

                    ${item.image ? `
                        <img src="http://127.0.0.1:5000/${item.image}" width="80">
                    ` : ""}

                </div>

                <button class="remove-btn">
                    ✕
                </button>
            `;

            const removeBtn = div.querySelector(".remove-btn");

            removeBtn.addEventListener("click", () => {
                removeItem(item.id);
            });

            cartItemsContainer.appendChild(div);

        });

        totalEl.textContent = `$${data.total.toFixed(2)}`;
    }

    // ===============================
    // ELIMINAR ITEM
    // ===============================
    async function removeItem(id) {

        try {

            await fetch(`http://127.0.0.1:5000/api/cart/${id}`, {
                method: "DELETE",
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            });

            loadCart();

        } catch (error) {
            console.error("Error eliminando item:", error);
        }
    }

    // ===============================
    // IR A CHECKOUT
    // ===============================
    checkoutBtn?.addEventListener("click", () => {
        window.location.href = "checkout.html";
    });

    // ===============================
    // INICIAR
    // ===============================
    loadCart();

});