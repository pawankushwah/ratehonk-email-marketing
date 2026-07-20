"use client";

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { trpc } from '@/app/trpc';
import { useBusinessStore } from '@/app/store/useBusinessStore';
import { useToast } from '@/app/hooks/useToast';
import {
  Mail, Search, Trash2, Archive, CheckCircle2, User, Tag, ChevronLeft,
  Send, MessageSquare, Plus, X, ChevronDown, Check, CornerDownLeft,
  FileText, Settings, HelpCircle, Inbox as InboxIcon, RefreshCw, Eye
} from 'lucide-react';
import Button from '@/app/components/ui/button';

// --- Type Definitions ---
interface Contact {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  phoneNumber: string | null;
  company: string | null;
  tags: string[];
  labels: string[];
  source: 'email-marketing' | 'contact-form';
  createdAt: string;
  rating: number;
}

interface MessageThread {
  id: string;
  contact: Contact;
  subject: string;
  status: 'todo' | 'done' | 'trash';
  unread: boolean;
  messages: {
    id: string;
    senderName: string;
    senderEmail: string;
    type: 'incoming' | 'outgoing' | 'comment';
    content: string;
    timestamp: string;
  }[];
}

// --- Default Initial Data ---
const DEFAULT_THREADS: MessageThread[] = [
  {
    id: 'thread-1',
    subject: 'hello',
    status: 'todo',
    unread: true,
    contact: {
      id: 'contact-1',
      email: 'pawankushwahmail@gmail.com',
      firstName: 'Pawan',
      lastName: 'Kushwah',
      phoneNumber: '+1 (555) 234-5678',
      company: 'RateHonk Inc.',
      tags: ['VIP', 'Hot Lead'],
      labels: ['Urgent'],
      source: 'email-marketing',
      createdAt: '2026-07-14T08:29:00Z',
      rating: 4
    },
    messages: [
      {
        id: 'msg-1-1',
        senderName: 'Pawan Kushwah',
        senderEmail: 'pawankushwahmail@gmail.com',
        type: 'incoming',
        content: 'hello',
        timestamp: 'Tue July 14, 2026 8:29 am'
      },
      {
        id: 'msg-1-2',
        senderName: 'pawan kushwah',
        senderEmail: 'pawankushwahmail@gmail.com',
        type: 'outgoing',
        content: 'ghjk',
        timestamp: 'Tue July 14, 2026 8:30 am'
      }
    ]
  },
  {
    id: 'thread-2',
    subject: 'Inquiry about custom plan pricing',
    status: 'todo',
    unread: false,
    contact: {
      id: 'contact-2',
      email: 'sarah.j@techstart.io',
      firstName: 'Sarah',
      lastName: 'Jenkins',
      phoneNumber: '+1 (415) 888-9900',
      company: 'TechStart Co.',
      tags: ['Enterprise'],
      labels: ['Billing', 'Sales'],
      source: 'contact-form',
      createdAt: '2026-07-17T10:15:00Z',
      rating: 5
    },
    messages: [
      {
        id: 'msg-2-1',
        senderName: 'Sarah Jenkins',
        senderEmail: 'sarah.j@techstart.io',
        type: 'incoming',
        content: 'Hi team, I am interested in your custom bulk email marketing plan for 500k monthly volume. Could you share details about pricing and sending limits?',
        timestamp: 'Fri July 17, 2026 10:15 am'
      },
      {
        id: 'msg-2-2',
        senderName: 'Support Agent',
        senderEmail: 'support@ratehonk.com',
        type: 'outgoing',
        content: 'Hi Sarah, thanks for reaching out! A sales representative will email you our standard enterprise tiers shortly. In the meantime, feel free to check our pricing page.',
        timestamp: 'Fri July 17, 2026 10:45 am'
      },
      {
        id: 'msg-2-3',
        senderName: 'Aashu (Internal Note)',
        senderEmail: 'aashu@ratehonk.com',
        type: 'comment',
        content: 'Tagged as hot lead. TechStart is a high-growth startup. We should reach out directly over phone if possible.',
        timestamp: 'Fri July 17, 2026 11:00 am'
      }
    ]
  }
];

