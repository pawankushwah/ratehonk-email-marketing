"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ChevronLeft, ClipboardPaste, UploadCloud, CheckCircle2, FileText, AlertCircle } from 'lucide-react';
import Button from '@/app/components/ui/button';
import { useRouter } from 'next/navigation';

type Step = 'Choose Method' | 'Upload' | 'Match' | 'Status' | 'Review' | 'Confirmation';

const steps: Step[] = ['Choose Method', 'Upload', 'Match', 'Status', 'Review', 'Confirmation'];

export default function ImportContactsPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState<Step>('Choose Method');
  const [importMethod, setImportMethod] = useState<'paste' | 'upload' | null>(null);
  
  // Step States
  const [pastedText, setPastedText] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('subscribed');

  const handleNext = () => {
    const currentIndex = steps.indexOf(currentStep);
    if (currentIndex < steps.length - 1) {
      setCurrentStep(steps[currentIndex + 1]);
    }
  };

  const handleBack = () => {
    const currentIndex = steps.indexOf(currentStep);
    if (currentIndex > 0) {
      setCurrentStep(steps[currentIndex - 1]);
    } else {
      router.push('/audience');
    }
  };

  const handleExit = () => {
    router.push('/audience');
  };

  return (
    <div className="fixed inset-0 z-50 bg-white flex flex-col h-screen overflow-hidden">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 border-b border-gray-200 shrink-0 bg-white">
        <div className="flex items-center gap-6">
          <button 
            onClick={handleBack}
            className="text-gray-500 hover:text-gray-900 transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          
          <div className="flex items-center gap-4">
            <Image 
              src="/ratehonk-logo.png" 
              alt="Ratehonk Logo" 
              width={32} 
              height={32} 
              className="object-contain"
            />
            <div className="flex flex-col">
              <h1 className="text-lg font-semibold text-gray-900 leading-tight">Import Contacts</h1>
              <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                {steps.map((step, index) => {
                  const isActive = currentStep === step;
                  const isPast = steps.indexOf(currentStep) > index;
                  
                  return (
                    <React.Fragment key={step}>
                      <span 
                        className={`
                          ${isActive ? 'font-semibold text-gray-900 underline underline-offset-4 decoration-2 decoration-[#007c89]' : ''}
                          ${!isActive && isPast ? 'text-gray-900' : ''}
                        `}
                      >
                        {step}
                      </span>
                      {index < steps.length - 1 && (
                        <span className="text-gray-300">&gt;</span>
                      )}
                    </React.Fragment>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        <Button 
          variant="outline" 
          onClick={handleExit}
          className="text-gray-600 border-gray-300 hover:bg-gray-50"
        >
          Exit
        </Button>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto bg-white flex flex-col items-center pt-12 px-6 pb-24">
        {/* 1. CHOOSE METHOD */}
        {currentStep === 'Choose Method' && (
          <div className="w-full max-w-4xl">
            <h2 className="text-[32px] font-semibold text-[#241c15] mb-8 text-center md:text-left">
              Add your contacts
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div 
                onClick={() => setImportMethod('paste')}
                className={`
                  border-2 rounded-lg p-10 flex flex-col items-center justify-center cursor-pointer transition-all h-[260px]
                  ${importMethod === 'paste' 
                    ? 'border-[#007c89] bg-[#007c89]/5' 
                    : 'border-dashed border-gray-200 hover:border-[#007c89] hover:bg-gray-50'
                  }
                `}
              >
                <div className="w-12 h-12 flex items-center justify-center mb-4 text-gray-800">
                  <ClipboardPaste className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Paste your contacts</h3>
                <p className="text-sm text-gray-500 text-center">
                  Separating by commas, one per line
                </p>
              </div>

              <div 
                onClick={() => setImportMethod('upload')}
                className={`
                  border-2 rounded-lg p-10 flex flex-col items-center justify-center cursor-pointer transition-all h-[260px]
                  ${importMethod === 'upload' 
                    ? 'border-[#007c89] bg-[#007c89]/5' 
                    : 'bg-[#f6f6f4] border-transparent hover:border-[#007c89] hover:bg-gray-50'
                  }
                `}
              >
                <div className="w-12 h-12 flex items-center justify-center mb-4 text-gray-800">
                  <UploadCloud className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Upload a file</h3>
                <p className="text-sm text-gray-500 text-center">
                  Max file size: 200 MB (CSV, TXT), 50 MB (XLSX)
                </p>
              </div>
            </div>
          </div>
        )}

        {/* 2. UPLOAD */}
        {currentStep === 'Upload' && (
          <div className="w-full max-w-4xl">
            <h2 className="text-[32px] font-semibold text-[#241c15] mb-8">
              {importMethod === 'paste' ? 'Paste your contacts' : 'Upload your file'}
            </h2>
            
            {importMethod === 'paste' ? (
              <div className="w-full">
                <p className="text-gray-600 mb-4">Paste your contact information below. You can include email addresses, names, and other details.</p>
                <textarea 
                  className="w-full h-64 p-4 border border-gray-300 rounded-md focus:ring-[#007c89] focus:border-[#007c89] resize-none"
                  placeholder="name@example.com, John, Doe&#10;another@example.com, Jane, Smith"
                  value={pastedText}
                  onChange={(e) => setPastedText(e.target.value)}
                ></textarea>
              </div>
            ) : (
              <div className="w-full border-2 border-dashed border-gray-300 rounded-lg p-16 flex flex-col items-center justify-center bg-gray-50">
                <FileText className="w-12 h-12 text-gray-400 mb-4" />
                <p className="text-lg font-medium text-gray-900 mb-2">Drag and drop your file here</p>
                <p className="text-gray-500 mb-6">or</p>
                <Button variant="outline" className="border-[#007c89] text-[#007c89]">
                  Browse to upload
                </Button>
                <p className="text-xs text-gray-400 mt-4">Supported formats: CSV, TXT, XLSX</p>
              </div>
            )}
          </div>
        )}

        {/* 3. MATCH */}
        {currentStep === 'Match' && (
          <div className="w-full max-w-4xl">
            <h2 className="text-[32px] font-semibold text-[#241c15] mb-2">
              Match your columns
            </h2>
            <p className="text-gray-600 mb-8">Match the columns from your imported data to the fields in your audience.</p>
            
            <div className="border border-gray-200 rounded-lg overflow-hidden">
              <table className="w-full text-left bg-white">
                <thead className="bg-gray-50 border-b border-gray-200 text-sm font-medium text-gray-500">
                  <tr>
                    <th className="p-4">Column Header</th>
                    <th className="p-4">Sample Data</th>
                    <th className="p-4">Audience Field</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  <tr>
                    <td className="p-4 font-medium text-gray-900">Email Address</td>
                    <td className="p-4 text-gray-600">user@example.com</td>
                    <td className="p-4">
                      <select className="border border-gray-300 rounded-md p-2 w-full max-w-xs focus:ring-[#007c89] focus:border-[#007c89]">
                        <option>Email Address</option>
                        <option>First Name</option>
                        <option>Last Name</option>
                      </select>
                    </td>
                  </tr>
                  <tr>
                    <td className="p-4 font-medium text-gray-900">First Name</td>
                    <td className="p-4 text-gray-600">John</td>
                    <td className="p-4">
                      <select className="border border-gray-300 rounded-md p-2 w-full max-w-xs focus:ring-[#007c89] focus:border-[#007c89]">
                        <option>First Name</option>
                        <option>Last Name</option>
                        <option>Email Address</option>
                      </select>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 4. STATUS */}
        {currentStep === 'Status' && (
          <div className="w-full max-w-4xl">
            <h2 className="text-[32px] font-semibold text-[#241c15] mb-2">
              Organize your contacts
            </h2>
            <p className="text-gray-600 mb-8">Set the status and tags for these imported contacts.</p>
            
            <div className="max-w-xl">
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Select a status for these contacts</label>
                <div className="space-y-3">
                  {['subscribed', 'unsubscribed', 'non-subscribed'].map((status) => (
                    <label key={status} className={`flex items-start p-4 border rounded-md cursor-pointer transition-colors ${selectedStatus === status ? 'border-[#007c89] bg-[#007c89]/5' : 'border-gray-200 hover:bg-gray-50'}`}>
                      <input 
                        type="radio" 
                        name="status" 
                        value={status} 
                        checked={selectedStatus === status}
                        onChange={(e) => setSelectedStatus(e.target.value)}
                        className="mt-1 h-4 w-4 text-[#007c89] border-gray-300 focus:ring-[#007c89]"
                      />
                      <div className="ml-3">
                        <span className="block text-sm font-medium text-gray-900 capitalize">{status}</span>
                        <span className="block text-sm text-gray-500">
                          {status === 'subscribed' && 'These contacts have agreed to receive your marketing emails.'}
                          {status === 'unsubscribed' && 'These contacts have opted out of your marketing emails.'}
                          {status === 'non-subscribed' && 'These contacts have interacted with you but haven\'t opted in.'}
                        </span>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Tag your contacts (Optional)</label>
                <input 
                  type="text" 
                  placeholder="e.g. 2024 Trade Show, Summer Promo" 
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-[#007c89] focus:border-[#007c89]"
                />
              </div>
            </div>
          </div>
        )}

        {/* 5. REVIEW */}
        {currentStep === 'Review' && (
          <div className="w-full max-w-4xl">
            <h2 className="text-[32px] font-semibold text-[#241c15] mb-2">
              Review your import
            </h2>
            <p className="text-gray-600 mb-8">You're almost done! Please review the details below before completing your import.</p>
            
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 space-y-6">
              <div className="flex items-start">
                <CheckCircle2 className="w-6 h-6 text-green-500 mt-0.5 mr-3 shrink-0" />
                <div>
                  <h4 className="text-base font-semibold text-gray-900">Import Method</h4>
                  <p className="text-gray-600 text-sm mt-1 capitalize">{importMethod} contacts</p>
                </div>
              </div>
              <div className="flex items-start">
                <CheckCircle2 className="w-6 h-6 text-green-500 mt-0.5 mr-3 shrink-0" />
                <div>
                  <h4 className="text-base font-semibold text-gray-900">Audience Status</h4>
                  <p className="text-gray-600 text-sm mt-1 capitalize">{selectedStatus}</p>
                </div>
              </div>
              <div className="flex items-start">
                <CheckCircle2 className="w-6 h-6 text-green-500 mt-0.5 mr-3 shrink-0" />
                <div>
                  <h4 className="text-base font-semibold text-gray-900">Fields Matched</h4>
                  <p className="text-gray-600 text-sm mt-1">2 columns mapped</p>
                </div>
              </div>
            </div>

            <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start text-blue-800">
              <AlertCircle className="w-5 h-5 shrink-0 mr-3 mt-0.5" />
              <p className="text-sm">By completing this import, you confirm that these contacts have given you permission to email them, and you understand our Anti-Spam Policy.</p>
            </div>
          </div>
        )}

        {/* 6. CONFIRMATION */}
        {currentStep === 'Confirmation' && (
          <div className="w-full max-w-4xl text-center py-16">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="w-10 h-10 text-green-600" />
            </div>
            <h2 className="text-[32px] font-semibold text-[#241c15] mb-4">
              Your import was successful!
            </h2>
            <p className="text-gray-600 text-lg mb-8 max-w-xl mx-auto">
              We're processing your contacts in the background. You'll receive a notification once everything is fully imported and ready to use.
            </p>
            <div className="flex items-center justify-center gap-4">
              <Button variant="outline" onClick={handleExit}>
                Go to Audience
              </Button>
              <Button className="!bg-[#007c89] hover:!bg-[#006570] !text-white" onClick={handleExit}>
                Create a Campaign
              </Button>
            </div>
          </div>
        )}
      </main>

      {/* Footer Area (Sticky) */}
      {currentStep !== 'Confirmation' && (
        <footer className="border-t border-gray-200 p-6 bg-white shrink-0 mt-auto">
          <div className="w-full max-w-4xl mx-auto flex justify-between items-center px-6 md:px-0">
            {currentStep !== 'Choose Method' ? (
              <Button 
                variant="outline" 
                onClick={handleBack}
                className="px-6"
              >
                Back
              </Button>
            ) : (
              <div></div>
            )}
            
            <Button 
              size="lg"
              className="!bg-[#007c89] hover:!bg-[#006570] !text-white px-8"
              disabled={
                (currentStep === 'Choose Method' && !importMethod) ||
                (currentStep === 'Upload' && importMethod === 'paste' && !pastedText)
              }
              onClick={handleNext}
            >
              {currentStep === 'Review' ? 'Import Contacts' : 'Continue'}
            </Button>
          </div>
        </footer>
      )}
    </div>
  );
}
