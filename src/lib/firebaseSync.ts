import { doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore';
import { db } from './firebase';

async function loadCollection<T>(docName: string): Promise<T[]> {
  try {
    const ref = doc(db, 'sefor3', docName);
    const snap = await getDoc(ref);
    if (snap.exists()) {
      const data = snap.data();
      return (data?.items as T[]) ?? [];
    }
    return [];
  } catch {
    return [];
  }
}

async function saveCollection<T>(docName: string, items: T[]): Promise<void> {
  try {
    const ref = doc(db, 'sefor3', docName);
    await setDoc(ref, { items });
  } catch {
    // silent fail
  }
}

function subscribeCollection<T>(docName: string, callback: (items: T[]) => void): () => void {
  const ref = doc(db, 'sefor3', docName);
  return onSnapshot(ref, (snap) => {
    if (snap.exists()) {
      callback((snap.data()?.items as T[]) ?? []);
    }
  }, () => {/* ignore errors */});
}

export function loadCdgPlanos<T>(): Promise<T[]> {
  return loadCollection<T>('cdgPlanos');
}

export function saveCdgPlanos<T>(items: T[]): Promise<void> {
  return saveCollection('cdgPlanos', items);
}

export function subscribeCdgPlanos<T>(callback: (items: T[]) => void): () => void {
  return subscribeCollection<T>('cdgPlanos', callback);
}

export function loadAcoesRecomp<T>(): Promise<T[]> {
  return loadCollection<T>('acoesRecomp');
}

export function saveAcoesRecomp<T>(items: T[]): Promise<void> {
  return saveCollection('acoesRecomp', items);
}

export function subscribeAcoesRecomp<T>(callback: (items: T[]) => void): () => void {
  return subscribeCollection<T>('acoesRecomp', callback);
}

export async function initFirebaseSync(): Promise<void> {
  return;
}
