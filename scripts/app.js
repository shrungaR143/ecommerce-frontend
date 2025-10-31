console.log("E-Commerce Website Loaded");

// --- CACHING AND CART SETUP ---
const CACHE_KEY = 'cachedProducts';
const CACHE_DURATION = 3600000; // 1 hour in milliseconds

// 💡 Standardized key for persistent cart data
const CART_STORAGE_KEY = 'shoppingCart'; 

// 1. Select the necessary elements from the HTML
const hamburgerBtn = document.querySelector('.hamburger-menu');
const desktopNav = document.querySelector('.desktop-nav'); 
const productGrid = document.querySelector('.product-grid');
const cartBadge = document.querySelector('.notification-badge');

// 🚀 TASK 4 ELEMENT: Selector for the category filter dropdown
const categoryFilter = document.getElementById('category-filter');


// ==================================================================
// === STANDARD CART MANAGEMENT FUNCTIONS (Used by ALL Pages) ===
// ==================================================================

/**
 * Retrieves the persistent cart array from Local Storage (shoppingCart key).
 * @returns {Array} The cart items array.
 */
function getCartItems() {
    try {
        const cart = localStorage.getItem(CART_STORAGE_KEY);
        return cart ? JSON.parse(cart) : [];
    } catch (e) {
        console.error("Error retrieving cart from Local Storage:", e);
        return [];
    }
}

/**
 * Saves the cart array back to Local Storage.
 * @param {Array} items - The cart items array to save.
 */
function saveCartItems(items) {
    try {
        localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
    } catch (e) {
        console.error("Error saving cart to Local Storage:", e);
    }
}

/**
 * Updates the visual badge count based on the SUM of all item quantities.
 */
function updateCartBadge() {
    const cartItems = getCartItems();
    // Calculate total count (sum of all item quantities stored in Local Storage)
    const totalCount = cartItems.reduce((sum, item) => sum + (item.quantity || 0), 0);
    
    if (cartBadge) { 
        cartBadge.textContent = totalCount; 
        // CRITICAL: Badge starts from 0. If 0, display is 'none'.
        cartBadge.style.display = totalCount > 0 ? 'block' : 'none';
    }
}

/**
 * Function to add a product to the cart storage and update the count.
 * 🚀 Handles Quantity Update for existing items.
 */
function addToCart(productId) {
    let cart = getCartItems();
    
    const newItem = { 
        id: parseInt(productId), 
        quantity: 1,
        cartUniqueId: `${productId}-default-default` 
    };

    const existingItemIndex = cart.findIndex(item => item.cartUniqueId === newItem.cartUniqueId);

    if (existingItemIndex > -1) {
        // Update quantity
        cart[existingItemIndex].quantity += 1;
    } else {
        // Add the new item
        cart.push(newItem);
    }
    
    saveCartItems(cart);
    updateCartBadge();
    
    console.log(`Product ID ${productId} successfully added/updated.`);
}

// ==================================================================
// === TASK 4: PRODUCT FILTERING LOGIC ===
// ==================================================================

/**
 * Renders the categories into the filter dropdown menu.
 * @param {Array<string>} categories - A unique list of all categories.
 */
function renderCategoryFilter(categories) {
    if (!categoryFilter) {
        console.warn("Category filter element (#category-filter) not found.");
        return;
    }

    // Start with the default 'All Products' option
    let optionsHTML = '<option value="all">All Products</option>';

    // Add an option for each unique category
    categories.forEach(category => {
        // Optional: Capitalize for better display
        const formattedCategory = category.split(' ')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
        
        optionsHTML += `<option value="${category}">${formattedCategory}</option>`;
    });

    categoryFilter.innerHTML = optionsHTML;
    
    // Set up the listener immediately after rendering
    categoryFilter.addEventListener('change', handleFilterChange);
}


/**
 * Handles the change event from the category filter dropdown.
 */
