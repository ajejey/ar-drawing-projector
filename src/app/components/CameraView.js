'use client';

import { useState, useRef, useEffect } from 'react';

export default function CameraView() {
  const [hasCamera, setHasCamera] = useState(false);
  const videoRef = useRef(null);

  useEffect(() => {
    async function setupCamera() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ 
          video: { 
            facingMode: 'environment' // Prefer back camera
          } 
        });
        
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          setHasCamera(true);
        }
      } catch (error) {
        console.error('Camera access denied:', error);
      }
    }

    setupCamera();
  }, []);

  return (
    <div className="camera-view w-full h-screen relative">
      {hasCamera ? (
        <video 
          ref={videoRef} 
          autoPlay 
          playsInline 
          className="w-full h-full object-cover"
        />
      ) : (
        <div className="flex items-center justify-center h-full">
          Camera access required
        </div>
      )}
    </div>
  );
}
