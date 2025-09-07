import { useState, useCallback } from 'react';

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

export function useToast() {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const toast = useCallback((options: ToastOptions) => {
    const id = Math.random().toString(36).substr(2, 9);
    const newToast: ToastMessage = {
      id,
      ...options,
    };

    setToasts((prevToasts) => [...prevToasts, newToast]);

    // Auto-remove toast after 5 seconds
    setTimeout(() => {
      setToasts((prevToasts) => prevToasts.filter((t) => t.id !== id));
    }, 5000);

    return { id };
  }, []);

  const dismiss = useCallback((toastId: string) => {
    setToasts((prevToasts) => prevToasts.filter((t) => t.id !== toastId));
  }, []);

  return {
    toast,
    dismiss,
    toasts,
  };
}
