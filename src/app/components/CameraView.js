'use client';

import { useState, useRef, useEffect } from 'react';

export default function CameraView() {
  const [hasCamera, setHasCamera] = useState(false);
  const [cameraError, setCameraError] = useState(null);
  const [debugInfo, setDebugInfo] = useState('Initializing...');
  const videoRef = useRef(null);

  useEffect(() => {
    let stream = null;

    async function setupCamera() {
      try {
        setDebugInfo('Getting camera permissions...');
        
        // First, just try to get any video input
        stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: false
        });

        setDebugInfo('Got camera stream, setting up video...');
        
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          
          // Wait for video to be ready
          await new Promise((resolve) => {
            videoRef.current.onloadedmetadata = () => {
              setDebugInfo('Video metadata loaded');
              resolve();
            };
          });

          // Try to play the video
          await videoRef.current.play();
          setDebugInfo('Video is playing');
          setHasCamera(true);
        } else {
          throw new Error('Video element not found');
        }
      } catch (error) {
        console.error('Camera setup error:', error);
        setDebugInfo(`Setup error: ${error.message}`);
        setCameraError(error.message);
        
        // Log additional information
        if (!navigator.mediaDevices) {
          setDebugInfo('mediaDevices API not available');
        }
        if (!videoRef.current) {
          setDebugInfo('Video element reference not found');
        }
      }
    }

    // Start camera setup
    setupCamera();

    // Cleanup function
    return () => {
      if (stream) {
        const tracks = stream.getTracks();
        tracks.forEach(track => track.stop());
      }
    };
  }, []);

  return (
    <div className="camera-view w-full h-screen relative bg-black">
      <video 
        ref={videoRef} 
        playsInline 
        autoPlay
        muted
        style={{ display: hasCamera ? 'block' : 'none' }}
        className="w-full h-full object-cover"
      />
      
      {!hasCamera && (
        <div className="flex flex-col items-center justify-center h-full p-4 text-center text-white">
          <p className="mb-4">Debug Info: {debugInfo}</p>
          {cameraError ? (
            <div className="text-red-500">
              <p>Camera Access Error:</p>
              <p>{cameraError}</p>
              <p className="mt-4">Please ensure:</p>
              <ul className="list-disc list-inside">
                <li>Camera permissions are granted</li>
                <li>Using HTTPS or localhost</li>
                <li>Camera is not in use by another app</li>
                <li>Browser supports camera access</li>
              </ul>
            </div>
          ) : (
            <p>Setting up camera...</p>
          )}
        </div>
      )}
    </div>
  );
}
