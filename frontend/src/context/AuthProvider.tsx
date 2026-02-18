import { createContext, useContext, type ReactNode } from 'react';
import { useAtom } from 'jotai';
import { 
  tokenAtom, 
  userAtom, 
  isAuthenticatedAtom, 
  loginAtom, 
  registerAtom, 
  logoutAtom 
} from '../lib/authAtom';

interface User {
  _id: string;
  name: string;
  email: string;
}

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (name: string, email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [token] = useAtom(tokenAtom);
  const [user] = useAtom(userAtom);
  const [isAuthenticated] = useAtom(isAuthenticatedAtom);
  
  const [, login] = useAtom(loginAtom);
  const [, register] = useAtom(registerAtom);
  const [, logout] = useAtom(logoutAtom);

  const handleLogin = async (email: string, password: string) => {
    return await login({ email, password });
  };

  const handleRegister = async (name: string, email: string, password: string) => {
    return await register({ name, email, password });
  };

  const handleLogout = () => {
    logout();
  };

  const value: AuthContextType = {
    isAuthenticated,
    user,
    token,
    login: handleLogin,
    register: handleRegister,
    logout: handleLogout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
