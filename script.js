
/* ==========================================
   ELECTROHUB — COMPLETE JAVASCRIPT
   File: script.js
   ========================================== */

"use strict";

// 1. PRODUCT DATA
const defaultProducts = [
    {
        id: 1,
        name: "Premium Laptop",
        price: 54999,
        category: "Laptop",
        description: "Powerful performance for work and study.",
        img: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=700&q=80"
    },
    {
        id: 2,
        name: "Smartphone Pro",
        price: 32999,
        category: "Mobile",
        description: "Modern smartphone with advanced features.",
        img: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=700&q=80"
    },
    {
        id: 3,
        name: "Wireless Headphones",
        price: 2499,
        category: "Audio",
        description: "Enjoy your music with wireless freedom.",
        img: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=700&q=80"
    },
    {
        id: 4,
        name: "Smart Watch",
        price: 3999,
        category: "Watch",
        description: "Track your daily activities in style.",
        img: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=700&q=80"
    },
    {
        id: 5,
        name: "Gaming Laptop",
        price: 74999,
        category: "Laptop",
        description: "An immersive gaming and entertainment experience.",
        img: "https://images.unsplash.com/photo-1603302576837-37561b2e2302?auto=format&fit=crop&w=700&q=80"
    },
    {
        id: 6,
        name: "Wireless Earbuds",
        price: 1799,
        category: "Audio",
        description: "Compact earbuds for everyday listening.",
        img: "https://images.unsplash.com/photo-1606220945770-b5b6c2c55bf1?auto=format&fit=crop&w=700&q=80"
    },
    {
        id: 7,
        name: "Modern Smartphone",
        price: 18999,
        category: "Mobile",
        description: "A stylish device for everyday use.",
        img: "https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?auto=format&fit=crop&w=700&q=80"
    },
    {
        id: 8,
        name: "Fitness Watch",
        price: 2999,
        category: "Watch",
        description: "A smart companion for your daily routine.",
        img: "https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?auto=format&fit=crop&w=700&q=80"
    }
];

// 2. APPLICATION STATE
function loadSavedProducts() {
    try {
        const saved = localStorage.getItem("electrohub_products");
        return saved ? JSON.parse(saved) : defaultProducts;
    } catch (error) {
        console.warn("Could not load saved products.", error);
        return defaultProducts;
    }
}

function loadCart() {
    try {
        const saved = JSON.parse(
            localStorage.getItem("electrohub_cart") || "[]"
        );

        return Array.isArray(saved) ? saved : [];
    } catch {
        return [];
    }
}

let products = loadSavedProducts();
let cart = loadCart();
let currentCategory = "All";
let currentSlide = 0;
let sliderTimer = null;

const $ = (selector) => document.querySelector(selector);

function saveProducts() {
    try {
        localStorage.setItem(
            "electrohub_products",
            JSON.stringify(products)
        );
    } catch (error) {
        console.warn("Could not save products.", error);
    }
}

function saveCart() {
    try {
        localStorage.setItem(
            "electrohub_cart",
            JSON.stringify(cart)
        );
    } catch (error) {
        console.warn("Could not save cart.", error);
    }
}

function escapeHTML(value) {
    return String(value).replace(/[&<>"']/g, (character) => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
    })[character]);
}

function formatPrice(price) {
    return Number(price).toLocaleString("en-IN", {
        maximumFractionDigits: 2
    });
}

// 3. DISPLAY PRODUCTS
function renderProducts(list = products) {
    const container = $("#productContainer");

    if (!container) return;

    if (!list.length) {
        container.innerHTML = `
            <div class="empty-state">
                <i class="fa-solid fa-magnifying-glass"></i>
                <h3>No products found</h3>
                <p>Try another search or category.</p>
                <button onclick="resetFilters()">Show All Products</button>
            </div>
        `;
        return;
    }

    container.innerHTML = list.map((product) => `
        <article class="product-card">
            <img
                src="${escapeHTML(product.img || "")}"
                alt="${escapeHTML(product.name)}"
                loading="lazy"
                onerror="this.style.display='none'"
            >

            <div class="product-info">
                <span class="product-category">
                    ${escapeHTML(product.category)}
                </span>

                <h3>${escapeHTML(product.name)}</h3>

                <p>${escapeHTML(product.description || "")}</p>

                <span class="product-price">
                    ₹${formatPrice(product.price)}
                </span>

                <div class="product-actions">
                    <button onclick="addToCart(${Number(product.id)})">
                        <i class="fa-solid fa-cart-plus"></i>
                        Add to Cart
                    </button>

                    <button
                        class="secondary-button"
                        onclick="viewProduct(${Number(product.id)})"
                        aria-label="View ${escapeHTML(product.name)}"
                    >
                        <i class="fa-solid fa-eye"></i>
                    </button>
                </div>
            </div>
        </article>
    `).join("");
}

