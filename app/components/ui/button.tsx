// components/ui/Button.tsx
import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    children: React.ReactNode;
    size?: 'sm' | 'md' | 'lg';
    variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'success' | 'warning';
}

export default function Button({ children, size = 'md', variant = 'primary', className = '', ...props }: ButtonProps) {
    let sizeClasses = "px-5 py-2.5 text-lg";
    if (size === 'sm') {
        sizeClasses = "px-3 py-1.5 text-sm";
    } else if (size === 'lg') {
        sizeClasses = "px-6 py-3 text-xl";
    }

    let variantClasses = "bg-main hover:bg-sky-600 active:bg-sky-700 text-white shadow-md shadow-sky-500/10";
    if (variant === 'secondary') {
        variantClasses = "bg-gray-100 hover:bg-gray-200 active:bg-gray-300 text-gray-800 shadow-sm";
    } else if (variant === 'outline') {
        variantClasses = "bg-transparent border-2 border-main text-main hover:bg-main/5 active:bg-main/10 shadow-sm";
    } else if (variant === 'ghost') {
        variantClasses = "bg-transparent text-text-dim hover:bg-input/50 hover:text-text active:bg-input shadow-none";
    } else if (variant === 'danger') {
        variantClasses = "bg-red-500 hover:bg-red-600 active:bg-red-700 text-white shadow-sm shadow-red-500/20";
    } else if (variant === 'success') {
        variantClasses = "bg-green-500 hover:bg-green-600 active:bg-green-700 text-white shadow-sm shadow-green-500/20";
    } else if (variant === 'warning') {
        variantClasses = "bg-yellow-500 hover:bg-yellow-600 active:bg-yellow-700 text-white shadow-sm shadow-yellow-500/20";
    }

    return (
        <button
            {...props}
            className={`${sizeClasses} ${variantClasses} flex gap-1 justify-center items-center max-w-[440px] font-bold rounded-xl transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
        >
            {children}
        </button>
    );
}