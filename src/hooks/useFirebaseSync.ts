import { useEffect } from 'react';

export function useFirebaseSync(table: string, refresh: () => void): void {
  useEffect(() => {
    const handler = () => refresh();
    window.addEventListener(`sefor3:table:${table}`, handler);
    return () => window.removeEventListener(`sefor3:table:${table}`, handler);
  }, [table, refresh]);
}
