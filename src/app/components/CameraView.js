'use client';

import { useState, useRef, useEffect } from 'react';

export default function CameraView() {
  const [hasCamera, setHasCamera] = useState(false);
  const [cameraError, setCameraError] = useState(null);
  const [debugInfo, setDebugInfo] = useState('Initializing...');
  const [cameras, setCameras] = useState([]);
  const [activeCameraId, setActiveCameraId] = useState(null);
  const videoRef = useRef(null);

  // Function to enumerate available cameras
  const getCameras = async () => {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = devices.filter(device => device.kind === 'videoinput');
      setCameras(videoDevices);
      setDebugInfo(`Found ${videoDevices.length} cameras`);
      return videoDevices;
    } catch (error) {
      setDebugInfo('Error getting cameras: ' + error.message);
      return [];
    }
  };

  // Function to start the camera with specific constraints
  const startCamera = async (deviceId = null) => {
    try {
      const constraints = {
        video: deviceId ? { deviceId: { exact: deviceId } } : { facingMode: 'environment' },
        audio: false
      };

      setDebugInfo('Requesting camera access...');
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
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
      }
    } catch (error) {
      console.error('Camera access error:', error);
      setDebugInfo('Access error: ' + error.message);
      setCameraError(error.message || 'Failed to access camera');
    }
  };

  // Function to switch camera
  const switchCamera = async () => {
    if (videoRef.current?.srcObject) {
      const tracks = videoRef.current.srcObject.getTracks();
      tracks.forEach(track => track.stop());
    }

    const currentIndex = cameras.findIndex(camera => camera.deviceId === activeCameraId);
    const nextIndex = (currentIndex + 1) % cameras.length;
    const nextCamera = cameras[nextIndex];
    
    setActiveCameraId(nextCamera.deviceId);
    await startCamera(nextCamera.deviceId);
  };

  useEffect(() => {
    async function initializeCamera() {
      setDebugInfo('Checking browser support...');
      
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setCameraError('Browser does not support camera access');
        setDebugInfo('No mediaDevices support');
        return;
      }

      const videoDevices = await getCameras();
      
      if (videoDevices.length > 0) {
        // Try to find back camera first
        const backCamera = videoDevices.find(device => 
          device.label.toLowerCase().includes('back') || 
          device.label.toLowerCase().includes('environment')
        );
        
        const deviceId = backCamera ? backCamera.deviceId : videoDevices[0].deviceId;
        setActiveCameraId(deviceId);
        await startCamera(deviceId);
      } else {
        // Fallback to default camera
        await startCamera();
      }
    }

    initializeCamera();

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
        <>
          <video 
            ref={videoRef} 
            playsInline 
            autoPlay
            muted
            className="w-full h-full object-cover"
          />
          {cameras.length > 1 && (
            <button
              onClick={switchCamera}
              className="absolute top-4 right-4 bg-white/30 p-2 rounded-full"
            >
              Switch Camera
            </button>
          )}
        </>
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
