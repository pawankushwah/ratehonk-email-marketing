"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { trpc } from "@/app/trpc";
import { useToast } from "@/app/hooks/useToast";
import AuthLogo from "@/app/components/ui/authLogo";

import { Suspense } from "react";

function VerifyContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const token = searchParams.get("token");
    const { addToast } = useToast();
    
    const [status, setStatus] = useState<"loading" | "success" | "error">("loading");

    const verifyMutation = trpc.auth.verifyRegistration.useMutation({
        onSuccess: (data) => {
            addToast("Email verified successfully!", "success");
            // Backend sets the HttpOnly cookie automatically
            if (data.user) {
                localStorage.setItem("ratehonk_user", JSON.stringify(data.user));
            }
            setStatus("success");
            // Proceed to getting more business info
            setTimeout(() => {
                router.push("/onboarding");
            }, 1000);
        },
        onError: (err) => {
            addToast(err.message || "Failed to verify email.", "error");
            setStatus("error");
        }
    });

    useEffect(() => {
        if (!token) {
            setStatus("error");
            return;
        }
        
        // Prevent strict mode double firing in dev
        if (status === "loading" && !verifyMutation.isPending) {
            verifyMutation.mutate({ token });
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [token]);

    return (
        <div className="flex min-h-screen w-full justify-center items-center">
            <div className="flex flex-col items-center justify-center space-y-6 px-8 py-12 max-w-lg w-full text-center">
                <AuthLogo />

                <h1 className="text-3xl font-bold tracking-tight text-text">
                    Email Verification
                </h1>

                {status === "loading" && (
                    <p className="text-sm text-text-dim">
                        Verifying your email address, please wait...
                    </p>
                )}

                {status === "success" && (
                    <p className="text-sm text-green-600 font-medium">
                        Success! Redirecting you to the next step...
                    </p>
                )}

                {status === "error" && (
                    <div className="space-y-4">
                        <p className="text-sm text-red-600 font-medium">
                            Invalid or expired verification link.
                        </p>
                        <button 
                            onClick={() => router.push("/register")}
                            className="text-main hover:underline font-semibold"
                        >
                            Return to Registration
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}

export default function VerifyPage() {
    return (
        <Suspense fallback={
            <div className="flex min-h-screen w-full justify-center items-center">
                <p className="text-sm text-text-dim">Loading...</p>
            </div>
        }>
            <VerifyContent />
        </Suspense>
    );
}
