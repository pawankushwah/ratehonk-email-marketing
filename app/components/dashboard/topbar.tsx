"use client";
import React, { useEffect, useState, useRef } from "react";
import { Search, Bell, Moon, ChevronDown, Menu, LogOut, User, Building2, Settings, LifeBuoy } from "lucide-react";
import { useRouter } from "next/navigation";
import { trpc } from "@/app/trpc";
import { useBusinessStore } from "@/app/store/useBusinessStore";

export default function Topbar() {
  const router = useRouter();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isBusinessDropdownOpen, setIsBusinessDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const businessDropdownRef = useRef<HTMLDivElement>(null);


  const { data: sessionData, isLoading } = trpc.auth.getSession.useQuery();
  const user = sessionData?.user;

  const { data: businessesData } = trpc.user.getBusinesses.useQuery(undefined, { enabled: !!user });
  const businesses = businessesData?.businesses || [];

  const { activeBusinessId, setActiveBusinessId } = useBusinessStore();

  useEffect(() => {
    if (businesses.length > 0 && !activeBusinessId) {
      setActiveBusinessId(businesses[0].id);
    }
  }, [businesses, activeBusinessId, setActiveBusinessId]);

  const activeBusiness = businesses.find((b: any) => b.id === activeBusinessId) || businesses[0];

  const logoutMutation = trpc.auth.logout.useMutation({
    onSuccess: () => {
      localStorage.removeItem("ratehonk_user");
      router.push("/login");
    }
  });

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
      if (businessDropdownRef.current && !businessDropdownRef.current.contains(event.target as Node)) {
        setIsBusinessDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  const getInitials = () => {
    if (user?.firstName && user?.lastName) {
      return `${user.firstName[0]}${user.lastName[0]}`.toUpperCase();
    }
    if (user?.email) {
      return user.email.substring(0, 2).toUpperCase();
    }
    return "U";
  };

  const displayName = user?.firstName ? `${user.firstName} ${user.lastName || ''}`.trim() : "User";

  return (
    <header className="h-20 bg-white border-b border-border flex items-center justify-between px-6 lg:px-10 fixed top-0 right-0 w-full md:w-[calc(100%-280px)] z-30">

      {/* Left section: Welcome Text & Mobile Menu Toggle */}
      <div className="flex items-center space-x-4">
        {/* Mobile Hamburger (visible only on small screens) */}
        <button className="md:hidden p-2 text-text hover:bg-gray-50 rounded-lg">
          <Menu className="w-6 h-6" />
        </button>

        {/* Business Switcher */}
        {activeBusiness ? (
          <div className="relative hidden sm:block" ref={businessDropdownRef}>
            <button
              onClick={() => setIsBusinessDropdownOpen(!isBusinessDropdownOpen)}
              className="flex items-center space-x-3 bg-gray-50 hover:bg-gray-100 border border-border rounded-xl px-4 py-2 transition-colors"
            >
              <div className="w-6 h-6 rounded bg-main/10 flex items-center justify-center text-main font-bold text-xs">
                {activeBusiness.logoUrl ? (
                  <img src={activeBusiness.logoUrl} alt={activeBusiness.name} className="w-full h-full object-cover rounded" />
                ) : (
                  activeBusiness.name.charAt(0).toUpperCase()
                )}
              </div>
              <span className="font-bold text-text text-sm truncate max-w-[150px]">
                {activeBusiness.name}
              </span>
              <ChevronDown className="w-4 h-4 text-text-dim" />
            </button>

            {isBusinessDropdownOpen && (
              <div className="absolute top-full left-0 mt-2 w-64 bg-white border border-border rounded-xl shadow-lg py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                <div className="px-4 py-2 text-xs font-semibold text-text-dim uppercase tracking-wider">
                  Your Businesses
                </div>
                <div className="max-h-60 overflow-y-auto custom-scrollbar">
                  {businesses.map((biz: any) => (
                    <button
                      key={biz.id}
                      onClick={() => {
                        setActiveBusinessId(biz.id);
                        setIsBusinessDropdownOpen(false);
                      }}
                      className={`w-full flex items-center px-4 py-2 text-left hover:bg-gray-50 transition-colors ${activeBusinessId === biz.id ? 'bg-gray-50/80' : ''}`}
                    >
                      <div className="w-6 h-6 rounded bg-main/10 flex items-center justify-center text-main font-bold text-xs mr-3 flex-shrink-0">
                        {biz.logoUrl ? (
                          <img src={biz.logoUrl} alt={biz.name} className="w-full h-full object-cover rounded" />
                        ) : (
                          biz.name.charAt(0).toUpperCase()
                        )}
                      </div>
                      <span className="text-sm font-medium text-text truncate">
                        {biz.name}
                      </span>
                    </button>
                  ))}
                </div>
                <div className="border-t border-border mt-2 pt-2 px-2">
                  <button
                    onClick={() => {
                      setIsBusinessDropdownOpen(false);
                      router.push('/dashboard/profile'); // Go to profile to add business
                    }}
                    className="w-full flex items-center px-3 py-2 text-sm text-main hover:bg-main-dim rounded-lg transition-colors font-medium"
                  >
                    <Building2 className="w-4 h-4 mr-2" />
                    Manage Businesses
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <h1 className="text-xl font-bold text-text hidden sm:block">Welcome, {user?.firstName || 'there'}</h1>
        )}
      </div>

      {/* Right section: Search & Profile */}
      <div className="flex items-center space-x-6">

        {/* Search Bar */}
        <div className="hidden md:flex items-center bg-main-dim px-4 py-2.5 rounded-xl w-64 lg:w-80">
          <Search className="w-5 h-5 text-main mr-2" />
          <input
            type="text"
            placeholder="Search here"
            className="bg-transparent border-none outline-none text-[15px] text-text placeholder-gray-400 w-full"
          />
        </div>

        {/* Icons */}
        <div className="flex items-center space-x-4 text-text">
          <button className="hover:text-main transition-colors">
            <Bell className="w-5 h-5" />
          </button>
          <button className="hover:text-main transition-colors">
            <Moon className="w-5 h-5" />
          </button>
        </div>

        {/* Profile Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <div
            className="flex items-center space-x-3 pl-4 border-l border-border cursor-pointer hover:opacity-80 transition-opacity"
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          >
            {/* Avatar */}
            <div className="w-10 h-10 rounded-full bg-main flex items-center justify-center text-white font-bold text-sm">
              {user?.profilePictureUrl ? (
                <img src={user.profilePictureUrl} alt="Profile" className="w-full h-full object-cover rounded-full" />
              ) : (
                getInitials()
              )}
            </div>

            {/* User Info (hidden on mobile) */}
            <div className="hidden sm:block text-left">
              <p className="text-sm font-bold text-text leading-tight">{displayName}</p>
              <span className="px-3 py-1 bg-gray-100 rounded-full text-xs font-semibold text-text-dim mb-4">
                {user?.role}
              </span>
            </div>

            <ChevronDown className="w-4 h-4 text-text-dim hidden sm:block" />
          </div>

          {/* Dropdown Menu */}
          {isDropdownOpen && (
            <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-lg border border-gray-100 py-1 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
              <div className="px-4 py-3 border-b border-gray-100">
                <p className="text-sm font-bold text-text truncate">{displayName}</p>
                <p className="text-xs text-text-dim truncate mt-0.5" title={user?.email}>{user?.email}</p>
              </div>
              <button
                onClick={() => {
                  setIsDropdownOpen(false);
                  router.push('/dashboard/profile');
                }}
                className="w-full text-left px-4 py-2 text-sm text-text hover:bg-gray-50 flex items-center transition-colors"
              >
                <User className="w-4 h-4 mr-2 text-text-dim" />
                My Profile
              </button>
              <div className="border-t border-gray-100 my-1"></div>
              <button
                onClick={() => {
                  setIsDropdownOpen(false);
                  router.push('/support');
                }}
                className="w-full text-left px-4 py-2 text-sm text-text hover:bg-gray-50 flex items-center transition-colors"
              >
                <LifeBuoy className="w-4 h-4 mr-2 text-text-dim" />
                Support
              </button>

              <button
                onClick={() => {
                  setIsDropdownOpen(false);
                  router.push('/dashboard/profile?tab=settings');
                }}
                className="w-full text-left px-4 py-2 text-sm text-text hover:bg-gray-50 flex items-center transition-colors"
              >
                <Settings className="w-4 h-4 mr-2 text-text-dim" />
                Settings
              </button>
              <div className="border-t border-gray-100 my-1"></div>
              <button
                onClick={handleLogout}
                disabled={logoutMutation.isPending}
                className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center transition-colors"
              >
                <LogOut className="w-4 h-4 mr-2" />
                {logoutMutation.isPending ? "Logging out..." : "Log out"}
              </button>
            </div>
          )}
        </div>

      </div>
    </header>
  );
}
