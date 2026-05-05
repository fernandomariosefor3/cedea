import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_PUBLIC_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_PUBLIC_SUPABASE_ANON_KEY as string;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error("timeout")), ms)
    ),
  ]);
}

function getLocalFallbackId(): string {
  const key = "emdia_local_uid";
  let id = localStorage.getItem(key);
  if (!id) {
    id = `local_${Math.random().toString(36).slice(2)}_${Date.now()}`;
    localStorage.setItem(key, id);
  }
  return id;
}

/**
 * Garante que o usuário tenha uma sessão anônima ativa.
 * Se não houver sessão, faz login anônimo automaticamente.
 * Em caso de falha ou timeout, usa um ID local como fallback.
 */
export async function ensureAnonymousSession(): Promise<string> {
  try {
    const { data: { session } } = await withTimeout(
      supabase.auth.getSession(),
      5000
    );
    if (session?.user?.id) return session.user.id;

    const { data, error } = await withTimeout(
      supabase.auth.signInAnonymously(),
      8000
    );
    if (error || !data.user) throw new Error("Falha ao criar sessão anônima");
    return data.user.id;
  } catch {
    return getLocalFallbackId();
  }
}
