import React, { useState, useRef } from 'react';
import { Upload, Camera, X, CheckCircle } from 'lucide-react';

interface ImageUploadProps {
  onImageSelect: (file: File) => void;
  selectedImage: File | null;
  isProcessing: boolean;
}

export const ImageUpload: React.FC<ImageUploadProps> = ({ 
  onImageSelect, 
  selectedImage, 
  isProcessing 
}) => {
  const [dragOver, setDragOver] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = () => {
    setDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleFileSelect = (file: File) => {
    if (file && file.type.startsWith('image/')) {
      onImageSelect(file);
      
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const clearSelection = () => {
    onImageSelect(null as any);
    setPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="bg-white bg-opacity-20 backdrop-blur-lg border border-white border-opacity-30 rounded-2xl p-6 shadow-xl">
      <h3 className="text-white text-lg font-semibold mb-4 flex items-center gap-2">
        <Camera className="w-5 h-5" />
        Upload Crop Image
      </h3>
      
      {!selectedImage ? (
        <div
          className={`border-2 border-dashed rounded-xl p-8 text-center transition-all duration-200 cursor-pointer ${
            dragOver 
              ? 'border-green-400 bg-green-400 bg-opacity-10' 
              : 'border-gray-300 hover:border-green-400'
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          <Upload className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-white mb-2">
            Drag & drop your crop image here, or click to browse
          </p>
          <p className="text-gray-300 text-sm">
            Supports: JPG, PNG, WEBP (Max 10MB)
          </p>
          
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileInputChange}
            className="hidden"
          />
        </div>
      ) : (
        <div className="space-y-4">
          <div className="relative">
            {preview && (
              <img
                src={preview}
                alt="Crop preview"
                className="w-full h-48 object-cover rounded-xl"
              />
            )}
            <button
              onClick={clearSelection}
              className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-1 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          
          <div className="bg-green-500 bg-opacity-20 border border-green-400 rounded-lg p-3">
            <div className="flex items-center gap-2 text-green-200">
              <CheckCircle className="w-4 h-4" />
              <span className="text-sm">Image ready for analysis</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};