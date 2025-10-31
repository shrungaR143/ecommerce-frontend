// --- Global Constants and Selectors ---
const cartItemsContainer = document.getElementById('cart-items-container');
const emptyCartMessage = document.getElementById('empty-cart-message');

// 🚀 Selectors for Totals
const cartSubtotalDisplay = document.getElementById('cart-subtotal');
const cartShippingDisplay = document.getElementById('cart-shipping');
const cartTotalDisplay = document.getElementById('cart-total');

// 🚀 NEW Selector for Checkout Button
const checkoutButton = document.getElementById('checkout-btn');

// --- CONSTANTS ---
const SHIPPING_COST = 5.00; // Define a fixed shipping cost
const MAX_QUANTITY = 10;
const MIN_QUANTITY = 1;
const CART_STORAGE_KEY = 'shoppingCart'; 

// ==================================================================
// === Standard Cart Management Functions (Replicated from app.js for robustness) ===
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
    const totalCount = cartItems.reduce((sum, item) => sum + (item.quantity || 0), 0);
    
    // Selecting the badge on the cart page (or relying on app.js to select it)
    const badge = document.querySelector('.notification-badge'); 
    
    if (badge) { 
        badge.textContent = totalCount; 
        badge.style.display = totalCount > 0 ? 'block' : 'none';
    }
}

// ==================================================================
// === TASK 9: CHECKOUT LOGIC ===
// ==================================================================

/**
 * Handles the checkout process: clears the cart and shows a success message.
 */
function checkout() {
    // Check again if the cart is empty before proceeding to clear
    if (getCartItems().length === 0) {
        alert("Your cart is already empty. Nothing to check out.");
        return;
    }

    // 1. Clear Local Storage
    saveCartItems([]); 

    // 2. Update Badge and Rerender Cart (will show empty state)
    updateCartBadge();
    
    // 3. Display Confirmation Message
    if (cartItemsContainer) {
        cartItemsContainer.innerHTML = `
            <div class="checkout-success-message">
                <h2>🎉 Order Placed Successfully!</h2>
                <p>Thank you for your purchase. Your items will be shipped shortly.</p>
                <p class="summary-link"><a href="index.html">Continue Shopping</a></p>
            </div>
        `;
    }
    
    // 4. Hide the Totals Summary
    const totalsContainer = document.querySelector('.cart-summary-container');
    if (totalsContainer) {
        totalsContainer.style.display = 'none';
    }
    // Also hide the empty message if it's visible (though clearing the cart items should handle this)
    if (emptyCartMessage) {
        emptyCartMessage.style.display = 'none';
    }
}


// ==================================================================
// === CART RENDERING & LOGIC (Kept as is) ===
// ==================================================================

function generateCartItemHTML(item) {
    const lineTotal = (item.price * item.quantity).toFixed(2);
    
    return `
        <div class="cart-item" data-unique-id="${item.cartUniqueId}">
            <img src="${item.image}" alt="${item.title}" class="cart-item-image">
            <div class="cart-item-details">
                <h4 class="cart-item-title">${item.title}</h4>
                <p class="cart-item-price">$${item.price.toFixed(2)} each</p>
                <p class="cart-item-variations">
                    Size: <strong>${item.size || 'N/A'}</strong> | 
                    Color: <strong>${item.color || 'N/A'}</strong>
                </p>
            </div>

            <div class="cart-item-controls">
                <div class="quantity-selector cart-quantity-selector">
                    <button class="quantity-btn decrease-btn" data-action="decrease" data-id="${item.cartUniqueId}">−</button>
                    <input type="number" class="quantity-input" value="${item.quantity}" min="1" max="10" readonly>
                    <button class="quantity-btn increase-btn" data-action="increase" data-id="${item.cartUniqueId}">+</button>
                </div>
                
                <button class="remove-item-btn" data-action="remove" data-id="${item.cartUniqueId}">Remove</button>
            </div>
            
            <div class="cart-item-total">
                Line Total: <strong>$${lineTotal}</strong>
            </div>
        </div>
    `;
}

