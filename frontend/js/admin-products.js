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
const BASE_URL = "http://192.168.100.2:5000";
const API_URL = `${BASE_URL}/api/products/`;

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

        if (!response.ok) {
            throw new Error("Error al obtener productos");
        }

        const products = await response.json();

        container.innerHTML = "";

        products.forEach(product => {

            // ==============================
            // 🖼️ IMAGEN
            // ==============================
            let imageHtml = `
                <div class="no-image">
                    Sin imagen
                </div>
            `;

            if (product.image_url) {

                const imageUrl = product.image_url.startsWith("http")
                    ? product.image_url
                    : `${BASE_URL}${product.image_url}`;

                imageHtml = `
                    <img 
                        src="${imageUrl}" 
                        alt="producto"
                    >
                `;
            }

            // ==============================
            // 📦 CARD
            // ==============================
            const card = document.createElement("div");

            card.className = `
                product-card 
                ${!product.is_active ? "inactive" : ""}
            `;

            card.innerHTML = `

                ${imageHtml}

                <h3>${product.name}</h3>

                <p>$${product.price}</p>

                <p>
                    <small>
                        ${product.category || "Sin categoría"}
                    </small>
                </p>

                ${
                    product.options
                    ? `
                        <p class="options-tag">
                            <small>
                                Opciones: ${product.options}
                            </small>
                        </p>
                    `
                    : ""
                }

                <button 
                    class="toggle-product-btn" 
                    data-id="${product.id}"
                >
                    ${product.is_active ? "Desactivar" : "Activar"}
                </button>
            `;

            container.appendChild(card);
        });

    } catch (error) {

        console.error("Error cargando productos:", error);

        container.innerHTML = `
            <p style="text-align:center;">
                Error al cargar productos
            </p>
        `;
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

        if (!response.ok) {
            throw new Error();
        }

        loadProducts();

    } catch (error) {

        console.error(error);
        alert("Error al actualizar producto");
    }
});

// ==============================
// 🧾 MODAL
// ==============================
const addBtn = document.getElementById("addProductBtn");
const modal = document.getElementById("productModal");
const closeModal = document.getElementById("closeModal");
const form = document.getElementById("product-form");

// ==============================
// 📂 ABRIR MODAL
// ==============================
addBtn.addEventListener("click", () => {
    modal.classList.remove("hidden");
});

// ==============================
// ❌ CERRAR MODAL
// ==============================
closeModal.addEventListener("click", () => {

    modal.classList.add("hidden");

    form.reset();

    imagePreview.classList.add("hidden");
});

// ==============================
// 🖼️ PREVIEW IMAGEN
// ==============================
imageInput.addEventListener("change", () => {

    const file = imageInput.files[0];

    if (!file) {

        imagePreview.classList.add("hidden");
        return;
    }

    const reader = new FileReader();

    reader.onload = (e) => {

        imagePreview.src = e.target.result;

        imagePreview.classList.remove("hidden");
    };

    reader.readAsDataURL(file);
});

// ==============================
// 🚀 ENVIAR PRODUCTO
// ==============================
form.addEventListener("submit", async (e) => {

    e.preventDefault();

    const name = document.getElementById("name").value.trim();

    const description = document
        .getElementById("description")
        .value
        .trim();

    const price = document.getElementById("price").value;

    const category = document
        .getElementById("category")
        .value
        .trim();

    const options = document
        .getElementById("optionsInput")
        .value
        .trim();

    const image = imageInput.files[0];

    // ==============================
    // ✅ VALIDACIÓN
    // ==============================
    if (!name || !price) {

        alert("Completa los campos obligatorios");
        return;
    }

    // ==============================
    // 📦 FORM DATA
    // ==============================
    const formData = new FormData();

    formData.append("name", name);
    formData.append("description", description);
    formData.append("price", price);
    formData.append("category", category);
    formData.append("options", options);

    if (image) {
        formData.append("image", image);
    }

    // ==============================
    // 🚀 FETCH
    // ==============================
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
            throw new Error(
                data.error || "Error al agregar producto"
            );
        }

        // ==============================
        // ✅ ÉXITO
        // ==============================
        alert("Producto agregado correctamente ✅");

        form.reset();

        imagePreview.classList.add("hidden");

        modal.classList.add("hidden");

        loadProducts();

    } catch (error) {

        console.error(error);

        alert("Error: " + error.message);
    }
});