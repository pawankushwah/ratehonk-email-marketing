"use client";
import React, { useState, useEffect } from 'react';
import { trpc } from '@/app/trpc';
import { useBusinessStore } from '@/app/store/useBusinessStore';
import { AudienceHero } from './components/AudienceHero';
import { ContactsTable } from './components/ContactsTable';
import { useToast } from '@/app/hooks/useToast';
import { Loader2, ChevronDown, UserPlus, Upload } from 'lucide-react';
import Button from '@/app/components/ui/button';
import Link from 'next/link';

export default function AudiencePage() {
  const activeBusinessId = useBusinessStore(state => state.activeBusinessId);
  const { addToast: showToast } = useToast();
  const [isAddMenuOpen, setIsAddMenuOpen] = useState(false);

  const { data, isLoading, refetch } = trpc.audience.getContacts.useQuery(
    { businessId: activeBusinessId || '' },
    { enabled: !!activeBusinessId }
  );

  if (!activeBusinessId) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-500">
        Please select or create a workspace to manage audience contacts.
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64 text-[#007c89]">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  const contacts = data?.contacts || [];

  return (
    <div className="max-w-[1400px] mx-auto py-8 px-6">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Contacts</h1>

        <div className="relative">
          <Button
            onClick={() => setIsAddMenuOpen(!isAddMenuOpen)}
            size="md"
            className="!bg-[#007c89] hover:!bg-[#006570] !text-white flex items-center gap-2"
          >
            Add contacts <ChevronDown className="w-4 h-4" />
          </Button>

          {isAddMenuOpen && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setIsAddMenuOpen(false)} />
              <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 shadow-lg rounded-md z-20 py-1">
                <button
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                  onClick={() => {
                    setIsAddMenuOpen(false);
                    // Add import logic here later
                  }}
                >
                  <Upload className="w-4 h-4" /> Import contacts
                </button>
                <Link
                  href="/audience/add-contact"
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                >
                  <UserPlus className="w-4 h-4" /> Add single contact
                </Link>
              </div>
            </>
          )}
        </div>
      </div>

      {contacts.length < 10 && (
        <AudienceHero />
      )}

      {/* Show table if there are any contacts, or even if empty, the table handles empty state well */}
      <ContactsTable
        contacts={contacts}
        businessId={activeBusinessId}
        refetch={refetch}
      />
    </div>
  );
}
