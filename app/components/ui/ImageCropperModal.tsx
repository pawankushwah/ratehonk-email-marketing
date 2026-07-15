import React, { useState, useCallback } from 'react';
import Cropper from 'react-easy-crop';
import { X, RotateCw, ArrowLeftRight, Plus, Minus } from 'lucide-react';
import Button from './button';

interface ImageCropperModalProps {
  imageSrc: string;
  onClose: () => void;
  onSave: (croppedImageFile: File) => void;
  aspectRatio?: number;
}

const createImage = (url: string): Promise<HTMLImageElement> =>
  new Promise((resolve, reject) => {
    const image = new Image();
    image.addEventListener('load', () => resolve(image));
    image.addEventListener('error', (error) => reject(error));
    image.setAttribute('crossOrigin', 'anonymous');
    image.src = url;
  });

function getRadianAngle(degreeValue: number) {
  return (degreeValue * Math.PI) / 180;
}

async function getCroppedImg(
  imageSrc: string,
  pixelCrop: { x: number; y: number; width: number; height: number },
  rotation = 0,
  flip = { horizontal: false, vertical: false }
): Promise<File | null> {
  const image = await createImage(imageSrc);
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    return null;
  }

  const maxSize = Math.max(image.width, image.height);
  const safeArea = 2 * ((maxSize / 2) * Math.sqrt(2));

  canvas.width = safeArea;
  canvas.height = safeArea;

  ctx.translate(safeArea / 2, safeArea / 2);
  ctx.rotate(getRadianAngle(rotation));
  ctx.scale(flip.horizontal ? -1 : 1, flip.vertical ? -1 : 1);
  ctx.translate(-safeArea / 2, -safeArea / 2);

  ctx.drawImage(
    image,
    safeArea / 2 - image.width * 0.5,
    safeArea / 2 - image.height * 0.5
  );

  const data = ctx.getImageData(0, 0, safeArea, safeArea);

  canvas.width = pixelCrop.width;
  canvas.height = pixelCrop.height;

  ctx.putImageData(
    data,
    Math.round(0 - safeArea / 2 + image.width * 0.5 - pixelCrop.x),
    Math.round(0 - safeArea / 2 + image.height * 0.5 - pixelCrop.y)
  );

  return new Promise((resolve) => {
    canvas.toBlob((file) => {
      if (file) {
        resolve(new File([file], 'cropped.jpg', { type: 'image/jpeg' }));
      } else {
        resolve(null);
      }
    }, 'image/jpeg', 0.9);
  });
}

export const ImageCropperModal = ({ imageSrc, onClose, onSave, aspectRatio = 1 }: ImageCropperModalProps) => {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [flip, setFlip] = useState({ horizontal: false, vertical: false });
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const onCropComplete = useCallback((croppedArea: any, croppedAreaPixels: any) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const handleSave = async () => {
    try {
      setIsProcessing(true);
      const croppedImage = await getCroppedImg(imageSrc, croppedAreaPixels, rotation, flip);
      if (croppedImage) {
        onSave(croppedImage);
      }
    } catch (e) {
      console.error(e);
      alert('Error cropping image');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFlipHorizontal = () => setFlip(f => ({ ...f, horizontal: !f.horizontal }));
  const handleRotate = () => setRotation(r => r + 90);

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl overflow-hidden shadow-2xl w-full max-w-2xl flex flex-col relative animate-in zoom-in-95 duration-200" onClick={(e) => e.stopPropagation()}>

        <div className="flex justify-between items-center p-6 border-b border-gray-100">
          <h3 className="text-xl font-bold text-text">Process Image</h3>
          <button type="button" onClick={onClose} className="p-2 bg-gray-50 hover:bg-gray-100 rounded-full transition-colors text-gray-500">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="relative w-full h-[400px] bg-gray-900">
          <Cropper
            image={imageSrc}
            crop={crop}
            zoom={zoom}
            rotation={rotation}
            transform={`translate(${crop.x}px, ${crop.y}px) rotate(${rotation}deg) scale(${flip.horizontal ? -zoom : zoom}, ${flip.vertical ? -zoom : zoom})`}
            aspect={aspectRatio}
            onCropChange={setCrop}
            onCropComplete={onCropComplete}
            onZoomChange={setZoom}
            onRotationChange={setRotation}
          />

          {/* Vertical Zoom Controls on the Right */}
          <div className="absolute right-4 top-1/2 -translate-y-1/2 flex flex-col items-center bg-white/95 p-2 rounded-2xl shadow-lg border border-gray-200 z-10 space-y-3">
            <button
              type="button"
              onClick={() => setZoom(z => Math.min(z + 0.1, 3))}
              className="w-8 h-8 flex items-center justify-center bg-gray-50 hover:bg-gray-100 rounded-xl text-gray-700 transition-colors shadow-sm border border-gray-100"
              title="Zoom In"
            >
              <Plus className="w-4 h-4" />
            </button>
            <input
              type="range"
              value={zoom}
              min={1}
              max={3}
              step={0.1}
              onChange={(e) => setZoom(Number(e.target.value))}
              className="h-32 w-1.5 appearance-none bg-gray-200 rounded-full [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-main accent-main cursor-pointer m-auto"
              style={{ WebkitAppearance: 'slider-vertical' } as any}
            />
            <button
              type="button"
              onClick={() => setZoom(z => Math.max(z - 0.1, 1))}
              className="w-8 h-8 flex items-center justify-center bg-gray-50 hover:bg-gray-100 rounded-xl text-gray-700 transition-colors shadow-sm border border-gray-100"
              title="Zoom Out"
            >
              <Minus className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="p-6 bg-gray-50 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-gray-100">
          <div className="flex items-center space-x-3 w-full sm:w-auto">
            <button
              type="button"
              onClick={handleRotate}
              className="flex items-center justify-center w-10 h-10 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 hover:border-main/50 transition-all text-text-dim hover:text-main shadow-sm"
              title="Rotate 90°"
            >
              <RotateCw className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={handleFlipHorizontal}
              className="flex items-center justify-center w-10 h-10 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 hover:border-main/50 transition-all text-text-dim hover:text-main shadow-sm"
              title="Flip Horizontal"
            >
              <ArrowLeftRight className="w-4 h-4" />
            </button>
          </div>

          <div className="flex space-x-3 w-full sm:w-auto justify-end">
            <Button type="button" onClick={onClose} className="!bg-white !text-text !border-gray-200 hover:!bg-gray-50 hover:!border-gray-300">
              Cancel
            </Button>
            <Button type="button" onClick={handleSave} disabled={isProcessing}>
              {isProcessing ? 'Processing...' : 'Apply & Save'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
