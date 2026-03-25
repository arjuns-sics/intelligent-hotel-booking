import { createContext, useContext, type ReactNode } from 'react';
import { useAtom } from 'jotai';
import {
  adminTokenAtom,
  adminAtom,
  isAdminAuthenticatedAtom,
} from '../lib/authAtoms';
import {
  adminLoginAtom,
  adminLogoutAtom,
} from '../lib/adminAuthAtom';

interface Admin {
  _id: string;
  name: string;
  email: string;
  role: string;
}

interface AdminAuthContextType {
  isAuthenticated: boolean;
  admin: Admin | null;
  token: string | null;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
}

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined);

interface AdminAuthProviderProps {
  children: ReactNode;
}

export const AdminAuthProvider = ({ children }: AdminAuthProviderProps) => {
  const [token] = useAtom(adminTokenAtom);
  const [admin] = useAtom(adminAtom);
  const [isAuthenticated] = useAtom(isAdminAuthenticatedAtom);

  const [, login] = useAtom(adminLoginAtom);
  const [, logout] = useAtom(adminLogoutAtom);

  const handleLogin = async (email: string, password: string) => {
    return await login({ email, password });
  };

  const handleLogout = () => {
    logout();
  };

  const value: AdminAuthContextType = {
    isAuthenticated,
    admin,
    token,
    login: handleLogin,
    logout: handleLogout,
  };

  return (
    <AdminAuthContext.Provider value={value}>
      {children}
    </AdminAuthContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAdminAuth = (): AdminAuthContextType => {
  const context = useContext(AdminAuthContext);
  if (context === undefined) {
    throw new Error('useAdminAuth must be used within an AdminAuthProvider');
  }
  return context;
};
