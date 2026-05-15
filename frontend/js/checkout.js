document.addEventListener("DOMContentLoaded", () => {

    const BASE_URL = "http://192.168.100.2:5000";

    const form = document.getElementById("checkoutForm");
    const summaryContainer = document.getElementById("checkout-summary");

    const token = localStorage.getItem("token");

    // ===============================
    // 🔐 VALIDACIÓN DE SESIÓN
    // ===============================
    if (!token) {
        alert("Debes iniciar sesión");
        window.location.href = "login.html";
        return;
    }

    // ===============================
    // 📦 CARGAR RESUMEN DEL CARRITO
    // ===============================
    async function loadSummary() {
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
            renderSummary(data);

        } catch (error) {
            console.error(error);
            summaryContainer.innerHTML = `
                <p style="color:red;">Error cargando resumen</p>
            `;
        }
    }

    // ===============================
    // 🎨 RENDER RESUMEN
    // ===============================
    function renderSummary(data) {

        if (!data.items || data.items.length === 0) {
            summaryContainer.innerHTML = "<p>Tu carrito está vacío</p>";
            return;
        }

        let html = "";

        data.items.forEach(item => {

            let extra = "";

            if (item.size) {
                extra = `<p><strong>Talla:</strong> ${item.size}</p>`;
            } else if (item.cup_type) {
                extra = `<p><strong>Tipo:</strong> ${item.cup_type}</p>`;
            }

            const imageUrl = item.image
                ? (item.image.startsWith("http")
                    ? item.image
                    : `${BASE_URL}/${item.image}`)
                : "";

            html += `
                <div class="checkout-item">

                    <div class="checkout-item-content">

                        ${imageUrl ? `
                            <img src="${imageUrl}" class="checkout-image">
                        ` : ""}

                        <div class="checkout-info">
                            <h4>${item.name}</h4>
                            ${extra}
                            <p>${item.quantity} × $${item.price}</p>
                            <p><strong>$${item.subtotal}</strong></p>
                        </div>

                    </div>

                </div>
            `;
        });

        html += `
            <div class="checkout-total">
                Total: $${data.total}
            </div>
        `;

        summaryContainer.innerHTML = html;
    }

    // ===============================
    // 🧠 VALIDACIÓN FORM
    // ===============================
    function validateForm(address, city, phone) {

        if (!address || address.length < 5) {
            return "Dirección inválida";
        }

        if (!city || city.length < 2) {
            return "Ciudad inválida";
        }

        if (!phone || phone.length < 8) {
            return "Teléfono inválido";
        }

        return null;
    }

    // ===============================
    // 🚀 ENVIAR PEDIDO
    // ===============================
    form.addEventListener("submit", async (e) => {
        e.preventDefault();

        const address = document.getElementById("address").value.trim();
        const city = document.getElementById("city").value.trim();
        const phone = document.getElementById("phone").value.trim();
        const notes = document.getElementById("notes").value.trim();

        const error = validateForm(address, city, phone);

        if (error) {
            alert(error);
            return;
        }

        const submitBtn = form.querySelector("button");

        // 🔄 Loader
        submitBtn.disabled = true;
        submitBtn.textContent = "Procesando...";

        try {

            const response = await fetch(`${BASE_URL}/api/orders/from-cart`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({
                    address,
                    city,
                    phone,
                    notes
                })
            });

            let data;
            try {
                data = await response.json();
            } catch {
                throw new Error("Respuesta inválida del servidor");
            }

            if (!response.ok) {
                throw new Error(data.error || "Error al procesar pedido");
            }

            // ✅ Éxito
            localStorage.setItem("orderSuccess", "true");

            window.location.href = "index.html";

        } catch (error) {
            console.error(error);
            alert(error.message);
        } finally {
            submitBtn.disabled = false;
            submitBtn.textContent = "Confirmar pedido";
        }
    });

    // ===============================
    // 🚀 INIT
    // ===============================
    loadSummary();

});