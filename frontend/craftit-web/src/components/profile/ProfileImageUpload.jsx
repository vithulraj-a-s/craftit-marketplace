import React, { useState, useRef, useEffect } from 'react';
import { Camera, Image as ImageIcon } from 'lucide-react';
import clsx from 'clsx';

export default function ProfileImageUpload({ initialImage, onImageChange, error }) {
  const [preview, setPreview] = useState(initialImage || null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (initialImage && typeof initialImage === 'string') {
      setPreview(initialImage);
    }
  }, [initialImage]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPreview(URL.createObjectURL(file));
      onImageChange(file);
    }
  };

  const handleTriggerUpload = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="flex flex-col">
      <div 
        onClick={handleTriggerUpload}
        className={clsx(
          "relative w-full aspect-square rounded-lg border-2 flex items-center justify-center cursor-pointer overflow-hidden transition-all group bg-gray-50",
          error ? "border-red-400" : "border-gray-200 border-dashed hover:border-indigo-400"
        )}
      >
        {preview ? (
          <>
            <img src={preview} alt="Profile preview" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              <Camera className="text-white mb-2" size={24} />
              <span className="text-white text-sm font-medium">Change Photo</span>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center text-gray-400 group-hover:text-indigo-500 transition-colors">
            <ImageIcon size={32} className="mb-3" />
            <span className="text-sm font-medium text-gray-500 group-hover:text-indigo-600">Add Profile Image</span>
          </div>
        )}
      </div>
      {error && <span className="text-sm text-red-500 mt-2">{error}</span>}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        className="hidden"
      />
    </div>
  );
}
