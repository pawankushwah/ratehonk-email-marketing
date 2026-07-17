"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  Sparkles, 
  Calendar, 
  AlertCircle, 
  RefreshCw, 
  Bot, 
  MoreVertical, 
  Trash2, 
  Copy, 
  Edit,
  Mail
} from 'lucide-react';
import { trpc } from '@/app/trpc';
import { useBusinessStore } from '@/app/store/useBusinessStore';
import { useToast } from '@/app/hooks/useToast';

interface EmailTemplate {
  id: string;
  name: string;
  category: string;
  description: string;
  htmlContent: string;
  updatedAt: string;
}

export default function CampaignsEmailTemplatesPage() {
  const { addToast } = useToast();
  const router = useRouter();
  const activeBusinessId = useBusinessStore(state => state.activeBusinessId);
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);

  // Fetch Templates via tRPC
  const { data, isLoading, isError, refetch } = trpc.emailtemp.getTemplates.useQuery(
    { businessId: activeBusinessId || '' },
    { enabled: !!activeBusinessId }
  );

  // Delete Template Mutation
  const deleteMutation = trpc.emailtemp.deleteTemplate.useMutation({
    onSuccess: () => {
      addToast('Email template deleted successfully!', 'success');
      refetch();
    },
    onError: (error) => {
      addToast(error.message || 'Failed to delete template.', 'error');
    }
  });

  const handleUseTemplate = (template: EmailTemplate) => {
    if (template.id.startsWith('tpl-')) {
      router.push(`/campaigns/email-templates/builder?id=${template.id}`);
    } else {
      router.push(`/campaigns/email-templates/builder?id=${template.id}`);
    }
  };

  const handleMenuAction = (action: string, template: EmailTemplate) => {
    setActiveMenuId(null);
    
    if (action === 'Edit') {
      router.push(`/campaigns/email-templates/builder?id=${template.id}`);
      return;
    }

    if (action === 'Delete') {
      if (template.id.startsWith('tpl-')) {
        addToast('System templates cannot be deleted.', 'error');
        return;
      }
      if (confirm(`Are you sure you want to delete the template "${template.name}"?`)) {
        deleteMutation.mutate({
          id: template.id,
          businessId: activeBusinessId || ''
        });
      }
      return;
    }

    addToast(`${action} for "${template.name}" will be supported in future steps.`, 'success');
  };

  if (!activeBusinessId) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-500">
        Please select or create a workspace to view email templates.
      </div>
    );
  }

  const templates = ((data && 'templates' in data) ? data.templates : []) as EmailTemplate[];

  return (
    <div className="max-w-[1400px] mx-auto py-8 px-6 bg-gray-50/20 min-h-screen">
      
      {/* Page Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Email Templates</h1>
          <p className="text-text-dim text-xs mt-1">Manage and draft high-performance templates for your outreach.</p>
        </div>

        <Link
          href="/campaigns/email-templates/builder"
          className="bg-main hover:bg-sky-600 text-white flex items-center gap-2 px-4 py-2.5 rounded-lg font-bold text-sm transition-colors shadow-sm"
        >
          <Sparkles className="w-4 h-4" /> Create New Template
        </Link>
      </div>

      {/* Main Grid Canvas */}
      {isLoading ? (
        /* SKELETON LOADER STATE */
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map(idx => (
            <div key={idx} className="bg-white rounded-xl border border-border overflow-hidden shadow-xs animate-pulse flex flex-col h-full">
              <div className="h-36 bg-gray-100"></div>
              <div className="p-4 space-y-3 flex-1 flex flex-col">
                <div className="w-2/3 h-4 bg-gray-200 rounded"></div>
                <div className="w-full h-3 bg-gray-100 rounded"></div>
                <div className="w-5/6 h-3 bg-gray-100 rounded"></div>
                <div className="w-1/2 h-2.5 bg-gray-100 rounded mt-auto"></div>
                <div className="w-full h-9 bg-gray-200 rounded-lg mt-3"></div>
              </div>
            </div>
          ))}
        </div>
      ) : isError ? (
        /* ERROR FALLBACK STATE */
        <div className="flex flex-col items-center justify-center py-16 text-center bg-white rounded-xl border border-border shadow-xs p-8 max-w-xl mx-auto">
          <div className="w-12 h-12 rounded-full bg-red-100 text-red-500 flex items-center justify-center mb-4">
            <AlertCircle className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-text mb-2">Failed to load templates</h3>
          <p className="text-sm text-text-dim max-w-xs mb-6">
            Something went wrong while connecting to the template service. Please check your workspace connection.
          </p>
          <button
            onClick={() => refetch()}
            className="bg-main hover:bg-sky-600 text-white font-semibold rounded-lg px-5 py-2 text-sm transition-colors flex items-center gap-2 shadow-sm"
          >
            <RefreshCw className="w-4 h-4" /> Retry Fetch
          </button>
        </div>
      ) : templates.length === 0 ? (
        /* EMPTY STATE DISPLAY */
        <div className="flex flex-col items-center justify-center py-20 text-center bg-white rounded-xl border border-border shadow-xs p-8">
          <div className="w-12 h-12 rounded-full bg-main-dim flex items-center justify-center text-main mb-4">
            <Mail className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-text mb-1.5">No email templates yet</h3>
          <p className="text-sm text-text-dim max-w-sm mb-6 leading-relaxed">
            Create your first email template using AI or use one of your saved templates.
          </p>
          <Link
            href="/campaigns/email-templates/builder"
            className="bg-[#007c89] hover:bg-[#006570] text-white font-semibold rounded-lg px-6 py-2.5 text-sm transition-colors shadow-sm"
          >
            Create New Template
          </Link>
        </div>
      ) : (
        /* CARD GALLERY */
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {templates.map(tpl => (
            <div 
              key={tpl.id}
              className="bg-white rounded-xl border border-border overflow-hidden hover:shadow-md hover:border-main/30 hover:shadow-sky-500/5 transition-all duration-300 flex flex-col h-full relative"
            >
              {/* Thumbnail Area */}
              <div className="h-36 bg-gradient-to-br from-main-dim/60 to-main-dim/20 flex flex-col items-center justify-center border-b border-border relative">
                <Bot className="w-8 h-8 text-main/60 animate-pulse" />
                <span className="absolute bottom-3 right-3 text-[9px] font-bold text-main uppercase tracking-wider bg-white/90 px-2 py-0.5 rounded-full border border-main/10 shadow-xs">
                  {tpl.category}
                </span>
              </div>

              {/* Card Body */}
              <div className="p-5 flex-1 flex flex-col">
                <div className="flex items-center justify-between mb-1.5 relative">
                  <h3 className="text-sm font-bold text-text truncate max-w-[85%]" title={tpl.name}>
                    {tpl.name}
                  </h3>
                  
                  {/* Card Dropdown Trigger */}
                  <div className="relative">
                    <button
                      onClick={() => setActiveMenuId(prev => prev === tpl.id ? null : tpl.id)}
                      className="p-1 text-text-dim hover:text-text hover:bg-gray-50 rounded transition-colors"
                    >
                      <MoreVertical className="w-4 h-4" />
                    </button>

                    {/* Action Dropdown Menu */}
                    {activeMenuId === tpl.id && (
                      <>
                        <div className="fixed inset-0 z-10" onClick={() => setActiveMenuId(null)} />
                        <div className="absolute right-0 mt-1.5 w-36 bg-white border border-border rounded-lg shadow-lg py-1 z-20">
                          <button
                            onClick={() => handleMenuAction('Edit', tpl)}
                            className="w-full text-left px-3 py-1.5 text-xs text-text hover:bg-gray-50 flex items-center gap-2"
                          >
                            <Edit className="w-3.5 h-3.5 text-text-dim" /> Edit
                          </button>
                          <button
                            onClick={() => handleMenuAction('Duplicate', tpl)}
                            className="w-full text-left px-3 py-1.5 text-xs text-text hover:bg-gray-50 flex items-center gap-2"
                          >
                            <Copy className="w-3.5 h-3.5 text-text-dim" /> Duplicate
                          </button>
                          <div className="border-t border-border my-1"></div>
                          <button
                            onClick={() => handleMenuAction('Delete', tpl)}
                            className="w-full text-left px-3 py-1.5 text-xs text-red-600 hover:bg-red-50 flex items-center gap-2"
                          >
                            <Trash2 className="w-3.5 h-3.5 text-red-500" /> Delete
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                <p className="text-xs text-text-dim line-clamp-2 mb-4 flex-1">
                  {tpl.description}
                </p>

                <div className="flex items-center gap-1.5 text-[10px] text-text-dim border-t border-gray-50 pt-3">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>Updated {new Date(tpl.updatedAt).toLocaleDateString()}</span>
                </div>

                <button
                  onClick={() => handleUseTemplate(tpl)}
                  className="w-full bg-[#007c89] hover:bg-[#006570] text-white text-xs font-bold rounded-lg py-2.5 mt-4 transition-colors duration-200 shadow-xs cursor-pointer text-center"
                >
                  Use Existing Template
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

    </div>
  );
}
