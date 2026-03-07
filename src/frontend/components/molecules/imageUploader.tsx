"use client";

import { useState, useEffect } from 'react';
import Dropzone from '@/components/atoms/dropzone';
import Spinner from '@/components/atoms/spinner'

interface ImageUploaderProps {
  onImageUpload: (file: File) => void;
  isProcessing: boolean;
}

export default function ImageUploader({ onImageUpload, isProcessing }: ImageUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);

  const handleFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file');
      return;
    }

    const reader = new FileReader();
    reader.readAsDataURL(file);

    onImageUpload(file);
  };

  return (
    <div className="space-y-4" role="region" aria-label="Image upload area">
      {!isProcessing && (
        <Dropzone
          onFile={handleFile}
          isDragging={isDragging}
          setIsDragging={setIsDragging}
        />
      )}

      {isProcessing && <Spinner />}
    </div>
  );
}
