'use client';

import { useState, useRef, useEffect } from 'react';

export default function ReferencePointSelector({ onPointsSelected, videoRef }) {
  const [points, setPoints] = useState([]);
  const [isSelecting, setIsSelecting] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const canvasRef = useRef(null);

  const steps = [
    'Place your drawing paper on a flat surface',
    'Click on the TOP-LEFT corner of your paper',
    'Click on the TOP-RIGHT corner of your paper',
    'Click on the BOTTOM-RIGHT corner of your paper',
    'Click on the BOTTOM-LEFT corner of your paper'
  ];

  useEffect(() => {
    if (isSelecting && videoRef.current) {
      const updateCanvas = () => {
        const canvas = canvasRef.current;
        const video = videoRef.current;
        
        if (!canvas || !video) return;
        
        // Match canvas size to video
        canvas.width = video.videoWidth || video.clientWidth;
        canvas.height = video.videoHeight || video.clientHeight;
        
        const ctx = canvas.getContext('2d');
        
        // Clear canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Draw video frame
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        // Draw guide overlay
        drawGuideOverlay(ctx, canvas.width, canvas.height);
        
        // Draw existing points and connections
        drawPoints(ctx);
      };

      const animationFrame = requestAnimationFrame(function animate() {
        updateCanvas();
        requestAnimationFrame(animate);
      });

      return () => cancelAnimationFrame(animationFrame);
    }
  }, [isSelecting, points, videoRef]);

  const drawGuideOverlay = (ctx, width, height) => {
    // Add semi-transparent overlay
    ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
    ctx.fillRect(0, 0, width, height);

    // Draw corner indicators based on current step
    if (currentStep > 0 && currentStep < 5) {
      const cornerSize = Math.min(width, height) * 0.1;
      const corners = [
        { x: cornerSize, y: cornerSize },
        { x: width - cornerSize, y: cornerSize },
        { x: width - cornerSize, y: height - cornerSize },
        { x: cornerSize, y: height - cornerSize }
      ];

      ctx.strokeStyle = '#00ff00';
      ctx.lineWidth = 2;
      
      // Highlight current corner
      const currentCorner = corners[currentStep - 1];
      ctx.beginPath();
      ctx.arc(currentCorner.x, currentCorner.y, 20, 0, 2 * Math.PI);
      ctx.stroke();
      
      // Add pulsing animation
      const pulse = (Math.sin(Date.now() / 200) + 1) / 2;
      ctx.strokeStyle = `rgba(0, 255, 0, ${pulse})`;
      ctx.beginPath();
      ctx.arc(currentCorner.x, currentCorner.y, 30, 0, 2 * Math.PI);
      ctx.stroke();
    }
  };

  const drawPoints = (ctx) => {
    if (points.length === 0) return;

    // Draw points
    ctx.fillStyle = '#00ff00';
    points.forEach((point, index) => {
      ctx.beginPath();
      ctx.arc(point.x, point.y, 5, 0, 2 * Math.PI);
      ctx.fill();
      
      // Add point number
      ctx.fillStyle = 'white';
      ctx.font = '16px Arial';
      ctx.fillText(index + 1, point.x + 10, point.y + 10);
    });

    // Connect points with lines
    if (points.length > 1) {
      ctx.strokeStyle = '#00ff00';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(points[0].x, points[0].y);
      points.forEach((point, index) => {
        if (index > 0) {
          ctx.lineTo(point.x, point.y);
        }
      });
      if (points.length === 4) {
        ctx.lineTo(points[0].x, points[0].y);
      }
      ctx.stroke();
    }
  };

  const handleCanvasClick = (e) => {
    if (points.length >= 4) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) * (canvasRef.current.width / rect.width);
    const y = (e.clientY - rect.top) * (canvasRef.current.height / rect.height);
    
    const newPoint = { x, y };
    setPoints([...points, newPoint]);
    setCurrentStep(currentStep + 1);

    // If we have all points, notify parent
    if (points.length === 3) {
      setTimeout(() => {
        onPointsSelected([...points, newPoint]);
        setIsSelecting(false);
        setCurrentStep(0);
      }, 500);
    }
  };

  const startSelection = () => {
    setIsSelecting(true);
    setPoints([]);
    setCurrentStep(1);
  };

  const resetPoints = () => {
    setPoints([]);
    setCurrentStep(1);
  };

  return (
    <div className="absolute inset-0 z-10">
      {isSelecting ? (
        <>
          <canvas
            ref={canvasRef}
            onClick={handleCanvasClick}
            className="absolute inset-0 w-full h-full cursor-crosshair"
          />
          <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-black/70 text-white p-4 rounded-lg text-center max-w-sm">
            <p className="text-lg font-bold mb-2">{steps[currentStep]}</p>
            <p className="text-sm">Points set: {points.length} / 4</p>
            {points.length > 0 && (
              <button
                onClick={resetPoints}
                className="mt-2 px-3 py-1 bg-red-500 text-white rounded-full text-sm"
              >
                Reset Points
              </button>
            )}
          </div>
        </>
      ) : (
        <button
          onClick={startSelection}
          className="absolute top-24 left-1/2 -translate-x-1/2 bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg font-medium shadow-lg transition-colors"
        >
          Set Reference Points
        </button>
      )}
    </div>
  );
}
