"use client";
import React from 'react';
import Button from '@/app/components/ui/button';

export function AudienceHero() {
  return (
    <div className="flex flex-col md:flex-row items-center justify-between bg-white rounded-xl shadow-sm p-8 md:p-12 border border-gray-100">
      <div className="max-w-md">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Add your contacts</h1>
        <p className="text-gray-600 mb-6 leading-relaxed">
          Contacts are the people who make up your audience. Import them from a CSV file or other apps, or let them subscribe using a form.
        </p>

        <div className="flex items-center gap-4 mb-4">
          <Button className="!bg-[#007c89] hover:!bg-[#006570] !text-white !font-semibold !rounded-md px-6 py-2">
            Import Contacts
          </Button>
          {/* <Button variant="outline" className="!font-semibold !rounded-md px-6 py-2 border-gray-300 text-gray-700">
            Create popup form
          </Button> */}
        </div>
      </div>

      <div className="mt-10 md:mt-0 relative hidden sm:block">
        {/* Placeholder for the illustration/avatar cluster */}
        <div className="w-64 h-64 relative">
          <div className="absolute top-0 right-0 w-32 h-32 rounded-full overflow-hidden border-4 border-white shadow-lg z-10">
            <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80" alt="Avatar" className="w-full h-full object-cover" />
          </div>
          <div className="absolute bottom-4 left-4 w-24 h-24 rounded-full overflow-hidden border-4 border-white shadow-lg z-20">
            <img src="https://images.unsplash.com/photo-1506277886164-e25aa3f4ef7f?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80" alt="Avatar" className="w-full h-full object-cover" />
          </div>
          <div className="absolute bottom-10 right-8 w-20 h-20 rounded-full overflow-hidden border-4 border-white shadow-lg z-30">
            <img src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80" alt="Avatar" className="w-full h-full object-cover" />
          </div>
          {/* Connecting lines simulation */}
          <svg className="absolute inset-0 w-full h-full text-gray-300" style={{ zIndex: 0 }}>
            <circle cx="128" cy="128" r="90" fill="none" stroke="currentColor" strokeWidth="1" strokeDasharray="4 4" />
          </svg>
          <div className="absolute top-1/2 left-0 transform -translate-x-1/2 -translate-y-1/2 w-12 h-12 bg-[#2c2c2c] rounded-full flex items-center justify-center text-white z-40">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}
