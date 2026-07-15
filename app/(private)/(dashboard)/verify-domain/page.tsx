"use client";
import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { trpc } from "@/app/trpc";
import { CheckCircle2, XCircle, Loader2 } from "lucide-react";
import Button from "@/app/components/ui/button";

function VerifyDomainContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const token = searchParams.get("token");
    
    const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
    const [message, setMessage] = useState("Verifying your domain...");

    const confirmTokenMutation = trpc.confirmDomainToken.useMutation({
        onSuccess: (data) => {
            if (data.success) {
                setStatus("success");
                setMessage(data.message || "Domain verified successfully!");
            } else {
                setStatus("error");
                setMessage(data.error || "Failed to verify domain.");
            }
        },
        onError: (err) => {
            setStatus("error");
            setMessage(err.message || "An unexpected error occurred.");
        }
    });

    // We use a flag to prevent double-firing in React Strict Mode
    const [hasFired, setHasFired] = useState(false);

    useEffect(() => {
        if (!token) {
            setStatus("error");
            setMessage("No verification token provided.");
            return;
        }

        if (!hasFired) {
            setHasFired(true);
            confirmTokenMutation.mutate({ token });
        }
    }, [token, hasFired]);

    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] p-4 text-center">
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 max-w-md w-full flex flex-col items-center">
                {status === "loading" && (
                    <>
                        <Loader2 className="w-16 h-16 text-main animate-spin mb-6" />
                        <h2 className="text-xl font-bold text-text mb-2">Verifying Domain</h2>
                        <p className="text-text-dim">{message}</p>
                    </>
                )}
                
                {status === "success" && (
                    <>
                        <CheckCircle2 className="w-16 h-16 text-green-500 mb-6" />
                        <h2 className="text-xl font-bold text-text mb-2">Verification Successful</h2>
                        <p className="text-text-dim mb-8">{message}</p>
                        <Button onClick={() => router.push("/dashboard/profile?tab=domains")} className="w-full">
                            Continue to Profile
                        </Button>
                    </>
                )}

                {status === "error" && (
                    <>
                        <XCircle className="w-16 h-16 text-red-500 mb-6" />
                        <h2 className="text-xl font-bold text-text mb-2">Verification Failed</h2>
                        <p className="text-text-dim mb-8">{message}</p>
                        <Button onClick={() => router.push("/dashboard/profile?tab=domains")} variant="outline" className="w-full">
                            Back to Profile
                        </Button>
                    </>
                )}
            </div>
        </div>
    );
}

export default function VerifyDomainPage() {
    return (
        <Suspense fallback={<div className="flex justify-center items-center min-h-[60vh]"><Loader2 className="w-8 h-8 animate-spin text-main" /></div>}>
            <VerifyDomainContent />
        </Suspense>
    );
}
