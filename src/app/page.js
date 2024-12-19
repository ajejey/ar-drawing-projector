// page.js
'use client';

import { useState, useRef } from 'react';
import dynamic from 'next/dynamic';
import { Canvas } from '@react-three/fiber';
import { ARButton } from '@react-three/xr';
import * as THREE from 'three';

// Dynamically import AR components to avoid SSR issues
// const ARScene = dynamic(() => import('./components/ARScene'), { ssr: false });

export default function Home() {
  const [isARStarted, setIsARStarted] = useState(false);
  const [referenceImage, setReferenceImage] = useState(null);
  const [overlayOpacity, setOverlayOpacity] = useState(0.7);

  return (
    <div className="fixed inset-0 bg-black">
      {!isARStarted ? (
        <StartScreen 
          onStart={() => setIsARStarted(true)}
          onImageUpload={setReferenceImage}
        />
      ) : (
        <div className="relative w-full h-full">
          <Canvas className="w-full h-full">
            <ARScene 
              referenceImage={referenceImage}
              opacity={overlayOpacity}
            />
          </Canvas>
          
          <Controls
            opacity={overlayOpacity}
            onOpacityChange={setOverlayOpacity}
            onReset={() => setIsARStarted(false)}
          />
        </div>
      )}
    </div>
  );
}

// components/StartScreen.js
const StartScreen = ({ onStart, onImageUpload }) => {
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        onImageUpload(e.target.result);
        onStart();
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-full space-y-8 p-4">
      <h1 className="text-2xl font-bold text-white text-center">
        AR Drawing Assistant
      </h1>
      
      <div className="max-w-md w-full space-y-4">
        <label className="block p-4 border-2 border-dashed border-gray-400 rounded-lg text-center cursor-pointer hover:border-blue-500 transition-colors">
          <span className="text-white mb-2 block">Upload Reference Image</span>
          <input
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="hidden"
          />
        </label>
        
        <div className="text-sm text-gray-400 text-center">
          Place a marker on your drawing paper for tracking
        </div>
      </div>
    </div>
  );
};

// components/ARScene.js
import { useThree, useFrame } from '@react-three/fiber';
import { useXR } from '@react-three/xr';

const ARScene = ({ referenceImage, opacity = 0.7 }) => {
  const { scene, camera } = useThree();
  const { isPresenting } = useXR();
  const markerRef = useRef();
  
  useEffect(() => {
    if (!referenceImage || !isPresenting) return;

    // Create marker group
    const markerGroup = new THREE.Group();
    scene.add(markerGroup);
    markerRef.current = markerGroup;

    // Create reference image plane
    const texture = new THREE.TextureLoader().load(referenceImage);
    const geometry = new THREE.PlaneGeometry(1, 1 * (texture.image.height / texture.image.width));
    const material = new THREE.MeshBasicMaterial({
      map: texture,
      transparent: true,
      opacity: opacity,
    });
    const plane = new THREE.Mesh(geometry, material);
    markerGroup.add(plane);

    // Setup AR.js context
    const arToolkitContext = new THREEx.ArToolkitContext({
      cameraParametersUrl: 'camera_para.dat',
      detectionMode: 'mono',
    });

    // Initialize AR context when camera parameters are ready
    arToolkitContext.init(() => {
      camera.projectionMatrix.copy(arToolkitContext.getProjectionMatrix());
    });

    // Create and initialize marker controls
    const markerControls = new THREEx.ArMarkerControls(arToolkitContext, markerGroup, {
      type: 'pattern',
      patternUrl: 'pattern-marker.patt',
    });

    // Update AR scene on each frame
    const onRenderFct = () => {
      if (arToolkitContext.arController !== null) {
        arToolkitContext.update(camera.source.domElement);
      }
    };

    // Start render loop
    useFrame(() => {
      onRenderFct();
    });

    return () => {
      scene.remove(markerGroup);
    };
  }, [referenceImage, scene, camera, isPresenting, opacity]);

  return null;
};


// components/Controls.js
const Controls = ({ opacity, onOpacityChange, onReset }) => {
  return (
    <div className="fixed bottom-4 left-4 right-4 bg-black/70 rounded-lg p-4 space-y-4">
      <div className="flex items-center space-x-4">
        <label className="text-white whitespace-nowrap">Opacity</label>
        <input
          type="range"
          min="0"
          max="1"
          step="0.1"
          value={opacity}
          onChange={(e) => onOpacityChange(parseFloat(e.target.value))}
          className="w-full"
        />
      </div>
      
      <div className="flex justify-between">
        <ARButton>Start AR</ARButton>
        
        <button
          onClick={onReset}
          className="px-4 py-2 bg-red-500 text-white rounded-lg"
        >
          Reset
        </button>
      </div>
    </div>
  );
};