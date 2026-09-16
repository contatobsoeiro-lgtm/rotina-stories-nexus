import { db } from "./auth-guard.js";
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

export async function fetchStories() {
  const snap = await getDoc(doc(db, "content", "stories"));
  if (!snap.exists()) return [];
  const items = snap.data().items || [];
  // Firestore guarda blocks como [{type,text}]; o resto do app espera [[type,text]].
  return items.map((item) => ({
    ...item,
    blocks: (item.blocks || []).map((b) => [b.type, b.text]),
  }));
}

export async function fetchPrompts() {
  const snap = await getDoc(doc(db, "content", "prompts"));
  return snap.exists() ? snap.data() : { feed: [], stories: [], comunidade: [], contexto: '', entrevista: '' };
}
