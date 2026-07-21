"use client";

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft, ChevronRight, AlertCircle } from 'lucide-react';
import ChatPanel, { ChatMessage } from './components/ChatPanel';
import PreviewPanel from './components/PreviewPanel';
import { useToast } from '@/app/hooks/useToast';
import { trpc } from '@/app/trpc';
import { useBusinessStore } from '@/app/store/useBusinessStore';

function AIEmailTemplateBuilderContent() {
  const { addToast } = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();
  const templateId = searchParams.get('id') || searchParams.get('templateId');
  const utils = trpc.useUtils();
  const activeBusinessId = useBusinessStore(state => state.activeBusinessId);

  // State Management
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [device, setDevice] = useState<'desktop' | 'mobile'>('desktop');
  const [hasTemplate, setHasTemplate] = useState(false);
  const [lastPrompt, setLastPrompt] = useState('');
  const [generatedHtml, setGeneratedHtml] = useState<string | null>(null);

  // AI Provider State
  const { data: apiKeysData, isLoading: isApiKeysLoading } = trpc.apiKeys.getApiKeys.useQuery();
  const apiKeys = apiKeysData?.apiKeys || [];

  const providers = React.useMemo(() => {
    const ALL_PROVIDERS = [
      { id: 'openai', name: 'OpenAI (GPT-4o)' },
      { id: 'gemini', name: 'Google Gemini' },
      { id: 'anthropic', name: 'Anthropic Claude' },
      { id: 'mistral', name: 'Mistral AI' },
      { id: 'grok', name: 'xAI (Grok)' }
    ];
    return ALL_PROVIDERS.map(p => {
      const isConnected = apiKeys.some(k => k.provider === p.id && k.isActive);
      return { ...p, isConnected };
    });
  }, [apiKeys]);

  const [selectedProvider, setSelectedProvider] = useState<string>('');

  useEffect(() => {
    if (providers.length > 0 && !selectedProvider) {
      // Find first connected, or just first one
      const firstConnected = providers.find(p => p.isConnected) || providers[0];
      setSelectedProvider(firstConnected.id);
    }
  }, [providers, selectedProvider]);

  // Save Modal Form States
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
  const [saveName, setSaveName] = useState('');
  const [saveCategory, setSaveCategory] = useState('General');
  const [saveDescription, setSaveDescription] = useState('');
  const [nameError, setNameError] = useState('');

  // Fetch template data if templateId is provided (Edit mode)
  const { data: templateData, error: templateError } = trpc.emailtemp.getTemplateById.useQuery(
    { id: templateId || '', businessId: activeBusinessId || '' },
    { enabled: !!templateId && !!activeBusinessId }
  );

  useEffect(() => {
    if (templateData?.template) {
      setGeneratedHtml(templateData.template.htmlContent);
      setHasTemplate(true);
      setSaveName(templateData.template.name);
      setSaveDescription(templateData.template.description || '');
      setSaveCategory(templateData.template.category || 'General');

      setMessages([
        {
          id: `sys-load-${Date.now()}`,
          role: 'assistant',
          content: `Loaded existing template "${templateData.template.name}". You can now edit it or refine it using the AI assistant.`,
          timestamp: new Date()
        }
      ]);
    }
  }, [templateData]);

  useEffect(() => {
    if (templateError) {
      addToast(`Failed to load email template: ${templateError.message}`, 'error');
    }
  }, [templateError]);

  // tRPC Mutation for Template Generation
  const generateMutation = trpc.emailtemp.generateTemplate.useMutation({
    onSuccess: (data) => {
      setIsGenerating(false);
      if (data && 'html' in data && data.success) {
        setGeneratedHtml(data.html);
        setHasTemplate(true);

        const botMsg: ChatMessage = {
          id: `ai-${Date.now()}`,
          role: 'assistant',
          content: 'Your email template has been generated successfully. You can preview it on the right.',
          timestamp: new Date()
        };
        setMessages(prev => [...prev, botMsg]);
        addToast('Email template generated successfully!', 'success');
      } else {
        const botMsg: ChatMessage = {
          id: `ai-${Date.now()}`,
          role: 'assistant',
          content: 'Failed to generate template response format. Please try again.',
          timestamp: new Date()
        };
        setMessages(prev => [...prev, botMsg]);
        addToast('Template generation response error.', 'error');
      }
    },
    onError: (error) => {
      setIsGenerating(false);
      const botMsg: ChatMessage = {
        id: `ai-err-${Date.now()}`,
        role: 'assistant',
        content: `Sorry, there was an error generating your template: ${error.message || 'Unknown network error'}. Please try again.`,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, botMsg]);
      addToast(error.message || 'Generation failed.', 'error');
    }
  });

  // tRPC Mutation for Saving Template
  const createMutation = trpc.emailtemp.createTemplate.useMutation({
    onSuccess: async () => {
      addToast('Email template saved successfully!', 'success');
      setIsSaveModalOpen(false);
      // Invalidate template queries for hot updates on return
      await utils.emailtemp.getTemplates.invalidate();
      router.push('/campaigns/email-templates');
    },
    onError: (error) => {
      addToast(error.message || 'Failed to save email template.', 'error');
    }
  });

  // tRPC Mutation for Updating Template
  const updateMutation = trpc.emailtemp.updateTemplate.useMutation({
    onSuccess: async () => {
      addToast('Email template updated successfully!', 'success');
      setIsSaveModalOpen(false);
      // Invalidate template queries for hot updates on return
      await utils.emailtemp.getTemplates.invalidate();
      router.push('/campaigns/email-templates');
    },
    onError: (error) => {
      addToast(error.message || 'Failed to update email template.', 'error');
    }
  });

  const isSaving = createMutation.isPending || updateMutation.isPending;

  // Handlers
  const handleSendMessage = (text: string) => {
    if (!text.trim() || isGenerating) return;

    // 1. Add user message immediately
    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: text,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMsg]);
    setIsGenerating(true);
    setLastPrompt(text);

    // 2. Trigger tRPC API mutation call
    generateMutation.mutate({ prompt: text, provider: selectedProvider || undefined });
  };

  const handleClearChat = () => {
    setMessages([]);
    setHasTemplate(false);
    setLastPrompt('');
    setGeneratedHtml(null);
    setIsGenerating(false);
    addToast('Conversation cleared.', 'success');
  };

  const handleUseTemplate = () => {
    if (!generatedHtml) {
      addToast('No generated template code found. Please generate a template first.', 'error');
      return;
    }
    const defaultName = lastPrompt
      ? (lastPrompt.substring(0, 30) + (lastPrompt.length > 30 ? '...' : ''))
      : 'AI Generated Template';
    setSaveName(defaultName);
    setSaveCategory('General');
    setSaveDescription('');
    setNameError('');
    setIsSaveModalOpen(true);
  };

  const handleConfirmSave = () => {
    if (!saveName.trim()) {
      setNameError('Template name is required.');
      return;
    }
    if (!activeBusinessId) {
      addToast('No active workspace selected. Please select a workspace.', 'error');
      return;
    }
    if (!generatedHtml) {
      addToast('No generated HTML context found.', 'error');
      return;
    }

    if (templateId && !templateId.startsWith('tpl-')) {
      updateMutation.mutate({
        id: templateId,
        businessId: activeBusinessId,
        name: saveName,
        category: saveCategory,
        description: saveDescription,
        htmlContent: generatedHtml
      });
    } else {
      createMutation.mutate({
        businessId: activeBusinessId,
        name: saveName,
        category: saveCategory,
        description: saveDescription,
        htmlContent: generatedHtml
      });
    }
  };

  const handleRegenerate = () => {
    if (!lastPrompt || isGenerating) return;

    setIsGenerating(true);
    addToast('Regenerating template...', 'success');

    const userMsg: ChatMessage = {
      id: `user-regen-${Date.now()}`,
      role: 'user',
      content: 'Regenerate the template.',
      timestamp: new Date()
    };
    setMessages(prev => [...prev, userMsg]);

    generateMutation.mutate({ prompt: lastPrompt, provider: selectedProvider || undefined });
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#f8fafc] flex flex-col w-full h-screen overflow-hidden">

      {/* Premium Top Navigation Bar */}
      <header className="shrink-0 h-[72px] bg-white border-b border-gray-200 flex items-center px-4 md:px-8 justify-between shadow-xs">
        <div className="flex items-center gap-4">
          <Link
            href="/campaigns/email-templates"
            className="w-10 h-10 flex items-center justify-center rounded-xl bg-gray-50 border border-gray-200 text-gray-500 hover:text-[#007c89] hover:border-[#007c89]/30 hover:bg-[#007c89]/5 transition-all shadow-xs"
            title="Back to Templates"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div className="h-8 w-px bg-gray-200 hidden sm:block"></div>
          <div>
            <h1 className="text-lg md:text-xl font-bold text-gray-900 leading-tight">AI Email Template Builder</h1>
            <p className="text-xs text-gray-500 font-medium">Design and code responsive emails using artificial intelligence</p>
          </div>
        </div>
      </header>

      {/* Main Workspace Area */}
      <div className="flex-1 w-full max-w-[1800px] mx-auto p-4 md:p-6 lg:p-8 flex flex-col h-full min-h-0 overflow-hidden">

        {/* Conditional Layout */}
        {isApiKeysLoading ? (
          <div className="flex-1 flex flex-col items-center justify-center">
            <div className="w-10 h-10 border-4 border-main border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-gray-500 font-medium">Checking AI providers...</p>
          </div>
        ) : (
          /* Two-Column Layout Grid */
          <div className="grid grid-cols-1 md:grid-cols-[38%_60%] gap-6 lg:gap-8 flex-1 min-h-0 h-full">

            {/* Left Column: AI Assistant Chat Control */}
            <ChatPanel
              messages={messages}
              isGenerating={isGenerating}
              onSendMessage={handleSendMessage}
              onClearChat={handleClearChat}
              providers={providers}
              selectedProvider={selectedProvider}
              onProviderChange={setSelectedProvider}
            />

            {/* Right Column: Visual Email Preview canvas */}
            <PreviewPanel
              hasTemplate={hasTemplate}
              isGenerating={isGenerating}
              device={device}
              onDeviceChange={setDevice}
              onSaveTemplate={handleUseTemplate}
              onRegenerate={handleRegenerate}
              lastPrompt={lastPrompt}
              htmlContent={generatedHtml}
            />

          </div>
        )}

        {/* Save Template Modal */}
        {isSaveModalOpen && (
          <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
            <div className="bg-white rounded-2xl overflow-hidden shadow-2xl w-full max-w-md flex flex-col relative animate-in zoom-in-95 duration-150 p-6" onClick={(e) => e.stopPropagation()}>
              <h3 className="text-lg font-bold text-text mb-4">
                {templateId ? 'Update Email Template' : 'Save AI Email Template'}
              </h3>

              <div className="space-y-4">
                {/* Template Preview (acting as image field) */}
                <div>
                  <label className="block text-xs font-bold text-text-dim uppercase tracking-wider mb-1.5">
                    Template Preview (Thumbnail)
                  </label>
                  <div className="border border-border rounded-xl overflow-hidden bg-gray-50 h-36 relative shadow-inner flex items-center justify-center">
                    <div className="absolute inset-0 origin-top-left scale-[0.4] w-[250%] h-[250%] pointer-events-none bg-white">
                      <iframe
                        title="Email Modal Thumbnail"
                        srcDoc={generatedHtml || '<html><body><p style="padding: 20px; font-family: sans-serif; color: #999;">No preview available</p></body></html>'}
                        sandbox=""
                        className="w-full h-full border-0 bg-white"
                      />
                    </div>
                  </div>
                </div>

                {/* Name */}
                <div>
                  <label className="block text-xs font-bold text-text-dim uppercase tracking-wider mb-1.5">
                    Template Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={saveName}
                    onChange={(e) => {
                      setSaveName(e.target.value);
                      if (e.target.value.trim()) setNameError('');
                    }}
                    placeholder="e.g. Welcome Email Newsletter"
                    className={`w-full p-2.5 bg-white border rounded-lg text-sm focus:outline-none focus:ring-2 transition-all ${nameError
                      ? 'border-red-500 focus:ring-red-500/20'
                      : 'border-border focus:ring-sky-500/20'
                      }`}
                    disabled={isSaving}
                  />
                  {nameError && (
                    <p className="text-red-500 text-xs mt-1">{nameError}</p>
                  )}
                </div>

                {/* Category */}
                <div>
                  <label className="block text-xs font-bold text-text-dim uppercase tracking-wider mb-1.5">
                    Category
                  </label>
                  <input
                    type="text"
                    value={saveCategory}
                    onChange={(e) => setSaveCategory(e.target.value)}
                    placeholder="e.g. Marketing, Newsletter"
                    className="w-full p-2.5 bg-white border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sky-500/20 transition-all"
                    disabled={isSaving}
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-xs font-bold text-text-dim uppercase tracking-wider mb-1.5">
                    Description
                  </label>
                  <textarea
                    value={saveDescription}
                    onChange={(e) => setSaveDescription(e.target.value)}
                    placeholder="Provide a brief summary of when to use this template..."
                    rows={3}
                    className="w-full p-2.5 bg-white border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sky-500/20 resize-none transition-all"
                    disabled={isSaving}
                  />
                </div>
              </div>

              {/* Actions Bar */}
              <div className="mt-6 flex items-center justify-end gap-3 border-t border-gray-100 pt-4">
                <button
                  type="button"
                  onClick={() => setIsSaveModalOpen(false)}
                  className="px-4 py-2 text-sm font-semibold border border-border rounded-lg hover:bg-gray-50 transition-all text-text"
                  disabled={isSaving}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmSave}
                  disabled={isSaving}
                  className={`flex items-center justify-center px-5 py-2 text-sm font-semibold rounded-lg text-white shadow-sm transition-all ${isSaving
                    ? 'bg-gray-300 cursor-not-allowed shadow-none'
                    : 'bg-[#007c89] hover:bg-[#006570] hover:shadow-md'
                    }`}
                >
                  {isSaving ? 'Saving...' : templateId ? 'Update Template' : 'Save Template'}
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

export default function AIEmailTemplateBuilderPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-[60vh] text-text-dim text-sm font-semibold">
        Loading AI template builder...
      </div>
    }>
      <AIEmailTemplateBuilderContent />
    </Suspense>
  );
}
