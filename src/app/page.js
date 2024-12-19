'use client';

import Image from "next/image";
import { useState } from 'react';
import CameraView from './components/CameraView';
import ImageUploader from './components/ImageUploader';
import TransformControls from './components/TransformControls';

export default function Home() {
  const [uploadedImage, setUploadedImage] = useState(null);
  const [imageTransform, setImageTransform] = useState({
    opacity: 0.5,
    rotation: 0
  });

  const handleImageUpload = (image) => {
    setUploadedImage(image);
  };

  const handleTransform = (transform) => {
    setImageTransform(transform);
  };

  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <main className="relative h-screen overflow-hidden flex flex-col gap-8 row-start-2 items-center sm:items-start">
        <CameraView />
        
        {uploadedImage && (
          <div 
            className="absolute top-0 left-0 w-full h-full pointer-events-none"
            style={{
              opacity: imageTransform.opacity,
              transform: `rotate(${imageTransform.rotation}deg)`
            }}
          >
            <img 
              src={uploadedImage} 
              alt="Tracing Reference" 
              className="w-full h-full object-contain"
            />
          </div>
        )}
        
        <ImageUploader onImageUpload={handleImageUpload} />
        
        {uploadedImage && (
          <TransformControls 
            image={uploadedImage} 
            onTransform={handleTransform} 
          />
        )}

        </main>
        
        
    </div>
  );
}
