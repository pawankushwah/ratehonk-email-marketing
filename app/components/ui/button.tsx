// components/ui/Button.tsx
import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    children: React.ReactNode;
    size?: 'sm' | 'md' | 'lg';
}

export default function Button({ children, size = 'md', className = '', ...props }: ButtonProps) {
    let sizeClasses = "px-5 py-2.5 text-lg";
    if (size === 'sm') {
        sizeClasses = "px-3 py-1.5 text-sm";
    } else if (size === 'lg') {
        sizeClasses = "px-6 py-3 text-xl";
    }

    return (
        <button
            {...props}
            className={`${sizeClasses} max-w-[440px] bg-main hover:bg-sky-600 active:bg-sky-700 text-white font-bold rounded-xl shadow-md shadow-sky-500/10 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2 ${className}`}
        >
            {children}
        </button>
    );
}