"use client";
import React, { useState, useMemo } from 'react';
import { trpc } from '@/app/trpc';
import { useToast } from '@/app/hooks/useToast';
import {
  Settings, Download, Tag, Mail, Archive, Trash2, MoreVertical,
  ChevronDown, CheckCircle2, XCircle, Clock, AlertTriangle
} from 'lucide-react';
import { format } from 'date-fns';

interface Contact {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  address: string | null;
  phoneNumber: string | null;
  birthday: string | null;
  company: string | null;
  tags: string[];
  source: string | null;
  rating: number | null;
  subscriptionStatus: string;
  createdAt: string;
  updatedAt: string;
}

const ALL_COLUMNS = [
  { id: 'email', label: 'Email Address' },
  { id: 'firstName', label: 'First Name' },
  { id: 'lastName', label: 'Last Name' },
  { id: 'address', label: 'Address' },
  { id: 'phoneNumber', label: 'Phone Number' },
  { id: 'birthday', label: 'Birthday' },
  { id: 'company', label: 'Company' },
  { id: 'tags', label: 'Tags' },
  { id: 'source', label: 'Source' },
  { id: 'rating', label: 'Rating' },
  { id: 'subscriptionStatus', label: 'Email Marketing' },
  { id: 'createdAt', label: 'Date Added' },
  { id: 'updatedAt', label: 'Last Changed' },
];

// Default visible columns
const DEFAULT_VISIBLE_COLS = ['email', 'firstName', 'lastName', 'address', 'phoneNumber', 'birthday'];

