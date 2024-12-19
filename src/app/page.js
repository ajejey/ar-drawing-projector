'use client';

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
    <div className="relative h-screen w-screen overflow-hidden bg-black">
      <main className="h-full w-full">
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
