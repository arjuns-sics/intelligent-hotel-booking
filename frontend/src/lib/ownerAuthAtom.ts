import { atom } from 'jotai';
import api from './api';
import { showSuccess, showError } from './notifications';

// Types
interface HotelOwner {
  id: string;
  name: string;
  email: string;
  phone?: string;
}

interface OwnerAuthResponse {
  success: boolean;
  message: string;
  data: HotelOwner & { token: string };
}

// Initialize atoms with localStorage values
const getStoredOwnerToken = (): string | null => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('hotelOwnerToken');
  }
  return null;
};

const getStoredOwner = (): HotelOwner | null => {
  if (typeof window !== 'undefined') {
    const storedOwner = localStorage.getItem('hotelOwner');
    return storedOwner ? JSON.parse(storedOwner) : null;
  }
  return null;
};

const getOnboardingComplete = (): boolean => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('onboardingComplete') === 'true';
  }
  return false;
};

// Atoms for hotel owner authentication state
export const ownerTokenAtom = atom<string | null>(getStoredOwnerToken());
export const ownerAtom = atom<HotelOwner | null>(getStoredOwner());
export const onboardingCompleteAtom = atom<boolean>(getOnboardingComplete());

// Derived atom to check if owner is authenticated
export const isOwnerAuthenticatedAtom = atom<boolean>((get) => {
  const token = get(ownerTokenAtom);
  return !!token;
});

// Login atom
export const loginOwnerAtom = atom(
  null,
  async (_get, set, { email, password }: { email: string; password: string }) => {
    try {
      const response = await api.post<OwnerAuthResponse>('/owner/login', { email, password });
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
      const response = await api.post<OwnerAuthResponse>('/owner/register', { 
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
    set(ownerTokenAtom, null);
    set(ownerAtom, null);
    set(onboardingCompleteAtom, false);
    localStorage.removeItem('hotelOwnerToken');
    localStorage.removeItem('hotelOwner');
    localStorage.removeItem('onboardingComplete');
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
