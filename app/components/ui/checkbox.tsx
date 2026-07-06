// components/ui/Checkbox.tsx
import React, { forwardRef } from 'react';

interface CheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label: string;
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
    ({ label, ...props }, ref) => {
        return (
            <label className="flex items-center space-x-3 cursor-pointer select-none max-w-[440px]">
                <div className="relative flex items-center justify-center">
                    <input
                        ref={ref}
                        type="checkbox"
                        className="peer appearance-none h-5 w-5 rounded bg-main-dim border-none checked:outline-none checked:ring-2 checked:ring-sky-500/50 transition-all cursor-pointer"
                        {...props}
                    />
                    <svg
                        className="absolute w-3.5 h-3.5 text-main pointer-events-none hidden peer-checked:block"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth="4"
                    >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                </div>
                <span className="text-sm font-semibold text-text">{label}</span>
            </label>
        );
    }
);

Checkbox.displayName = 'Checkbox';