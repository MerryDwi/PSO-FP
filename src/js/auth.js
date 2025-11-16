// ===============================
// AUTH.JS — Halaman LOGIN & SIGNUP
// ===============================

// Ambil elemen
const signInForm = document.getElementById("signInForm");
const signUpForm = document.getElementById("signUpForm");
const switchToSignUp = document.getElementById("switchToSignUp");
const switchToSignIn = document.getElementById("switchToSignIn");

// ------------------------------
// TOGGLE SIGN-IN <-> SIGN-UP
// ------------------------------
switchToSignUp?.addEventListener("click", () => {
    signInForm.style.display = "none";
    signUpForm.style.display = "block";
});

switchToSignIn?.addEventListener("click", () => {
    signUpForm.style.display = "none";
    signInForm.style.display = "block";
});

// ------------------------------
// SHOW / HIDE PASSWORD
// ------------------------------
document.querySelectorAll(".togglePassword").forEach(toggle => {
    toggle.addEventListener("click", () => {
        const input = toggle.previousElementSibling;
        if (input.type === "password") {
            input.type = "text";
            toggle.textContent = "🙈";
        } else {
            input.type = "password";
            toggle.textContent = "👁️";
        }
    });
});

// ------------------------------
// LOGIN (sementara — tanpa Firebase)
// Akan diganti oleh Malvin nanti
// ------------------------------
if (signInForm) {
    signInForm.addEventListener("submit", (e) => {
        e.preventDefault();

        // ambil nilai input
        const email = document.getElementById("loginEmail").value.trim();
        const password = document.getElementById("loginPassword").value.trim();

        if (email === "" || password === "") {
            alert("Email dan password wajib diisi!");
            return;
        }

        // LOGIN SEMENTARA
        // Nanti Malvin ganti dengan Firebase signInWithEmailAndPassword
        localStorage.setItem("user", email);

        // Redirect ke game
        window.location.href = "game.html";
    });
}

// ------------------------------
// SIGN UP (sementara — tanpa Firebase)
// ------------------------------
if (signUpForm) {
    signUpForm.addEventListener("submit", (e) => {
        e.preventDefault();

        const email = document.getElementById("signupEmail").value.trim();
        const password = document.getElementById("signupPassword").value.trim();

        if (email === "" || password === "") {
            alert("Email dan password wajib diisi!");
            return;
        }

        // REGISTRASI SEMENTARA
        // Nanti Malvin ganti dengan Firebase createUserWithEmailAndPassword
        localStorage.setItem("user", email);

        alert("Akun berhasil dibuat! Silakan login.");
        signUpForm.style.display = "none";
        signInForm.style.display = "block";
    });
}
