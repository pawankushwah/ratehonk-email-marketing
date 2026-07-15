// components/ui/Textarea.tsx
import React, { forwardRef } from 'react';

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
    label: string;
    rightLabelAction?: React.ReactNode;
    error?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
    ({ label, rightLabelAction, error, ...props }, ref) => {
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
                    <textarea
                        ref={ref}
                        className={`w-full min-h-[100px] p-4 bg-main-dim rounded-lg text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-sky-500/50 transition-all resize-y ${error ? 'border border-red-500 bg-red-50' : ''}`}
                        {...props}
                    />
                </div>
                {error && <span className="text-xs font-medium text-red-500">{error}</span>}
            </div>
        );
    }
);

Textarea.displayName = 'Textarea';
