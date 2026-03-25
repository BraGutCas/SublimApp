const API_URL = "http://127.0.0.1:5000/api/products/";
const CART_API = "http://127.0.0.1:5000/api/cart/add";

// ======================================================
// MOSTRAR PRODUCTOS
// ======================================================
initializeApp();

// ======================================================
// FUNCIÓN PRINCIPAL
// ======================================================

function initializeApp() {

    loadProducts();

}


// ======================================================
// CARGAR PRODUCTOS
// ======================================================

function loadProducts() {

    fetch(API_URL)
        .then(response => response.json())
        .then(data => {

            const container = document.getElementById("products");
            if (!container) return;

            container.innerHTML = "";

            data.forEach(product => {

                const card = document.createElement("div");

                card.className = `product-card ${!product.is_active ? "inactive" : ""}`;

                card.innerHTML = `
                    <img 
                        src="${product.image_url || 'img/no-image.jpg'}" 
                        alt="${product.name}"
                    >
                    <h3>${product.name}</h3>
                    <p>${product.description}</p>
                    <p class="price">$${product.price}</p>
                    <p><small>${product.category}</small></p>

                    ${
                        product.is_active
                        ? `<button class="custom-btn">
                                Personalizar
                           </button>`
                        : `<button class="custom-btn" disabled 
                                 style="background:#ccc; cursor:not-allowed;">
                                Sin existencias
                           </button>`
                    }
                `;

                if (product.is_active) {
                    card.querySelector(".custom-btn")
                        .addEventListener("click", () => {
                            openModal(product.id, product.category);
                        });
                }

                container.appendChild(card);
            });
        })
        .catch(error => {
            console.error("Error al cargar productos:", error);
        });
}


// ======================================================
// MODAL
// ======================================================

const modal = document.getElementById("customModal");
const confirmBtn = document.getElementById("confirmAddBtn");
const cancelBtn = document.getElementById("cancelModalBtn");

let selectedProductId = null;
let selectedCategory = null;

function openModal(productId, category) {

    selectedProductId = productId;
    selectedCategory = category;

    const optionsDiv = document.getElementById("product-options");

    if (category === "playera") {
        optionsDiv.innerHTML = `
            <label>Talla:</label>
            <select id="modal-size">
                <option value="">Selecciona talla</option>
                <option value="S">S</option>
                <option value="M">M</option>
                <option value="L">L</option>
            </select>
        `;
    } 
    else if (category === "taza") {
        optionsDiv.innerHTML = `
            <label>Tipo de taza:</label>
            <select id="modal-cupType">
                <option value="">Selecciona tipo</option>
                <option value="blanca">Taza blanca</option>
                <option value="magica">Taza mágica</option>
            </select>
        `;
    } 
    else {
        optionsDiv.innerHTML = "";
    }

    modal.style.display = "flex";
}

cancelBtn?.addEventListener("click", () => {
    modal.style.display = "none";
});

confirmBtn?.addEventListener("click", () => {
    addToCartWithImages();
});


// ======================================================
// AGREGAR AL CARRITO
// ======================================================

async function addToCartWithImages() {

    const token = localStorage.getItem("token");

    if (!token) {
        alert("Debes iniciar sesión");
        window.location.href = "login.html";
        return;
    }

    const images = document.getElementById("modal-images").files;

    if (!images.length) {
        alert("Debes subir al menos una imagen");
        return;
    }

    let size = null;
    let cupType = null;

    if (selectedCategory === "playera") {
        size = document.getElementById("modal-size")?.value;
        if (!size) {
            alert("Debes seleccionar una talla");
            return;
        }
    }

    if (selectedCategory === "taza") {
        cupType = document.getElementById("modal-cupType")?.value;
        if (!cupType) {
            alert("Debes seleccionar el tipo de taza");
            return;
        }
    }

    const formData = new FormData();
    formData.append("product_id", selectedProductId);
    formData.append("quantity", 1);

    if (size) formData.append("size", size);
    if (cupType) formData.append("cup_type", cupType);

    for (let i = 0; i < images.length; i++) {
        formData.append("images", images[i]);
    }

    try {
        const response = await fetch(CART_API, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${token}`
            },
            body: formData
        });

        if (!response.ok) {
            const data = await response.json();
            throw new Error(data.error || "Error al agregar");
        }

        alert("Producto agregado al carrito 🛒");
        modal.style.display = "none";

    } catch (error) {
        console.error(error);
        alert(error.message);
    }
}