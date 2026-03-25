document.addEventListener("DOMContentLoaded", () => {

    const token = localStorage.getItem("token");
    const user = JSON.parse(localStorage.getItem("user"));

    if (!token || !user) {
        window.location.href = "login.html";
        return;
    }

    const form = document.getElementById("checkoutForm");
    const summaryContainer = document.getElementById("checkout-summary");

    // ===============================
    // CARGAR CARRITO
    // ===============================
    async function loadCheckout() {
        try {
            const response = await fetch("http://127.0.0.1:5000/api/cart/", {
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            });

            if (!response.ok) throw new Error("Error cargando carrito");

            const data = await response.json();
            renderCheckout(data);

        } catch (error) {
            console.error(error);
            summaryContainer.innerHTML = "<p>Error cargando carrito</p>";
        }
    }

    function renderCheckout(data) {

        summaryContainer.innerHTML = "";

        if (!data.items || data.items.length === 0) {
            summaryContainer.innerHTML = "<p>Tu carrito está vacío 😢</p>";
            return;
        }

        data.items.forEach(item => {

            const normalizedPath = item.image.replace(/\\/g, "/");
            const imageUrl = `http://127.0.0.1:5000/${normalizedPath}`;

            let extraInfo = "";

            if (item.size) {
                extraInfo = `<p><strong>Talla:</strong> ${item.size}</p>`;
            } else if (item.cup_type) {
                extraInfo = `<p><strong>Tipo:</strong> ${item.cup_type}</p>`;
            }

            summaryContainer.innerHTML += `
                <div class="checkout-item">
                    <div class="checkout-item-content">
                        <img src="${imageUrl}" 
                             alt="${item.name}" 
                             class="checkout-image">
                        <div class="checkout-info">
                            <h4>${item.name}</h4>
                            ${extraInfo}
                            <p>Cantidad: ${item.quantity}</p>
                            <p>Precio unitario: $${item.price.toFixed(2)}</p>
                            <p><strong>Subtotal: $${item.subtotal.toFixed(2)}</strong></p>
                        </div>
                    </div>
                </div>
            `;
        });

        summaryContainer.innerHTML += `
            <div class="checkout-total">
                <strong>Total: $${data.total.toFixed(2)}</strong>
            </div>
        `;
    }

    // ===============================
    // ENVIAR PEDIDO
    // ===============================
    form.addEventListener("submit", async function (e) {

        e.preventDefault();
        e.stopPropagation();

        const address = document.getElementById("address").value.trim();
        const city = document.getElementById("city").value.trim();
        const phone = document.getElementById("phone").value.trim();
        const notes = document.getElementById("notes").value.trim();

        if (!address || !city || !phone) {
            alert("Completa todos los campos obligatorios");
            return;
        }

        try {

            const response = await fetch(
                "http://127.0.0.1:5000/api/orders/from-cart",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${token}`
                    },
                    body: JSON.stringify({
                        customer_name: user.name,
                        phone,
                        address,
                        city,
                        notes
                    })
                }
            );

            if (!response.ok) {
                alert("❌ Error al crear el pedido");
                return;
            }

            // 🔥 Guardamos bandera de éxito
            localStorage.setItem("orderSuccess", "true");

            // 🔥 Redirección limpia (la que ya te funcionaba)
            window.location.href = "index.html";

        } catch (error) {
            console.error(error);
            alert("Error de conexión con el servidor");
        }

    });

    loadCheckout();

});