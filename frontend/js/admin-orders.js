const token = localStorage.getItem("token");
const user = JSON.parse(localStorage.getItem("user"));

// 🔐 PROTECCIÓN
if (!token || !user || user.role !== "admin") {
    alert("Acceso no autorizado");
    window.location.href = "login.html";
}

const ordersTable = document.getElementById("orders-list");
const totalOrdersEl = document.getElementById("total-orders");
const pendingOrdersEl = document.getElementById("pending-orders");
const completedOrdersEl = document.getElementById("completed-orders");
const totalIncomeEl = document.getElementById("total-income");

let allOrders = [];

// =========================
// CARGAR PEDIDOS
// =========================
async function loadOrders() {
    try {
        const response = await fetch(
            "http://127.0.0.1:5000/api/orders/admin/all",
            {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
        );

        const data = await response.json();

        if (!Array.isArray(data)) {
            throw new Error("Formato inválido");
        }

        allOrders = data;
        renderOrders(allOrders);

    } catch (error) {
        console.error(error);
        ordersTable.innerHTML = `
            <tr>
                <td colspan="6">Error al cargar pedidos</td>
            </tr>
        `;
    }
}

loadOrders();

// =========================
// RENDERIZAR PEDIDOS
// =========================
function renderOrders(orders) {

    ordersTable.innerHTML = "";

    let totalIncome = 0;
    let pending = 0;
    let completed = 0;

    orders.forEach(order => {

        totalIncome += order.total || 0;

        const status = order.status || "pendiente";

        if (status === "completado") {
            completed++;
        } else {
            pending++;
        }

        const fechaLocal = new Date(order.created_at)
            .toLocaleString("es-MX");

        const tr = document.createElement("tr");

        tr.innerHTML = `
            <td>
                #${order.id}<br>
                Usuario: #${order.order_number}
            </td>

            <td>${order.buyer}</td>
            <td>${order.email}</td>
            <td>${fechaLocal}</td>
            <td>$${order.total}</td>

            <td>
                <span class="status ${status}">
                    ${status}
                </span>

                <div class="action-buttons">

                    ${
                        status === "pendiente"
                        ? `<button class="btn-action btn-complete complete-btn" data-id="${order.id}">
                                <i class="fas fa-check"></i> Completar
                           </button>`
                        : ""
                    }

                    <button class="btn-action btn-products toggle-btn" data-id="${order.id}">
                        <i class="fas fa-box"></i> Productos
                    </button>

                    <button class="btn-action btn-shipping delivery-btn" data-id="${order.id}">
                        <i class="fas fa-truck"></i> Envío
                    </button>

                </div>
            </td>
        `;

        ordersTable.appendChild(tr);

        // 🔹 FILA DETALLE CON IMÁGENES
        const detailRow = document.createElement("tr");
        detailRow.style.display = "none";
        detailRow.id = `details-${order.id}`;

        detailRow.innerHTML = `
            <td colspan="6">
                ${order.items.map(item => {

                    let extraInfo = "";

                    if (item.size) {
                        extraInfo = `<p><strong>Talla:</strong> ${item.size}</p>`;
                    } 
                    else if (item.cup_type) {
                        extraInfo = `<p><strong>Tipo:</strong> ${item.cup_type}</p>`;
                    }

                    return `
                        <div style="margin-bottom:15px; padding:12px; border:1px solid #ddd; border-radius:8px;">
                            <p><strong>${item.product_name}</strong></p>
                            ${extraInfo}
                            <p>Cantidad: ${item.quantity}</p>
                            <p>Precio: $${item.price}</p>

                            ${
                                item.image
                                ? `
                                    <img src="http://127.0.0.1:5000/${item.image}" 
                                         width="120"
                                         style="border-radius:6px; margin-top:8px;">
                                    <br>
                                    <a href="http://127.0.0.1:5000/${item.image}" download>
                                       Descargar imagen
                                    </a>
                                  `
                                : "<p style='color:gray;'>Sin imagen</p>"
                            }
                        </div>
                    `;
                }).join("")}
            </td>
        `;

        ordersTable.appendChild(detailRow);
    });

    totalOrdersEl.textContent = orders.length;
    pendingOrdersEl.textContent = pending;
    completedOrdersEl.textContent = completed;
    totalIncomeEl.textContent = totalIncome.toFixed(2);
}

// =========================
// EVENTOS
// =========================
document.addEventListener("click", async (e) => {

    if (e.target.closest(".toggle-btn")) {
        const button = e.target.closest(".toggle-btn");
        const id = button.dataset.id;
        const detailRow = document.getElementById(`details-${id}`);
        if (!detailRow) return;

        detailRow.style.display =
            detailRow.style.display === "none"
            ? "table-row"
            : "none";
    }

    if (e.target.closest(".complete-btn")) {

        const button = e.target.closest(".complete-btn");
        const orderId = button.dataset.id;

        if (!confirm(`¿Marcar pedido #${orderId} como completado?`)) {
            return;
        }

        try {
            const response = await fetch(
                `http://127.0.0.1:5000/api/orders/${orderId}/status`,
                {
                    method: "PUT",
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({ status: "completado" })
                }
            );

            if (!response.ok) {
                throw new Error("Error al actualizar");
            }

            const index = allOrders.findIndex(o => o.id == orderId);
            if (index !== -1) {
                allOrders[index].status = "completado";
            }

            renderOrders(allOrders);

        } catch (error) {
            console.error(error);
            alert("Error al actualizar pedido");
        }
    }

    if (e.target.closest(".delivery-btn")) {
        const button = e.target.closest(".delivery-btn");
        const orderId = button.dataset.id;
        openDeliveryModal(orderId);
    }
});

// =========================
// MODAL ENVÍO
// =========================
function openDeliveryModal(orderId) {

    const order = allOrders.find(o => o.id == orderId);
    if (!order) return;

    const modalBody = document.getElementById("modalBody");

    modalBody.innerHTML = `
        <p><strong>Cliente:</strong> ${order.buyer || "-"}</p>
        <p><strong>Email:</strong> ${order.email || "-"}</p>
        <p><strong>Teléfono:</strong> ${order.phone || "-"}</p>
        <p><strong>Dirección:</strong> ${order.address || "-"}</p>
        <p><strong>Ciudad:</strong> ${order.city || "-"}</p>
        <p><strong>Notas:</strong> ${order.notes || "-"}</p>
        <hr>
        <p><strong>Total:</strong> $${order.total}</p>
    `;

    document.getElementById("orderModal").style.display = "block";
}

function closeOrderModal() {
    document.getElementById("orderModal").style.display = "none";
}