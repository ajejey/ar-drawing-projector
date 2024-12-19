'use client';

import { useState, useRef, useEffect } from 'react';

export default function ReferencePointSelector({ onPointsSelected }) {
  const [points, setPoints] = useState([]);
  const [isSelecting, setIsSelecting] = useState(false);
  const canvasRef = useRef(null);
  const videoRef = useRef(null);

  useEffect(() => {
    if (isSelecting && videoRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      
      // Match canvas size to video
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      
      // Draw video frame on canvas
      ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
    }
  }, [isSelecting]);

  const handleCanvasClick = (e) => {
    if (points.length >= 4) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const newPoint = { x, y };
    setPoints([...points, newPoint]);

    // Draw point on canvas
    const ctx = canvasRef.current.getContext('2d');
    ctx.fillStyle = '#00ff00';
    ctx.beginPath();
    ctx.arc(x, y, 5, 0, 2 * Math.PI);
    ctx.fill();

    // If we have all points, notify parent
    if (points.length === 3) {
      onPointsSelected([...points, newPoint]);
      setIsSelecting(false);
    }
  };

  const startSelection = () => {
    setIsSelecting(true);
    setPoints([]);
  };

  return (
    <div className="absolute inset-0 z-10">
      {isSelecting ? (
        <>
          <canvas
            ref={canvasRef}
            onClick={handleCanvasClick}
            className="absolute inset-0 w-full h-full"
          />
          <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-black/70 text-white p-2 rounded">
            Select {4 - points.length} reference points
          </div>
        </>
      ) : (
        <button
          onClick={startSelection}
          className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-blue-500 text-white px-4 py-2 rounded"
        >
          Set Reference Points
        </button>
      )}
    </div>
  );
}