function handleFilterChange(e) {
    const selectedCategory = e.target.value;
    filterAndRenderProducts(selectedCategory);
}


/**
 * Filters the products based on the selected category and re-renders the grid.
 */
function filterAndRenderProducts(category) {
    const cachedData = localStorage.getItem(CACHE_KEY);
    if (!cachedData) return; // Cannot filter if no data is cached

    const { products } = JSON.parse(cachedData);
    let filteredProducts = products;

    if (category !== 'all') {
        filteredProducts = products.filter(product => product.category === category);
    }
    
    renderProducts(filteredProducts);
}


// ==================================================================
// === FETCHING AND RENDERING ===
// ==================================================================

// --- HELPER FUNCTION TO RENDER PRODUCTS ---
function renderProducts(products) {
    productGrid.innerHTML = ''; // Clear loading message

    if (products.length === 0) {
        productGrid.innerHTML = '<p style="text-align: center; font-size: 1.2em; grid-column: 1 / -1;">No products found in this category.</p>';
        return;
    }

    products.forEach(product => {
        const formattedPrice = product.price.toFixed(2);
        
        // Corrected link structure to use product-card-link-wrapper if needed for CSS
        const productCardHTML = `
            <a href="product.html?id=${product.id}" class="product-card-link-wrapper"> 
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
            </a>
            `;
            
        productGrid.insertAdjacentHTML('beforeend', productCardHTML);
    });
}

// --- FUNCTION TO FETCH PRODUCTS (UPDATED to fetch ALL for filtering) ---
async function fetchProducts() {
    // Only run this on the index page where productGrid exists
    if (!productGrid) return; 

    productGrid.innerHTML = '<p style="text-align: center; font-size: 1.2em;">Loading products...</p>';
    
    const cachedData = localStorage.getItem(CACHE_KEY);
    let products = [];
    let isCached = false;

    // Check Cache
    if (cachedData) {
        const parsedData = JSON.parse(cachedData);
        const currentTime = new Date().getTime();

        if (currentTime - parsedData.timestamp < CACHE_DURATION) {
            products = parsedData.products;
            isCached = true;
            console.log('Serving products from cache. API call avoided.');
        } else {
            localStorage.removeItem(CACHE_KEY); 
        }
    }

    // Fetch if not cached or cache expired
    if (!isCached) {
        try {
            // Fetch ALL products to get a complete category list
            const response = await fetch('https://fakestoreapi.com/products'); 
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            products = await response.json();

            // Cache the full data
            const dataToCache = {
                timestamp: new Date().getTime(),
                products: products
            };
            localStorage.setItem(CACHE_KEY, JSON.stringify(dataToCache));

        } catch (error) {
            console.error('Error fetching products:', error);
            productGrid.innerHTML = '<p style="color: red; text-align: center; font-size: 1.2em;">Failed to load products. Check console for error details.</p>';
            return;
        }
    }
    
    // --- TASK 4: Initialize Filtering ---
    const uniqueCategories = [...new Set(products.map(p => p.category))];
    renderCategoryFilter(uniqueCategories);
    
    // Render all products initially
    renderProducts(products);
}


// ------------------------------------------------------------------
// Initialization
// ------------------------------------------------------------------
document.addEventListener('DOMContentLoaded', () => {

    // 🚀 CRITICAL FIX: Ensure the badge is initialized first thing on any page load!
    // This call reads localStorage and sets the badge count (even if it's 0).
    updateCartBadge(); 


    // === MOBILE NAVIGATION LOGIC ===
    if(hamburgerBtn && desktopNav) {
        hamburgerBtn.addEventListener('click', () => {
            desktopNav.classList.toggle('active');
            
            if (desktopNav.classList.contains('active')) {
                hamburgerBtn.innerHTML = '&#10005;'; 
            } else {
                hamburgerBtn.innerHTML = '&#9776;'; 
            }
        });
    }

    // Execute the product fetch function (only runs logic if productGrid is on the page)
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
});