"use client";

import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, Send, Trash2, Sparkles, User, Bot } from 'lucide-react';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface ChatPanelProps {
  messages: ChatMessage[];
  isGenerating: boolean;
  onSendMessage: (text: string) => void;
  onClearChat: () => void;
}

const STARTER_PROMPTS = [
  "Create a welcome email for new users with a blue theme",
  "Design a summer sale promo email with discount codes",
  "Draft a product update newsletter with clean visual headers"
];

export default function ChatPanel({
  messages,
  isGenerating,
  onSendMessage,
  onClearChat
}: ChatPanelProps) {
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto scroll to bottom when new messages or typing starts
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isGenerating]);

  const handleSend = () => {
    if (!input.trim() || isGenerating) return;
    onSendMessage(input.trim());
    setInput('');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="bg-white border border-border rounded-xl shadow-sm flex flex-col h-[650px] overflow-hidden">
      {/* Panel Header */}
      <div className="px-6 py-4 border-b border-border flex items-center justify-between bg-gray-50/50">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-lg bg-main-dim flex items-center justify-center text-main">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-text">AI Assistant</h3>
            <p className="text-xs text-text-dim">Describe the email you want to create.</p>
          </div>
        </div>
        
        {messages.length > 0 && (
          <button
            onClick={onClearChat}
            className="flex items-center gap-1 text-xs font-semibold text-text-dim hover:text-red-500 transition-colors py-1.5 px-2 rounded-md hover:bg-red-50"
            title="Clear conversation"
          >
            <Trash2 className="w-3.5 h-3.5" /> Clear
          </button>
        )}
      </div>

      {/* Conversation Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-thin">
        {messages.length === 0 ? (
          /* Empty State */
          <div className="h-full flex flex-col items-center justify-center text-center p-4">
            <div className="w-12 h-12 rounded-full bg-main-dim flex items-center justify-center text-main mb-4 animate-pulse">
              <Sparkles className="w-6 h-6" />
            </div>
            <h4 className="text-sm font-bold text-text mb-2">Start by describing your email</h4>
            <p className="text-xs text-text-dim max-w-xs mb-6">
              Tell the assistant what kind of campaign you want. E.g., target audience, key message, styles, or specific themes.
            </p>
            
            {/* Quick Starters */}
            <div className="w-full max-w-sm space-y-2">
              <p className="text-[10px] font-bold text-text-dim uppercase tracking-wider text-left mb-1.5 pl-1">
                Suggested templates
              </p>
              {STARTER_PROMPTS.map((prompt, index) => (
                <button
                  key={index}
                  onClick={() => setInput(prompt)}
                  className="w-full text-left p-3 text-xs bg-gray-50 border border-border hover:border-main hover:bg-main-dim/20 rounded-lg text-text font-medium transition-all duration-200"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        ) : (
          /* Message List */
          <div className="flex flex-col space-y-4">
            {messages.map((message) => {
              const isUser = message.role === 'user';
              return (
                <div
                  key={message.id}
                  className={`flex items-start gap-3 max-w-[85%] ${isUser ? 'self-end flex-row-reverse' : 'self-start'}`}
                >
                  {/* Avatar Icon */}
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                    isUser ? 'bg-main text-white shadow-sm shadow-sky-500/10' : 'bg-gray-100 text-text-dim border border-border'
                  }`}>
                    {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                  </div>

                  {/* Bubble Container */}
                  <div className={`rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                    isUser 
                      ? 'bg-main text-white rounded-tr-none shadow-md shadow-sky-500/5' 
                      : 'bg-gray-100 text-text rounded-tl-none border border-border/50'
                  }`}>
                    <p className="whitespace-pre-wrap">{message.content}</p>
                  </div>
                </div>
              );
            })}

            {/* Simulated Loading/Typing State */}
            {isGenerating && (
              <div className="flex items-start gap-3 max-w-[85%] self-start">
                <div className="w-8 h-8 rounded-full bg-gray-100 text-text-dim border border-border flex items-center justify-center text-xs font-bold flex-shrink-0">
                  <Bot className="w-4 h-4" />
                </div>
                <div className="rounded-2xl rounded-tl-none bg-gray-100 border border-border/50 px-4 py-3 flex items-center space-x-1">
                  <div className="w-2 h-2 bg-text-dim/60 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                  <div className="w-2 h-2 bg-text-dim/60 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                  <div className="w-2 h-2 bg-text-dim/60 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="p-4 border-t border-border bg-gray-50/50 flex flex-col gap-3">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Example: Create a modern welcome email for new users with a blue theme..."
          className="w-full h-20 p-3 bg-white border border-border rounded-lg text-sm text-text placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-sky-500/50 resize-none transition-all"
          disabled={isGenerating}
        />
        
        <div className="flex justify-between items-center">
          <span className="text-[11px] text-text-dim">
            Press <kbd className="px-1 py-0.5 bg-gray-100 border border-border rounded text-xs font-mono">Enter</kbd> to send, <kbd className="px-1 py-0.5 bg-gray-100 border border-border rounded text-xs font-mono">Shift + Enter</kbd> for new line.
          </span>
          
          <button
            onClick={handleSend}
            disabled={!input.trim() || isGenerating}
            className={`flex items-center gap-1.5 px-4 py-2 text-sm font-semibold rounded-lg text-white shadow-sm transition-all ${
              !input.trim() || isGenerating
                ? 'bg-gray-300 cursor-not-allowed shadow-none'
                : 'bg-main hover:bg-sky-600 hover:shadow-md hover:shadow-sky-500/10'
            }`}
          >
            <Send className="w-4 h-4" /> Send
          </button>
        </div>
      </div>
    </div>
  );
}
