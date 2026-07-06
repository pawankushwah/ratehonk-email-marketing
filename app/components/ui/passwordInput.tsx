// components/ui/PasswordInput.tsx
import React, { forwardRef } from 'react';
import { Input } from './input';
import Link from 'next/link';

interface PasswordInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  onForgotPassword?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  forgotPasswordHref?: string;
  label?: string;
  error?: string;
}

export const PasswordInput = forwardRef<HTMLInputElement, PasswordInputProps>(
  ({ onForgotPassword, forgotPasswordHref, label, error, ...props }, ref) => {
    let forgotPasswordAction = null;
    
    if (forgotPasswordHref) {
      forgotPasswordAction = (
        <Link
          href={forgotPasswordHref}
          className="text-sm font-semibold text-main hover:underline focus:outline-none"
        >
          Forgot Password?
        </Link>
      );
    } else if (onForgotPassword) {
      forgotPasswordAction = (
        <button
          type="button"
          onClick={onForgotPassword}
          className="text-sm font-semibold text-main hover:underline focus:outline-none"
        >
          Forgot Password?
        </button>
      );
    }

    return (
      <Input
        ref={ref}
        label={!label ? "Password" : label}
        type="password"
        rightLabelAction={forgotPasswordAction}
        error={error}
        {...props}
      />
    );
  }
);

PasswordInput.displayName = 'PasswordInput';