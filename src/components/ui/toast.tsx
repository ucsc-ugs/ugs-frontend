import { CheckCircle2, AlertCircle, X } from 'lucide-react';

interface ToastProps {
    type: 'success' | 'error';
    message: string;
    onClose: () => void;
}

export function Toast({ type, message, onClose }: ToastProps) {
    return (
        <div className={`relative p-4 rounded-lg shadow-lg flex items-center gap-2 min-w-[300px] ${type === 'success'
                ? 'bg-green-100 text-green-800 border border-green-200'
                : 'bg-red-100 text-red-800 border border-red-200'
            }`}>
            {type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
            ) : (
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
            )}
            <span className="flex-1">{message}</span>
            <button
                onClick={onClose}
                className={`p-1 rounded hover:opacity-70 ${type === 'success' ? 'text-green-600' : 'text-red-600'
                    }`}
            >
                <X className="w-4 h-4" />
            </button>
        </div>
    );
}
