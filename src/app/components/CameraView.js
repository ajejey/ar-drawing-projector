'use client';

import { useState, useRef, useEffect } from 'react';

export default function CameraView() {
  const videoRef = useRef(null);
  const [devices, setDevices] = useState([]);
  const [selectedDevice, setSelectedDevice] = useState(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    initializeCamera();
    return () => {
      stopCamera();
    };
  }, []);

  const initializeCamera = async () => {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = devices.filter(device => device.kind === 'videoinput');
      setDevices(videoDevices);
      
      if (videoDevices.length > 0) {
        // Try to find back camera
        const backCamera = videoDevices.find(device => 
          device.label.toLowerCase().includes('back') || 
          device.label.toLowerCase().includes('environment')
        );
        const deviceId = backCamera ? backCamera.deviceId : videoDevices[0].deviceId;
        
        setSelectedDevice(deviceId);
        startCamera(deviceId);
      } else {
        setError('No cameras found');
      }
    } catch (err) {
      console.error('Camera initialization error:', err);
      setError('Failed to access camera. Please ensure camera permissions are granted.');
    }
  };

  const startCamera = async (deviceId) => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { 
          deviceId: deviceId ? { exact: deviceId } : undefined,
          facingMode: 'environment',
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        }
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
        setIsCameraActive(true);
        setError(null);
      }
    } catch (err) {
      console.error('Start camera error:', err);
      setError('Failed to start camera: ' + err.message);
    }
  };

  const stopCamera = () => {
    if (videoRef.current?.srcObject) {
      videoRef.current.srcObject.getTracks().forEach(track => track.stop());
    }
    setIsCameraActive(false);
  };

  const handleDeviceChange = (e) => {
    const deviceId = e.target.value;
    setSelectedDevice(deviceId);
    if (isCameraActive) {
      stopCamera();
      startCamera(deviceId);
    }
  };

  return (
    <div className="relative w-full h-screen bg-black">
      <video
        ref={videoRef}
        autoPlay
        playsInline
        className="w-full h-full object-cover"
      />

      {/* Camera Selection */}
      {devices.length > 1 && (
        <select
          value={selectedDevice || ''}
          onChange={handleDeviceChange}
          className="absolute top-4 right-4 p-2 bg-black/50 text-white rounded-lg"
        >
          {devices.map((device) => (
            <option key={device.deviceId} value={device.deviceId}>
              {device.label || `Camera ${devices.indexOf(device) + 1}`}
            </option>
          ))}
        </select>
      )}

      {/* Error Message */}
      {error && (
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 p-4 bg-black/70 text-red-500 rounded-lg text-center">
          <p>{error}</p>
          <p className="mt-2 text-sm text-white">
            Please ensure:
            <br />• Camera permissions are granted
            <br />• Using HTTPS or localhost
            <br />• Camera is not in use by another app
          </p>
        </div>
      )}
    </div>
  );
}