export default function AudienceInboxPage() {
  const activeBusinessId = useBusinessStore(state => state.activeBusinessId);
  const { addToast } = useToast();

  // Load existing contacts if available
  const { data: contactsData, isLoading: isContactsLoading } = trpc.audience.getContacts.useQuery(
    { businessId: activeBusinessId || '' },
    { enabled: !!activeBusinessId }
  );
  const dbContacts = ((contactsData && 'contacts' in contactsData ? contactsData.contacts : []) || []) as any[];

  // --- State Variables ---
  const [threads, setThreads] = useState<MessageThread[]>([]);
  const [selectedThreadId, setSelectedThreadId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'todo' | 'done' | 'trash' | 'all'>('todo');
  const [selectedSource, setSelectedSource] = useState<'all' | 'email-marketing' | 'contact-form'>('all');
  const [selectedLabel, setSelectedLabel] = useState<string | null>(null);
  
  // Navigation / Panes on Mobile
  const [activePane, setActivePane] = useState<'sidebar' | 'list' | 'detail'>('list');

  // Interactive Editors
  const [replyText, setReplyText] = useState('');
  const [commentText, setCommentText] = useState('');
  const [isReplying, setIsReplying] = useState(false);
  const [isCommenting, setIsCommenting] = useState(false);

  // Modals & Sheets
  const [isComposeOpen, setIsComposeOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isTagPopupOpen, setIsTagPopupOpen] = useState(false);
  const [isLabelPopupOpen, setIsLabelPopupOpen] = useState(false);
  
  // New conversation form (Compose)
  const [composeTo, setComposeTo] = useState('');
  const [composeSubject, setComposeSubject] = useState('');
  const [composeSource, setComposeSource] = useState<'email-marketing' | 'contact-form'>('email-marketing');
  const [composeMessage, setComposeMessage] = useState('');

  // Dropdown states
  const [showComposeSuggestions, setShowComposeSuggestions] = useState(false);

  // Load from local storage
  useEffect(() => {
    const saved = localStorage.getItem(`ratehonk_inbox_threads_${activeBusinessId || 'default'}`);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setThreads(parsed);
        if (parsed.length > 0) {
          setSelectedThreadId(parsed[0].id);
        }
      } catch (e) {
        setThreads(DEFAULT_THREADS);
        setSelectedThreadId(DEFAULT_THREADS[0].id);
      }
    } else {
      setThreads(DEFAULT_THREADS);
      if (DEFAULT_THREADS.length > 0) {
        setSelectedThreadId(DEFAULT_THREADS[0].id);
      }
    }
  }, [activeBusinessId]);

  // Save to local storage
  const saveThreads = (updatedThreads: MessageThread[]) => {
    setThreads(updatedThreads);
    localStorage.setItem(
      `ratehonk_inbox_threads_${activeBusinessId || 'default'}`,
      JSON.stringify(updatedThreads)
    );
  };

  const selectedThread = useMemo(() => {
    return threads.find(t => t.id === selectedThreadId) || null;
  }, [threads, selectedThreadId]);

  // Mark selected thread as read
  useEffect(() => {
    if (selectedThread && selectedThread.unread) {
      const updated = threads.map(t => {
        if (t.id === selectedThread.id) {
          return { ...t, unread: false };
        }
        return t;
      });
      saveThreads(updated);
    }
  }, [selectedThreadId]);

  // --- Filtering Logic ---
  const filteredThreads = useMemo(() => {
    return threads.filter(t => {
      // Tab status check
      if (activeTab !== 'all' && t.status !== activeTab) return false;

      // Source check
      if (selectedSource !== 'all' && t.contact.source !== selectedSource) return false;

      // Label check
      if (selectedLabel && !t.contact.labels.includes(selectedLabel)) return false;

      // Search Query check
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesName = `${t.contact.firstName} ${t.contact.lastName}`.toLowerCase().includes(query);
        const matchesEmail = t.contact.email.toLowerCase().includes(query);
        const matchesSubject = t.subject.toLowerCase().includes(query);
        const matchesMessage = t.messages.some(m => m.content.toLowerCase().includes(query));
        return matchesName || matchesEmail || matchesSubject || matchesMessage;
      }

      return true;
    });
  }, [threads, activeTab, selectedSource, selectedLabel, searchQuery]);

  // --- Unique list of labels ---
  const allLabels = useMemo(() => {
    const labelsSet = new Set<string>();
    threads.forEach(t => t.contact.labels.forEach(l => labelsSet.add(l)));
    return Array.from(labelsSet);
  }, [threads]);

  // --- Counts ---
  const counts = useMemo(() => {
    const result = {
      todo: 0,
      done: 0,
      trash: 0,
      all: 0,
      emailMarketing: 0,
      contactForm: 0
    };
    threads.forEach(t => {
      if (t.status === 'todo') result.todo++;
      if (t.status === 'done') result.done++;
      if (t.status === 'trash') result.trash++;
      result.all++;

      if (t.contact.source === 'email-marketing') result.emailMarketing++;
      if (t.contact.source === 'contact-form') result.contactForm++;
    });
    return result;
  }, [threads]);

  // --- Actions ---

  // Compose / New Conversation Submit
  const handleComposeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!composeTo.trim() || !composeSubject.trim() || !composeMessage.trim()) {
      addToast('Please fill out all fields.', 'error');
      return;
    }

    // Try to split name if found in suggestions
    let fName = '';
    let lName = '';
    const emailToUse = composeTo.trim();

    // Check if match inside local database contacts
    const matchedContact = dbContacts.find(c => c.email.toLowerCase() === emailToUse.toLowerCase());
    if (matchedContact) {
      fName = matchedContact.firstName || '';
      lName = matchedContact.lastName || '';
    } else {
      // Just extract from email handle
      const namePart = emailToUse.split('@')[0];
      fName = namePart.charAt(0).toUpperCase() + namePart.slice(1);
    }

    const timestampStr = new Date().toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });

    const newThread: MessageThread = {
      id: `thread-${Date.now()}`,
      subject: composeSubject,
      status: 'todo',
      unread: false,
      contact: {
        id: `contact-${Date.now()}`,
        email: emailToUse,
        firstName: fName,
        lastName: lName,
        phoneNumber: matchedContact?.phoneNumber || '',
        company: matchedContact?.company || '',
        tags: [],
        labels: [],
        source: composeSource,
        createdAt: new Date().toISOString(),
        rating: 3
      },
      messages: [
        {
          id: `msg-${Date.now()}`,
          senderName: `${fName} ${lName}`.trim() || emailToUse,
          senderEmail: emailToUse,
          type: 'incoming',
          content: composeMessage,
          timestamp: timestampStr
        }
      ]
    };

    const newThreads = [newThread, ...threads];
    saveThreads(newThreads);
    setSelectedThreadId(newThread.id);
    setIsComposeOpen(false);

    // Reset Form
    setComposeTo('');
    setComposeSubject('');
    setComposeMessage('');
    addToast('Conversation created!', 'success');
    
    // Switch pane on mobile
    setActivePane('detail');
  };

  // Reply Submit
  const handleReplySubmit = () => {
    if (!replyText.trim() || !selectedThread) return;

    const timestampStr = new Date().toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });

    const newMsg = {
      id: `msg-reply-${Date.now()}`,
      senderName: 'You (Agent)',
      senderEmail: 'agent@ratehonk.com',
      type: 'outgoing' as const,
      content: replyText,
      timestamp: timestampStr
    };

    const updated = threads.map(t => {
      if (t.id === selectedThread.id) {
        return {
          ...t,
          messages: [...t.messages, newMsg]
        };
      }
      return t;
    });

    saveThreads(updated);
    setReplyText('');
    setIsReplying(false);
    addToast('Reply sent successfully!', 'success');
  };

  // Add Comment Submit
  const handleCommentSubmit = () => {
    if (!commentText.trim() || !selectedThread) return;

    const timestampStr = new Date().toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });

    const newComment = {
      id: `msg-comment-${Date.now()}`,
      senderName: 'You (Internal Note)',
      senderEmail: 'agent@ratehonk.com',
      type: 'comment' as const,
      content: commentText,
      timestamp: timestampStr
    };

    const updated = threads.map(t => {
      if (t.id === selectedThread.id) {
        return {
          ...t,
          messages: [...t.messages, newComment]
        };
      }
      return t;
    });

    saveThreads(updated);
    setCommentText('');
    setIsCommenting(false);
    addToast('Comment added!', 'success');
  };

  // Toggle Thread Status (Done, Todo, Trash)
  const handleStatusChange = (status: 'todo' | 'done' | 'trash') => {
    if (!selectedThread) return;
    const updated = threads.map(t => {
      if (t.id === selectedThread.id) {
        return { ...t, status };
      }
      return t;
    });
    saveThreads(updated);
    addToast(`Conversation marked as ${status === 'todo' ? 'To Do' : status === 'done' ? 'Done' : 'Trash'}`, 'success');

    // Auto-select next thread in the filtered list if available
    const currentIndex = filteredThreads.findIndex(t => t.id === selectedThread.id);
    let nextSelectedId: string | null = null;
    if (filteredThreads.length > 1) {
      if (currentIndex < filteredThreads.length - 1) {
        nextSelectedId = filteredThreads[currentIndex + 1].id;
      } else {
        nextSelectedId = filteredThreads[currentIndex - 1].id;
      }
    }
    setSelectedThreadId(nextSelectedId);

    // If mobile, go back to list
    if (window.innerWidth < 768) {
      setActivePane('list');
    }
  };

  // Add/Remove label for active thread
  const handleAddLabel = (labelName: string) => {
    if (!selectedThread || !labelName.trim()) return;
    const cleanLabel = labelName.trim();

    const updated = threads.map(t => {
      if (t.id === selectedThread.id) {
        const labels = t.contact.labels.includes(cleanLabel)
          ? t.contact.labels.filter(l => l !== cleanLabel)
          : [...t.contact.labels, cleanLabel];
        return {
          ...t,
          contact: { ...t.contact, labels }
        };
      }
      return t;
    });
    saveThreads(updated);
    setIsLabelPopupOpen(false);
  };

  // Add/Remove tag for active thread
  const handleAddTag = (tagName: string) => {
    if (!selectedThread || !tagName.trim()) return;
    const cleanTag = tagName.trim();

    const updated = threads.map(t => {
      if (t.id === selectedThread.id) {
        const tags = t.contact.tags.includes(cleanTag)
          ? t.contact.tags.filter(t => t !== cleanTag)
          : [...t.contact.tags, cleanTag];
        return {
          ...t,
          contact: { ...t.contact, tags }
        };
      }
      return t;
    });
    saveThreads(updated);
    setIsTagPopupOpen(false);
  };

  // Contact Suggestion Helper for Compose input
  const filteredSuggestions = useMemo(() => {
    if (!composeTo) return [];
    return dbContacts.filter(c => 
      c.email.toLowerCase().includes(composeTo.toLowerCase()) ||
      (c.firstName && c.firstName.toLowerCase().includes(composeTo.toLowerCase())) ||
      (c.lastName && c.lastName.toLowerCase().includes(composeTo.toLowerCase()))
    ).slice(0, 5);
  }, [composeTo, dbContacts]);

  return (
    <div className="fixed inset-0 z-50 bg-white flex flex-col h-screen overflow-hidden">

      {/* Main Inbox Dashboard Frame */}
      <div className="flex flex-1 overflow-hidden">
        
        {/* ========================================================
            COLUMN 1: LEFT SIDEBAR
            ======================================================== */}
        <aside className={`w-64 border-r border-gray-200 flex flex-col bg-white flex-shrink-0 transition-all duration-300
          ${activePane === 'sidebar' ? 'block w-full' : 'hidden md:flex'}`}>
          
          {/* Brand header */}
          <div className="p-4 border-b border-gray-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-[#007c89] flex items-center justify-center text-white">
                <Mail className="w-4 h-4" />
              </div>
              <span className="font-bold text-gray-900 text-lg">Inbox</span>
            </div>
            {/* Mobile close button */}
            <button className="md:hidden p-1 text-gray-500 hover:bg-gray-100 rounded" onClick={() => setActivePane('list')}>
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Action Compose button */}
          <div className="p-4">
            <button 
              onClick={() => setIsComposeOpen(true)}
              className="w-full flex items-center justify-center gap-2 py-2 px-4 rounded-xl border border-gray-300 font-bold text-gray-700 bg-white hover:bg-gray-50 shadow-sm transition-all duration-150 text-sm"
            >
              <Plus className="w-4 h-4 text-gray-500" />
              Compose
            </button>
          </div>

          {/* Nav groups */}
          <div className="flex-1 overflow-y-auto px-2 py-3 space-y-6">
            {/* Sources */}
            <div>
              <div className="px-3 flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1">
                <span>Sources</span>
                <button className="text-[#007c89] hover:underline font-bold text-[10px] capitalize">Manage</button>
              </div>
              <div className="space-y-0.5">
                <button
                  onClick={() => { setSelectedSource('all'); if(window.innerWidth < 768) setActivePane('list'); }}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm flex items-center justify-between font-semibold transition-all
                    ${selectedSource === 'all' ? 'bg-[#f2fafb] text-[#007c89]' : 'text-gray-700 hover:bg-gray-50'}`}
                >
                  <span>All</span>
                  <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full font-bold">
                    {counts.all}
                  </span>
                </button>
                <button
                  onClick={() => { setSelectedSource('email-marketing'); if(window.innerWidth < 768) setActivePane('list'); }}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm flex items-center justify-between font-semibold transition-all
                    ${selectedSource === 'email-marketing' ? 'bg-[#f2fafb] text-[#007c89]' : 'text-gray-700 hover:bg-gray-50'}`}
                >
                  <span className="truncate">Email Marketing Replies</span>
                  <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full font-bold ml-1">
                    {counts.emailMarketing}
                  </span>
                </button>
                <button
                  onClick={() => { setSelectedSource('contact-form'); if(window.innerWidth < 768) setActivePane('list'); }}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm flex items-center justify-between font-semibold transition-all
                    ${selectedSource === 'contact-form' ? 'bg-[#f2fafb] text-[#007c89]' : 'text-gray-700 hover:bg-gray-50'}`}
                >
                  <span className="truncate">Contact Form</span>
                  <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full font-bold ml-1">
                    {counts.contactForm}
                  </span>
                </button>
              </div>
            </div>

            {/* Labels */}
            <div>
              <div className="px-3 flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1">
                <span>Labels</span>
                <button className="text-[#007c89] hover:underline font-bold text-[10px] capitalize">Manage</button>
              </div>
              <div className="space-y-0.5">
                <button
                  onClick={() => { setSelectedLabel(null); if(window.innerWidth < 768) setActivePane('list'); }}
                  className={`w-full text-left px-3 py-1.5 rounded-lg text-sm flex items-center gap-2 font-semibold transition-all
                    ${selectedLabel === null ? 'bg-[#f2fafb] text-[#007c89]' : 'text-gray-700 hover:bg-gray-50'}`}
                >
                  <div className="w-2.5 h-2.5 rounded-full bg-gray-300" />
                  <span>All labels</span>
                </button>
                {allLabels.length === 0 ? (
                  <p className="text-xs text-gray-400 px-3 py-2 italic">No labels</p>
                ) : (
                  allLabels.map(l => (
                    <button
                      key={l}
                      onClick={() => { setSelectedLabel(l); if(window.innerWidth < 768) setActivePane('list'); }}
                      className={`w-full text-left px-3 py-1.5 rounded-lg text-sm flex items-center gap-2 font-semibold transition-all
                        ${selectedLabel === l ? 'bg-[#f2fafb] text-[#007c89]' : 'text-gray-700 hover:bg-gray-50'}`}
                    >
                      <div className="w-2.5 h-2.5 rounded-full bg-[#007c89]" />
                      <span className="truncate">{l}</span>
                    </button>
                  ))
                )}
              </div>
            </div>

            {/* Notification & Templates */}
            <div className="pt-2 border-t border-gray-100 space-y-1">
              <button className="w-full text-left px-3 py-2 rounded-lg text-sm font-semibold text-gray-600 hover:bg-gray-50 flex items-center gap-2">
                <Settings className="w-4 h-4 text-gray-400" />
                Notification Settings
              </button>
              <button className="w-full text-left px-3 py-2 rounded-lg text-sm font-semibold text-gray-600 hover:bg-gray-50 flex items-center gap-2">
                <FileText className="w-4 h-4 text-gray-400" />
                Message Templates
              </button>
            </div>

            {/* Add Source Shortcut */}
            <div>
              <button 
                onClick={() => addToast('Add source integrations coming soon!', 'info')}
                className="w-full text-left px-3 py-2 rounded-lg text-sm font-semibold text-[#007c89] hover:bg-teal-50/50 flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Add source
              </button>
            </div>
          </div>

          {/* Feedback footer */}
          <div className="p-4 border-t border-gray-100 text-xs text-gray-400">
            Have feedback? <a href="#" className="text-[#007c89] hover:underline font-semibold" onClick={(e) => {e.preventDefault(); addToast('Feedback form coming soon!', 'info');}}>Let us know.</a>
          </div>
        </aside>

        {/* ========================================================
            COLUMN 2: MIDDLE MESSAGE LIST
            ======================================================== */}
        <section className={`w-80 border-r border-gray-200 flex flex-col bg-gray-50/50 flex-shrink-0 transition-all duration-300
          ${activePane === 'list' ? 'block w-full' : (activePane === 'sidebar' || activePane === 'detail') ? 'hidden md:flex' : 'hidden md:flex'}`}>
          
          {/* Header search bar */}
          <div className="p-4 bg-white border-b border-gray-200 flex flex-col gap-3">
            <div className="flex items-center gap-2 md:hidden">
              <button className="p-1.5 text-gray-500 hover:bg-gray-100 rounded" onClick={() => setActivePane('sidebar')}>
                <Settings className="w-5 h-5" />
              </button>
              <span className="font-bold text-gray-900">Conversations</span>
            </div>
            
            <div className="relative">
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search for a message"
                className="w-full bg-gray-50 border border-gray-300 rounded-lg pl-9 pr-4 py-2 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#007c89]/50 focus:border-[#007c89] transition-all"
              />
            </div>
          </div>

          {/* Status Tabs */}
          <div className="flex border-b border-gray-200 bg-white text-xs font-bold text-gray-500">
            <button
              onClick={() => setActiveTab('todo')}
              className={`flex-1 py-2.5 border-b-2 text-center transition-all ${activeTab === 'todo' ? 'border-[#007c89] text-[#007c89]' : 'border-transparent hover:text-gray-800'}`}
            >
              To Do {counts.todo > 0 && <span className="bg-gray-100 px-1.5 py-0.5 rounded-full ml-1 text-[10px] text-gray-600">{counts.todo}</span>}
            </button>
            <button
              onClick={() => setActiveTab('done')}
              className={`flex-1 py-2.5 border-b-2 text-center transition-all ${activeTab === 'done' ? 'border-[#007c89] text-[#007c89]' : 'border-transparent hover:text-gray-800'}`}
            >
              Done
            </button>
            <button
              onClick={() => setActiveTab('trash')}
              className={`flex-1 py-2.5 border-b-2 text-center transition-all ${activeTab === 'trash' ? 'border-[#007c89] text-[#007c89]' : 'border-transparent hover:text-gray-800'}`}
            >
              Trash
            </button>
            <button
              onClick={() => setActiveTab('all')}
              className={`flex-1 py-2.5 border-b-2 text-center transition-all ${activeTab === 'all' ? 'border-[#007c89] text-[#007c89]' : 'border-transparent hover:text-gray-800'}`}
            >
              All
            </button>
          </div>

          {/* Scrollable list */}
          <div className="flex-1 overflow-y-auto divide-y divide-gray-200">
            {filteredThreads.length === 0 ? (
              <div className="p-8 text-center text-gray-400 text-sm flex flex-col items-center justify-center gap-3 h-64">
                <Mail className="w-8 h-8 text-gray-300" />
                <p>No messages found</p>
              </div>
            ) : (
              filteredThreads.map(t => {
                const isSelected = t.id === selectedThreadId;
                const contactName = `${t.contact.firstName || ''} ${t.contact.lastName || ''}`.trim() || t.contact.email;
                const latestMsg = t.messages[t.messages.length - 1];
                const displayDate = latestMsg ? latestMsg.timestamp.split(' ').slice(1, 3).join(' ') : '';
                
                return (
                  <div
                    key={t.id}
                    onClick={() => {
                      setSelectedThreadId(t.id);
                      setActivePane('detail');
                    }}
                    className={`p-4 cursor-pointer relative transition-all duration-150 ${
                      isSelected 
                        ? 'bg-[#007c89] text-white shadow-sm' 
                        : 'bg-white text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    {/* Unread circle badge */}
                    {t.unread && (
                      <div className="absolute left-1.5 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-sky-400" />
                    )}

                    <div className="flex items-center justify-between mb-1.5">
                      <span className={`font-bold truncate text-sm ${isSelected ? 'text-white' : 'text-gray-900'}`}>
                        {contactName}
                      </span>
                      <span className={`text-[10px] flex-shrink-0 font-medium ${isSelected ? 'text-teal-100' : 'text-gray-400'}`}>
                        {t.messages[t.messages.length - 1]?.timestamp.split(' ')[1] || ''}
                      </span>
                    </div>

                    <div className="flex items-center justify-between mb-1">
                      <span className={`text-xs truncate max-w-[200px] ${isSelected ? 'text-teal-50' : 'text-gray-500'}`}>
                        {t.contact.email}
                      </span>
                      {t.contact.source === 'contact-form' ? (
                        <FileText className={`w-3.5 h-3.5 ${isSelected ? 'text-teal-200' : 'text-gray-400'}`} />
                      ) : (
                        <Mail className={`w-3.5 h-3.5 ${isSelected ? 'text-teal-200' : 'text-gray-400'}`} />
                      )}
                    </div>

                    <h4 className={`text-xs font-bold truncate mb-1 ${isSelected ? 'text-white' : 'text-gray-800'}`}>
                      {t.subject}
                    </h4>

                    <p className={`text-xs line-clamp-2 leading-relaxed ${isSelected ? 'text-teal-100' : 'text-gray-400'}`}>
                      "{latestMsg?.content}"
                    </p>

                    {/* Labels representation */}
                    {t.contact.labels.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1">
                        {t.contact.labels.map(l => (
                          <span 
                            key={l}
                            className={`text-[9px] px-1.5 py-0.5 rounded font-bold uppercase tracking-wider ${
                              isSelected ? 'bg-teal-700/60 text-white' : 'bg-gray-100 text-gray-500'
                            }`}
                          >
                            {l}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </section>

        {/* ========================================================
            COLUMN 3: RIGHT DETAIL PANE
            ======================================================== */}
        <section className={`flex-1 flex flex-col bg-white min-w-0 transition-all duration-300
          ${activePane === 'detail' ? 'block w-full' : 'hidden md:flex'}`}>
          
          {selectedThread ? (
            <div className="flex-1 flex flex-col h-full relative">
              
              {/* Thread Header details */}
              <div className="p-4 border-b border-gray-200 flex items-center justify-between bg-white flex-shrink-0">
                <div className="flex items-center gap-3 min-w-0">
                  {/* Back button (Mobile only) */}
                  <button className="md:hidden p-1.5 text-gray-500 hover:bg-gray-100 rounded mr-1" onClick={() => setActivePane('list')}>
                    <ChevronLeft className="w-5 h-5" />
                  </button>

                  {/* Profile Avatar circle */}
                  <div className="w-10 h-10 rounded-full bg-[#007c89]/10 text-[#007c89] flex items-center justify-center font-bold text-base flex-shrink-0">
                    {selectedThread.contact.firstName?.charAt(0) || selectedThread.contact.email.charAt(0).toUpperCase()}
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-gray-900 truncate">
                        {`${selectedThread.contact.firstName || ''} ${selectedThread.contact.lastName || ''}`.trim() || 'No Name'}
                      </span>
                      <a 
                        href={`mailto:${selectedThread.contact.email}`} 
                        className="text-xs text-gray-400 hover:underline truncate"
                      >
                        {selectedThread.contact.email}
                      </a>
                    </div>
                    {/* Source label */}
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-gray-100 text-gray-500 font-bold uppercase tracking-wider">
                        {selectedThread.contact.source === 'email-marketing' ? 'Email Campaign Reply' : 'Contact Form Inquiry'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right side actions */}
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setIsProfileOpen(true)}
                    className="flex items-center gap-1.5 py-1.5 px-3 rounded-lg border border-gray-200 text-xs font-bold text-gray-700 bg-white hover:bg-gray-50 transition-all shadow-sm"
                  >
                    <User className="w-3.5 h-3.5 text-gray-500" />
                    <span className="hidden sm:inline">View Profile</span>
                  </button>
                  <button
                    onClick={() => setIsTagPopupOpen(true)}
                    className="flex items-center gap-1.5 py-1.5 px-3 rounded-lg border border-gray-200 text-xs font-bold text-gray-700 bg-white hover:bg-gray-50 transition-all shadow-sm"
                  >
                    <Plus className="w-3.5 h-3.5 text-gray-500" />
                    <Tag className="w-3.5 h-3.5 text-gray-500" />
                    <span className="hidden sm:inline">Tag Contact</span>
                  </button>
                  {selectedThread.status !== 'trash' ? (
                    <button
                      onClick={() => handleStatusChange('trash')}
                      className="p-1.5 rounded-lg border border-gray-200 text-gray-500 bg-white hover:bg-red-50 hover:text-red-600 hover:border-red-100 transition-all shadow-sm"
                      title="Move to Trash"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  ) : (
                    <button
                      onClick={() => handleStatusChange('todo')}
                      className="p-1.5 rounded-lg border border-gray-200 text-gray-500 bg-white hover:bg-sky-50 hover:text-[#007c89] hover:border-sky-100 transition-all shadow-sm"
                      title="Restore to To Do"
                    >
                      <Archive className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>

              {/* Thread Subject area */}
              <div className="px-6 py-4 border-b border-gray-100 bg-white flex-shrink-0">
                <h2 className="text-xl font-bold text-gray-900 leading-tight mb-2">
                  {selectedThread.subject}
                </h2>
                
                {/* Labels applied list */}
                <div className="flex items-center flex-wrap gap-2">
                  {selectedThread.contact.labels.map(l => (
                    <span 
                      key={l} 
                      className="text-[10px] px-2 py-0.5 rounded-full bg-teal-50 border border-teal-200 text-[#007c89] font-bold uppercase tracking-wider flex items-center gap-1"
                    >
                      {l}
                      <button 
                        onClick={() => handleAddLabel(l)}
                        className="hover:bg-teal-100/80 rounded-full p-0.5 text-teal-600 transition-all"
                      >
                        <X className="w-2.5 h-2.5" />
                      </button>
                    </span>
                  ))}
                  <button
                    onClick={() => setIsLabelPopupOpen(true)}
                    className="text-[10px] py-0.5 px-2 rounded-full border border-dashed border-gray-300 text-gray-500 hover:border-[#007c89] hover:text-[#007c89] font-semibold flex items-center gap-1 transition-all"
                  >
                    <Plus className="w-3 h-3" />
                    Label
                  </button>
                </div>
              </div>

              {/* Message scroll stream */}
              <div className="flex-1 overflow-y-auto p-6 bg-gray-50/50 space-y-6 pb-24">
                {selectedThread.messages.map((m) => {
                  if (m.type === 'comment') {
                    // Internal Note styled box
                    return (
                      <div key={m.id} className="max-w-3xl mx-auto bg-yellow-50 border border-yellow-200 rounded-xl p-4 shadow-sm text-yellow-800">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full bg-yellow-100 text-yellow-700 flex items-center justify-center font-bold text-xs">
                              N
                            </div>
                            <span className="font-bold text-xs text-yellow-900">{m.senderName}</span>
                            <span className="text-[10px] text-yellow-600 font-bold uppercase tracking-wide px-1.5 py-0.5 rounded bg-yellow-200/50">Internal Comment</span>
                          </div>
                          <span className="text-[10px] text-yellow-600 font-medium">{m.timestamp}</span>
                        </div>
                        <p className="text-sm whitespace-pre-wrap leading-relaxed text-yellow-900">
                          {m.content}
                        </p>
                      </div>
                    );
                  }

                  const isOutgoing = m.type === 'outgoing';
                  return (
                    <div key={m.id} className="max-w-3xl mx-auto flex gap-3 items-start">
                      {/* Left side profile initial badge (only if incoming) */}
                      {!isOutgoing && (
                        <div className="w-8 h-8 rounded-full bg-[#007c89]/10 text-[#007c89] flex items-center justify-center font-bold text-xs flex-shrink-0 shadow-sm">
                          {m.senderName.charAt(0)}
                        </div>
                      )}

                      {/* Message bubble card */}
                      <div className={`flex-1 bg-white rounded-2xl border border-gray-200 p-5 shadow-sm min-w-0 ${
                        isOutgoing ? 'border-sky-100 bg-sky-50/30' : ''
                      }`}>
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-xs text-gray-900">{m.senderName}</span>
                            {isOutgoing && (
                              <span className="text-[10px] text-sky-600 font-bold uppercase tracking-wide">
                                (replied)
                              </span>
                            )}
                          </div>
                          <span className="text-[10px] text-gray-400 font-medium">{m.timestamp}</span>
                        </div>

                        <p className="text-sm whitespace-pre-wrap leading-relaxed text-gray-700">
                          {m.content}
                        </p>
                      </div>

                      {/* Right side profile initial (only if outgoing) */}
                      {isOutgoing && (
                        <div className="w-8 h-8 rounded-full bg-sky-100 text-sky-600 flex items-center justify-center font-bold text-xs flex-shrink-0 shadow-sm">
                          Y
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Bottom Sticky Action box */}
              <div className="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 flex flex-col gap-4 shadow-[0_-4px_12px_rgba(0,0,0,0.02)] flex-shrink-0 z-10">
                {isReplying ? (
                  // Inline Reply input text area
                  <div className="bg-gray-50 border border-gray-200 rounded-xl p-3 flex flex-col gap-2">
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>Replying to <strong>{selectedThread.contact.email}</strong></span>
                      <button onClick={() => setIsReplying(false)} className="text-gray-400 hover:text-gray-600">
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                    <textarea
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      placeholder="Write your email reply..."
                      className="w-full min-h-[100px] bg-transparent resize-y text-sm text-gray-700 placeholder-gray-400 focus:outline-none"
                    />
                    <div className="flex justify-end gap-2">
                      <button 
                        onClick={() => setIsReplying(false)}
                        className="py-1.5 px-3 rounded-lg border border-gray-200 text-xs font-bold text-gray-600 bg-white hover:bg-gray-50 transition-all"
                      >
                        Cancel
                      </button>
                      <button 
                        onClick={handleReplySubmit}
                        className="py-1.5 px-3 rounded-lg text-xs font-bold text-white bg-[#007c89] hover:bg-[#006570] transition-all flex items-center gap-1.5 shadow-sm"
                      >
                        <Send className="w-3 h-3" />
                        Send Reply
                      </button>
                    </div>
                  </div>
                ) : isCommenting ? (
                  // Inline Comment input text area
                  <div className="bg-yellow-50/50 border border-yellow-200 rounded-xl p-3 flex flex-col gap-2">
                    <div className="flex items-center justify-between text-xs text-yellow-800">
                      <span>Add internal comment (note visible only to agents)</span>
                      <button onClick={() => setIsCommenting(false)} className="text-yellow-600 hover:text-yellow-800">
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                    <textarea
                      value={commentText}
                      onChange={(e) => setCommentText(e.target.value)}
                      placeholder="Write internal note..."
                      className="w-full min-h-[100px] bg-transparent resize-y text-sm text-yellow-900 placeholder-yellow-600/60 focus:outline-none"
                    />
                    <div className="flex justify-end gap-2">
                      <button 
                        onClick={() => setIsCommenting(false)}
                        className="py-1.5 px-3 rounded-lg border border-yellow-200 text-xs font-bold text-yellow-700 bg-white hover:bg-yellow-100/50 transition-all"
                      >
                        Cancel
                      </button>
                      <button 
                        onClick={handleCommentSubmit}
                        className="py-1.5 px-3 rounded-lg text-xs font-bold text-white bg-yellow-600 hover:bg-yellow-700 transition-all flex items-center gap-1.5 shadow-sm"
                      >
                        <CornerDownLeft className="w-3 h-3" />
                        Save Comment
                      </button>
                    </div>
                  </div>
                ) : (
                  // Standard bottom actions
                  <div className="flex items-center gap-2">
                    {selectedThread.status !== 'done' && (
                      <button
                        onClick={() => handleStatusChange('done')}
                        className="py-2 px-4 rounded-xl border border-gray-200 text-sm font-bold text-gray-700 bg-white hover:bg-green-50 hover:text-green-600 hover:border-green-100 flex items-center gap-1.5 shadow-sm transition-all"
                      >
                        <CheckCircle2 className="w-4 h-4 text-green-500" />
                        Mark as Done
                      </button>
                    )}
                    {selectedThread.status === 'done' && (
                      <button
                        onClick={() => handleStatusChange('todo')}
                        className="py-2 px-4 rounded-xl border border-gray-200 text-sm font-bold text-gray-700 bg-white hover:bg-sky-50 hover:text-[#007c89] hover:border-sky-100 flex items-center gap-1.5 shadow-sm transition-all"
                      >
                        <Archive className="w-4 h-4 text-sky-500" />
                        Mark as To Do
                      </button>
                    )}
                    <button
                      onClick={() => setIsReplying(true)}
                      className="py-2 px-4 rounded-xl text-sm font-bold text-white bg-[#007c89] hover:bg-[#006570] flex items-center gap-1.5 shadow-sm transition-all ml-auto"
                    >
                      <CornerDownLeft className="w-4 h-4" />
                      Reply
                    </button>
                    <button
                      onClick={() => setIsCommenting(true)}
                      className="py-2 px-4 rounded-xl border border-gray-200 text-sm font-bold text-gray-700 bg-white hover:bg-gray-50 flex items-center gap-1.5 shadow-sm transition-all"
                    >
                      <MessageSquare className="w-4 h-4 text-gray-500" />
                      Add Comment
                    </button>
                  </div>
                )}
              </div>

            </div>
          ) : (
            // Empty view
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-gray-400 gap-3 h-full">
              <Mail className="w-12 h-12 text-gray-200" />
              <p className="text-base font-medium">Select a conversation to start reading</p>
            </div>
          )}
        </section>
      </div>

      {/* ========================================================
          MODAL: COMPOSE NEW EMAIL
          ======================================================== */}
      {isComposeOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl border border-gray-200 shadow-xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="p-4 border-b border-gray-200 flex items-center justify-between bg-white">
              <h3 className="font-bold text-gray-900 text-lg flex items-center gap-2">
                <Mail className="w-5 h-5 text-[#007c89]" />
                New Conversation (Simulation)
              </h3>
              <button onClick={() => setIsComposeOpen(false)} className="p-1 text-gray-500 hover:bg-gray-100 rounded">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleComposeSubmit} className="p-6 flex-1 overflow-y-auto space-y-4">
              {/* Recipient Input with suggestions autocomplete */}
              <div className="relative">
                <label className="block text-xs font-semibold text-gray-500 uppercase mb-1.5">To (Email)</label>
                <input
                  type="email"
                  value={composeTo}
                  onChange={(e) => {
                    setComposeTo(e.target.value);
                    setShowComposeSuggestions(true);
                  }}
                  onFocus={() => setShowComposeSuggestions(true)}
                  placeholder="recipient@example.com"
                  className="w-full bg-gray-50 border border-gray-300 rounded-lg px-4 py-2.5 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#007c89]/50 focus:border-[#007c89] transition-all"
                  required
                />
                
                {/* Suggestions popup list */}
                {showComposeSuggestions && filteredSuggestions.length > 0 && (
                  <div className="absolute left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-lg z-50 py-1 text-xs">
                    <p className="px-3 py-1.5 text-[10px] text-gray-400 font-bold uppercase">Workspace Contacts</p>
                    {filteredSuggestions.map(c => (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => {
                          setComposeTo(c.email);
                          setShowComposeSuggestions(false);
                        }}
                        className="w-full text-left px-3 py-2 hover:bg-gray-50 flex flex-col"
                      >
                        <span className="font-bold text-gray-800">
                          {c.firstName || c.lastName ? `${c.firstName || ''} ${c.lastName || ''}`.trim() : 'Unnamed Contact'}
                        </span>
                        <span className="text-gray-400">{c.email}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Subject */}
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase mb-1.5">Subject</label>
                <input
                  type="text"
                  value={composeSubject}
                  onChange={(e) => setComposeSubject(e.target.value)}
                  placeholder="Subject line"
                  className="w-full bg-gray-50 border border-gray-300 rounded-lg px-4 py-2.5 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#007c89]/50 focus:border-[#007c89] transition-all"
                  required
                />
              </div>

              {/* Source Select */}
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase mb-1.5">Simulation Source</label>
                <select
                  value={composeSource}
                  onChange={(e) => setComposeSource(e.target.value as 'email-marketing' | 'contact-form')}
                  className="w-full bg-gray-50 border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#007c89]/50 focus:border-[#007c89] transition-all"
                >
                  <option value="email-marketing">Email Marketing Reply</option>
                  <option value="contact-form">Contact Form Submission</option>
                </select>
              </div>

              {/* Message */}
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase mb-1.5">Message</label>
                <textarea
                  value={composeMessage}
                  onChange={(e) => setComposeMessage(e.target.value)}
                  placeholder="Type the message body here..."
                  className="w-full min-h-[120px] bg-gray-50 border border-gray-300 rounded-lg px-4 py-2.5 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#007c89]/50 focus:border-[#007c89] transition-all"
                  required
                />
              </div>

              {/* Buttons */}
              <div className="pt-4 border-t border-gray-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsComposeOpen(false)}
                  className="py-2 px-4 rounded-xl border border-gray-200 text-sm font-bold text-gray-700 bg-white hover:bg-gray-50 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="py-2 px-4 rounded-xl text-sm font-bold text-white bg-[#007c89] hover:bg-[#006570] transition-all flex items-center gap-1.5 shadow-sm"
                >
                  <Send className="w-4 h-4" />
                  Create Thread
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================
          SIDE-SHEET DRAWER: VIEW PROFILE
          ======================================================== */}
      {isProfileOpen && selectedThread && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/30 animate-in fade-in duration-200">
          {/* Backdrop close target */}
          <div className="absolute inset-0" onClick={() => setIsProfileOpen(false)} />
          
          <div className="relative bg-white w-full max-w-md h-full shadow-2xl border-l border-gray-200 flex flex-col z-10 animate-in slide-in-from-right duration-300">
            {/* Drawer Header */}
            <div className="p-4 border-b border-gray-200 flex items-center justify-between bg-white">
              <h3 className="font-bold text-gray-900 text-lg flex items-center gap-2">
                <User className="w-5 h-5 text-[#007c89]" />
                Contact Profile
              </h3>
              <button onClick={() => setIsProfileOpen(false)} className="p-1.5 text-gray-500 hover:bg-gray-100 rounded">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Profile Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* User big avatar card */}
              <div className="flex flex-col items-center text-center p-4 bg-gray-50 rounded-2xl border border-gray-100">
                <div className="w-20 h-20 rounded-full bg-[#007c89]/10 text-[#007c89] flex items-center justify-center font-bold text-3xl mb-3 shadow-inner">
                  {selectedThread.contact.firstName?.charAt(0) || selectedThread.contact.email.charAt(0).toUpperCase()}
                </div>
                <h4 className="font-bold text-gray-900 text-lg">
                  {`${selectedThread.contact.firstName || ''} ${selectedThread.contact.lastName || ''}`.trim() || 'No Name'}
                </h4>
                <p className="text-sm text-gray-400">{selectedThread.contact.email}</p>
                <div className="mt-2 flex items-center gap-1.5">
                  <span className="text-[10px] bg-green-50 border border-green-200 text-green-700 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
                    Active Subscriber
                  </span>
                </div>
              </div>

              {/* Basic Fields */}
              <div className="space-y-4">
                <h5 className="text-xs font-semibold text-gray-400 uppercase tracking-wider border-b border-gray-100 pb-1">Details</h5>
                
                <div className="grid grid-cols-3 text-sm">
                  <span className="text-gray-400 font-semibold">Phone:</span>
                  <span className="col-span-2 text-gray-700 font-medium">
                    {selectedThread.contact.phoneNumber || <span className="text-gray-300 italic">None</span>}
                  </span>
                </div>
                
                <div className="grid grid-cols-3 text-sm">
                  <span className="text-gray-400 font-semibold">Company:</span>
                  <span className="col-span-2 text-gray-700 font-medium">
                    {selectedThread.contact.company || <span className="text-gray-300 italic">None</span>}
                  </span>
                </div>
                
                <div className="grid grid-cols-3 text-sm">
                  <span className="text-gray-400 font-semibold">Channel:</span>
                  <span className="col-span-2 text-gray-700 font-medium capitalize">
                    {selectedThread.contact.source.replace('-', ' ')}
                  </span>
                </div>

                <div className="grid grid-cols-3 text-sm">
                  <span className="text-gray-400 font-semibold">Added:</span>
                  <span className="col-span-2 text-gray-700 font-medium">
                    {new Date(selectedThread.contact.createdAt).toLocaleDateString()}
                  </span>
                </div>

                <div className="grid grid-cols-3 text-sm">
                  <span className="text-gray-400 font-semibold">Rating:</span>
                  <span className="col-span-2 text-yellow-500 font-medium flex gap-0.5">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <span key={i} className={i < selectedThread.contact.rating ? 'opacity-100' : 'opacity-25'}>★</span>
                    ))}
                  </span>
                </div>
              </div>

              {/* Tags Section */}
              <div className="space-y-3">
                <div className="flex items-center justify-between border-b border-gray-100 pb-1">
                  <h5 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Tags</h5>
                  <button 
                    onClick={() => setIsTagPopupOpen(true)}
                    className="text-[#007c89] hover:underline font-bold text-xs flex items-center gap-0.5"
                  >
                    <Plus className="w-3 h-3" /> Edit
                  </button>
                </div>
                {selectedThread.contact.tags.length === 0 ? (
                  <p className="text-xs text-gray-400 italic">No tags assigned</p>
                ) : (
                  <div className="flex flex-wrap gap-1.5">
                    {selectedThread.contact.tags.map(t => (
                      <span 
                        key={t}
                        className="text-xs px-2.5 py-1 bg-gray-100 rounded-lg text-gray-600 font-bold"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Labels Section */}
              <div className="space-y-3">
                <div className="flex items-center justify-between border-b border-gray-100 pb-1">
                  <h5 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Labels</h5>
                  <button 
                    onClick={() => setIsLabelPopupOpen(true)}
                    className="text-[#007c89] hover:underline font-bold text-xs flex items-center gap-0.5"
                  >
                    <Plus className="w-3 h-3" /> Edit
                  </button>
                </div>
                {selectedThread.contact.labels.length === 0 ? (
                  <p className="text-xs text-gray-400 italic">No labels applied</p>
                ) : (
                  <div className="flex flex-wrap gap-1.5">
                    {selectedThread.contact.labels.map(l => (
                      <span 
                        key={l}
                        className="text-xs px-2.5 py-1 bg-teal-50 border border-teal-200 text-[#007c89] font-bold rounded-lg"
                      >
                        {l}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          POPUP: TAG CONTACT MODAL
          ======================================================== */}
      {isTagPopupOpen && selectedThread && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl border border-gray-200 shadow-xl w-full max-w-sm overflow-hidden">
            <div className="p-4 border-b border-gray-200 flex items-center justify-between">
              <h3 className="font-bold text-gray-900 text-base">Tag Contact</h3>
              <button onClick={() => setIsTagPopupOpen(false)} className="p-1 text-gray-500 hover:bg-gray-100 rounded">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-5 space-y-4">
              <p className="text-xs text-gray-400">Select standard tags to assign to this contact:</p>
              
              {/* Popular tags selection */}
              <div className="flex flex-wrap gap-2">
                {['VIP', 'Hot Lead', 'Customer', 'Prospect', 'Enterprise', 'Partner'].map(tag => {
                  const hasTag = selectedThread.contact.tags.includes(tag);
                  return (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => handleAddTag(tag)}
                      className={`text-xs px-3 py-1.5 rounded-xl border transition-all flex items-center gap-1 font-bold ${
                        hasTag 
                          ? 'bg-[#007c89] border-[#007c89] text-white' 
                          : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      {tag}
                      {hasTag && <Check className="w-3 h-3" />}
                    </button>
                  );
                })}
              </div>

              {/* Custom input entry */}
              <div className="pt-4 border-t border-gray-100 flex gap-2">
                <input
                  type="text"
                  placeholder="Create custom tag..."
                  id="customTagInput"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleAddTag((e.target as HTMLInputElement).value);
                      (e.target as HTMLInputElement).value = '';
                    }
                  }}
                  className="flex-1 bg-gray-50 border border-gray-300 rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-[#007c89]/50"
                />
                <button
                  onClick={() => {
                    const el = document.getElementById('customTagInput') as HTMLInputElement;
                    if (el && el.value.trim()) {
                      handleAddTag(el.value);
                      el.value = '';
                    }
                  }}
                  className="py-1.5 px-3 rounded-lg text-xs font-bold text-white bg-[#007c89] hover:bg-[#006570]"
                >
                  Add
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          POPUP: LABEL CONVERSATION MODAL
          ======================================================== */}
      {isLabelPopupOpen && selectedThread && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl border border-gray-200 shadow-xl w-full max-w-sm overflow-hidden">
            <div className="p-4 border-b border-gray-200 flex items-center justify-between">
              <h3 className="font-bold text-gray-900 text-base">Add Label</h3>
              <button onClick={() => setIsLabelPopupOpen(false)} className="p-1 text-gray-500 hover:bg-gray-100 rounded">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-5 space-y-4">
              <p className="text-xs text-gray-400">Select conversation classification labels:</p>
              
              {/* Popular labels list */}
              <div className="flex flex-wrap gap-2">
                {['Urgent', 'Billing', 'Sales', 'Feedback', 'Support', 'Tech Issue'].map(lbl => {
                  const hasLbl = selectedThread.contact.labels.includes(lbl);
                  return (
                    <button
                      key={lbl}
                      type="button"
                      onClick={() => handleAddLabel(lbl)}
                      className={`text-xs px-3 py-1.5 rounded-xl border transition-all flex items-center gap-1 font-bold ${
                        hasLbl 
                          ? 'bg-[#007c89] border-[#007c89] text-white shadow-sm' 
                          : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      {lbl}
                      {hasLbl && <Check className="w-3 h-3" />}
                    </button>
                  );
                })}
              </div>

              {/* Custom input entry */}
              <div className="pt-4 border-t border-gray-100 flex gap-2">
                <input
                  type="text"
                  placeholder="Create custom label..."
                  id="customLabelInput"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleAddLabel((e.target as HTMLInputElement).value);
                      (e.target as HTMLInputElement).value = '';
                    }
                  }}
                  className="flex-1 bg-gray-50 border border-gray-300 rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-[#007c89]/50"
                />
                <button
                  onClick={() => {
                    const el = document.getElementById('customLabelInput') as HTMLInputElement;
                    if (el && el.value.trim()) {
                      handleAddLabel(el.value);
                      el.value = '';
                    }
                  }}
                  className="py-1.5 px-3 rounded-lg text-xs font-bold text-white bg-[#007c89] hover:bg-[#006570]"
                >
                  Add
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
