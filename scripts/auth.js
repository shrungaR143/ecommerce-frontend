// scripts/auth.js

// 1. Correct: Import the initialized 'auth' service object from your local config file.
import { auth } from "./firebase-config.js"; 

// 2. CRITICAL FIX: Import the specific Firebase functions from the correct Firebase module path.
import { 
    createUserWithEmailAndPassword, 
    signInWithEmailAndPassword 
} from "firebase/auth";


document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('login-form');
    const signupForm = document.getElementById('signup-form');

    // --- Utility Functions (Omitted for brevity, but they remain correct) ---

    function isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    function isValidPassword(password) {
        if (password.length < 8) return false;
        if (!/[A-Z]/.test(password)) return false;
        if (!/[a-z]/.test(password)) return false;
        if (!/[0-9]/.test(password)) return false;
        return true;
    }
    
    function displayError(inputElement, message) {
        let errorElement = inputElement.nextElementSibling;
        if (!errorElement || !errorElement.classList.contains('input-error')) {
            errorElement = document.createElement('p');
            errorElement.classList.add('input-error');
            inputElement.parentNode.insertBefore(errorElement, inputElement.nextSibling);
        }
        errorElement.textContent = message;
        errorElement.style.display = 'block';
        inputElement.classList.add('input-invalid');
    }

    function clearError(inputElement) {
        const errorElement = inputElement.nextElementSibling;
        if (errorElement && errorElement.classList.contains('input-error')) {
            errorElement.textContent = '';
            errorElement.style.display = 'none';
        }
        inputElement.classList.remove('input-invalid');
    }

    function setupRealTimeValidation(form) {
        const emailInput = form.querySelector('input[type="email"]');
        const passwordInput = form.querySelector('input[type="password"]');

        if (emailInput) {
            emailInput.addEventListener('input', (e) => {
                clearError(e.target);
                if (e.target.value && !isValidEmail(e.target.value)) {
                    displayError(e.target, 'Please enter a valid email address.');
                }
            });
        }

        if (passwordInput) {
            passwordInput.addEventListener('input', (e) => {
                clearError(e.target);
                if (e.target.value && !isValidPassword(e.target.value)) {
                    displayError(e.target, 'Password must be 8+ chars, incl. upper, lower, and a number.');
                }
            });
        }
    }


    // --- Form Submission Handlers ---

    if (loginForm) {
        setupRealTimeValidation(loginForm);
        
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const emailInput = document.getElementById('login-email');
            const passwordInput = document.getElementById('login-password');

            clearError(emailInput);
            clearError(passwordInput);

            // Final Validation Check
            let isValid = true;
            if (!isValidEmail(emailInput.value)) {
                displayError(emailInput, 'Invalid email format.');
                isValid = false;
            }
            if (passwordInput.value.length === 0) {
                 displayError(passwordInput, 'Password is required.');
                 isValid = false;
            }
            if (!isValid) return;
            
            // --- FIREBASE LOGIN PROCESS ---
            try {
                const userCredential = await signInWithEmailAndPassword(
                    auth, 
                    emailInput.value,
                    passwordInput.value
                );
                
                const user = userCredential.user;
                console.log('Firebase Login successful. User ID:', user.uid);
                
                // CRITICAL: Save user to local storage for persistent session
                localStorage.setItem('user', JSON.stringify({ uid: user.uid, email: user.email })); 
                
                // FIX: Alert first, then wrap redirect in a timeout
                alert(`Welcome back! You are logged in.`);
                setTimeout(() => {
                    window.location.href = 'index.html'; 
                }, 50); // Small delay to ensure alert completes

            } catch (error) {
                console.error("Firebase Login Error:", error.code, error.message);
                
                let errorMessage = "Login failed. Please check your credentials.";
                
                if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
                    errorMessage = 'Incorrect email or password. Please try again.';
                } else if (error.code === 'auth/invalid-email') {
                     errorMessage = 'The email address is not valid.';
                }
                
                // Display error to the user
                displayError(emailInput, errorMessage);
            }
        });
    }


    if (signupForm) {
        setupRealTimeValidation(signupForm);
        
        const confirmPassInput = document.getElementById('signup-confirm-password');

        confirmPassInput.addEventListener('input', (e) => {
            const passInput = document.getElementById('signup-password');
            clearError(e.target);
            if (passInput.value !== e.target.value) {
                displayError(e.target, 'Passwords do not match.');
            }
        });

        signupForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const nameInput = document.getElementById('signup-name');
            const emailInput = document.getElementById('signup-email');
            const passwordInput = document.getElementById('signup-password');
            
            let isValid = true;

            // Final Validation Checks
            if (nameInput.value.trim() === '') {
                displayError(nameInput, 'Full name is required.');
                isValid = false;
            }
            if (!isValidEmail(emailInput.value)) {
                displayError(emailInput, 'Invalid email format.');
                isValid = false;
            }
            if (!isValidPassword(passwordInput.value)) {
                displayError(passwordInput, 'See requirements below password field.'); 
                isValid = false;
            }
            if (passwordInput.value !== confirmPassInput.value) {
                displayError(confirmPassInput, 'Passwords must match.');
                isValid = false;
            }

            if (!isValid) return;

            // --- FIREBASE REGISTRATION LOGIC ---
            try {
                const userCredential = await createUserWithEmailAndPassword(
                    auth, // The exported Auth service object from firebase-config.js
                    emailInput.value,
                    passwordInput.value
                );
                
                const user = userCredential.user;
                console.log('Firebase Registration successful. User ID:', user.uid);
                
                // CRITICAL: Save user to local storage for persistent session
                localStorage.setItem('user', JSON.stringify({ uid: user.uid, email: user.email }));
                
                // FIX: Alert first, then wrap redirect in a timeout
                alert(`Welcome, ${nameInput.value}! Your account has been created.`);
                setTimeout(() => {
                    window.location.href = 'index.html'; // Redirect to home page after sign up
                }, 50); // Small delay to ensure alert completes

            } catch (error) {
                console.error("Firebase Error:", error.code, error.message);
                
                let errorMessage = "Registration failed. Please try again.";
                
                if (error.code === 'auth/email-already-in-use') {
                    errorMessage = 'This email is already registered. Try logging in.';
                    displayError(emailInput, errorMessage); 
                } else if (error.code === 'auth/weak-password') {
                    errorMessage = 'Password is too weak. Please see password requirements.';
                    displayError(passwordInput, errorMessage); 
                } else {
                    displayError(emailInput, errorMessage); 
                }
            }
        });
    }
});