// 4. SEARCH PRODUCTS
function openSearch() {
    const panel = $("#searchPanel");

    if (!panel) return;

    panel.classList.add("active");
    panel.style.display = "flex";

    $("#searchInput")?.focus();
}

function closeSearch() {
    const panel = $("#searchPanel");

    if (!panel) return;

    panel.classList.remove("active");
    panel.style.display = "none";
}

function searchProducts() {
    const input = $("#searchInput");
    const query = input ? input.value.trim().toLowerCase() : "";

    const results = products.filter((product) => {
        const matchesText = [
            product.name,
            product.category,
            product.description
        ].join(" ").toLowerCase().includes(query);

        const matchesCategory =
            currentCategory === "All" ||
            product.category.toLowerCase() ===
                currentCategory.toLowerCase();

        return matchesText && matchesCategory;
    });

    renderProducts(results);
}

// 5. FILTER CATEGORIES
function filterCategory(category) {
    currentCategory = category;
    const query = $("#searchInput")?.value.trim().toLowerCase() || "";

    const results = products.filter((product) => {
        const matchesCategory =
            category === "All" ||
            product.category.toLowerCase() === category.toLowerCase();

        const matchesText = [
            product.name,
            product.category,
            product.description
        ].join(" ").toLowerCase().includes(query);

        return matchesCategory && matchesText;
    });

    renderProducts(results);

    $("#trending")?.scrollIntoView({
        behavior: "smooth",
        block: "start"
    });
}

function resetFilters() {
    currentCategory = "All";

    if ($("#searchInput")) {
        $("#searchInput").value = "";
    }

    renderProducts();
}

// 6. PRODUCT DETAILS
function viewProduct(id) {
    const product = products.find(
        (item) => Number(item.id) === Number(id)
    );

    if (!product) return;

    alert(
        `${product.name}\n\n` +
        `Category: ${product.category}\n` +
        `Price: ₹${formatPrice(product.price)}\n\n` +
        `${product.description || ""}`
    );
}

// 7. ADD ITEMS TO CART
function addToCart(id) {
    const product = products.find(
        (item) => Number(item.id) === Number(id)
    );

    if (!product) return;

    const existingItem = cart.find(
        (item) => Number(item.id) === Number(id)
    );

    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({
            id: product.id,
            name: product.name,
            price: Number(product.price),
            quantity: 1
        });
    }

    saveCart();
    updateCart();

    alert(`${product.name} added to your cart!`);
}

// 8. UPDATE SHOPPING CART
function updateCart() {
    const count = cart.reduce(
        (total, item) => total + item.quantity,
        0
    );

    const total = cart.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0
    );

    if ($("#cartCount")) {
        $("#cartCount").textContent = count;
    }

    if ($("#cartTotal")) {
        $("#cartTotal").textContent = formatPrice(total);
    }

    const cartItems = $("#cartItems");

    if (!cartItems) return;

    if (!cart.length) {
        cartItems.innerHTML = `
            <div class="empty-state">
                <i class="fa-solid fa-cart-shopping"></i>
                <p>Your cart is empty.</p>
            </div>
        `;
        return;
    }

    cartItems.innerHTML = cart.map((item) => `
        <div class="cart-item">
            <div>
                <strong>${escapeHTML(item.name)}</strong>
                <p>
                    ₹${formatPrice(item.price)} × ${item.quantity}
                </p>
                <strong>
                    ₹${formatPrice(item.price * item.quantity)}
                </strong>
            </div>

            <div class="cart-item-actions">
                <button
                    onclick="changeQuantity(${Number(item.id)}, -1)"
                    aria-label="Decrease quantity"
                >−</button>

                <button
                    onclick="changeQuantity(${Number(item.id)}, 1)"
                    aria-label="Increase quantity"
                >+</button>

                <button onclick="removeFromCart(${Number(item.id)})">
                    Remove
                </button>
            </div>
        </div>
    `).join("");
}

