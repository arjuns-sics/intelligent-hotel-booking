import { atom } from 'jotai';

// Types
export interface User {
  _id: string;
  name: string;
  email: string;
}

export interface HotelOwner {
  id: string;
  name: string;
  email: string;
  phone?: string;
}

export interface Admin {
  _id: string;
  name: string;
  email: string;
  role: string;
}

// Initialize atoms with localStorage values
const getStoredValue = <T>(key: string): T | null => {
  if (typeof window !== 'undefined') {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) : null;
  }
  return null;
};

const getStoredString = (key: string): string | null => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem(key);
  }
  return null;
};

const getOnboardingComplete = (): boolean => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('onboardingComplete') === 'true';
  }
  return false;
};

// User atoms
export const tokenAtom = atom<string | null>(getStoredString('token'));
export const userAtom = atom<User | null>(getStoredValue<User>('user'));

// Hotel owner atoms
export const ownerTokenAtom = atom<string | null>(getStoredString('hotelOwnerToken'));
export const ownerAtom = atom<HotelOwner | null>(getStoredValue<HotelOwner>('hotelOwner'));
export const onboardingCompleteAtom = atom<boolean>(getOnboardingComplete());

// Admin atoms
export const adminTokenAtom = atom<string | null>(getStoredString('adminToken'));
export const adminAtom = atom<Admin | null>(getStoredValue<Admin>('admin'));

// Derived authentication status atoms
export const isAuthenticatedAtom = atom<boolean>((get) => !!get(tokenAtom));
export const isOwnerAuthenticatedAtom = atom<boolean>((get) => !!get(ownerTokenAtom));
export const isAdminAuthenticatedAtom = atom<boolean>((get) => !!get(adminTokenAtom));

// Helper to clear all auth state
export const clearAllAuthState = (set: any) => {
  // Reset all atoms
  set(tokenAtom, null);
  set(userAtom, null);
  set(ownerTokenAtom, null);
  set(ownerAtom, null);
  set(onboardingCompleteAtom, false);
  set(adminTokenAtom, null);
  set(adminAtom, null);

  // Clear localStorage
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  localStorage.removeItem('hotelOwnerToken');
  localStorage.removeItem('hotelOwner');
  localStorage.removeItem('onboardingComplete');
  localStorage.removeItem('adminToken');
  localStorage.removeItem('admin');
};
