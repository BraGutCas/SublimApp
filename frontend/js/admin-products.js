const token = localStorage.getItem("token");
const user = JSON.parse(localStorage.getItem("user"));

// 🔐 PROTECCIÓN
if (!token || !user || user.role !== "admin") {
    alert("Acceso no autorizado");
    window.location.href = "login.html";
}

const API_URL = "http://127.0.0.1:5000/api/products/";
const container = document.getElementById("products");

async function loadProducts() {
    console.log(products);
    try {
        const response = await fetch(API_URL, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });

        const products = await response.json();

        container.innerHTML = "";

        products.forEach(product => {

            const card = document.createElement("div");
            card.className = `product-card ${!product.is_active ? "inactive" : ""}`;

            card.innerHTML = `
                <img src="${product.image_url || 'img/no-image.jpg'}">
                <h3>${product.name}</h3>
                <p>$${product.price}</p>
                <p><small>${product.category}</small></p>

                <button class="toggle-product-btn" data-id="${product.id}">
                    ${product.is_active ? "Desactivar" : "Activar"}
                </button>
            `;

            container.appendChild(card);
        });

    } catch (error) {
        console.error("Error cargando productos:", error);
    }
}

loadProducts();


// =========================
// TOGGLE PRODUCTO
// =========================

document.addEventListener("click", async (e) => {

    if (!e.target.classList.contains("toggle-product-btn")) return;

    const productId = e.target.dataset.id;

    try {
        const response = await fetch(
            `http://127.0.0.1:5000/api/products/${productId}/toggle`,
            {
                method: "PUT",
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
        );

        if (!response.ok) throw new Error("Error");

        loadProducts();

    } catch (error) {
        alert("Error al actualizar producto");
    }
});