function calculateCartTotals(items) {
    // Hide totals section if necessary (used for checkout success)
    const totalsContainer = document.querySelector('.cart-summary-container');
    if (items.length === 0) {
        if (emptyCartMessage) emptyCartMessage.style.display = 'block';
        if (cartItemsContainer) cartItemsContainer.innerHTML = '';
        if (totalsContainer) totalsContainer.style.display = 'none'; // Hide totals if cart is empty
        
        // Reset totals displays
        if (cartSubtotalDisplay) cartSubtotalDisplay.textContent = '$0.00';
        if (cartShippingDisplay) cartShippingDisplay.textContent = '$0.00';
        if (cartTotalDisplay) cartTotalDisplay.textContent = '$0.00';
        return;
    }
    
    if (emptyCartMessage) emptyCartMessage.style.display = 'none';
    if (totalsContainer) totalsContainer.style.display = 'block'; // Show totals

    // 1. Calculate Subtotal
    const subtotal = items.reduce((sum, item) => {
        const itemPrice = item.price || 0;
        const itemQuantity = item.quantity || 0;
        return sum + (itemPrice * itemQuantity);
    }, 0);

    // 2. Calculate Final Total
    const shipping = SHIPPING_COST;
    const finalTotal = subtotal + shipping;

    // 3. Update the HTML displays
    if (cartSubtotalDisplay) cartSubtotalDisplay.textContent = `$${subtotal.toFixed(2)}`;
    if (cartShippingDisplay) cartShippingDisplay.textContent = `$${shipping.toFixed(2)}`;
    if (cartTotalDisplay) cartTotalDisplay.textContent = `$${finalTotal.toFixed(2)}`;
}

function removeCartItem(uniqueId) {
    let cart = getCartItems();
    const updatedCart = cart.filter(item => item.cartUniqueId !== uniqueId);
    
    saveCartItems(updatedCart);
    renderCartItems(); 
    updateCartBadge();
}

function updateItemQuantity(uniqueId, action) {
    let cart = getCartItems();
    const itemIndex = cart.findIndex(item => item.cartUniqueId === uniqueId);
    
    if (itemIndex > -1) {
        let currentQuantity = cart[itemIndex].quantity;
        
        if (action === 'increase' && currentQuantity < MAX_QUANTITY) {
            cart[itemIndex].quantity++;
        } else if (action === 'decrease' && currentQuantity > MIN_QUANTITY) {
            cart[itemIndex].quantity--;
        }
        
        saveCartItems(cart);
        renderCartItems(); 
        updateCartBadge();
    }
}

function renderCartItems() {
    const cartItems = getCartItems(); 

    if (cartItemsContainer) cartItemsContainer.innerHTML = ''; 

    if (cartItems.length === 0) {
        calculateCartTotals([]); 
        return;
    }
    
    const allItemsHTML = cartItems.map(generateCartItemHTML).join('');
    if (cartItemsContainer) cartItemsContainer.innerHTML = allItemsHTML;

    calculateCartTotals(cartItems);
    updateCartBadge(); 
}

/**
 * Sets up a single click listener for all cart interactions (UPDATED for Checkout).
 */
function initializeEventListeners() {
    // Listener for remove and quantity buttons
    document.addEventListener('click', (e) => {
        const target = e.target;
        const action = target.getAttribute('data-action');
        const uniqueId = target.getAttribute('data-id');

        if (!uniqueId || !action) return; 

        if (action === 'remove') {
            removeCartItem(uniqueId);
        } else if (action === 'increase' || action === 'decrease') {
            updateItemQuantity(uniqueId, action);
        }
    });

    // 🚀 TASK 9: Checkout Button Listener
    if (checkoutButton) {
        checkoutButton.addEventListener('click', (e) => {
            e.preventDefault();
            // Perform a quick check before calling checkout
            if (getCartItems().length > 0) {
                checkout();
            } else {
                alert("Your cart is empty. Please add items before checking out.");
            }
        });
    }
}


// --- Initialization: Run when the script loads ---
document.addEventListener('DOMContentLoaded', () => {
    // 1. Render all items and calculate totals
    renderCartItems();
    
    // 2. Attach interactive listeners (now including checkout)
    initializeEventListeners(); 
});


