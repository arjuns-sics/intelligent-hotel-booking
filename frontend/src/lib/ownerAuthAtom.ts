import { atom } from 'jotai';
import api from './api';
import { showSuccess, showError, showInfo } from './notifications';
import { ownerTokenAtom, ownerAtom, onboardingCompleteAtom, clearAllAuthState } from './authAtoms';

// Login atom
export const loginOwnerAtom = atom(
  null,
  async (_get, set, { email, password }: { email: string; password: string }) => {
    try {
      const response = await api.post('/owner/login', { email, password });
      const { token, ...ownerData } = response.data.data;

      set(ownerTokenAtom, token);
      set(ownerAtom, ownerData);

      localStorage.setItem('hotelOwnerToken', token);
      localStorage.setItem('hotelOwner', JSON.stringify(ownerData));

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
export const registerOwnerAtom = atom(
  null,
  async (_get, set, { name, email, password, phone }: { 
    name: string; 
    email: string; 
    password: string;
    phone?: string;
  }) => {
    try {
      const response = await api.post('/owner/register', { 
        name, 
        email, 
        password,
        phone,
      });
      const { token, ...ownerData } = response.data.data;

      set(ownerTokenAtom, token);
      set(ownerAtom, ownerData);

      localStorage.setItem('hotelOwnerToken', token);
      localStorage.setItem('hotelOwner', JSON.stringify(ownerData));

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
export const logoutOwnerAtom = atom(
  null,
  (_get, set) => {
    clearAllAuthState(set);
    showInfo('Logged out successfully');
  }
);

// Complete onboarding atom
export const completeOnboardingAtom = atom(
  null,
  (_get, set) => {
    set(onboardingCompleteAtom, true);
    localStorage.setItem('onboardingComplete', 'true');
  }
);
