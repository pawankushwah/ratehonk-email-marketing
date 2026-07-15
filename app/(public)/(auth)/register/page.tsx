"use client";
import Button from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { PasswordInput } from "@/app/components/ui/passwordInput";
import Image from "next/image";
import Link from "next/link";
import { z } from "zod";
import { useFormik } from "formik";
import { trpc } from "@/app/trpc";
import { useToast } from "@/app/hooks/useToast";

const registerSchema = z.object({
    businessName: z.string().min(1, "Business Name is required"),
    email: z.string().min(1, "Email is required").email("Invalid email address"),
    password: z.string().min(1, "Password is required").min(6, "Password must be at least 6 characters"),
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

type RegisterFormValues = z.infer<typeof registerSchema>;

import AuthLogo from "@/app/components/ui/authLogo";

export default function RegisterPage() {
    const { addToast } = useToast();
    const registerMutation = trpc.auth.register.useMutation({
        onSuccess: () => {
            addToast("We have sent an email, you can continue from there.", "success");
            formik.resetForm();
        },
        onError: (err) => {
            addToast(err.message || "Something went wrong", "error");
        }
    });

    const formik = useFormik<RegisterFormValues>({
        initialValues: {
            businessName: "",
            email: "",
            password: "",
        },
        validate: validateWithZod(registerSchema),
        onSubmit: (values) => {
            registerMutation.mutate(values);
        },
    });

    return (
        <div className="flex min-h-screen w-full justify-center items-center">
            {/* Left Part of the Register */}
            <div className="flex flex-col justify-center space-y-6 px-8 py-12 lg:px-[140px] lg:py-[90px] max-w-3xl">
                {/* Brand Identity */}
                <AuthLogo />

                {/* Main Heading Text */}
                <h1 className="text-3xl font-bold tracking-tight text-text">
                    Create your account
                </h1>

                {/* Narrative Context Description */}
                <p className="text-sm font-normal font-oxygen leading-relaxed text-text-dim max-w-[440px]">
                    Welcome to RateHonk. Launch smarter email campaigns, automate your marketing, and connect with your audienceall from one powerful platform.
                </p>

                <form onSubmit={formik.handleSubmit} noValidate className="flex flex-col space-y-6 max-w-[440px]">
                    <Input
                        name="businessName"
                        label="Business Name"
                        type="text"
                        required
                        placeholder="Enter your business name"
                        value={formik.values.businessName}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        error={formik.touched.businessName && formik.errors.businessName ? String(formik.errors.businessName[0] || formik.errors.businessName) : undefined}
                    />

                    <Input
                        name="email"
                        label="Business Email"
                        type="email"
                        required
                        placeholder="e.g. yourname@example.com"
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
                        value={formik.values.password}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        error={formik.touched.password && formik.errors.password ? String(formik.errors.password[0] || formik.errors.password) : undefined}
                    />

                    <p className="text-sm text-text-dim font-normal font-oxygen leading-relaxed">
                        By creating an account, you agree to RateHonk's Terms of Service and Privacy Policy.
                    </p>

                    <Button type="submit" disabled={registerMutation.isPending}>
                        {registerMutation.isPending ? "Signing Up..." : "Sign Up"}
                    </Button>
                </form>

                <div className="w-full max-w-[440px] text-center text-sm font-semibold text-text-dim">
                    Have an Account?{' '}
                    <Link
                        href="/login"
                        className="text-main hover:underline transition-all font-semibold focus:outline-none"
                    >
                        Login
                    </Link>
                </div>
            </div>

            <div className="w-[600px] relative hidden xl:block">
                <Image
                    src="/images/ui/register.png"
                    alt="Register"
                    width={500}
                    height={500}
                    className="w-[600px] h-full object-contain"
                />
            </div>
        </div>
    )
}
