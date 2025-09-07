import { useToast } from '@/hooks/use-toast';
import { Toast } from '@/components/ui/toast';

export function Toaster() {
  const { toasts, dismiss } = useToast();

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          type={toast.variant === 'destructive' ? 'error' : 'success'}
          message={toast.title ? `${toast.title}: ${toast.description}` : toast.description}
          onClose={() => dismiss(toast.id)}
        />
      ))}
    </div>
  );
}
