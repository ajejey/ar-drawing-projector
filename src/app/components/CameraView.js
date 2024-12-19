'use client';

import { useState, useRef, useEffect } from 'react';

export default function CameraView() {
  const [hasCamera, setHasCamera] = useState(false);
  const [cameraError, setCameraError] = useState(null);
  const [debugInfo, setDebugInfo] = useState('Initializing...');
  const videoRef = useRef(null);

  useEffect(() => {
    async function setupCamera() {
      setDebugInfo('Checking browser support...');
      
      // Check if browser supports getUserMedia
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setCameraError('Browser does not support camera access');
        setDebugInfo('No mediaDevices support');
        return;
      }

      try {
        setDebugInfo('Requesting camera access...');
        
        // Start with basic constraints
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: false
        });
        
        setDebugInfo('Got camera stream, setting up video...');

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          
          // Add event listeners for debugging
          videoRef.current.onloadedmetadata = () => {
            setDebugInfo('Video metadata loaded');
            videoRef.current.play()
              .then(() => {
                setDebugInfo('Video playing');
                setHasCamera(true);
              })
              .catch(err => {
                setDebugInfo('Play failed: ' + err.message);
                setCameraError('Failed to play video: ' + err.message);
              });
          };
          
          videoRef.current.onerror = (err) => {
            setDebugInfo('Video error: ' + err.message);
            setCameraError('Video error: ' + err.message);
          };
        } else {
          setDebugInfo('No video ref available');
          setCameraError('Video element not initialized');
        }
      } catch (error) {
        console.error('Camera access error:', error);
        setDebugInfo('Access error: ' + error.message);
        setCameraError(error.message || 'Failed to access camera');
      }
    }

    setupCamera();

    return () => {
      if (videoRef.current?.srcObject) {
        const tracks = videoRef.current.srcObject.getTracks();
        tracks.forEach(track => track.stop());
      }
    };
  }, []);

  return (
    <div className="camera-view w-full h-screen relative bg-black">
      {hasCamera ? (
        <video 
          ref={videoRef} 
          playsInline 
          autoPlay
          muted
          className="w-full h-full object-cover"
        />
      ) : (
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
              </ul>
            </div>
          ) : (
            <p>Initializing camera...</p>
          )}
        </div>
      )}
    </div>
  );
}
