// components/ui/Button.tsx
import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    children: React.ReactNode;
}

export default function Button({ children, ...props }: ButtonProps) {
    return (
        <button
            {...props}
            className="w-full max-w-[440px] h-[52px] bg-main hover:bg-sky-600 active:bg-sky-700 text-white font-bold text-lg rounded-xl shadow-md shadow-sky-500/10 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2"
        >
            {children}
        </button>
    );
}