function changeQuantity(id, amount) {
    const item = cart.find(
        (product) => Number(product.id) === Number(id)
    );

    if (!item) return;

    item.quantity += amount;

    if (item.quantity <= 0) {
        cart = cart.filter(
            (product) => Number(product.id) !== Number(id)
        );
    }

    saveCart();
    updateCart();
}

function removeFromCart(id) {
    cart = cart.filter(
        (item) => Number(item.id) !== Number(id)
    );

    saveCart();
    updateCart();
}

function openCart() {
    updateCart();

    const modal = $("#cartModal");

    if (modal) {
        modal.style.display = "flex";
        modal.classList.add("active");
    }
}

function closeCart() {
    const modal = $("#cartModal");

    if (modal) {
        modal.style.display = "none";
        modal.classList.remove("active");
    }
}

// Demo checkout only: no real payment is processed.
function checkout() {
    if (!cart.length) {
        alert("Your cart is empty!");
        return;
    }

    alert(
        "Demo checkout\n\n" +
        "Total: ₹" + formatPrice(
            cart.reduce(
                (sum, item) => sum + item.price * item.quantity,
                0
            )
        ) +
        "\n\nNo payment has been taken. Connect a secure payment " +
        "provider to accept real orders."
    );
}

// 9. PROFILE MODAL
function openProfile() {
    const modal = $("#profileModal");

    if (modal) {
        modal.style.display = "flex";
        modal.classList.add("active");
    }
}

function closeProfile() {
    const modal = $("#profileModal");

    if (modal) {
        modal.style.display = "none";
        modal.classList.remove("active");
    }
}

// 10. MOBILE MENU
function toggleMenu() {
    const navbar = $("#navbar");

    if (navbar) {
        navbar.classList.toggle("active");
    }
}

// Close mobile menu after selecting a navigation link.
document.querySelectorAll(".navbar a").forEach((link) => {
    link.addEventListener("click", () => {
        $("#navbar")?.classList.remove("active");
    });
});

// Close modals by clicking the background.
["profileModal", "cartModal"].forEach((id) => {
    const modal = document.getElementById(id);

    modal?.addEventListener("click", (event) => {
        if (event.target !== modal) return;

        modal.style.display = "none";
        modal.classList.remove("active");
    });
});

// 11. HERO SLIDER
function showSlide(index) {
    const slides = document.querySelectorAll(".slide");
    const dots = document.querySelectorAll(".dot");

    if (!slides.length) return;

    currentSlide = (index + slides.length) % slides.length;

    slides.forEach((slide, i) => {
        slide.classList.toggle("active", i === currentSlide);
    });

    dots.forEach((dot, i) => {
        dot.classList.toggle("active", i === currentSlide);
    });
}

function changeSlide(direction) {
    showSlide(currentSlide + direction);
    startSlider();
}

function setSlide(index) {
    showSlide(index);
    startSlider();
}

function startSlider() {
    clearInterval(sliderTimer);

    if (document.querySelectorAll(".slide").length > 1) {
        sliderTimer = setInterval(() => {
            showSlide(currentSlide + 1);
        }, 5000);
    }
}

function goProducts() {
    $("#trending")?.scrollIntoView({
        behavior: "smooth",
        block: "start"
    });
}

// 12. CUSTOMER COMMENTS
function addComment() {
    const nameInput = $("#commentName");
    const textInput = $("#commentText");
    const commentsList = $("#commentsList");

    if (!nameInput || !textInput || !commentsList) return;

    const name = nameInput.value.trim();
    const comment = textInput.value.trim();

    if (!name || !comment) {
        alert("Please enter your name and comment.");
        return;
    }

    const article = document.createElement("article");
    article.className = "comment-item";

    const heading = document.createElement("h4");
    heading.textContent = name;

    const paragraph = document.createElement("p");
    paragraph.textContent = comment;

    article.append(heading, paragraph);
    commentsList.prepend(article);

    nameInput.value = "";
    textInput.value = "";
}

// 13. NEWSLETTER FORM
function subscribe(event) {
    event.preventDefault();

    const name = $("#subscriberName")?.value.trim();
    const email = $("#subscriberEmail")?.value.trim();
    const message = $("#subscribeMessage");

    if (!name || !email) {
        alert("Please complete all fields.");
        return;
    }

    if (message) {
        message.textContent =
            `Thanks, ${name}! Your demo subscription was recorded locally.`;
    }

    event.target.reset();

    // A real mailing list requires a backend or email service.
}

