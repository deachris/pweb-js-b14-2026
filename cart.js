let cart = [];

// Load Keranjang

function loadCart() {
    const savedCart = localStorage.getItem('cart');

    if (savedCart) {
        cart = JSON.parse(savedCart);
    } 
    else
    {
        cart = [];
    }

    updateCartUI();
}

// Tambah ke Keranjang

function addToCart(product) {
    const existProduct = cart.find(
        item => item.id === product.id
    );

    if (existProduct) {
        existProduct.quantity += 1;
    }
    else 
    {
        cart.push({
            id: product.id,
            title: product.title,
            price: product.price,
            thumbnail: product.thumbnail,
            quantity: 1
        });
    }
    saveCart();
    updateCartUI();
}

// Simpan ke Keranjang

function saveCart() {
    if (cart.length === 0) {
        localStorage.removeItem('cart');
        return;
    }
    
    localStorage.setItem(
        'cart', JSON.stringify(cart)
    );
}

// Hapus dari Keranjang

function deleteCart(productId) {
    cart = cart.filter(
        item => item.id !== productId
    );
    saveCart();
    updateCartUI();
}

function renderCartItems() {
    const cartItems =
        document.getElementById("cart-items");

    if (cart.length === 0) {
        cartItems.innerHTML = "<p class='empty-cart'>Keranjang masih kosong.</p>";
        return;
    }

    cartItems.innerHTML = cart.map(item => `
        <div class="cart-item">
            <img src="${item.thumbnail}" alt="${item.title}">
            <div class="cart-item-info">
                <h3>${item.title}</h3>
                <p>${item.quantity} × $${item.price}</p>
            </div>
            <button class="delete-cart" data-id="${item.id}">Hapus</button>
        </div>
    `).join("");
}


// Mengupdate jumlah dan total

function updateCartUI() {
    const badge =
        document.getElementById("cart-badge");

    const totalElement =
        document.getElementById("cart-total");

    const totalQuantity = cart.reduce(
        (total, item) => total + item.quantity, 0
    );

    const totalPrice = cart.reduce(
        (total, item) => total + item.price * item.quantity, 0
    );

    badge.textContent = totalQuantity;

    totalElement.textContent = `$${totalPrice.toFixed(2)}`;
    renderCartItems();
}

document
    .getElementById("cart-items")
    .addEventListener("click", function(event) {

        const button = event.target.closest(".delete-cart");

        if (!button) {
            return;
        }

        const productId = Number(button.dataset.id);
        deleteCart(productId);
    });

loadCart();