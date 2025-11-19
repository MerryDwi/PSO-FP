// ===============================
// AUTH.JS — Halaman LOGIN & SIGNUP
// ===============================

import { auth } from './firebase.config.js'; // Impor objek auth
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  onAuthStateChanged
} from "firebase/auth"; // Impor fungsi Firebase Auth
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

// ===============================
// SETUP VARIABEL DAN LOGIKA
// ===============================

// Ambil elemen DOM
const signInFormContainer = document.getElementById("signInForm");
const signUpFormContainer = document.getElementById("signUpForm");
const switchToSignUp = document.getElementById("switchToSignUp");
const switchToSignIn = document.getElementById("switchToSignIn");
const loginForm = document.getElementById("loginForm");
const signupForm = document.getElementById("signupForm");

// ------------------------------
// TOGGLE SIGN-IN <-> SIGN-UP
// ------------------------------
switchToSignUp?.addEventListener("click", () => {
    signInFormContainer.classList.add("hidden"); 
    signUpFormContainer.classList.remove("hidden");
});

switchToSignIn?.addEventListener("click", () => {
    signUpFormContainer.classList.add("hidden");
    signInFormContainer.classList.remove("hidden");
});

// ------------------------------
// LOGIN DENGAN FIREBASE
// ------------------------------
if (loginForm) {
    loginForm.addEventListener("submit", (e) => {
        e.preventDefault();

        // ambil nilai input
        const email = document.getElementById("loginEmail").value.trim();
        const password = document.getElementById("loginPassword").value.trim();

        if (email === "" || password === "") {
            alert("Email dan password wajib diisi!");
            return;
        }

        // Gunakan Firebase signInWithEmailAndPassword
        signInWithEmailAndPassword(auth, email, password)
          .then((userCredential) => {
            console.log("Login sukses:", userCredential.user);
            window.location.href = "game.html"; // Redirect ke game
          })
          .catch((error) => {
            console.error("Error Login:", error.code, error.message);
            alert(`Gagal login: ${error.message.split('(')[0].trim()}`);
          });
    });
}

// ------------------------------
// SIGN UP DENGAN FIREBASE
// ------------------------------
if (signupForm) {
    signupForm.addEventListener("submit", (e) => {
        e.preventDefault();

        const email = document.getElementById("signupEmail").value.trim();
        const password = document.getElementById("signupPassword").value.trim();
        const confirmPassword = document.getElementById("signupConfirm").value.trim();

        // Constant-time comparison to prevent timing attacks
        function constantTimeEquals(a, b) {
            if (a.length !== b.length) return false;
            let result = 0;
            for (let i = 0; i < a.length; i++) {
                result |= a.charCodeAt(i) ^ b.charCodeAt(i);
            }
            return result === 0;
        }
        
        if (!constantTimeEquals(password, confirmPassword)) {
            alert("Password dan konfirmasi password tidak cocok!");
            return;
        }

        if (email === "" || password === "") {
            alert("Email dan password wajib diisi!");
            return;
        }

        // Gunakan Firebase createUserWithEmailAndPassword
        createUserWithEmailAndPassword(auth, email, password)
          .then((userCredential) => {
            console.log("Sign Up sukses:", userCredential.user);
            alert("Akun berhasil dibuat! Silakan login.");
    
            // Alihkan ke form login
            signUpFormContainer.classList.add("hidden");
            signInFormContainer.classList.remove("hidden");
          })
          .catch((error) => {
            console.error("Error Sign Up:", error.code, error.message);
            alert(`Gagal mendaftar: ${error.message.split('(')[0].trim()}`);
          });
    });
}

// ------------------------------
// Cek Status Otentikasi saat memuat index.html
// ------------------------------

// Cek jika pengguna sudah login, langsung arahkan ke game.html
onAuthStateChanged(auth, (user) => {
    // Hanya redirect jika kita berada di index.html
    if (user && window.location.pathname.endsWith('index.html')) {
        window.location.href = 'game.html';
    }
});
