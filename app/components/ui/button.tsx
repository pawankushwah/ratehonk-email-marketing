// components/ui/Button.tsx
import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    children: React.ReactNode;
    size?: 'sm' | 'md' | 'lg';
    variant?: 'primary' | 'outline' | 'ghost';
}

export default function Button({ children, size = 'md', variant = 'primary', className = '', ...props }: ButtonProps) {
    let sizeClasses = "px-5 py-2.5 text-lg";
    if (size === 'sm') {
        sizeClasses = "px-3 py-1.5 text-sm";
    } else if (size === 'lg') {
        sizeClasses = "px-6 py-3 text-xl";
    }

    let variantClasses = "bg-main hover:bg-sky-600 active:bg-sky-700 text-white shadow-md shadow-sky-500/10";
    if (variant === 'outline') {
        variantClasses = "bg-transparent border-2 border-main text-main hover:bg-main/5 active:bg-main/10 shadow-sm";
    } else if (variant === 'ghost') {
        variantClasses = "bg-transparent text-text-dim hover:bg-input/50 hover:text-text active:bg-input shadow-none";
    }

    return (
        <button
            {...props}
            className={`${sizeClasses} ${variantClasses} flex gap-1 items-center max-w-[440px] font-bold rounded-xl transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
        >
            {children}
        </button>
    );
}