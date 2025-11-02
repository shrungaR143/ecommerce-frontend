// --- 1. Cart Utilities ---

/**
 * Retrieves the cart items array from local storage.
 * Returns an empty array if nothing is found.
 * @returns {Array} The cart items.
 */
export function getCartItems() {
    const cart = localStorage.getItem('cart');
    return cart ? JSON.parse(cart) : [];
}

/**
 * Saves the given cart items array back to local storage.
 * @param {Array} cartItems - The array of cart items to save.
 */
export function saveCartItems(cartItems) {
    localStorage.setItem('cart', JSON.stringify(cartItems));
}


// --- 2. Formatting Utilities ---

/**
 * Formats a number into a US Dollar currency string.
 * @param {number} price - The price to format.
 * @returns {string} The formatted currency string.
 */
export function formatPrice(price) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
    }).format(price);
}


// --- 3. Authentication Status (Moved from auth.js/app.js) ---

/**
 * Checks if a user is currently logged in.
 * This is primarily used for navigation updates and routing protection.
 * @returns {boolean} True if a user is logged in, false otherwise.
 */
export function isLoggedIn() {
    // Get the auth object stored by Firebase/your auth flow (assuming 'user' is stored)
    const user = localStorage.getItem('user'); 
    return !!user; // Converts to boolean: true if user exists, false if null/empty
}