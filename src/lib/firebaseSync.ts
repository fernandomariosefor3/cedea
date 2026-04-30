import { rtdb, DB_ROOT } from './firebase';
import { ref, get, set, onValue } from 'firebase/database';
import { setTableCache, setFirebaseWriter, markFirebasePopulated } from './supabase';

const TABLES = [
  'escolas',
  'visitas',
  'encaminhamentos',
  'planos_acao',
  'acoes_plano',
  'versoes_plano',
  'cdg_escolas',
  'cdg_evidencias',
  'cdg_checklist',
  'relatorios',
  'nucleo_gestor',
  'ppdt_face',
  'ppdt_pca',
  'recomposicao_turmas',
  'busca_ativa',
  'busca_ativa_acoes',
];

type Row = Record<string, unknown>;

function objToArray(val: unknown): Row[] {
  if (!val || typeof val !== 'object') return [];
  if (Array.isArray(val)) return val as Row[];
  return Object.values(val) as Row[];
}

function arrayToObj(rows: Row[]): Record<string, Row> | null {
  if (rows.length === 0) return null;
  const obj: Record<string, Row> = {};
  rows.forEach((r) => {
    const key = String((r as Record<string, unknown>).id ?? Math.random());
    obj[key] = r;
  });
  return obj;
}

function firebaseWrite(table: string, rows: Row[]): void {
  const tableRef = ref(rtdb, `${DB_ROOT}/${table}`);
  const data = arrayToObj(rows);
  set(tableRef, data).catch((err) =>
    console.warn(`[Firebase] write error for "${table}":`, err),
  );
}

export async function initFirebaseSync(): Promise<void> {
  // Register the write function so supabase shim can call it
  setFirebaseWriter(firebaseWrite as (table: string, rows: Row[]) => void);

  // Try to load data from Firebase
  try {
    const rootRef = ref(rtdb, DB_ROOT);
    const snapshot = await get(rootRef);

    if (snapshot.exists()) {
      const rootData = snapshot.val() as Record<string, unknown>;
      let populated = false;
      for (const table of TABLES) {
        if (rootData[table]) {
          const rows = objToArray(rootData[table]);
          setTableCache(table, rows);
          populated = true;
        } else {
          setTableCache(table, []);
        }
      }
      if (populated) {
        markFirebasePopulated();
      }
    }
    // If snapshot doesn't exist, Firebase is empty → local seed will run and write to Firebase
  } catch (err) {
    console.warn('[Firebase] Failed to load initial data, falling back to local seed:', err);
  }

  // Set up real-time listeners for all tables
  for (const table of TABLES) {
    const tableRef = ref(rtdb, `${DB_ROOT}/${table}`);
    onValue(tableRef, (snap) => {
      const rows = snap.exists() ? objToArray(snap.val()) : [];
      setTableCache(table, rows);
      // Notify hooks that this table changed
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent(`sefor3:table:${table}`));
      }
    });
  }
}

// ─── CDG Planos (used directly by the CDG page via localStorage) ──────────────

const CDG_PLANOS_PATH = `${DB_ROOT}/cdg_planos`;

export async function loadCdgPlanos<T>(): Promise<T[]> {
  try {
    const snap = await get(ref(rtdb, CDG_PLANOS_PATH));
    return snap.exists() ? (objToArray(snap.val()) as unknown as T[]) : [];
  } catch {
    return [];
  }
}

export function saveCdgPlanos<T>(planos: T[]): void {
  const data = arrayToObj(planos as unknown as Row[]);
  set(ref(rtdb, CDG_PLANOS_PATH), data).catch(console.warn);
}

export function subscribeCdgPlanos<T>(cb: (planos: T[]) => void): () => void {
  const unsubscribe = onValue(ref(rtdb, CDG_PLANOS_PATH), (snap) => {
    cb(snap.exists() ? (objToArray(snap.val()) as unknown as T[]) : []);
  });
  return unsubscribe;
}

// ─── Recomposição Ações ────────────────────────────────────────────────────────

const ACOES_RECOMP_PATH = `${DB_ROOT}/acoes_recomp`;

export async function loadAcoesRecomp<T>(): Promise<T[]> {
  try {
    const snap = await get(ref(rtdb, ACOES_RECOMP_PATH));
    return snap.exists() ? (objToArray(snap.val()) as unknown as T[]) : [];
  } catch {
    return [];
  }
}

export function saveAcoesRecomp<T>(acoes: T[]): void {
  const data = arrayToObj(acoes as unknown as Row[]);
  set(ref(rtdb, ACOES_RECOMP_PATH), data).catch(console.warn);
}

export function subscribeAcoesRecomp<T>(cb: (acoes: T[]) => void): () => void {
  const unsubscribe = onValue(ref(rtdb, ACOES_RECOMP_PATH), (snap) => {
    cb(snap.exists() ? (objToArray(snap.val()) as unknown as T[]) : []);
  });
  return unsubscribe;
}
