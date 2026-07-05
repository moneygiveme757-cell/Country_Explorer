
import {
  auth
} from "./firebase.js";

import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

const loginBtn = document.getElementById("loginBtn");
const signupBtn = document.getElementById("signupBtn");
const guestBtn = document.getElementById("guestBtn");
const resetBtn = document.getElementById("resetBtn");

if (loginBtn) {
  loginBtn.addEventListener("click", async () => {
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    try {
      await signInWithEmailAndPassword(auth, email, password);
      window.location.href = "main.html";
    } catch (err) {
      alert(err.message);
    }
  });
}

if (signupBtn) {
  signupBtn.addEventListener("click", async () => {
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    try {
      await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );

      alert("Account created!");
      window.location.href = "index.html";

    } catch (err) {
      alert(err.message);
    }
  });
}

if (guestBtn) {
  guestBtn.addEventListener("click", () => {
    localStorage.setItem("guest", "true");
    window.location.href = "main.html";
  });
}

if (resetBtn) {
  resetBtn.addEventListener("click", async () => {
    const email = document.getElementById("email").value;

    try {
      await sendPasswordResetEmail(auth, email);
      alert("Password reset email sent.");
    } catch (err) {
      alert(err.message);
    }
  });
}
