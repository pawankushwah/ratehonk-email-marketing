import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import React from "react";

export default async function PublicPathLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get("ratehonk_access_token")?.value;
    const refreshToken = cookieStore.get("ratehonk_refresh_token")?.value;

    if (accessToken || refreshToken) {
        redirect("/dashboard");
    }
    return children;
}