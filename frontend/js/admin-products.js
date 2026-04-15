// ==============================
// 🔐 AUTENTICACIÓN
// ==============================
const token = localStorage.getItem("token");
const user = JSON.parse(localStorage.getItem("user"));

if (!token || !user || user.role !== "admin") {
    alert("Acceso no autorizado");
    window.location.href = "login.html";
}

// ==============================
// 🌐 CONFIG
// ==============================
const API_URL = "http://127.0.0.1:5000/api/products/";
const container = document.getElementById("products");

// ==============================
// 📦 CARGAR PRODUCTOS
// ==============================
async function loadProducts() {
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
                <p><small>${product.category || "Sin categoría"}</small></p>

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

// ==============================
// 🔄 ACTIVAR / DESACTIVAR
// ==============================
document.addEventListener("click", async (e) => {

    if (!e.target.classList.contains("toggle-product-btn")) return;

    const productId = e.target.dataset.id;

    try {
        const response = await fetch(
            `${API_URL}${productId}/toggle`,
            {
                method: "PUT",
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
        );

        if (!response.ok) throw new Error();

        loadProducts();

    } catch (error) {
        alert("Error al actualizar producto");
    }
});

// ==============================
// 🧾 MODAL AGREGAR PRODUCTO
// ==============================
const addBtn = document.getElementById("addProductBtn");
const modal = document.getElementById("productModal");
const closeModal = document.getElementById("closeModal");
const form = document.getElementById("product-form");

// abrir modal
addBtn.addEventListener("click", () => {
    modal.classList.remove("hidden");
});

// cerrar modal
closeModal.addEventListener("click", () => {
    modal.classList.add("hidden");
});

// enviar producto
form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const name = document.getElementById("name").value.trim();
    const description = document.getElementById("description").value.trim();
    const price = document.getElementById("price").value;
    const category = document.getElementById("category").value.trim();
    const image = document.getElementById("image").files[0];

    if (!name || !price) {
        alert("Completa todos los campos");
        return;
    }

    const formData = new FormData();
    formData.append("name", name);
    formData.append("description", description);
    formData.append("price", price);
    formData.append("category", category);

    if (image) {
        formData.append("image", image);
    }

    try {
        const response = await fetch(API_URL, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${token}`
            },
            body: formData
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || "Error al agregar producto");
        }

        alert("Producto agregado correctamente ✅");

        form.reset();
        modal.classList.add("hidden");

        loadProducts();

    } catch (error) {
        console.error(error);
        alert("Error: " + error.message);
    }
});