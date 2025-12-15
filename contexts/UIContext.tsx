import React, { createContext, useContext, useState, useCallback } from 'react';
import { Icons } from '../components/Icons';

interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
}

interface UIContextType {
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
}

const UIContext = createContext<UIContextType>({ showToast: () => {} });

export const useUI = () => useContext(UIContext);

export const UIProvider = ({ children }: { children?: React.ReactNode }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback((message: string, type: 'success' | 'error' | 'info' = 'info') => {
    const id = Math.random().toString(36).substr(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3000);
  }, []);

  return (
    <UIContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`flex items-center p-4 rounded-lg shadow-lg text-white transform transition-all duration-300 animate-slide-up ${
              toast.type === 'success' ? 'bg-green-600' : toast.type === 'error' ? 'bg-red-600' : 'bg-blue-600'
            }`}
          >
            {toast.type === 'success' && <Icons.CheckCircle className="h-5 w-5 mr-3" />}
            {toast.type === 'error' && <Icons.X className="h-5 w-5 mr-3" />}
            <span className="font-medium text-sm">{toast.message}</span>
          </div>
        ))}
      </div>
    </UIContext.Provider>
  );
};