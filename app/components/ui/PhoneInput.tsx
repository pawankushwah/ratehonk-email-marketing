"use client";
import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Search } from 'lucide-react';
import { countries, Country } from '@/app/lib/countries';

interface PhoneInputProps {
  value: string;
  onChange: (value: string) => void;
  selectedCountryCode: string;
  onCountryChange: (code: string) => void;
  error?: string;
  label?: string;
}

export function PhoneInput({ value, onChange, selectedCountryCode, onCountryChange, error, label }: PhoneInputProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  const selectedCountry = countries.find(c => c.code === selectedCountryCode) || countries[0];

  const filteredCountries = countries.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.dialCode.includes(search) ||
    c.code.toLowerCase().includes(search.toLowerCase())
  );

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="flex flex-col space-y-2">
      {label && <label className="text-sm font-semibold text-text">{label}</label>}
      <div className={`relative flex items-center border rounded-xl bg-gray-50 transition-colors focus-within:border-main focus-within:ring-1 focus-within:ring-main/20 ${error ? 'border-red-500' : 'border-border'}`}>

        {/* Country Selector Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className="flex items-center space-x-2 pl-3 pr-2 py-2.5 rounded-l-xl bg-gray-100 hover:bg-gray-50 transition-colors"
          >
            <img src={selectedCountry.flagUrl} alt={selectedCountry.code} className="w-5 h-auto rounded-[2px]" />
            <span className="text-sm font-medium text-text">{selectedCountry.dialCode}</span>
            <ChevronDown className="w-4 h-4 text-text-dim" />
          </button>

          {isOpen && (
            <div className="absolute top-full left-0 mt-1 w-64 bg-white border border-gray-100 rounded-xl shadow-lg z-50 overflow-hidden">
              <div className="p-2 border-b border-gray-100">
                <div className="flex items-center bg-gray-50 rounded-lg px-2 py-1.5">
                  <Search className="w-4 h-4 text-text-dim mr-2" />
                  <input
                    type="text"
                    placeholder="Search country..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="bg-transparent border-none outline-none text-sm w-full text-text placeholder-gray-400"
                    autoFocus
                  />
                </div>
              </div>
              <div className="max-h-60 overflow-y-auto custom-scrollbar">
                {filteredCountries.map(country => (
                  <button
                    key={country.code}
                    type="button"
                    onClick={() => {
                      onCountryChange(country.code);
                      setIsOpen(false);
                      setSearch('');
                    }}
                    className="w-full flex items-center px-3 py-2 hover:bg-gray-50 transition-colors text-left"
                  >
                    <img src={country.flagUrl} alt={country.code} className="w-5 h-auto rounded-[2px] mr-3" />
                    <span className="text-sm text-text flex-1 truncate">{country.name}</span>
                    <span className="text-xs text-text-dim font-medium">{country.dialCode}</span>
                  </button>
                ))}
                {filteredCountries.length === 0 && (
                  <div className="p-3 text-center text-sm text-text-dim">No countries found</div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Divider */}
        <div className="w-[1px] h-6 bg-border mx-1"></div>

        {/* Phone Number Input */}
        <input
          type="tel"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Contact Number"
          className="flex-1 bg-transparent border-none outline-none px-3 py-2.5 text-[15px] text-text placeholder-gray-400 placeholder:tracking-normal tracking-widest"
        />
      </div>
      {error && <span className="text-xs text-red-500">{error}</span>}
    </div>
  );
}
