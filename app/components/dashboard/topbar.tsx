import React from "react";
import { Search, Bell, Moon, ChevronDown, Menu } from "lucide-react";

export default function Topbar() {
  return (
    <header className="h-20 bg-white border-b border-border flex items-center justify-between px-6 lg:px-10 fixed top-0 right-0 w-full md:w-[calc(100%-280px)] z-30">
      
      {/* Left section: Welcome Text & Mobile Menu Toggle */}
      <div className="flex items-center space-x-4">
        {/* Mobile Hamburger (visible only on small screens) */}
        <button className="md:hidden p-2 text-text hover:bg-gray-50 rounded-lg">
          <Menu className="w-6 h-6" />
        </button>
        <h1 className="text-xl font-bold text-text hidden sm:block">Welcome, Marc</h1>
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
        <div className="flex items-center space-x-3 pl-4 border-l border-border cursor-pointer hover:opacity-80 transition-opacity">
          {/* Avatar */}
          <div className="w-10 h-10 rounded-full bg-main flex items-center justify-center text-white font-bold text-sm">
            MJ
          </div>
          
          {/* User Info (hidden on mobile) */}
          <div className="hidden sm:block text-left">
            <p className="text-sm font-bold text-text leading-tight">Marc Jacob</p>
            <p className="text-xs text-text-dim leading-tight">marco@goodmail.io</p>
          </div>
          
          <ChevronDown className="w-4 h-4 text-text-dim hidden sm:block" />
        </div>

      </div>
    </header>
  );
}
