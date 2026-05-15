// ==============================
// 🌐 CONFIGURACIÓN API
// ==============================
const BASE_URL = "http://192.168.100.2:5000";
const PRODUCTS_URL = `${BASE_URL}/api/products/`;
const CART_API = `${BASE_URL}/api/cart/add`;

function guardarTiempo(tipo, tiempo) {
    const tiempos = JSON.parse(localStorage.getItem("metricas")) || [];

    tiempos.push({
        tipo: tipo,
        tiempo: parseFloat(tiempo),
        fecha: new Date().toLocaleTimeString()
    });

    localStorage.setItem("metricas", JSON.stringify(tiempos));
}

function verMetricas() {
    const tiempos = JSON.parse(localStorage.getItem("metricas")) || [];

    if (tiempos.length === 0) {
        console.log("No hay métricas aún");
        return;
    }

    console.table(tiempos);
}

function promedio(tipo) {
    const tiempos = JSON.parse(localStorage.getItem("metricas")) || [];

    const filtrados = tiempos.filter(t => t.tipo === tipo);

    if (filtrados.length === 0) return;

    const suma = filtrados.reduce((acc, t) => acc + t.tiempo, 0);
    const prom = (suma / filtrados.length).toFixed(2);

    console.log(`Promedio ${tipo}:`, prom, "ms");
}

// Guardamos los productos localmente para no saturar la API
let allProducts = [];

// ======================================================
// 🚀 INICIALIZAR APP
// ======================================================
document.addEventListener("DOMContentLoaded", () => {
    loadProducts();
});

// ======================================================
// 📦 CARGAR PRODUCTOS
// ======================================================
async function loadProducts() {
    try {
        const start = performance.now(); // ⏱️ INICIO
        const response = await fetch(PRODUCTS_URL);
        if (!response.ok) throw new Error("Error al obtener productos");

        const data = await response.json();
        allProducts = data; // Guardamos en memoria

        const container = document.getElementById("products");
        if (!container) return;

        container.innerHTML = "";

        data.forEach(product => {
            let imageUrl = "img/no-image.jpg";
            if (product.image_url) {
                imageUrl = product.image_url.startsWith("http")
                    ? product.image_url
                    : `${BASE_URL}${product.image_url}`;
            }

            const card = document.createElement("div");
            card.className = `product-card ${!product.is_active ? "inactive" : ""}`;

            card.innerHTML = `
                <img src="${imageUrl}" alt="${product.name}">
                <h3>${product.name}</h3>
                <p>${product.description || ""}</p>
                <p class="price">$${product.price}</p>
                <p><small>${product.category}</small></p>

                ${product.is_active
                    ? `<button class="custom-btn">Personalizar</button>`
                    : `<button class="custom-btn" disabled style="background:#ccc; cursor:not-allowed;">Sin existencias</button>`
                }
            `;

            if (product.is_active) {
                card.querySelector(".custom-btn").addEventListener("click", () => {
                    openModal(product.id);
                });
            }

            container.appendChild(card);
        });

        const end = performance.now();
        const tiempo = (end - start).toFixed(2);

        console.log("⏱️ Tiempo productos:", tiempo, "ms");
        guardarTiempo("Carga de productos", tiempo);

    } catch (error) {
        console.error("Error al cargar productos:", error);
    }
}

// ======================================================
// 🪟 MODAL DINÁMICO
// ======================================================
const modal = document.getElementById("customModal");
const confirmBtn = document.getElementById("confirmAddBtn");
const cancelBtn = document.getElementById("cancelModalBtn");

let selectedProductId = null;
let selectedCategory = null;

function openModal(productId) {
    // Buscamos el producto en nuestra lista local
    const product = allProducts.find(p => p.id === productId);
    if (!product) return;

    selectedProductId = productId;
    selectedCategory = product.category;

    const optionsDiv = document.getElementById("product-options");
    optionsDiv.innerHTML = ""; // Limpiar modal

    // 🔥 LÓGICA DINÁMICA DE OPCIONES (Tallas, Colores, etc.)
    if (product.options && product.options.trim() !== "") {
        // Convertimos el string "S, M, L, XL" en un array
        const optionsArray = product.options.split(',').map(opt => opt.trim());

        // Definimos el ID del select dependiendo de la categoría para no romper el carrito
        let selectId = (product.category === "playera") ? "modal-size" : "modal-cupType";
        let labelName = (product.category === "playera") ? "Talla:" : "Opción:";

        optionsDiv.innerHTML = `
            <label>${labelName}</label>
            <select id="${selectId}">
                <option value="">Selecciona una opción</option>
                ${optionsArray.map(opt => `<option value="${opt}">${opt}</option>`).join('')}
            </select>
        `;
    }

    modal.style.display = "flex";
}

// CERRAR MODAL
cancelBtn?.addEventListener("click", () => {
    modal.style.display = "none";
});

// CONFIRMAR
confirmBtn?.addEventListener("click", addToCartWithImages);

// ======================================================
// 🛒 AGREGAR AL CARRITO
// ======================================================
async function addToCartWithImages() {
    const start = performance.now(); // ⏱️ INICIO

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

    const size = document.getElementById("modal-size")?.value;
    const cupType = document.getElementById("modal-cupType")?.value;

    // Validación según categoría
    if (selectedCategory === "playera" && !size) {
        alert("Debes seleccionar una talla");
        return;
    }
    if (selectedCategory === "taza" && !cupType) {
        alert("Debes seleccionar el tipo de taza");
        return;
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

        const data = await response.json();

        if (!response.ok) throw new Error(data.error || "Error al agregar");

        alert("Producto agregado al carrito 🛒");
        modal.style.display = "none";

        const end = performance.now();
        const tiempo = (end - start).toFixed(2);

        console.log("⏱️ Tiempo agregar carrito:", tiempo, "ms");
        guardarTiempo("Carga agregar al carrito", tiempo);

    } catch (error) {
        console.error("ERROR CART:", error);
        alert(error.message);
    }
}