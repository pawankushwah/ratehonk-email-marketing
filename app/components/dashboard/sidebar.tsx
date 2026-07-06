"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { SIDEBAR_MENUS } from "@/app/config/sidebar";
import { ChevronDown, ChevronRight, X } from "lucide-react";

export default function Sidebar() {
  const pathname = usePathname();
  const [expandedMenu, setExpandedMenu] = useState<string | null>(null);

  const mainMenus = SIDEBAR_MENUS.filter((m) => m.group === "main").sort((a, b) => a.order - b.order);
  const bottomMenus = SIDEBAR_MENUS.filter((m) => m.group === "bottom").sort((a, b) => a.order - b.order);

  useEffect(() => {
    const activeMenu = mainMenus.find(m => pathname === m.href || (pathname.startsWith(m.href) && m.href !== '/'));
    if (activeMenu && activeMenu.hasSubmenu) {
      setExpandedMenu(activeMenu.id);
    }
  }, [pathname]);

  const toggleMenu = (id: string) => {
    setExpandedMenu(prev => (prev === id ? null : id));
  };

  return (
    <div className="w-[280px] h-screen bg-white border-r border-border flex flex-col fixed left-0 top-0 overflow-y-auto hidden md:flex z-40">
      {/* Logo Area */}
      <div className="px-6 pt-8 pb-6">
        <Link href="/">
          <Image
            src="/ratehonk.png"
            alt="RateHonk Brand"
            width={146}
            height={45}
            priority
          />
        </Link>
      </div>

      {/* Main Navigation */}
      <div className="flex-1 px-4 py-2 space-y-1">
        {mainMenus.map((menu) => {
          const isActive = pathname === menu.href || (pathname.startsWith(menu.href) && menu.href !== '/');
          const isExpanded = expandedMenu === menu.id;
          const Icon = menu.icon;

          return (
            <div key={menu.id} className="w-full">
              {menu.hasSubmenu && menu.children ? (
                <Link
                  href={menu.href}
                  onClick={() => toggleMenu(menu.id)}
                  className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-colors font-semibold text-[15px] ${
                    isActive || isExpanded
                      ? "bg-main-dim text-main" 
                      : "text-text hover:bg-gray-50 hover:text-main"
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <Icon className={`w-5 h-5 ${isActive || isExpanded ? "text-main" : "text-text-dim"}`} />
                    <span>{menu.label}</span>
                  </div>
                  {isExpanded ? (
                    <ChevronDown className={`w-4 h-4 ${isActive || isExpanded ? "text-main" : "text-text-dim"}`} />
                  ) : (
                    <ChevronRight className={`w-4 h-4 ${isActive || isExpanded ? "text-main" : "text-text-dim"}`} />
                  )}
                </Link>
              ) : (
                <Link
                  href={menu.href}
                  className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-colors font-semibold text-[15px] ${
                    isActive 
                      ? "bg-main-dim text-main" 
                      : "text-text hover:bg-gray-50 hover:text-main"
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <Icon className={`w-5 h-5 ${isActive ? "text-main" : "text-text-dim"}`} />
                    <span>{menu.label}</span>
                  </div>
                </Link>
              )}

              {/* Submenus Render */}
              {menu.hasSubmenu && menu.children && isExpanded && (
                <div className="mt-1 mb-2 ml-11 flex flex-col space-y-1 border-l-2 border-border pl-3">
                  {menu.children.map((child) => {
                    const isChildActive = pathname === child.href;
                    return (
                      <Link
                        key={child.id}
                        href={child.href}
                        className={`block py-2 px-3 rounded-lg text-sm font-semibold transition-colors ${
                          isChildActive
                            ? "bg-main-dim text-main"
                            : "text-text-dim hover:text-main hover:bg-gray-50"
                        }`}
                      >
                        {child.label}
                      </Link>
                    )
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Bottom Section */}
      <div className="p-4 mt-auto">
        {/* Your Plan Widget */}
        <div className="bg-main-dim rounded-2xl p-5 relative mb-4">
          <button className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 focus:outline-none">
            <X className="w-4 h-4" />
          </button>
          <h3 className="text-[15px] font-bold text-text mb-5">Your plan</h3>
          
          <div className="space-y-4">
            {/* Emails sent */}
            <div>
              <div className="flex justify-between text-[13px] text-text font-medium mb-2">
                <span>Emails sent</span>
                <span>50 of 100</span>
              </div>
              <div className="w-full h-1.5 bg-[#f0f4f8] rounded-full overflow-hidden">
                <div className="h-full bg-main rounded-full" style={{ width: "50%" }}></div>
              </div>
            </div>

            {/* SMS sent */}
            <div>
              <div className="flex justify-between text-[13px] text-text font-medium mb-2">
                <span>SMS sent</span>
                <span>10 of 50</span>
              </div>
              <div className="w-full h-1.5 bg-[#f0f4f8] rounded-full overflow-hidden">
                <div className="h-full bg-main rounded-full" style={{ width: "20%" }}></div>
              </div>
            </div>

            {/* Daily requests */}
            <div>
              <div className="flex justify-between text-[13px] text-text font-medium mb-2">
                <span>Daily requests</span>
                <span>60 of 100</span>
              </div>
              <div className="w-full h-1.5 bg-[#f0f4f8] rounded-full overflow-hidden">
                <div className="h-full bg-main rounded-full" style={{ width: "60%" }}></div>
              </div>
            </div>
          </div>

          <div className="mt-5 pt-4 border-t border-[#dbeaf0] text-[13px] text-text font-medium">
            Want more? <Link href="/pricing" className="text-main font-bold hover:underline">Make an upgrade</Link>
          </div>
        </div>

        {/* Bottom Navigation */}
        <div className="space-y-1">
          {bottomMenus.map((menu) => {
            const isActive = pathname === menu.href || (pathname.startsWith(menu.href) && menu.href !== '/');
            const Icon = menu.icon;

            return (
              <Link
                key={menu.id}
                href={menu.href}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-colors font-semibold text-[15px] ${
                  isActive 
                    ? "bg-main-dim text-main" 
                    : "text-text hover:bg-gray-50 hover:text-main"
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? "text-main" : "text-text-dim"}`} />
                <span>{menu.label}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
