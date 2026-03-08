/**
 * UI state management - ephemeral state for modals, toasts, etc.
 *
 * NO persist middleware - UI state is transient and resets on app restart.
 */
import { create } from 'zustand';

interface UIState {
  activeModal: string | null;
  toastMessage: string | null;
  toastType: 'success' | 'error' | 'info' | null;
  showModal: (id: string) => void;
  hideModal: () => void;
  showToast: (message: string, type: 'success' | 'error' | 'info') => void;
  hideToast: () => void;
}

export const useUIStore = create<UIState>((set) => ({
  activeModal: null,
  toastMessage: null,
  toastType: null,

  showModal: (id) => set({ activeModal: id }),
  hideModal: () => set({ activeModal: null }),

  showToast: (message, type) => set({ toastMessage: message, toastType: type }),
  hideToast: () => set({ toastMessage: null, toastType: null }),
}));