// 14. EXPORT PRODUCT CATALOG
function downloadFile(content, filename, mimeType) {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = filename;
    link.click();

    setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function exportProducts(format) {
    if (format === "json") {
        downloadFile(
            JSON.stringify(products, null, 2),
            "electrohub-products.json",
            "application/json"
        );
        return;
    }

    const columns = ["id", "name", "price", "category", "img", "description"];

    const csvCell = (value) =>
        '"' + String(value ?? "").replace(/"/g, '""') + '"';

    const rows = [
        columns.join(","),
        ...products.map((product) =>
            columns.map((column) => csvCell(product[column])).join(",")
        )
    ];

    downloadFile(
        "\uFEFF" + rows.join("\r\n"),
        "electrohub-products.csv",
        "text/csv;charset=utf-8;"
    );
}

// 15. IMPORT PRODUCT CATALOG
function parseCSV(text) {
    const rows = [];
    let row = [];
    let cell = "";
    let quoted = false;

    text = text.replace(/^\uFEFF/, "");

    for (let i = 0; i < text.length; i++) {
        const char = text[i];
        const next = text[i + 1];

        if (char === '"' && quoted && next === '"') {
            cell += '"';
            i++;
        } else if (char === '"') {
            quoted = !quoted;
        } else if (char === "," && !quoted) {
            row.push(cell);
            cell = "";
        } else if ((char === "\n" || char === "\r") && !quoted) {
            if (char === "\r" && next === "\n") i++;

            row.push(cell);

            if (row.some((value) => value.trim() !== "")) {
                rows.push(row);
            }

            row = [];
            cell = "";
        } else {
            cell += char;
        }
    }

    row.push(cell);

    if (row.some((value) => value.trim() !== "")) {
        rows.push(row);
    }

    if (!rows.length) return [];

    const headers = rows.shift().map((header) =>
        header.trim().toLowerCase()
    );

    return rows.map((values) => {
        const record = {};

        headers.forEach((header, index) => {
            record[header] = (values[index] || "").trim();
        });

        return record;
    });
}

function importProducts(event) {
    const file = event.target.files?.[0];
    const status = $("#catalogStatus");

    if (!file) return;

    const reader = new FileReader();

    reader.onload = () => {
        try {
            const content = String(reader.result || "");
            let imported;

            if (file.name.toLowerCase().endsWith(".json")) {
                imported = JSON.parse(content);
            } else if (file.name.toLowerCase().endsWith(".csv")) {
                imported = parseCSV(content);
            } else {
                throw new Error("Choose a JSON or CSV file.");
            }

            if (!Array.isArray(imported)) {
                throw new Error("The file must contain a product array.");
            }

            const normalized = imported.map((item) => {
                const id = Number(item.id);
                const price = Number(item.price);
                const name = String(item.name || "").trim();
                const category = String(item.category || "").trim();

                if (
                    !Number.isSafeInteger(id) ||
                    id <= 0 ||
                    !Number.isFinite(price) ||
                    price < 0 ||
                    !name ||
                    !category
                ) {
                    throw new Error(
                        "Every product needs a positive integer ID, " +
                        "name, category and valid price."
                    );
                }

                return {
                    id,
                    name,
                    price,
                    category,
                    img: String(item.img || ""),
                    description: String(item.description || "")
                };
            });

            // Merge by ID: imported products update matching IDs.
            const merged = new Map(
                products.map((product) => [Number(product.id), product])
            );

            normalized.forEach((product) => {
                merged.set(product.id, product);
            });

            products = [...merged.values()];

            saveProducts();
            resetFilters();

            if (status) {
                status.textContent =
                    `Imported ${normalized.length} products successfully.`;
            }
        } catch (error) {
            if (status) {
                status.textContent = "Import failed: " + error.message;
            } else {
                alert("Import failed: " + error.message);
            }
        } finally {
            event.target.value = "";
        }
    };

    reader.onerror = () => {
        if (status) status.textContent = "Unable to read this file.";
        event.target.value = "";
    };

    reader.readAsText(file);
}

// 16. INITIALIZE WEBSITE
document.addEventListener("DOMContentLoaded", () => {
    renderProducts();
    updateCart();
    showSlide(0);
    startSlider();
});
