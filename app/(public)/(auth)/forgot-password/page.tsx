"use client";
import Button from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import Image from "next/image";
import Link from "next/link";
import { z } from "zod";
import { useFormik } from "formik";

const forgotPasswordSchema = z.object({
    email: z.string().min(1, "Email is required").email("Invalid email address"),
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

type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>;

import AuthLogo from "@/app/components/ui/authLogo";

export default function ForgotPasswordPage() {
    const formik = useFormik<ForgotPasswordFormValues>({
        initialValues: {
            email: "",
        },
        validate: validateWithZod(forgotPasswordSchema),
        onSubmit: (values) => {
            console.log("Form submitted", values);
        },
    });

    return (
        <div className="flex min-h-screen w-full">
            {/* Left Part of the Forgot Password */}
            <div className="flex flex-col justify-center space-y-6 px-8 py-12 lg:px-[140px] lg:py-[90px] max-w-3xl w-full">
                {/* Brand Identity */}
                <AuthLogo />

                {/* Main Heading Text */}
                <h1 className="text-3xl font-bold tracking-tight text-text">
                    Forgot Password
                </h1>

                {/* Narrative Context Description */}
                <p className="text-sm font-normal font-oxygen leading-relaxed text-text-dim max-w-[440px]">
                    Enter the email address associated with your RateHonk account, and we'll send you a link to reset your password.
                </p>

                <form onSubmit={formik.handleSubmit} noValidate className="flex flex-col space-y-6 max-w-[440px]">
                    <Input
                        name="email"
                        label="Email"
                        type="email"
                        required
                        placeholder="Enter your email address"
                        value={formik.values.email}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        error={formik.touched.email && formik.errors.email ? String(formik.errors.email[0] || formik.errors.email) : undefined}
                    />

                    <Button type="submit">
                        Send mail !
                    </Button>
                </form>

                <div className="w-full max-w-[440px] text-center text-sm font-semibold text-text-dim mt-4">
                    Remember your password?{' '}
                    <Link
                        href="/login"
                        className="text-main hover:underline transition-all font-semibold focus:outline-none"
                    >
                        Login
                    </Link>
                </div>
            </div>

            <div className="flex-1 relative hidden lg:block">
                <Image
                    src="/images/ui/forgot.png"
                    alt="Forgot Password"
                    width={500}
                    height={500}
                    className="w-[600px] h-full object-contain"
                />
            </div>
        </div>
    )
}
