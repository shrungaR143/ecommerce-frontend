 
console.log("E-Commerce Website Loaded");

// 1. Select the necessary elements from the HTML
const hamburgerBtn = document.querySelector('.hamburger-menu');
const desktopNav = document.querySelector('.desktop-nav'); 
// The '.desktop-nav' is the menu element whose visibility we control.

// 2. Add an event listener to the hamburger button
hamburgerBtn.addEventListener('click', () => {
    
    // 3. Toggle the 'active' class on the navigation menu
    // The CSS in main.css handles the opening/closing effect when this class is present.
    desktopNav.classList.toggle('active');
    
    // 4. Update the icon for better user experience (burger <-> 'X')
    if (desktopNav.classList.contains('active')) {
        // Menu is open: Change button text to a close icon (X)
        hamburgerBtn.innerHTML = '&#10005;'; // HTML entity for 'X'
    } else {
        // Menu is closed: Change button text back to the hamburger icon
        hamburgerBtn.innerHTML = '&#9776;'; // HTML entity for hamburger
    }
});