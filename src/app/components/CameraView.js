'use client';

import { useState, useRef, useEffect } from 'react';

export default function CameraView() {
  const [hasCamera, setHasCamera] = useState(false);
  const [cameraError, setCameraError] = useState(null);
  const videoRef = useRef(null);

  useEffect(() => {
    async function setupCamera() {
      // Check if browser supports getUserMedia
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setCameraError('Browser does not support camera access');
        return;
      }

      try {
        const constraints = { 
          video: { 
            facingMode: { ideal: 'environment' },
            width: { ideal: 1280 },
            height: { ideal: 720 }
          } 
        };

        const stream = await navigator.mediaDevices.getUserMedia(constraints);
        
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.onloadedmetadata = () => {
            videoRef.current.play();
            setHasCamera(true);
          };
        }
      } catch (error) {
        console.error('Camera access error:', error);
        setCameraError(error.message || 'Failed to access camera');
      }
    }

    setupCamera();

    // Cleanup function
    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        const tracks = videoRef.current.srcObject.getTracks();
        tracks.forEach(track => track.stop());
      }
    };
  }, []);

  return (
    <div className="camera-view w-full h-screen relative">
      {hasCamera ? (
        <video 
          ref={videoRef} 
          playsInline 
          className="w-full h-full object-cover"
        />
      ) : (
        <div className="flex items-center justify-center h-full p-4 text-center">
          {cameraError ? (
            <div className="text-red-500">
              <p>Camera Access Error:</p>
              <p>{cameraError}</p>
              <p>Please ensure:</p>
              <ul>
                <li>Camera permissions are granted</li>
                <li>Using HTTPS or localhost</li>
                <li>Camera is not in use by another app</li>
              </ul>
            </div>
          ) : (
            <p>Camera access required. Please grant camera permissions.</p>
          )}
        </div>
      )}
    </div>
  );
}
