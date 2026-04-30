import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { initFirebaseSync } from '@/lib/firebaseSync';

interface FirebaseContextType {
  ready: boolean;
}

const FirebaseContext = createContext<FirebaseContextType>({ ready: false });

export function FirebaseProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    initFirebaseSync()
      .then(() => setReady(true))
      .catch((err) => {
        console.error('[Firebase] init error:', err);
        setError('Erro ao conectar ao banco de dados. Usando dados locais.');
        setReady(true); // Still render the app with fallback data
      });
  }, []);

  if (!ready) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        background: '#f0f4f8',
        gap: '16px',
        fontFamily: 'sans-serif',
      }}>
        <div style={{
          width: '48px',
          height: '48px',
          border: '4px solid #e2e8f0',
          borderTop: '4px solid #3b82f6',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
        }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        <p style={{ color: '#64748b', fontSize: '14px' }}>Conectando ao banco de dados...</p>
      </div>
    );
  }

  return (
    <FirebaseContext.Provider value={{ ready }}>
      {error && (
        <div style={{
          background: '#fef3c7',
          border: '1px solid #f59e0b',
          color: '#92400e',
          padding: '8px 16px',
          fontSize: '13px',
          textAlign: 'center',
        }}>
          {error}
        </div>
      )}
      {children}
    </FirebaseContext.Provider>
  );
}

export function useFirebase() {
  return useContext(FirebaseContext);
}