export function ContactsTable({ contacts, businessId, refetch }: { contacts: Contact[], businessId: string, refetch: () => void }) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [visibleColumns, setVisibleColumns] = useState<Set<string>>(new Set(DEFAULT_VISIBLE_COLS));
  const [isColsMenuOpen, setIsColsMenuOpen] = useState(false);
  const [isStatusMenuOpen, setIsStatusMenuOpen] = useState(false);
  const { addToast: showToast } = useToast();

  const updateStatusMutation = trpc.audience.updateStatus.useMutation({
    onSuccess: (data) => {
      if (data.success) {
        showToast(data.message || 'Status updated', 'success');
        setSelectedIds(new Set());
        setIsStatusMenuOpen(false);
        refetch();
      } else {
        showToast(data.error || 'Failed to update status', 'error');
      }
    }
  });

  const deleteContactsMutation = trpc.audience.deleteContacts.useMutation({
    onSuccess: (data) => {
      if (data.success) {
        showToast(data.message || 'Contacts deleted', 'success');
        setSelectedIds(new Set());
        refetch();
      } else {
        showToast(data.error || 'Failed to delete contacts', 'error');
      }
    }
  });

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedIds(new Set(contacts.map(c => c.id)));
    } else {
      setSelectedIds(new Set());
    }
  };

  const handleSelectOne = (id: string) => {
    const newSet = new Set(selectedIds);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    setSelectedIds(newSet);
  };

  const toggleColumn = (colId: string) => {
    const newCols = new Set(visibleColumns);
    if (newCols.has(colId)) {
      newCols.delete(colId);
    } else {
      newCols.add(colId);
    }
    setVisibleColumns(newCols);
  };

  const handleStatusChange = (status: string) => {
    if (selectedIds.size === 0) return;
    updateStatusMutation.mutate({
      businessId,
      contactIds: Array.from(selectedIds),
      status: status as any
    });
  };

  const handleDelete = () => {
    if (selectedIds.size === 0) return;
    if (window.confirm(`Are you sure you want to delete ${selectedIds.size} contacts?`)) {
      deleteContactsMutation.mutate({
        businessId,
        contactIds: Array.from(selectedIds)
      });
    }
  };

  // Status mapping to colors/icons
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Subscribed': return <span className="bg-green-100 text-green-800 px-2 py-0.5 rounded text-xs font-medium">Subscribed</span>;
      case 'Unsubscribed': return <span className="bg-orange-100 text-orange-800 px-2 py-0.5 rounded text-xs font-medium">Unsubscribed</span>;
      case 'Non-subscribed': return <span className="bg-gray-100 text-gray-800 px-2 py-0.5 rounded text-xs font-medium">Non-subscribed</span>;
      case 'Pending': return <span className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded text-xs font-medium">Pending</span>;
      case 'Cleaned': return <span className="bg-red-100 text-red-800 px-2 py-0.5 rounded text-xs font-medium">Cleaned</span>;
      default: return <span>{status}</span>;
    }
  };

  const visibleColsList = ALL_COLUMNS.filter(c => visibleColumns.has(c.id));

  return (
    <div className="bg-white rounded-lg border border-gray-200 mt-6 shadow-sm">
      {/* Top Action Bar */}
      <div className="p-3 border-b border-gray-200 flex items-center justify-between bg-gray-50/50 h-14 rounded-t-lg">
        <div className="flex items-center gap-4">
          {selectedIds.size > 0 && (
            <div className="flex items-center gap-3 pr-4 border-r border-gray-200">
              <span className="text-sm font-semibold text-gray-700">{selectedIds.size} selected</span>
            </div>
          )}

          {selectedIds.size > 0 && (
            <div className="flex items-center gap-2">
              <button className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100 rounded-md transition-colors">
                <Tag className="w-4 h-4" /> Tag contacts
              </button>

              <div className="relative">
                <button
                  onClick={() => setIsStatusMenuOpen(!isStatusMenuOpen)}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100 rounded-md transition-colors"
                >
                  <Mail className="w-4 h-4" /> Email subscription
                </button>
                {isStatusMenuOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setIsStatusMenuOpen(false)} />
                    <div className="absolute top-full left-0 mt-1 w-56 bg-white border border-gray-200 shadow-lg rounded-md z-50 py-1">
                      <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider bg-gray-50">Change Status</div>
                      {['Subscribed', 'Unsubscribed', 'Non-subscribed', 'Pending', 'Cleaned'].map(status => (
                        <button
                          key={status}
                          onClick={() => handleStatusChange(status)}
                          className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center justify-between"
                        >
                          {status}
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>

              <button className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100 rounded-md transition-colors">
                <Archive className="w-4 h-4" /> Archive
              </button>
              <button
                onClick={handleDelete}
                className="p-1.5 text-gray-500 hover:bg-gray-100 hover:text-red-600 rounded-md transition-colors ml-1"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <button
              onClick={() => setIsColsMenuOpen(!isColsMenuOpen)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
            >
              <Settings className="w-4 h-4" /> Columns
            </button>
            {isColsMenuOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setIsColsMenuOpen(false)} />
                <div className="absolute bottom-full right-0 mb-1 w-56 bg-white border border-gray-200 shadow-lg rounded-md z-50 py-2 max-h-[60vh] sm:max-h-64 overflow-y-auto">
                  <div className="px-3 pb-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">Toggle Columns</div>
                  {ALL_COLUMNS.map(col => (
                    <label key={col.id} className="flex items-center gap-3 px-4 py-1.5 hover:bg-gray-50 cursor-pointer">
                      <input
                        type="checkbox"
                        className="rounded border-gray-300 text-[#007c89] focus:ring-[#007c89]"
                        checked={visibleColumns.has(col.id)}
                        onChange={() => toggleColumn(col.id)}
                        disabled={col.id === 'email'} // Email must always be visible
                      />
                      <span className="text-sm text-gray-700">{col.label}</span>
                    </label>
                  ))}
                </div>
              </>
            )}
          </div>
          <button className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-md transition-colors">
            <Download className="w-4 h-4" /> Export all contacts
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-b-lg">
        <table className="w-full text-left text-xs whitespace-nowrap">
          <thead className="bg-white border-b border-gray-200">
            <tr>
              <th className="p-3 w-12 text-center">
                <input
                  type="checkbox"
                  className="w-4 h-4 rounded border-gray-300 text-[#007c89] focus:ring-[#007c89]"
                  checked={contacts.length > 0 && selectedIds.size === contacts.length}
                  ref={input => {
                    if (input) {
                      input.indeterminate = selectedIds.size > 0 && selectedIds.size < contacts.length;
                    }
                  }}
                  onChange={handleSelectAll}
                />
              </th>
              {visibleColsList.map(col => (
                <th key={col.id} className="p-3 font-semibold text-gray-600">{col.label}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {contacts.map(contact => (
              <tr
                key={contact.id}
                className={`hover:bg-gray-50/50 transition-colors ${selectedIds.has(contact.id) ? 'bg-teal-50/30' : ''}`}
              >
                <td className="p-3 text-center border-r border-transparent">
                  <input
                    type="checkbox"
                    className="w-4 h-4 rounded border-gray-300 text-[#007c89] focus:ring-[#007c89]"
                    checked={selectedIds.has(contact.id)}
                    onChange={() => handleSelectOne(contact.id)}
                  />
                </td>

                {visibleColsList.map(col => {
                  let content: React.ReactNode = (contact as any)[col.id] || '';

                  if (col.id === 'email') {
                    content = <span className="font-semibold text-[#007c89] cursor-pointer hover:underline">{contact.email}</span>;
                  } else if (col.id === 'tags') {
                    content = contact.tags?.map((t: any) => t.name).join(', ') || '-';
                  } else if (col.id === 'address') {
                    if (contact.address && typeof contact.address === 'object') {
                      const addr = contact.address as any;
                      content = [addr.street, addr.city, addr.state, addr.country].filter(Boolean).join(', ') || '-';
                    } else {
                      content = contact.address || '-';
                    }
                  } else if (col.id === 'rating') {
                    content = '⭐'.repeat(contact.rating || 2);
                  } else if (col.id === 'subscriptionStatus') {
                    content = getStatusBadge(contact.subscriptionStatus);
                  } else if (col.id === 'createdAt' || col.id === 'updatedAt') {
                    content = format(new Date((contact as any)[col.id]), 'MMM d, yyyy h:mm a');
                  }

                  return (
                    <td key={col.id} className="p-3 text-gray-700">
                      {content || <span className="text-gray-400">-</span>}
                    </td>
                  );
                })}
              </tr>
            ))}

            {contacts.length === 0 && (
              <tr>
                <td colSpan={visibleColsList.length + 1} className="p-8 text-center text-gray-500">
                  No contacts found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
