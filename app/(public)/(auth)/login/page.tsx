"use client";
import Button from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { PasswordInput } from "@/app/components/ui/passwordInput";
import { Checkbox } from "@/app/components/ui/checkbox";
import Image from "next/image";
import { z } from "zod";
import { useFormik } from "formik";
import Link from "next/link";

const loginSchema = z.object({
    email: z.string().min(1, "Email is required").email("Invalid email address"),
    password: z.string().min(1, "Password is required").min(6, "Password must be at least 6 characters"),
    rememberMe: z.boolean().optional(),
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

type LoginFormValues = z.infer<typeof loginSchema>;
import AuthLogo from "@/app/components/ui/authLogo";

export default function LoginPage() {
    const formik = useFormik<LoginFormValues>({
        initialValues: {
            email: "",
            password: "",
            rememberMe: false,
        },
        validate: validateWithZod(loginSchema),
        onSubmit: (values) => {
            console.log("Form submitted", values);
        },
    });

    return (
        <div className="flex min-h-screen w-full">
            {/* Left Part of the Login */}
            <div className="flex flex-col justify-center space-y-6 px-8 py-12 lg:px-[140px] lg:py-[90px] max-w-3xl w-full">
                {/* Brand Identity */}
                <AuthLogo />

                {/* Main Heading Text */}
                <h1 className="text-3xl font-bold tracking-tight text-text">
                    Welcome back to your account
                </h1>

                {/* Narrative Context Description */}
                <p className="text-sm font-normal font-oxygen leading-relaxed text-text-dim max-w-[440px]">
                    Grow your business with RateHonk Email Marketing. Create, automate, and optimize campaigns that engage your audience and drive real results.
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

                    <PasswordInput
                        name="password"
                        type="password"
                        required
                        placeholder="Enter your password"
                        forgotPasswordHref="/forgot-password"
                        value={formik.values.password}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        error={formik.touched.password && formik.errors.password ? String(formik.errors.password[0] || formik.errors.password) : undefined}
                    />

                    <Checkbox
                        name="rememberMe"
                        label="Remember Me"
                        checked={formik.values.rememberMe}
                        onChange={(e) => formik.setFieldValue("rememberMe", e.target.checked)}
                    />

                    <Button type="submit">
                        Login
                    </Button>
                </form>

                <div className="w-full max-w-[440px] text-center text-sm font-semibold text-text-dim">
                    Don't have an account?{' '}
                    <Link
                        href="/register"
                        className="text-main hover:underline transition-all font-semibold focus:outline-none"
                    >
                        Sign Up
                    </Link>
                </div>
            </div>
            <div className="flex-1 relative hidden lg:block">
                <Image
                    src="/images/ui/login.png"
                    alt="Login"
                    width={500}
                    height={500}
                    className="w-[600px] h-full object-contain"
                />
            </div>
        </div>
    )
}