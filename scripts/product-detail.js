// Select the container where product details will be displayed
const productDetailsContainer = document.querySelector('#product-details');

// --- Global State & Constants ---
let selectedSize = 'M';
let selectedColor = 'Red';
let basePrice = 0; // Will hold the product's unit price
const MAX_QUANTITY = 10;
const MIN_QUANTITY = 1;

// ==================================================================
// 🚀 NEW FUNCTION: Task 5 - Cart Utility Functions
// ==================================================================

/**
 * Retrieves the cart array from Local Storage, or returns an empty array.
 * @returns {Array} The cart items array.
 */
function getCartItems() {
    try {
        const cart = localStorage.getItem('shoppingCart');
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
        localStorage.setItem('shoppingCart', JSON.stringify(items));
    } catch (e) {
        console.error("Error saving cart to Local Storage:", e);
    }
}

/**
 * Updates the visual cart badge in the header.
 */
function updateCartBadge() {
    const cartItems = getCartItems();
    // Calculate total count (sum of all item quantities)
    const totalCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

    const badge = document.querySelector('.notification-badge');
    
    if (badge) {
        if (totalCount > 0) {
            badge.textContent = totalCount;
            badge.style.display = 'block';
        } else {
            badge.style.display = 'none';
        }
    }
}


// ==================================================================
// Price & Variation Logic (Task 4)
// ==================================================================

// --- MOCK DATA for Variations ---
const mockVariations = {
    sizes: ['S', 'M', 'L', 'XL'],
    colors: [
        { name: 'Red', hex: '#E53935' },
        { name: 'Blue', hex: '#1E88E5' },
        { name: 'Green', hex: '#4CAF50', available: false },
        { name: 'Black', hex: '#333333' }
    ]
};

/**
 * Recalculates and displays the total price.
 */
function updateTotalPrice() {
    const quantityInput = document.getElementById('quantity');
    const priceDisplay = document.getElementById('current-total-price');

    if (!quantityInput || !priceDisplay || basePrice === 0) return;

    const currentQuantity = parseInt(quantityInput.value) || 1;
    
    const newTotal = (basePrice * currentQuantity).toFixed(2);
    priceDisplay.textContent = `$${newTotal}`;
}


/**
 * Renders the variation options (Size and Color).
 */
function renderVariations() {
    const sizeContainer = document.getElementById('size-options');
    const colorContainer = document.getElementById('color-options');
    
    if (!sizeContainer || !colorContainer) return; 

    // Render Sizes
    mockVariations.sizes.forEach(size => {
        const option = document.createElement('div');
        option.textContent = size;
        option.classList.add('variation-option', 'size');
        option.dataset.value = size;
        if (size === selectedSize) option.classList.add('selected');
        option.addEventListener('click', () => handleVariationSelection('size', size, option));
        sizeContainer.appendChild(option);
    });

    // Render Colors
    mockVariations.colors.forEach(color => {
        const option = document.createElement('div');
        option.classList.add('variation-option', 'color');
        option.dataset.value = color.name;
        option.style.backgroundColor = color.hex;
        
        if (color.available === false) {
            option.classList.add('disabled');
        } else {
            if (color.name === selectedColor) option.classList.add('selected');
            option.addEventListener('click', () => handleVariationSelection('color', color.name, option));
        }
        colorContainer.appendChild(option);
    });
}


/**
 * Handles the selection of a product variation option.
 */
function handleVariationSelection(type, value, element) {
    if (element.classList.contains('disabled')) return;

    let container, stateKey;

    if (type === 'size') {
        stateKey = 'selectedSize';
        container = document.getElementById('size-options');
    } else if (type === 'color') {
        stateKey = 'selectedColor';
        container = document.getElementById('color-options');
    }
    
    container.querySelectorAll('.variation-option').forEach(opt => {
        opt.classList.remove('selected');
    });

    element.classList.add('selected');
    window[stateKey] = value; 
    
    // Recalculate price on selection change
    updateTotalPrice(); 
}


// ==================================================================
// Quantity Selector Logic (Task 3 & 4)
// ==================================================================

/**
 * Sets up event listeners for the quantity selector.
 */
function initializeQuantitySelector() {
    const quantityInput = document.getElementById('quantity');
    const buttons = document.querySelectorAll('.quantity-btn');

    buttons.forEach(button => {
        button.addEventListener('click', () => {
            let currentQuantity = parseInt(quantityInput.value);
            const action = button.dataset.action;

            if (action === 'increase') {
                if (currentQuantity < MAX_QUANTITY) {
                    currentQuantity++;
                }
            } else if (action === 'decrease') {
                if (currentQuantity > MIN_QUANTITY) {
                    currentQuantity--;
                }
            }
            
            quantityInput.value = currentQuantity;
            updateTotalPrice(); 
        });
    });
}


