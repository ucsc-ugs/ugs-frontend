import { useToast } from '@/contexts/ToastContext';
import { Toast } from '@/components/ui/toast';
import { useEffect } from 'react';

export function Toaster() {
  const { toasts, dismiss } = useToast();

  console.log('🍞 Toaster rendered with toasts:', toasts);

  return (
    <div className="fixed top-4 right-4 z-[9999] space-y-2 pointer-events-none">
      {toasts.length > 0 && (
        <div className="pointer-events-auto space-y-2">
          {toasts.map((toastItem) => {
            console.log('🍞 Rendering toast:', toastItem);
            return (
              <div key={toastItem.id} className="pointer-events-auto">
                <Toast
                  type={toastItem.variant === 'destructive' ? 'error' : 'success'}
                  message={toastItem.title ? `${toastItem.title}: ${toastItem.description}` : toastItem.description}
                  onClose={() => dismiss(toastItem.id)}
                />
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
