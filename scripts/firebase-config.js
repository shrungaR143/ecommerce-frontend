
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth"; // <-- NEW REQUIRED IMPORT

// Your unique Firebase configuration (use the data from your screenshot)
const firebaseConfig = {
    apiKey: "AIzaSyx...your-key-here...", 
    authDomain: "ecommerce-frontend-14275.firebaseapp.com",
    projectId: "ecommerce-frontend-14275",
    storageBucket: "ecommerce-frontend-14275.appspot.com",
    messagingSenderId: "187410177327",
    appId: "1:187410177327:web:9b1861158455e018c6d5da",
    measurementId: "G-PWLY86002D"
};

// Initialize Firebase App
const app = initializeApp(firebaseConfig);

// Initialize and EXPORT the Auth service
export const auth = getAuth(app); // <-- CRITICAL EXPORT

// You can optionally export the app instance if other services need it
export const firebaseApp = app;