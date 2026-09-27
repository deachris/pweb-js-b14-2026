const PRODUCTS_API = 'https://dummyjson.com/products?limit=0';

let allProducts = [];
let displayedProducts = [];
let filteredProducts = [];
let currentPage = 1;
const productsPerPage = 14;

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

            <button class="add-to-cart" data-id="${product.id}">
                Tambah ke Keranjang
            </button>
        </div>
    `;
}

// Detail Produk
function showProductDetail(product) {
    document.getElementById('popUpImage').src = product.thumbnail;
    document.getElementById('popUpImage').alt = product.title;

    document.getElementById('popUpTitle').textContent = product.title;
    document.getElementById('popUpCategory').textContent =
        `${product.category}`;

    document.getElementById('popUpBrand').textContent =
        `${product.brand || '-'}`;

    document.getElementById('popUpPrice').textContent =
        `Harga: $${product.price}`;

    document.getElementById('popUpDiscount').textContent =
        `-${Math.round(product.discountPercentage)}%`; 

    document.getElementById('popUpRating').textContent =
        `⭐ ${product.rating}`;

    document.getElementById('popUpStock').textContent =
        `Stok tersedia: ${product.stock}`;

    document.getElementById('popUpDesc').textContent =
        product.description;

    document.getElementById('popUpAddToCart').onclick = function() {
        addToCart(product);
    };

    document.getElementById('productPopUp').style.display = 'flex';
}

function renderProducts(products) {
    const grid = document.getElementById('productGrid');

    if (products.length === 0) {
        grid.innerHTML = '<p class="product-status">Produk tidak ditemukan.</p>';
        return;
    }

    grid.innerHTML = products.map(createProductCard).join('');
}

// Fungsi Load More Produk
function loadMoreProducts() {
    const startIndex = currentPage * productsPerPage;
    const endIndex = (currentPage + 1) * productsPerPage;

    const nextProducts = filteredProducts.slice(startIndex, endIndex);

    displayedProducts = displayedProducts.concat(nextProducts);
    renderProducts(displayedProducts);
    currentPage++;

    updateLoadMoreButton();
}

function updateLoadMoreButton() {
    const button = document.getElementById('loadMoreBtn');

    if (displayedProducts.length >= filteredProducts.length) {
        button.style.display = 'none';
    } 
    else 
    {
        button.style.display = 'block';
    }
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


    // Untuk fungsi Load More
    filteredProducts = result;
    currentPage = 1;

    displayedProducts = filteredProducts.slice(0, productsPerPage);

    renderProducts(displayedProducts);

    updateLoadMoreButton();
}

// Event Listeners & Inisialisasi
function initToolbarEvents() {
    const debouncedSearch = debounce(applyFiltersAndSort, 400);

    document.getElementById('searchInput').addEventListener('input', debouncedSearch);
    document.getElementById('categoryFilter').addEventListener('change', applyFiltersAndSort);
    document.getElementById('sortSelect').addEventListener('change', applyFiltersAndSort);
}

// === Load More ===
function initLoadMoreEvents() {
    document.getElementById('loadMoreBtn').addEventListener('click', loadMoreProducts);
}

// === Detail Produk ===
function initProductDetailEvents() {
    const productGrid = document.getElementById('productGrid');

    productGrid.addEventListener('click', function(event) {
        const card = event.target.closest('.product-card');
        if (!card) {
            return;
        }

        // Detail tidak bisa dibuka ketika tombol keranjang diklik
        if (event.target.closest('.add-to-cart')) {
            return;
        }
        const productId = Number(card.dataset.id);
        const product = allProducts.find(item => item.id === productId);

        if (!product) {
            return;
        }

        showProductDetail(product);
    });
}

function initPopUpEvents() {
    const popUp = document.getElementById('productPopUp');
    const closeButton = document.getElementById('closePopUp');

    closeButton.addEventListener('click', function() {
        popUp.style.display = 'none';
    });

    popUp.addEventListener('click', function(event) {
        if (event.target === popUp) {
            popUp.style.display = 'none';
        }
    });
}

// === Keranjang ===
function initCartEvents() {
    const productGrid = document.getElementById('productGrid');
    productGrid.addEventListener('click', function(event) {
        const button = event.target.closest('.add-to-cart');
        if (!button) {
            return;
        }
        const productId = Number(button.dataset.id);
        const product = allProducts.find(item => item.id === productId
        );

        if (!product) {
            return;
        }
        addToCart(product);
    });
}

document.addEventListener('DOMContentLoaded', () => {
    initNavbar();
    initToolbarEvents();
    initCartEvents();
    initLoadMoreEvents();
    initProductDetailEvents();
    initPopUpEvents();
    fetchProducts();
});