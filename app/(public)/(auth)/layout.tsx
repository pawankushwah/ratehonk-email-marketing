import React from "react";

export default async function AuthLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <div
            className="flex justify-center items-center min-h-screen bg-white text-black antialiased bg-[radial-gradient(circle_at_top_left,var(--color-main-dim)_0%,transparent_45%),radial-gradient(circle_at_bottom_right,var(--color-main-dim)_0%,transparent_45%)]"
        >
            {children}
        </div>
    );
}