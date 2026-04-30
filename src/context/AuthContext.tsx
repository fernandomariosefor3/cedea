import { createContext, useContext, useState, ReactNode } from 'react';

interface User {
  name: string;
  email: string;
  role: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => boolean;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

const VALID_USERS = [
  { email: 'admin@sefor3.ce.gov.br', password: 'sefor2026', name: 'Gestor SEFOR 3', role: 'Administrador' },
  { email: 'gestor@sefor3.ce.gov.br', password: 'gestor123', name: 'Gestor Escolar', role: 'Gestor' },
  { email: 'tecnico@sefor3.ce.gov.br', password: 'tecnico123', name: 'Técnico Regional', role: 'Técnico' },
];

const AUTH_KEY = 'sefor3_auth_user';

function getStoredUser(): User | null {
  try {
    const stored = localStorage.getItem(AUTH_KEY);
    return stored ? JSON.parse(stored) : null;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(getStoredUser);

  const login = (email: string, password: string): boolean => {
    const found = VALID_USERS.find(
      (u) => u.email === email.trim().toLowerCase() && u.password === password
    );
    if (found) {
      const userData: User = { name: found.name, email: found.email, role: found.role };
      localStorage.setItem(AUTH_KEY, JSON.stringify(userData));
      setUser(userData);
      return true;
    }
    return false;
  };

  const logout = () => {
    localStorage.removeItem(AUTH_KEY);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
