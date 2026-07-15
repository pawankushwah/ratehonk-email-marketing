"use client";
import React, { useState } from 'react';
import { X } from 'lucide-react';
import { trpc } from '@/app/trpc';
import { ImageCropperModal } from './ImageCropperModal';

const Lightbox = ({ src, onClose }: { src: string, onClose: () => void }) => {
  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <button
        className="absolute top-6 right-6 p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors text-white"
        onClick={onClose}
      >
        <X className="w-6 h-6" />
      </button>
      <img
        src={src}
        alt="Preview full"
        className="max-w-full max-h-full rounded-lg object-contain shadow-2xl animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      />
    </div>
  );
};

export const ImageUploadField = ({ value, onChange, error, label, uploadType, aspectRatio = 1 }: any) => {
  const [isUploading, setIsUploading] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [cropModalOpen, setCropModalOpen] = useState(false);
  const [selectedImageSrc, setSelectedImageSrc] = useState<string | null>(null);
  
  const uploadMutation = trpc.upload.uploadImage.useMutation();

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Size limit for profile picture (100KB)
    if (uploadType === 'profilePicture' && file.size > 100 * 1024) {
      alert("Profile picture size must be less than 100 KB");
      // Reset input
      e.target.value = '';
      return;
    }

    const reader = new FileReader();
    reader.addEventListener('load', () => {
      setSelectedImageSrc(reader.result?.toString() || null);
      setCropModalOpen(true);
    });
    reader.readAsDataURL(file);
    // Reset input so the same file can be selected again
    e.target.value = '';
  };

  const uploadFile = async (file: File) => {
    setIsUploading(true);
    
    const reader = new FileReader();
    reader.onload = async () => {
      const base64Data = reader.result as string;
      try {
        const data = await uploadMutation.mutateAsync({
          base64Data,
          fileName: file.name || 'upload.jpg',
          uploadType
        });
        if (data.success) {
          onChange(data.url);
        }
      } catch (err: any) {
        alert(err.message || 'Upload failed');
      } finally {
        setIsUploading(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSaveCrop = (croppedFile: File) => {
    setCropModalOpen(false);
    setSelectedImageSrc(null);
    uploadFile(croppedFile);
  };

  return (
    <div className="mb-4">
      <label className="block text-sm font-semibold text-text mb-2">{label}</label>
      <div className="flex items-center space-x-4">
        
        <div className={`relative h-16 ${aspectRatio > 1 ? 'w-32' : 'w-16'} rounded-xl border border-gray-200 overflow-hidden flex-shrink-0 bg-gray-50 flex items-center justify-center`}>
          {value ? (
            <img
              src={value}
              alt="Preview"
              className="w-full h-full object-cover cursor-pointer hover:opacity-80 transition-opacity"
              onClick={() => setLightboxOpen(true)}
            />
          ) : (
            <span className="text-gray-400 text-xs">No img</span>
          )}
          
          {isUploading && (
            <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center text-white z-10 backdrop-blur-sm">
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
            </div>
          )}
        </div>

        <div className="flex flex-col items-start">
          <label className={`cursor-pointer inline-flex items-center justify-center py-2 px-4 rounded-full border-0 text-sm font-semibold bg-main/10 text-main hover:bg-main/20 transition-colors ${isUploading ? 'opacity-50 pointer-events-none' : ''}`}>
            Choose file
            <input
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              disabled={isUploading}
              className="hidden"
            />
          </label>
          {!value && !isUploading && (
            <span className="text-xs text-gray-400 mt-1.5 ml-1">No file chosen</span>
          )}
        </div>
      </div>
      {error && <div className="text-red-500 text-xs mt-1">{error}</div>}

      {lightboxOpen && value && (
        <Lightbox src={value} onClose={() => setLightboxOpen(false)} />
      )}

      {cropModalOpen && selectedImageSrc && (
        <ImageCropperModal
          imageSrc={selectedImageSrc}
          onClose={() => { setCropModalOpen(false); setSelectedImageSrc(null); }}
          onSave={handleSaveCrop}
          aspectRatio={aspectRatio}
        />
      )}
    </div>
  );
};
