'use client';

import { useEffect, useRef } from 'react';

export default function ImageTracker({ referencePoints, videoRef, imageElement }) {
  const trackingRef = useRef({
    isTracking: false,
    lastPoints: null
  });

  useEffect(() => {
    let animationFrame;
    const cv = window.cv; // OpenCV.js instance

    const trackPoints = async () => {
      if (!videoRef.current || !cv || !referencePoints.length) return;

      const video = videoRef.current;
      
      // Create video capture from current frame
      const cap = new cv.VideoCapture(video);
      const frame = new cv.Mat(video.height, video.width, cv.CV_8UC4);
      cap.read(frame);

      // Convert frame to grayscale for feature detection
      const gray = new cv.Mat();
      cv.cvtColor(frame, gray, cv.COLOR_RGBA2GRAY);

      // Detect features using Good Features to Track
      const corners = new cv.Mat();
      const maxCorners = 50;
      const qualityLevel = 0.01;
      const minDistance = 10;
      cv.goodFeaturesToTrack(
        gray, corners, maxCorners, qualityLevel, minDistance
      );

      // If we have previous points, calculate optical flow
      if (trackingRef.current.lastPoints) {
        const status = new cv.Mat();
        const err = new cv.Mat();
        const nextPts = new cv.Mat();
        
        cv.calcOpticalFlowPyrLK(
          trackingRef.current.lastFrame, gray,
          trackingRef.current.lastPoints, nextPts,
          status, err
        );

        // Calculate homography matrix
        const H = cv.findHomography(
          trackingRef.current.lastPoints,
          nextPts,
          cv.RANSAC
        );

        // Apply transformation to image overlay
        if (imageElement) {
          applyTransformation(H, imageElement);
        }

        // Cleanup
        status.delete();
        err.delete();
        nextPts.delete();
        H.delete();
      }

      // Store current points and frame for next iteration
      trackingRef.current.lastPoints = corners;
      trackingRef.current.lastFrame = gray.clone();

      // Cleanup
      frame.delete();
      gray.delete();
      corners.delete();

      // Continue tracking
      animationFrame = requestAnimationFrame(trackPoints);
    };

    // Start tracking when we have reference points
    if (referencePoints.length === 4) {
      trackingRef.current.isTracking = true;
      trackPoints();
    }

    return () => {
      if (animationFrame) {
        cancelAnimationFrame(animationFrame);
      }
      // Cleanup OpenCV matrices
      if (trackingRef.current.lastFrame) {
        trackingRef.current.lastFrame.delete();
      }
      if (trackingRef.current.lastPoints) {
        trackingRef.current.lastPoints.delete();
      }
    };
  }, [referencePoints, videoRef, imageElement]);

  const applyTransformation = (H, imageElement) => {
    // Apply 3x3 homography matrix to transform image
    const transform = `matrix3d(
      ${H.data64F[0]}, ${H.data64F[1]}, 0, ${H.data64F[2]},
      ${H.data64F[3]}, ${H.data64F[4]}, 0, ${H.data64F[5]},
      0, 0, 1, 0,
      ${H.data64F[6]}, ${H.data64F[7]}, 0, ${H.data64F[8]}
    )`;
    
    imageElement.style.transform = transform;
  };

  return null; // This is a logic-only component
}
