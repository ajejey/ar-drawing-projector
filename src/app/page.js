'use client';

import { useState, useRef } from 'react';
import CameraView from './components/CameraView';
import ImageUploader from './components/ImageUploader';
import TransformControls from './components/TransformControls';
import ReferencePointSelector from './components/ReferencePointSelector';
import ImageTracker from './components/ImageTracker';

export default function Home() {
  const [uploadedImage, setUploadedImage] = useState(null);
  const [imageTransform, setImageTransform] = useState({
    opacity: 0.5,
    rotation: 0
  });
  const [referencePoints, setReferencePoints] = useState([]);
  const videoRef = useRef(null);
  const imageRef = useRef(null);

  const handleImageUpload = (image) => {
    setUploadedImage(image);
  };

  const handleTransform = (transform) => {
    setImageTransform(transform);
  };

  const handleReferencePoints = (points) => {
    setReferencePoints(points);
  };

  return (
    <div className="fixed inset-0 bg-black">
      <CameraView ref={videoRef} />
      
      {uploadedImage && (
        <div 
          ref={imageRef}
          className="absolute inset-0 pointer-events-none"
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
      
      {uploadedImage && !referencePoints.length && (
        <ReferencePointSelector 
          onPointsSelected={handleReferencePoints}
          videoRef={videoRef}
        />
      )}

      {uploadedImage && referencePoints.length > 0 && (
        <ImageTracker
          referencePoints={referencePoints}
          videoRef={videoRef}
          imageElement={imageRef.current}
        />
      )}
      
      <ImageUploader onImageUpload={handleImageUpload} />
      
      {uploadedImage && (
        <TransformControls 
          image={uploadedImage} 
          onTransform={handleTransform} 
        />
      )}
    </div>
  );
}
