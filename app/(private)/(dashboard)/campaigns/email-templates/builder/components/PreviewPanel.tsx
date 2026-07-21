"use client";

import React, { useState } from 'react';
import { Monitor, Smartphone, Sparkles, AlertCircle, RefreshCw, Save, Code } from 'lucide-react';

interface PreviewPanelProps {
  hasTemplate: boolean;
  isGenerating: boolean;
  device: 'desktop' | 'mobile';
  onDeviceChange: (device: 'desktop' | 'mobile') => void;
  onSaveTemplate: () => void;
  onRegenerate: () => void;
  lastPrompt: string;
  htmlContent: string | null;
}

export default function PreviewPanel({
  hasTemplate,
  isGenerating,
  device,
  onDeviceChange,
  onSaveTemplate,
  onRegenerate,
  lastPrompt,
  htmlContent
}: PreviewPanelProps) {

  // Detect whether the rendering failed (i.e. template exists but HTML content is empty)
  const isRenderFailed = hasTemplate && !isGenerating && !htmlContent;
  const [viewMode, setViewMode] = useState<'preview' | 'code'>('preview');

  return (
    <div className="bg-white border border-border rounded-xl shadow-sm flex flex-col h-full min-h-0 overflow-hidden">
      {/* Panel Header & Device Toggle */}
      <div className="px-6 py-3 border-b border-border flex items-center justify-between bg-gray-50/50">
        <h3 className="text-base font-bold text-text">Live Preview</h3>

        {/* View & Device Switchers */}
        <div className="flex items-center gap-4">
          {viewMode === 'preview' && (
            <div className="flex items-center bg-white border border-border rounded-lg p-0.5 shadow-sm">
              <button
                onClick={() => onDeviceChange('desktop')}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${device === 'desktop'
                    ? 'bg-main-dim text-main border-border shadow-xs'
                    : 'text-text-dim hover:text-text'
                  }`}
              >
                <Monitor className="w-3.5 h-3.5" /> Desktop
              </button>
              <button
                onClick={() => onDeviceChange('mobile')}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${device === 'mobile'
                    ? 'bg-main-dim text-main border-border shadow-xs'
                    : 'text-text-dim hover:text-text'
                  }`}
              >
                <Smartphone className="w-3.5 h-3.5" /> Mobile
              </button>
            </div>
          )}

          <div className="flex items-center bg-gray-100/80 border border-border rounded-lg p-0.5 shadow-sm">
            <button
              onClick={() => setViewMode('preview')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${viewMode === 'preview'
                  ? 'bg-white text-main shadow-xs'
                  : 'text-text-dim hover:text-text'
                }`}
            >
              <Monitor className="w-3.5 h-3.5" /> Preview
            </button>
            <button
              onClick={() => setViewMode('code')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${viewMode === 'code'
                  ? 'bg-white text-main shadow-xs'
                  : 'text-text-dim hover:text-text'
                }`}
            >
              <Code className="w-3.5 h-3.5" /> Code
            </button>
          </div>
        </div>
      </div>

      {/* Main Preview Screen Container */}
      <div className="flex-1 bg-gray-100 overflow-y-auto p-6 flex justify-center items-start scrollbar-none">

        {isGenerating ? (
          /* SKELETON LOADING STATE */
          <div className="w-full max-w-xl bg-white rounded-xl border border-border shadow-md overflow-hidden animate-pulse">
            {/* Header placeholder */}
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <div className="w-24 h-6 bg-gray-200 rounded"></div>
              <div className="flex space-x-2">
                <div className="w-4 h-4 bg-gray-200 rounded-full"></div>
                <div className="w-4 h-4 bg-gray-200 rounded-full"></div>
              </div>
            </div>
            {/* Hero image placeholder */}
            <div className="w-full h-44 bg-gray-100 flex items-center justify-center relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-gray-100 via-gray-200 to-gray-100 animate-[shimmer_1.5s_infinite]"></div>
              <Sparkles className="w-8 h-8 text-gray-300 relative z-10" />
            </div>
            {/* Body placeholder */}
            <div className="p-6 space-y-4">
              <div className="w-2/3 h-6 bg-gray-200 rounded"></div>
              <div className="w-full h-4 bg-gray-100 rounded"></div>
              <div className="w-full h-4 bg-gray-100 rounded"></div>
              <div className="w-5/6 h-4 bg-gray-100 rounded"></div>
              <div className="pt-4 flex justify-center">
                <div className="w-36 h-10 bg-gray-200 rounded-lg"></div>
              </div>
            </div>
            {/* Footer placeholder */}
            <div className="p-6 bg-gray-50 border-t border-gray-100 space-y-2">
              <div className="w-1/2 h-3 bg-gray-200 mx-auto rounded"></div>
              <div className="w-1/3 h-3 bg-gray-200 mx-auto rounded"></div>
            </div>
          </div>
        ) : isRenderFailed ? (
          /* RENDER ERROR FALLBACK STATE */
          <div className="w-full max-w-md bg-white border border-red-200 rounded-xl shadow-md p-6 text-center">
            <div className="w-12 h-12 rounded-full bg-red-100 text-red-500 flex items-center justify-center mx-auto mb-4 animate-bounce">
              <AlertCircle className="w-6 h-6" />
            </div>
            <h4 className="text-sm font-bold text-text mb-2">Preview rendering failed</h4>
            <p className="text-xs text-text-dim max-w-xs mx-auto mb-4">
              The generated template HTML is missing or invalid. Please try describing your templates again.
            </p>
          </div>
        ) : !hasTemplate ? (
          /* EMPTY STATE DISPLAY */
          <div className="w-full h-full flex flex-col items-center justify-center text-center p-4">
            <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center text-text-dim mb-4">
              <AlertCircle className="w-6 h-6" />
            </div>
            <h4 className="text-sm font-bold text-text mb-2">No template generated yet</h4>
            <p className="text-xs text-text-dim max-w-xs">
              Start a conversation with the AI assistant on the left to describe your email template design.
            </p>
          </div>
        ) : viewMode === 'code' ? (
          /* CODE VIEW */
          <div className="w-full h-full bg-[#1e1e1e] rounded-xl border border-gray-700 shadow-md overflow-hidden flex flex-col relative group">
            <div className="bg-[#2d2d2d] px-4 py-2 flex items-center border-b border-gray-700">
              <span className="text-gray-300 text-xs font-mono">index.html</span>
            </div>
            <textarea
              readOnly
              value={htmlContent || ''}
              className="w-full flex-1 p-4 bg-[#1e1e1e] text-gray-300 font-mono text-sm focus:outline-none resize-none scrollbar-thin scrollbar-thumb-gray-600"
              spellCheck="false"
            />
          </div>
        ) : (
          /* SAFE SANDBOXED PREVIEW RENDER */
          <div
            className={`bg-white rounded-xl border border-border shadow-md overflow-hidden transition-all duration-300 flex flex-col ${device === 'mobile'
                ? 'w-[360px] border-4 border-gray-800 rounded-[2rem] shadow-xl relative bg-white pb-3 pt-2 px-1'
                : 'w-full h-full max-w-none'
              }`}
          >
            {device === 'mobile' && (
              /* Phone Speaker/Camera Mock Notch */
              <div className="w-full flex justify-center pb-2 bg-white flex-shrink-0">
                <div className="w-20 h-4 bg-gray-800 rounded-full flex items-center justify-between px-3">
                  <div className="w-1.5 h-1.5 bg-gray-600 rounded-full"></div>
                  <div className="w-8 h-1 bg-gray-600 rounded-full"></div>
                </div>
              </div>
            )}

            {/* Sandboxed iframe prevents script execution and isolates layout styles */}
            <div className="w-full flex-1 bg-white flex flex-col relative h-full">
              <iframe
                title="Email Preview"
                srcDoc={htmlContent || '<html><body><p>No preview data available</p></body></html>'}
                sandbox="" // Empty sandbox strictly disables JS execution
                className={`w-full border-0 bg-white ${device === 'mobile' ? 'h-[600px]' : 'absolute inset-0 h-full'}`}
              />
            </div>
          </div>
        )}
      </div>

      {/* Bottom Action Bar */}
      <div className="p-4 border-t border-border bg-gray-50/50 flex items-center justify-end gap-3">
        <button
          onClick={onRegenerate}
          disabled={!hasTemplate || isGenerating}
          className={`flex items-center gap-1.5 px-4 py-2 text-sm font-semibold border rounded-lg transition-all ${!hasTemplate || isGenerating
              ? 'border-gray-200 text-gray-400 bg-white cursor-not-allowed'
              : 'border-border text-text hover:bg-gray-100 bg-white'
            }`}
        >
          <RefreshCw className={`w-4 h-4 ${isGenerating ? 'animate-spin' : ''}`} /> Regenerate
        </button>

        <button
          onClick={onSaveTemplate}
          disabled={!hasTemplate || isGenerating || isRenderFailed}
          className={`flex items-center gap-1.5 px-5 py-2 text-sm font-semibold rounded-lg text-white shadow-sm transition-all ${!hasTemplate || isGenerating || isRenderFailed
              ? 'bg-gray-300 cursor-not-allowed shadow-none'
              : 'bg-[#007c89] hover:bg-[#006570] hover:shadow-md hover:shadow-[#007c89]/10'
            }`}
        >
          <Save className="w-4 h-4" /> Save Template
        </button>
      </div>
    </div>
  );
}
