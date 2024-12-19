'use client';

import { useState } from 'react';

export default function TransformControls({ image, onTransform }) {
  const [opacity, setOpacity] = useState(0.5);
  const [rotation, setRotation] = useState(0);

  const handleOpacityChange = (e) => {
    const newOpacity = parseFloat(e.target.value);
    setOpacity(newOpacity);
    onTransform({ opacity: newOpacity, rotation });
  };

  const handleRotationChange = (e) => {
    const newRotation = parseInt(e.target.value);
    setRotation(newRotation);
    onTransform({ opacity, rotation: newRotation });
  };

  return (
    <div className="transform-controls fixed bottom-20 left-4 right-4 z-50 bg-black/50 p-4 rounded-lg">
      <div className="flex items-center space-x-4">
        <label className="text-white">Opacity</label>
        <input 
          type="range" 
          min="0" 
          max="1" 
          step="0.1" 
          value={opacity}
          onChange={handleOpacityChange}
          className="flex-grow"
        />
      </div>
      <div className="flex items-center space-x-4 mt-4">
        <label className="text-white">Rotation</label>
        <input 
          type="range" 
          min="0" 
          max="360" 
          value={rotation}
          onChange={handleRotationChange}
          className="flex-grow"
        />
      </div>
    </div>
  );
}
