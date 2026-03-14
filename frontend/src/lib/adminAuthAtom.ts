import { atom } from 'jotai';
import api from './api';
import { showSuccess, showError, showInfo } from './notifications';

// Types
interface Admin {
  _id: string;
  name: string;
  email: string;
  role: string;
}

interface AdminAuthResponse {
  success: boolean;
  message: string;
  data: Admin & { token: string };
}

// Initialize atoms with localStorage values
const getStoredToken = (): string | null => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('adminToken');
  }
  return null;
};

const getStoredAdmin = (): Admin | null => {
  if (typeof window !== 'undefined') {
    const storedAdmin = localStorage.getItem('admin');
    return storedAdmin ? JSON.parse(storedAdmin) : null;
  }
  return null;
};

// Atoms for admin authentication state
export const adminTokenAtom = atom<string | null>(getStoredToken());
export const adminAtom = atom<Admin | null>(getStoredAdmin());

// Derived atom to check if admin is authenticated
export const isAdminAuthenticatedAtom = atom<boolean>((get) => {
  const token = get(adminTokenAtom);
  return !!token;
});

// Login atom
export const adminLoginAtom = atom(
  null,
  async (_get, set, { email, password }: { email: string; password: string }) => {
    try {
      const response = await api.post<AdminAuthResponse>('/admin/login', { email, password });
      const { token, ...adminData } = response.data.data;

      set(adminTokenAtom, token);
      set(adminAtom, adminData);

      localStorage.setItem('adminToken', token);
      localStorage.setItem('admin', JSON.stringify(adminData));

      showSuccess('Admin login successful!');
      return { success: true };
    } catch (error) {
      if (error instanceof Error) {
        const axiosError = error as { response?: { data?: { message?: string } } };
        const message = axiosError.response?.data?.message || error.message || 'Login failed. Please check your credentials.';
        showError(message);
        return { success: false, error: message };
      }
      showError('Login failed. Please check your credentials.');
      return { success: false, error: 'Login failed. Please check your credentials.' };
    }
  }
);

// Logout atom
export const adminLogoutAtom = atom(
  null,
  (_get, set) => {
    set(adminTokenAtom, null);
    set(adminAtom, null);
    localStorage.removeItem('adminToken');
    localStorage.removeItem('admin');
    showInfo('Logged out successfully');
  }
);
