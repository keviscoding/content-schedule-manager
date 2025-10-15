import { useState } from 'react';

interface VideoPlayerProps {
  videoUrl: string;
  title: string;
  className?: string;
}

export function VideoPlayer({ videoUrl, title, className = '' }: VideoPlayerProps) {
  const [error, setError] = useState(false);

  return (
    <div className={`bg-black rounded-xl overflow-hidden ${className}`}>
      {error ? (
        <div className="w-full h-full flex items-center justify-center p-8 text-center">
          <div>
            <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-white mb-2">Unable to load video</p>
            <a 
              href={videoUrl} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-blue-400 hover:text-blue-300 text-sm underline"
            >
              Download video instead
            </a>
          </div>
        </div>
      ) : (
        <video
          controls
          className="w-full h-full"
          preload="metadata"
          crossOrigin="anonymous"
          onError={() => setError(true)}
        >
          <source src={videoUrl} type="video/mp4" />
          <source src={videoUrl} type="video/quicktime" />
          <source src={videoUrl} type="video/x-msvideo" />
          Your browser does not support the video tag.
        </video>
      )}
    </div>
  );
}
