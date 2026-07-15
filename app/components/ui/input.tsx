// components/ui/Input.tsx
import React, { forwardRef } from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label: string;
    rightLabelAction?: React.ReactNode;
    rightIcon?: React.ReactNode;
    error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
    ({ label, rightLabelAction, rightIcon, type = 'text', error, ...props }, ref) => {
        return (
            <div className="flex flex-col space-y-2 w-full max-w-[440px]">
                <div className="flex items-center justify-between text-sm font-semibold text-text">
                    <label>
                        {label}
                        {props.required && <span className="text-red-500 ml-1">*</span>}
                    </label>
                    {rightLabelAction && rightLabelAction}
                </div>
                <div className="relative w-full">
                    <input
                        ref={ref}
                        type={type}
                        className={`w-full h-11 px-4 ${rightIcon ? 'pr-11' : ''} bg-main-dim rounded-lg text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-sky-500/50 transition-all ${error ? 'border border-red-500 bg-red-50' : ''}`}
                        {...props}
                    />
                    {rightIcon && (
                        <div className="absolute right-0 top-0 h-full flex items-center pr-3">
                            {rightIcon}
                        </div>
                    )}
                </div>
                {error && <span className="text-xs font-medium text-red-500">{error}</span>}
            </div>
        );
    }
);

Input.displayName = 'Input';