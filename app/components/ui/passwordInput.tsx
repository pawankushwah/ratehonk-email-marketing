// components/ui/PasswordInput.tsx
import React, { forwardRef, useState } from 'react';
import { Input } from './input';
import Link from 'next/link';
import { Eye, EyeOff } from 'lucide-react';

interface PasswordInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  onForgotPassword?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  forgotPasswordHref?: string;
  label?: string;
  error?: string;
}

export const PasswordInput = forwardRef<HTMLInputElement, PasswordInputProps>(
  ({ onForgotPassword, forgotPasswordHref, label, error, ...props }, ref) => {
    const [showPassword, setShowPassword] = useState(false);

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

    const togglePasswordVisibility = () => {
      setShowPassword(!showPassword);
    };

    return (
      <Input
        ref={ref}
        label={!label ? "Password" : label}
        rightLabelAction={forgotPasswordAction}
        rightIcon={
          <button
            type="button"
            onClick={togglePasswordVisibility}
            className="text-gray-400 hover:text-gray-600 focus:outline-none"
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        }
        error={error}
        {...props}
        type={showPassword ? "text" : "password"}
      />
    );
  }
);

PasswordInput.displayName = 'PasswordInput';