const ordersDiv = document.getElementById("orders");
const user = JSON.parse(localStorage.getItem("user"));
const token = localStorage.getItem("token");

if (!user || !token) {
    alert("Debes iniciar sesión");
    window.location.href = "login.html";
}

// =========================
// OBTENER MIS PEDIDOS
// =========================
fetch("http://127.0.0.1:5000/api/orders/mine", {
    method: "GET",
    headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json"
    }
})
.then(res => {
    if (!res.ok) {
        throw new Error("No se pudieron obtener los pedidos");
    }
    return res.json();
})
.then(data => {

    if (!Array.isArray(data) || data.length === 0) {
        ordersDiv.innerHTML = `
            <p class="empty-orders">
                No tienes pedidos registrados 🛒
            </p>
        `;
        return;
    }

    ordersDiv.innerHTML = "";

    data.forEach(order => {

        const orderCard = document.createElement("div");
        orderCard.className = "order-card";

        // 📅 Fecha (ya viene en hora México)
        const fecha = new Date(order.created_at).toLocaleString("es-MX", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
            hour12: true
        });

        // 📦 Productos del pedido
        let itemsHTML = `
            <div class="order-items">
                <h4>Productos</h4>
                <ul>
        `;

        order.items.forEach(item => {
            itemsHTML += `
                <li style="margin-bottom:15px;">
                    <div style="display:flex; align-items:center; gap:15px;">

                        ${item.image ? `
                            <img 
                                src="http://127.0.0.1:5000/${item.image}" 
                                width="80"
                                style="border-radius:8px;"
                            >
                        ` : ""}

                        <div>
                            <strong>${item.product_name}</strong><br>

                            ${
                                item.size 
                                ? `<span><strong>Talla:</strong> ${item.size}</span><br>` 
                                : ""
                            }

                            ${
                                item.cup_type 
                                ? `<span><strong>Tipo:</strong> ${item.cup_type}</span><br>` 
                                : ""
                            }

                            ${item.quantity} × $${item.price}
                        </div>

                    </div>
                </li>
            `;
        });

        itemsHTML += `
                </ul>
            </div>
        `;

        orderCard.innerHTML = `
            <div class="order-header">
                <div>
                    <h3>Pedido #${order.order_number}</h3>
                    <span class="order-date">${fecha}</span>
                </div>

                <span class="status-badge ${order.status}">
                    ${order.status}
                </span>
            </div>

            ${itemsHTML}

            <div class="order-footer">
                <span class="order-total">Total: $${order.total}</span>
            </div>
        `;

        ordersDiv.appendChild(orderCard);
    });
})
.catch(err => {
    console.error(err);
    ordersDiv.innerHTML = `
        <p class="error-orders">
            Error al cargar los pedidos
        </p>
    `;
});
