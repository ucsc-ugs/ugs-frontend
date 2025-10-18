import React, { createContext, useContext, useState, useCallback } from 'react';

interface ToastMessage {
  id: string;
  title?: string;
  description: string;
  variant?: 'default' | 'destructive';
}

interface ToastOptions {
  title?: string;
  description: string;
  variant?: 'default' | 'destructive';
}

interface ToastContextType {
  toasts: ToastMessage[];
  toast: (options: ToastOptions) => { id: string };
  dismiss: (toastId: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const toast = useCallback((options: ToastOptions) => {
    console.log('🍞 Toast function called with:', options);
    const id = Math.random().toString(36).substr(2, 9);
    const newToast: ToastMessage = {
      id,
      ...options,
    };

    console.log('🍞 Creating toast with ID:', id, newToast);
    setToasts((prevToasts) => {
      console.log('🍞 Previous toasts:', prevToasts);
      const updatedToasts = [...prevToasts, newToast];
      console.log('🍞 Updated toasts:', updatedToasts);
      return updatedToasts;
    });

    // Auto-remove toast after 5 seconds
    setTimeout(() => {
      console.log('🍞 Auto-removing toast with ID:', id);
      setToasts((prevToasts) => prevToasts.filter((t) => t.id !== id));
    }, 5000);

    return { id };
  }, []);

  const dismiss = useCallback((toastId: string) => {
    console.log('🍞 Dismissing toast with ID:', toastId);
    setToasts((prevToasts) => prevToasts.filter((t) => t.id !== toastId));
  }, []);

  return (
    <ToastContext.Provider value={{ toasts, toast, dismiss }}>
      {children}
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (context === undefined) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}