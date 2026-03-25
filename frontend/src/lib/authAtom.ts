import { atom } from 'jotai';
import api from './api';
import { showSuccess, showError, showInfo } from './notifications';
import { tokenAtom, userAtom, clearAllAuthState } from './authAtoms';
import type { AuthResponse } from './api';

// Login atom
export const loginAtom = atom(
  null,
  async (_get, set, { email, password }: { email: string; password: string }) => {
    try {
      const response = await api.post<AuthResponse>('/auth/login', { email, password });
      const { token, user } = response.data;

      set(tokenAtom, token);
      set(userAtom, user);

      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));

      showSuccess('Login successful!');
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

// Register atom
export const registerAtom = atom(
  null,
  async (_get, set, { name, email, password }: { name: string; email: string; password: string }) => {
    try {
      const response = await api.post<AuthResponse>('/auth/register', { name, email, password });
      const { token, user } = response.data;

      set(tokenAtom, token);
      set(userAtom, user);

      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));

      showSuccess('Registration successful! Welcome to Intelligent Hotel.');
      return { success: true };
    } catch (error) {
      if (error instanceof Error) {
        const axiosError = error as { response?: { data?: { message?: string } } };
        const message = axiosError.response?.data?.message || error.message || 'Registration failed. Please try again.';
        showError(message);
        return { success: false, error: message };
      }
      showError('Registration failed. Please try again.');
      return { success: false, error: 'Registration failed. Please try again.' };
    }
  }
);

// Logout atom
export const logoutAtom = atom(
  null,
  (_get, set) => {
    clearAllAuthState(set);
    showInfo('Logged out successfully');
  }
);
