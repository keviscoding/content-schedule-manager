interface VideoPlayerProps {
  videoUrl: string;
  title: string;
  className?: string;
}

export function VideoPlayer({ videoUrl, title, className = '' }: VideoPlayerProps) {
  return (
    <div className={`bg-black rounded-xl overflow-hidden ${className}`}>
      <video
        controls
        className="w-full h-full"
        preload="metadata"
      >
        <source src={videoUrl} type="video/mp4" />
        Your browser does not support the video tag.
      </video>
    </div>
  );
}
