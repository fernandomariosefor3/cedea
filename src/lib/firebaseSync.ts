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
  'recomposicao_diagnosticos',
  'busca_ativa',
  'busca_ativa_acoes',
];

type Row = Record<string, unknown>;

function objToArray(val: unknown): Row[] {
  if (!val || typeof val !== 'object') return [];
  if (Array.isArray(val)) return (val as Row[]).filter((r) => r != null);
  return (Object.values(val) as Row[]).filter((r) => r != null);
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

// ✅ CORRIGIDO: sanitiza undefined → null antes de enviar ao Firebase
// O Firebase Realtime Database rejeita qualquer campo com valor undefined.
function sanitizeForFirebase(data: unknown): unknown {
  return JSON.parse(
    JSON.stringify(data, (_, value) => (value === undefined ? null : value))
  );
}

function firebaseWrite(table: string, rows: Row[]): void {
  const tableRef = ref(rtdb, `${DB_ROOT}/${table}`);
  const sanitized = sanitizeForFirebase(rows) as Row[];  // ✅ CORRIGIDO
  const data = arrayToObj(sanitized);
  set(tableRef, data).catch((err) =>
    console.warn(`[Firebase] write error for "${table}":`, err),
  );
}

export async function initFirebaseSync(): Promise<void> {
  setFirebaseWriter(firebaseWrite as (table: string, rows: Row[]) => void);

  return new Promise<void>((resolve) => {
    let initialized = false;

    function finish() {
      if (!initialized) {
        initialized = true;
        resolve();
      }
    }

    // Single root listener — one network call handles initial load and real-time updates
    const rootRef = ref(rtdb, DB_ROOT);
    onValue(
      rootRef,
      (snapshot) => {
        const rootData = snapshot.exists()
          ? (snapshot.val() as Record<string, unknown>)
          : {};

        let populated = false;
        for (const table of TABLES) {
          if (rootData[table]) {
            setTableCache(table, objToArray(rootData[table]));
            populated = true;
          } else {
            setTableCache(table, []);
          }
        }
        if (populated) markFirebasePopulated();

        // Notify all hooks that data may have changed
        if (typeof window !== 'undefined') {
          TABLES.forEach((table) =>
            window.dispatchEvent(new CustomEvent(`sefor3:table:${table}`)),
          );
        }

        finish();
      },
      () => finish(), // error callback — let app render with fallback
    );

    // Safety timeout: never block more than 4 seconds
    setTimeout(finish, 4000);
  });
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
  const data = arrayToObj(sanitizeForFirebase(planos) as Row[]);  // ✅ CORRIGIDO
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
  const data = arrayToObj(sanitizeForFirebase(acoes) as Row[]);  // ✅ CORRIGIDO
  set(ref(rtdb, ACOES_RECOMP_PATH), data).catch(console.warn);
}

export function subscribeAcoesRecomp<T>(cb: (acoes: T[]) => void): () => void {
  const unsubscribe = onValue(ref(rtdb, ACOES_RECOMP_PATH), (snap) => {
    cb(snap.exists() ? (objToArray(snap.val()) as unknown as T[]) : []);
  });
  return unsubscribe;
}
