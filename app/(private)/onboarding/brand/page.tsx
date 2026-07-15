"use client";
import React, { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Button from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { trpc } from '@/app/trpc';
import { useToast } from '@/app/hooks/useToast';
import { Globe, Image as ImageIcon, UploadCloud } from 'lucide-react';

export default function BrandOnboardingPage() {
  const router = useRouter();
  const { addToast } = useToast();
  const [url, setUrl] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadOption, setUploadOption] = useState<'url' | 'manual'>('url');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch user session to get businessId
  const { data: sessionData, isLoading: isSessionLoading } = trpc.auth.refreshToken.useQuery(undefined, {
    staleTime: Infinity,
    retry: false
  });

  const importMutation = trpc.onboarding.importBrand.useMutation({
    onSuccess: () => {
      router.push('/onboarding/audience');
    },
    onError: (err) => {
      // Ignore database errors if businessId doesn't exist yet, we still want to show the flow
      addToast(err.message || "Failed to save data. Proceeding anyway for demo.", "error");
      setTimeout(() => router.push('/onboarding/audience'), 1500);
    }
  });

  const handleNext = () => {
    if (uploadOption === 'url' && !url) {
      addToast("Please enter a valid Website URL or skip.", "error");
      return;
    }
    const businessId = sessionData?.user?.businessId;
    if (!businessId) {
      addToast("Session expired. Please log in again.", "error");
      return;
    }
    importMutation.mutate({ businessId, websiteUrl: url });
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append('brandLogo', file);

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();

      if (res.ok && data.success) {
        addToast("Logo uploaded successfully!", "success");
        const businessId = sessionData?.user?.businessId;
        if (!businessId) {
          throw new Error("Session expired. Please log in again.");
        }
        importMutation.mutate({ businessId, logoUrl: data.url });
      } else {
        throw new Error(data.error || "Upload failed");
      }
    } catch (err: any) {
      addToast(err.message || "Failed to upload file", "error");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="flex flex-col p-8 sm:p-12 h-full">
      <div className="flex-1 w-full max-w-md mx-auto flex flex-col justify-center">
        <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 px-3 py-1.5 rounded-full w-fit mb-6 shadow-sm border border-blue-100">
          <Globe className="w-4 h-4" />
          <span className="text-xs font-semibold uppercase tracking-wider">Get custom designs</span>
        </div>

        <h1 className="text-3xl font-extrabold text-gray-900 mb-4 tracking-tight">Import your brand</h1>

        <p className="text-gray-600 mb-8 font-oxygen text-sm leading-relaxed">
          Share your URL and we'll automatically import some business information, including your logos, images, colors, and fonts.
        </p>

        {/* Toggle between URL and Upload */}
        <div className="flex gap-4 mb-6">
          <button
            onClick={() => setUploadOption('url')}
            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg border text-sm font-semibold transition-all \${uploadOption === 'url' ? 'border-main text-main bg-main/5' : 'border-gray-200 text-gray-500 hover:bg-gray-50'}`}
          >
            <Globe className="w-4 h-4" /> Website URL
          </button>
          <button
            onClick={() => setUploadOption('manual')}
            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg border text-sm font-semibold transition-all \${uploadOption === 'manual' ? 'border-main text-main bg-main/5' : 'border-gray-200 text-gray-500 hover:bg-gray-50'}`}
          >
            <UploadCloud className="w-4 h-4" /> Upload Logo
          </button>
        </div>

        {uploadOption === 'url' ? (
          <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <Input
              name="websiteUrl"
              label="Website URL"
              placeholder="e.g. https://www.yourbrand.com"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
            />

            <p className="text-xs text-gray-500 font-oxygen mt-2 leading-relaxed">
              By clicking "Next," you represent and warrant that you own or have permission to use all of the content from this website.
            </p>
          </div>
        ) : (
          <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-gray-300 rounded-xl p-8 flex flex-col items-center justify-center text-center cursor-pointer hover:border-main hover:bg-main/5 transition-all group"
            >
              <div className="bg-gray-100 p-4 rounded-full mb-4 group-hover:bg-white group-hover:shadow-sm transition-all">
                <ImageIcon className="w-8 h-8 text-gray-400 group-hover:text-main" />
              </div>
              <h3 className="text-sm font-semibold text-gray-700">Click to upload your logo</h3>
              <p className="text-xs text-gray-400 mt-1">SVG, PNG, JPG or GIF (max. 5MB)</p>
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="image/png, image/jpeg, image/gif, image/svg+xml, image/webp"
                onChange={handleFileUpload}
              />
            </div>
          </div>
        )}

        <div className="mt-10 flex items-center justify-end gap-4">
          <button
            onClick={() => router.push('/onboarding/audience')}
            className="text-sm font-semibold text-gray-500 hover:text-gray-900 transition-colors"
          >
            Skip
          </button>
          <Button
            onClick={handleNext}
            disabled={importMutation.isPending || isUploading}
            className="w-24 text-sm py-2 px-4"
          >
            {importMutation.isPending || isUploading ? "Saving..." : "Next"}
          </Button>

        </div>
      </div>
    </div>
  );
}
