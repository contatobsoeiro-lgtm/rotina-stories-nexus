import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
  getAuth, onAuthStateChanged, signOut
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyBhlUoiffq5xpbfT5ghxfASJCdry6fllSE",
  authDomain: "nexus-membros.firebaseapp.com",
  projectId: "nexus-membros",
  storageBucket: "nexus-membros.firebasestorage.app",
  messagingSenderId: "641030538028",
  appId: "1:641030538028:web:4e673e9e5925a27f80a289",
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

// Resolve só quando o login estiver confirmado. Se não estiver logada, redireciona
// pro login e nunca resolve (a página some antes de renderizar qualquer conteúdo).
export function requireAuth() {
  return new Promise((resolve) => {
    onAuthStateChanged(auth, (user) => {
      if (user) {
        resolve(user);
      } else {
        const next = encodeURIComponent(location.pathname.split('/').pop() || 'index.html');
        location.href = `login.html?next=${next}`;
      }
    });
  });
}

export function wireLogout(user) {
  document.querySelectorAll('[data-action="logout"]').forEach((btn) => {
    if (user && user.email) btn.title = `Sair (${user.email})`;
    btn.addEventListener('click', async () => {
      await signOut(auth);
      location.href = 'login.html';
    });
  });
}
