const PRODUCTS_API = 'https://dummyjson.com/products?limit=0';

let allProducts = [];
let displayedProducts = [];

// Navigation Bar
function initNavbar() {
    const firstName = localStorage.getItem('firstName');
    document.getElementById('welcomeText').textContent = `Selamat datang, ${firstName}!`;

    document.getElementById('logoutBtn').addEventListener('click', () => {
        localStorage.removeItem('firstName');
        window.location.href = 'login.html';
    });
}

// Fetch & Render Produk
async function fetchProducts() {
    const statusEl = document.getElementById('productStatus');
    statusEl.textContent = 'Memuat produk...';
    statusEl.className = 'product-status';

    try {
        const response = await fetch(PRODUCTS_API);

        if (!response.ok) {
            throw new Error(`Server merespons dengan status ${response.status}`);
        }

        const data = await response.json();
        allProducts = data.products;

        populateCategoryFilter(allProducts);
        applyFiltersAndSort();

        statusEl.textContent = '';
    } catch (error) {
        statusEl.textContent = 'Gagal memuat produk. Periksa koneksi internet Anda, lalu muat ulang halaman.';
        statusEl.className = 'product-status error';
        console.error('fetchProducts error:', error);
    }
}

function createProductCard(product) {
    const hasDiscount = product.discountPercentage > 0;

    return `
        <div class="product-card" data-id="${product.id}">
            <img src="${product.thumbnail}" alt="${product.title}">
            <h3>${product.title}</h3>
            <p class="product-category">${product.category}</p>
            <div class="product-price-row">
                <span class="product-price">$${product.price}</span>
                ${hasDiscount ? `<span class="product-discount">-${Math.round(product.discountPercentage)}%</span>` : ''}
            </div>
            <p class="product-rating">⭐ ${product.rating}</p>
        </div>
    `;
}

function renderProducts(products) {
    const grid = document.getElementById('productGrid');

    if (products.length === 0) {
        grid.innerHTML = '<p class="product-status">Produk tidak ditemukan.</p>';
        return;
    }

    grid.innerHTML = products.map(createProductCard).join('');
}

// Debounce untuk Real-Time Search
function debounce(fn, delay) {
    let timeoutId;
    return function (...args) {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => fn.apply(this, args), delay);
    };
}

// Filter & Sorting
function populateCategoryFilter(products) {
    const select = document.getElementById('categoryFilter');
    const categories = [...new Set(products.map(p => p.category))].sort();

    categories.forEach(category => {
        const option = document.createElement('option');
        option.value = category;
        option.textContent = category;
        select.appendChild(option);
    });
}

function applyFiltersAndSort() {
    const keyword = document.getElementById('searchInput').value.trim().toLowerCase();
    const category = document.getElementById('categoryFilter').value;
    const sortBy = document.getElementById('sortSelect').value;

    // 1. Search (Nama atau Kategori)
    let result = allProducts.filter(product => {
        return (
            product.title.toLowerCase().includes(keyword) ||
            product.category.toLowerCase().includes(keyword)
        );
    });

    // 2. Filter Kategori
    if (category) {
        result = result.filter(product => product.category === category);
    }

    // 3. Sorting
    if (sortBy === 'price-asc') {
        result = [...result].sort((a, b) => a.price - b.price);
    } else if (sortBy === 'price-desc') {
        result = [...result].sort((a, b) => b.price - a.price);
    } else if (sortBy === 'rating-desc') {
        result = [...result].sort((a, b) => b.rating - a.rating);
    }

    displayedProducts = result;
    renderProducts(displayedProducts);
}

// Event Listeners & Inisialisasi
function initToolbarEvents() {
    const debouncedSearch = debounce(applyFiltersAndSort, 400);

    document.getElementById('searchInput').addEventListener('input', debouncedSearch);
    document.getElementById('categoryFilter').addEventListener('change', applyFiltersAndSort);
    document.getElementById('sortSelect').addEventListener('change', applyFiltersAndSort);
}

document.addEventListener('DOMContentLoaded', () => {
    initNavbar();
    initToolbarEvents();
    fetchProducts();
});