import React from 'react';
import { useData } from '../store';
import { X, CheckCircle, AlertTriangle, Info, AlertCircle } from 'lucide-react';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useData();

  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg text-white min-w-[300px] animate-in slide-in-from-right fade-in duration-300 ${
            toast.type === 'success' ? 'bg-emerald-600' :
            toast.type === 'error' ? 'bg-red-600' :
            toast.type === 'warning' ? 'bg-amber-500' :
            'bg-blue-600'
          }`}
        >
          {toast.type === 'success' && <CheckCircle className="w-5 h-5" />}
          {toast.type === 'error' && <AlertCircle className="w-5 h-5" />}
          {toast.type === 'warning' && <AlertTriangle className="w-5 h-5" />}
          {toast.type === 'info' && <Info className="w-5 h-5" />}
          
          <p className="flex-1 text-sm font-medium">{toast.message}</p>
          
          <button onClick={() => removeToast(toast.id)} className="text-white/80 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  );
};