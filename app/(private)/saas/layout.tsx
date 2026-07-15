import Sidebar from "@/app/components/dashboard/sidebar";
import Topbar from "@/app/components/dashboard/topbar";
import React from "react";

export default function SaasLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="min-h-screen bg-[#fafafa]">
      <Sidebar />
      <div className="md:pl-[280px] flex flex-col min-h-screen">
        <Topbar />
        <main className="flex-1 p-6 lg:p-10 pt-28">
          {children}
        </main>
      </div>
    </div>
  );
}
