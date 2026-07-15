'use client';
import { X, CheckCircle, AlertCircle, Info } from 'lucide-react';
import { useEffect, useState } from 'react';

interface ToastProps {
  message: string;
  type: 'success' | 'error' | 'info';
  onClose: () => void;
}

export const Toast = ({ message, type, onClose }: ToastProps) => {
  const [isShowing, setIsShowing] = useState(false);

  useEffect(() => {
    setIsShowing(true);
  }, []);

  const bgColors = {
    success: 'bg-green-50 border-green-500 text-green-800',
    error: 'bg-red-50 border-red-500 text-red-800',
    info: 'bg-blue-50 border-blue-500 text-blue-800',
  };

  const Icon = {
    success: <CheckCircle className="w-5 h-5 text-green-500" />,
    error: <AlertCircle className="w-5 h-5 text-red-500" />,
    info: <Info className="w-5 h-5 text-blue-500" />
  }[type];

  return (
    <div className={`transform transition-all duration-300 ease-in-out ${isShowing ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'} flex items-center p-4 mb-2 border-l-4 rounded shadow-lg ${bgColors[type]} w-[350px]`}>
      <div className="flex-shrink-0">
        {Icon}
      </div>
      <div className="ml-3 font-medium text-sm w-full">
        {message}
      </div>
      <button onClick={() => { setIsShowing(false); setTimeout(onClose, 300); }} className="ml-auto flex-shrink-0 text-gray-400 hover:text-gray-900 focus:outline-none">
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};
