import { atom } from 'jotai';
import api from './api';
import { showSuccess, showError, showInfo } from './notifications';
import { adminTokenAtom, adminAtom, clearAllAuthState } from './authAtoms';

// Login atom
export const adminLoginAtom = atom(
  null,
  async (_get, set, { email, password }: { email: string; password: string }) => {
    try {
      const response = await api.post('/admin/login', { email, password });
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
    clearAllAuthState(set);
    showInfo('Logged out successfully');
  }
);
