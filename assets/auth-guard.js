import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
  getAuth, onAuthStateChanged, signOut
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import {
  getFirestore, doc, getDoc
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyBhlUoiffq5xpbfT5ghxfASJCdry6fllSE",
  authDomain: "nexus-membros.firebaseapp.com",
  projectId: "nexus-membros",
  storageBucket: "nexus-membros.firebasestorage.app",
  messagingSenderId: "641030538028",
  appId: "1:641030538028:web:4e673e9e5925a27f80a289",
};

export const ADMIN_EMAIL = "contato.bsoeiro@gmail.com";

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

export function isAdmin(user) {
  return !!user && user.email === ADMIN_EMAIL;
}

// Busca o status de acesso da nutri (pending / approved / revoked). Admin não
// precisa de doc pra ter acesso, mas se tiver um, ele é ignorado mesmo assim.
export async function getAccessStatus(user) {
  if (isAdmin(user)) return 'approved';
  const snap = await getDoc(doc(db, 'users', user.uid));
  return snap.exists() ? snap.data().status : null;
}

// Resolve só quando login + aprovação estiverem confirmados. Caso contrário,
// desloga e manda pro login com um aviso do motivo — a página protegida nunca chega a montar.
export function requireAuth() {
  return new Promise((resolve) => {
    onAuthStateChanged(auth, async (user) => {
      if (!user) {
        const next = encodeURIComponent(location.pathname.split('/').pop() || 'index.html');
        location.href = `login.html?next=${next}`;
        return;
      }
      const status = await getAccessStatus(user);
      if (status === 'approved') {
        resolve(user);
      } else {
        await signOut(auth);
        const reason = status === 'pending' ? 'pending' : status === 'revoked' ? 'revoked' : 'unknown';
        location.href = `login.html?reason=${reason}`;
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
  if (isAdmin(user)) {
    document.querySelectorAll('[data-admin-only]').forEach((el) => { el.hidden = false; });
  }
}
