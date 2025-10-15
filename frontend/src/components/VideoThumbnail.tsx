import { useEffect, useRef, useState } from 'react';

interface VideoThumbnailProps {
  videoUrl: string;
  className?: string;
}

export function VideoThumbnail({ videoUrl, className = '' }: VideoThumbnailProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [thumbnail, setThumbnail] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;

    if (!video || !canvas) return;

    const generateThumbnail = () => {
      try {
        // Set canvas size to match video (9:16 aspect ratio)
        canvas.width = 360;
        canvas.height = 640;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Draw the video frame to canvas
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

        // Convert canvas to data URL
        const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
        setThumbnail(dataUrl);
        setLoading(false);
      } catch (error) {
        console.error('Failed to generate thumbnail:', error);
        setLoading(false);
      }
    };

    // Generate thumbnail when video metadata is loaded
    video.addEventListener('loadeddata', () => {
      // Seek to 1 second (or 10% of video duration)
      video.currentTime = Math.min(1, video.duration * 0.1);
    });

    video.addEventListener('seeked', generateThumbnail);

    return () => {
      video.removeEventListener('loadeddata', generateThumbnail);
      video.removeEventListener('seeked', generateThumbnail);
    };
  }, [videoUrl]);

  return (
    <div className={`relative ${className}`}>
      {/* Hidden video element for thumbnail generation */}
      <video
        ref={videoRef}
        src={videoUrl}
        crossOrigin="anonymous"
        className="hidden"
        preload="metadata"
      />
      
      {/* Hidden canvas for frame capture */}
      <canvas ref={canvasRef} className="hidden" />

      {/* Display thumbnail or loading state */}
      {loading ? (
        <div className="w-full h-full bg-gradient-to-br from-purple-500 via-pink-500 to-red-500 flex items-center justify-center animate-pulse">
          <svg className="w-16 h-16 text-white opacity-50" fill="currentColor" viewBox="0 0 20 20">
            <path d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" />
          </svg>
        </div>
      ) : thumbnail ? (
        <img
          src={thumbnail}
          alt="Video thumbnail"
          className="w-full h-full object-cover"
        />
      ) : (
        <div className="w-full h-full bg-gradient-to-br from-purple-500 via-pink-500 to-red-500 flex items-center justify-center">
          <svg className="w-16 h-16 text-white opacity-50" fill="currentColor" viewBox="0 0 20 20">
            <path d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" />
          </svg>
        </div>
      )}

      {/* Play icon overlay */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-16 h-16 bg-black/50 rounded-full flex items-center justify-center backdrop-blur-sm">
          <svg className="w-8 h-8 text-white ml-1" fill="currentColor" viewBox="0 0 20 20">
            <path d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" />
          </svg>
        </div>
      </div>
    </div>
  );
}
