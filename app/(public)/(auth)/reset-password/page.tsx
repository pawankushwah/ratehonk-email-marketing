"use client";
import Button from "@/app/components/ui/button";
import { PasswordInput } from "@/app/components/ui/passwordInput";
import Image from "next/image";
import { z } from "zod";
import { useFormik } from "formik";

const resetPasswordSchema = z.object({
    password: z.string().min(1, "Password is required").min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string().min(1, "Confirm Password is required"),
}).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
});

const validateWithZod = (schema: z.ZodSchema) => (values: any) => {
    try {
        schema.parse(values);
        return {};
    } catch (error) {
        if (error instanceof z.ZodError) {
            return error.formErrors.fieldErrors;
        }
        return {};
    }
};

type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>;

import AuthLogo from "@/app/components/ui/authLogo";

export default function ResetPasswordPage() {
    const formik = useFormik<ResetPasswordFormValues>({
        initialValues: {
            password: "",
            confirmPassword: "",
        },
        validate: validateWithZod(resetPasswordSchema),
        onSubmit: (values) => {
            console.log("Form submitted", values);
        },
    });

    return (
        <div className="flex min-h-screen w-full">
            {/* Left Part of the Reset Password */}
            <div className="flex flex-col justify-center space-y-6 px-8 py-12 lg:px-[140px] lg:py-[90px] max-w-3xl w-full">
                {/* Brand Identity */}
                <AuthLogo />

                {/* Main Heading Text */}
                <h1 className="text-3xl font-bold tracking-tight text-text">
                    Reset Your Password
                </h1>

                {/* Narrative Context Description */}
                <p className="text-sm font-normal font-oxygen leading-relaxed text-text-dim max-w-[440px]">
                    Create a strong, unique password to keep your RateHonk account secure. Make sure it's easy for you to remember or save it in a trusted password manager.
                </p>

                <form onSubmit={formik.handleSubmit} noValidate className="flex flex-col space-y-6 max-w-[440px]">
                    <PasswordInput
                        name="password"
                        label="New Password"
                        required
                        placeholder="••••••••••••••••"
                        value={formik.values.password}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        error={formik.touched.password && formik.errors.password ? String(formik.errors.password[0] || formik.errors.password) : undefined}
                    />

                    <PasswordInput
                        name="confirmPassword"
                        label="Confirm New Password"
                        required
                        placeholder="••••••••••••••••"
                        value={formik.values.confirmPassword}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        error={formik.touched.confirmPassword && formik.errors.confirmPassword ? String(formik.errors.confirmPassword[0] || formik.errors.confirmPassword) : undefined}
                    />

                    <Button type="submit">
                        Confirm
                    </Button>
                </form>
            </div>
            
            <div className="flex-1 relative hidden lg:block">
                <Image
                    src="/images/ui/reset.png"
                    alt="Reset Password"
                    width={500}
                    height={500}
                    className="w-[600px] h-full object-contain"
                />
            </div>
        </div>
    )
}
