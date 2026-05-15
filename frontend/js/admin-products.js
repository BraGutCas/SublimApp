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
const API_URL = "http://192.168.100.2:5000/api/products/";
const BASE_URL = "http://192.168.100.2:5000";

const container = document.getElementById("products");
const imageInput = document.getElementById("image");
const imagePreview = document.getElementById("imagePreview");

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

        if (!response.ok) throw new Error("Error al obtener productos");

        const products = await response.json();
        container.innerHTML = "";

        products.forEach(product => {
            let imageUrl = "assets/no-image.png";

            if (product.image_url) {
                imageUrl = product.image_url.startsWith("http")
                    ? product.image_url
                    : `${BASE_URL}${product.image_url}`;
            }

            const card = document.createElement("div");
            card.className = `product-card ${!product.is_active ? "inactive" : ""}`;

            card.innerHTML = `
                <img 
                    src="${imageUrl}" 
                    alt="producto"
                    onerror="this.src='assets/no-image.png'"
                >
                <h3>${product.name}</h3>
                <p>$${product.price}</p>
                <p><small>${product.category || "Sin categoría"}</small></p>
                ${product.options ? `<p class="options-tag"><small>Opciones: ${product.options}</small></p>` : ""}
                <button class="toggle-product-btn" data-id="${product.id}">
                    ${product.is_active ? "Desactivar" : "Activar"}
                </button>
            `;

            container.appendChild(card);
        });

    } catch (error) {
        console.error("Error cargando productos:", error);
        container.innerHTML = `<p style="text-align:center;">Error al cargar productos</p>`;
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
        const response = await fetch(`${API_URL}${productId}/toggle`, {
            method: "PUT",
            headers: {
                Authorization: `Bearer ${token}`
            }
        });

        if (!response.ok) throw new Error();
        loadProducts();

    } catch (error) {
        alert("Error al actualizar producto");
    }
});

// ==============================
// 🧾 MANEJO DEL MODAL Y FORMULARIO
// ==============================
const addBtn = document.getElementById("addProductBtn");
const modal = document.getElementById("productModal");
const closeModal = document.getElementById("closeModal");
const form = document.getElementById("product-form");

// Abrir modal
addBtn.addEventListener("click", () => {
    modal.classList.remove("hidden");
});

// Cerrar modal
closeModal.addEventListener("click", () => {
    modal.classList.add("hidden");
    form.reset();
    imagePreview.classList.add("hidden");
});

// Previsualización de imagen
imageInput.addEventListener("change", () => {
    const file = imageInput.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            imagePreview.src = e.target.result;
            imagePreview.classList.remove("hidden");
        };
        reader.readAsDataURL(file);
    } else {
        imagePreview.classList.add("hidden");
    }
});

// Enviar producto
form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const name = document.getElementById("name").value.trim();
    const description = document.getElementById("description").value.trim();
    const price = document.getElementById("price").value;
    const category = document.getElementById("category").value.trim();
    const options = document.getElementById("optionsInput").value.trim(); // Captura de opciones
    const image = imageInput.files[0];

    if (!name || !price) {
        alert("Completa todos los campos obligatorios");
        return;
    }

    const formData = new FormData();
    formData.append("name", name);
    formData.append("description", description);
    formData.append("price", price);
    formData.append("category", category);
    formData.append("options", options); // Se envía aunque esté vacío

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

        // Limpiar y cerrar
        form.reset();
        imagePreview.classList.add("hidden");
        modal.classList.add("hidden");

        loadProducts();

    } catch (error) {
        console.error(error);
        alert("Error: " + error.message);
    }
});