"use client";
import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { SETTINGS_MENUS } from "@/app/config/settings-sidebar";
import { ChevronRight } from "lucide-react";

export default function SettingsLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();

  return (
    <div className="flex h-[calc(100vh-144px)] max-w-6xl mx-auto bg-white rounded-2xl shadow-sm border border-border overflow-hidden">
      {/* Inner Settings Sidebar */}
      <div className="w-64 bg-gray-50 border-r border-border p-4 flex flex-col hidden md:flex">
        <h2 className="text-xl font-bold text-text mb-6 px-4 pt-2">Settings</h2>
        <div className="space-y-1">
          {SETTINGS_MENUS.map((menu) => {
            const isActive = pathname === menu.href || pathname.startsWith(menu.href + "/");
            const Icon = menu.icon;

            return (
              <Link
                key={menu.id}
                href={menu.href}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-colors font-semibold text-[14px] ${
                  isActive 
                    ? "bg-white text-main shadow-sm border border-gray-100" 
                    : "text-text hover:bg-gray-100 hover:text-main"
                }`}
              >
                <div className="flex items-center space-x-3">
                  <Icon className={`w-4 h-4 ${isActive ? "text-main" : "text-text-dim"}`} />
                  <span>{menu.label}</span>
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Settings Content Area */}
      <div className="flex-1 bg-white overflow-y-auto">
        <div className="p-8">
          {children}
        </div>
      </div>
    </div>
  );
}