// ==================================================================
// 📐 Core Functions 
// ==================================================================

/**
 * Get the Product ID from the URL Query Parameter
 */
function getProductIdFromUrl() {
    const urlParams = new URLSearchParams(window.location.search);
    const productId = urlParams.get('id');
    return productId ? parseInt(productId) : null;
}

/**
 * 2. Render the product details onto the page
 */
function renderProductDetail(product) {
    const formattedPrice = product.price.toFixed(2);
    
    const detailHTML = `
        <div class="detail-wrapper">
            <div class="detail-image-column">
                <img 
                    src="${product.image}" 
                    alt="${product.title}" 
                    class="detail-image"
                >
            </div>
            <div class="detail-info-column">
                <h1 class="detail-title">${product.title}</h1>
                <p class="detail-category">Category: ${product.category}</p>
                <p class="detail-description">${product.description}</p>
                
                <div class="product-variations">
                    <div id="size-options" class="variation-group">
                        <label for="size">Size:</label>
                        </div>
                    <div id="color-options" class="variation-group">
                        <label for="color">Color:</label>
                        </div>
                </div>

                <div class="quantity-selector-container">
                    <label for="quantity">Quantity:</label>
                    <div class="quantity-selector">
                        <button class="quantity-btn minus-btn" data-action="decrease">−</button>
                        <input type="number" id="quantity" value="1" min="1" max="10" readonly>
                        <button class="quantity-btn plus-btn" data-action="increase">+</button>
                    </div>
                </div>
                
                <div class="detail-price-rating">
                    <span class="detail-price" id="current-total-price">$${formattedPrice}</span> 
                    <span class="detail-rating">
                        Rating: ${product.rating.rate} (${product.rating.count} reviews)
                    </span>
                </div>
                <button class="cta-button add-to-cart-detail" data-product-id="${product.id}" data-product-title="${product.title}" data-product-price="${product.price}">
                    Add to Cart
                </button>
            </div>
        </div>
    `;

    productDetailsContainer.innerHTML = detailHTML;
    
    renderVariations(); 
    initializeQuantitySelector();
    // 🚀 NEW: Ensure cart badge is updated on page load
    updateCartBadge(); 
}


/**
 * 3. Fetch the single product data
 */
async function fetchProductDetail() {
    const id = getProductIdFromUrl();

    if (!id) {
        productDetailsContainer.innerHTML = '<p style="color: red; padding: 50px;">Error: No product ID found in the URL. Try navigating to product.html?id=1</p>';
        return;
    }

    try {
        const response = await fetch(`https://fakestoreapi.com/products/${id}`); 
        
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        
        const product = await response.json();
        
        // SET GLOBAL STATE: Store the unit price
        basePrice = product.price;

        renderProductDetail(product);

    } catch (error) {
        console.error('Error fetching product detail:', error);
        productDetailsContainer.innerHTML = '<p style="color: red; text-align: center; font-size: 1.2em; padding: 50px;">Failed to load product details.</p>';
    }
}

// Start the process when the script loads
fetchProductDetail();


// ------------------------------------------------------------------
// 🚀 NEW: Add to Cart Logic with Local Storage & Feedback (Task 5)
// ------------------------------------------------------------------

document.addEventListener('click', (e) => {
    const target = e.target;

    if (target.classList.contains('add-to-cart-detail')) {
        e.preventDefault(); 
        
        const productId = parseInt(target.getAttribute('data-product-id'));
        const productTitle = target.getAttribute('data-product-title');
        const productPrice = parseFloat(target.getAttribute('data-product-price'));
        const quantity = parseInt(document.getElementById('quantity').value);

        // 1. Create the item object with all state
        const newItem = {
            id: productId,
            title: productTitle,
            price: productPrice,
            quantity: quantity,
            size: selectedSize,
            color: selectedColor,
            // Include a unique ID to identify this specific variation/quantity combination
            cartUniqueId: `${productId}-${selectedSize}-${selectedColor}`
        };

        // 2. Load, Update, and Save to Local Storage
        const cartItems = getCartItems();
        const existingItemIndex = cartItems.findIndex(item => item.cartUniqueId === newItem.cartUniqueId);

        if (existingItemIndex > -1) {
            // If variation/size combo exists, increase quantity
            cartItems[existingItemIndex].quantity += quantity;
        } else {
            // Add the new item
            cartItems.push(newItem);
        }

        saveCartItems(cartItems);
        
        // 3. Visual Feedback (Success Message/Animation)
        const originalText = target.textContent;
        target.textContent = 'ADDED!';
        target.classList.add('added-success'); // Use this for CSS animation/color
        
        // 4. Update Cart Count Badge
        updateCartBadge();

        console.log("Cart contents in Local Storage:", getCartItems());

        setTimeout(() => {
            target.textContent = originalText;
            target.classList.remove('added-success');
        }, 1000); 
    }
});