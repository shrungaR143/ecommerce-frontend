console.log("E-Commerce Website Loaded");

// --- CACHING AND CART SETUP ---
// Variables for Product Caching (Task 6: Optimization)
const CACHE_KEY = 'cachedProducts';
const CACHE_DURATION = 3600000; // 1 hour in milliseconds

// FIX: CLEAR THE CART ON PAGE LOAD (Task 6: Persistence Fix)
// This ensures the cart badge starts at 0 when the page is closed and reopened.
localStorage.removeItem('cart');

// 1. Select the necessary elements from the HTML
const hamburgerBtn = document.querySelector('.hamburger-menu');
const desktopNav = document.querySelector('.desktop-nav'); 
const productGrid = document.querySelector('.product-grid');
const cartBadge = document.querySelector('.notification-badge'); // Select the badge element


// === CART MANAGEMENT FUNCTIONS ===

// Function to get the current cart array from browser storage
function getCartItems() {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    return cart;
}

// Function to update the visual badge count
function updateCartBadge() {
    const cart = getCartItems();
    const count = cart.length;
    
    if (cartBadge) { 
        cartBadge.textContent = count; 
        // Badge display handled by CSS for initial state, but JavaScript ensures dynamic showing/hiding
        cartBadge.style.display = count > 0 ? 'block' : 'none';
    }
}

// Function to add a product to the cart storage and update the count
function addToCart(productId) {
    let cart = getCartItems();
    
    cart.push({ id: productId, quantity: 1 });
    
    localStorage.setItem('cart', JSON.stringify(cart));
    
    updateCartBadge();
    
    console.log(`Product ID ${productId} successfully added. Current count: ${cart.length}`);
}

// Initialize the badge count when the page loads
updateCartBadge(); 


// === MOBILE NAVIGATION LOGIC ===
hamburgerBtn.addEventListener('click', () => {
    desktopNav.classList.toggle('active');
    
    if (desktopNav.classList.contains('active')) {
        hamburgerBtn.innerHTML = '&#10005;'; 
    } else {
        hamburgerBtn.innerHTML = '&#9776;'; 
    }
});


// --- HELPER FUNCTION TO RENDER PRODUCTS ---
// This function takes the product data and injects it into the HTML
function renderProducts(products) {
    productGrid.innerHTML = ''; // Clear loading message

    products.forEach(product => {
        const formattedPrice = product.price.toFixed(2);
        
        const productCardHTML = `
            <div class="product-card">
                <div class="product-image-wrapper">
                    <img 
                        src="${product.image}" 
                        alt="${product.title}" 
                        class="product-image"
                        loading="lazy" 
                    >
                </div>
                
                <h3 class="product-title" title="${product.title}">${product.title}</h3>
                
                <p class="product-price">$${formattedPrice}</p>
                
                <button class="add-to-cart-btn" data-product-id="${product.id}">
                    Add to Cart
                </button>
            </div>
        `;
        
        productGrid.insertAdjacentHTML('beforeend', productCardHTML);
    });
}


// --- FUNCTION TO FETCH PRODUCTS (WITH CACHING LOGIC) ---
async function fetchProducts() {
    productGrid.innerHTML = '<p style="text-align: center; font-size: 1.2em;">Loading products...</p>';
    
    // === Caching Check (Task 6) ===
    const cachedData = localStorage.getItem(CACHE_KEY);
    
    if (cachedData) {
        const { timestamp, products } = JSON.parse(cachedData);
        const currentTime = new Date().getTime();

        // Check if cache is still valid (less than 1 hour old)
        if (currentTime - timestamp < CACHE_DURATION) {
            console.log('Serving products from cache. API call avoided.');
            renderProducts(products);
            return; // Exit the function, no API call needed
        } else {
            console.log('Cache expired. Fetching new data...');
            localStorage.removeItem(CACHE_KEY); // Clear old cache
        }
    }
    // === End Caching Check ===

    try {
        // Fetch API Data
        const response = await fetch('https://fakestoreapi.com/products?limit=8'); 
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const products = await response.json();

        // === Cache Storage (Task 6) ===
        const dataToCache = {
            timestamp: new Date().getTime(),
            products: products
        };
        localStorage.setItem(CACHE_KEY, JSON.stringify(dataToCache));
        // === End Cache Storage ===

        renderProducts(products);

    } catch (error) {
        console.error('Error fetching products:', error);
        productGrid.innerHTML = '<p style="color: red; text-align: center; font-size: 1.2em;">Failed to load products. Check console for error details.</p>';
    }
}

// Execute the product fetch function
fetchProducts();


// === FINAL ADD TO CART CLICK LISTENER ===
document.addEventListener('click', (e) => {
    
    if (e.target.classList.contains('add-to-cart-btn')) {
        
        e.preventDefault(); 
        const productId = e.target.getAttribute('data-product-id');
        
        // 1. Call the function that updates storage and the badge
        addToCart(productId);
        
        // 2. Visual Feedback
        const originalText = e.target.textContent;
        e.target.textContent = 'ADDED!';
        e.target.style.backgroundColor = '#4CAF50'; 
        
        setTimeout(() => {
            e.target.textContent = originalText;
            e.target.style.backgroundColor = '#ffd700'; 
        }, 1000); 
    }
});

