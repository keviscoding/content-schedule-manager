import { Link } from 'react-router-dom';
import { TimeSinceUpload } from './TimeSinceUpload';
import { formatDistanceToNow } from 'date-fns';

interface ChannelCardProps {
  channel: any;
  youtubeData?: any;
  onDelete?: (channelId: string) => void;
  onArchive?: (channelId: string) => void;
  onUnarchive?: (channelId: string) => void;
}

function formatTimeAgo(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  const hours = Math.floor((Date.now() - d.getTime()) / (1000 * 60 * 60));
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return formatDistanceToNow(d, { addSuffix: true });
}

export function ChannelCard({ channel, youtubeData, onDelete, onArchive, onUnarchive }: ChannelCardProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'on-time':
        return 'bg-gradient-to-r from-green-500 to-emerald-500';
      case 'at-risk':
        return 'bg-gradient-to-r from-yellow-500 to-orange-500';
      case 'overdue':
        return 'bg-gradient-to-r from-red-500 to-pink-500';
      default:
        return 'bg-gradient-to-r from-gray-500 to-slate-500';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'on-time':
        return 'On Track';
      case 'at-risk':
        return 'At Risk';
      case 'overdue':
        return 'Overdue';
      default:
        return status;
    }
  };

  return (
    <div className="group relative bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-100">
      {/* Status Badge */}
      <div className="absolute top-4 right-4 z-10 flex items-center gap-2">
        <span className={`${getStatusColor(channel.status)} text-white text-xs font-semibold px-3 py-1.5 rounded-full shadow-lg`}>
          {getStatusText(channel.status)}
        </span>
        {onArchive && (
          <button
            onClick={(e) => {
              e.preventDefault();
              if (confirm(`Archive "${channel.name}"? You can restore it later from the archived channels view.`)) {
                onArchive(channel._id);
              }
            }}
            className="bg-gray-500 hover:bg-gray-600 text-white p-2 rounded-full shadow-lg transition-colors"
            title="Archive channel"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
            </svg>
          </button>
        )}
        {onUnarchive && (
          <button
            onClick={(e) => {
              e.preventDefault();
              if (confirm(`Restore "${channel.name}" to active channels?`)) {
                onUnarchive(channel._id);
              }
            }}
            className="bg-green-500 hover:bg-green-600 text-white p-2 rounded-full shadow-lg transition-colors"
            title="Unarchive channel"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
            </svg>
          </button>
        )}
        {onDelete && (
          <button
            onClick={(e) => {
              e.preventDefault();
              if (confirm(`Are you sure you want to delete "${channel.name}"? This will also remove all associated editors and tasks.`)) {
                onDelete(channel._id);
              }
            }}
            className="bg-red-500 hover:bg-red-600 text-white p-2 rounded-full shadow-lg transition-colors"
            title="Delete channel"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        )}
      </div>

      {/* Channel Header with Profile Picture */}
      <div className="relative h-32 bg-gradient-to-br from-purple-500 via-pink-500 to-red-500 p-6">
        {youtubeData?.profilePicture && (
          <img
            src={youtubeData.profilePicture}
            alt={channel.name}
            className="absolute bottom-0 left-6 w-20 h-20 rounded-full border-4 border-white shadow-xl transform translate-y-1/2"
          />
        )}
      </div>

      {/* Channel Info */}
      <div className="pt-12 px-6 pb-6">
        <div className="flex items-center gap-2 mb-2">
          <a 
            href={channel.youtubeUrl} 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-xl font-bold text-gray-900 hover:text-purple-600 transition-colors flex items-center gap-1"
          >
            {channel.name}
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </a>
        </div>

        {youtubeData && (
          <div className="space-y-3 mb-4">
            <p className="text-sm text-gray-600">
              <span className="font-semibold">{youtubeData.subscriberCount}</span> subscribers
            </p>
            
            {/* Real-time counter */}
            <div>
              <p className="text-xs font-medium text-gray-500 mb-1.5">Last Upload:</p>
              <TimeSinceUpload 
                lastUploadDate={channel.latestVideoDate || youtubeData.latestVideoDate} 
                showIcon={true}
              />
            </div>

            {/* Recent Videos */}
            {youtubeData.recentVideos && youtubeData.recentVideos.length > 0 && (
              <div className="mt-4">
                <p className="text-xs font-semibold text-gray-700 mb-2">Recent Videos:</p>
                <div className="grid grid-cols-2 gap-2">
                  {youtubeData.recentVideos.slice(0, 4).map((video: any, idx: number) => (
                    <a
                      key={idx}
                      href={video.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group/video relative block rounded-lg overflow-hidden hover:ring-2 hover:ring-purple-500 transition-all"
                    >
                      <div className="aspect-[9/16] bg-gray-200">
                        <img
                          src={video.thumbnail}
                          alt={video.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-2">
                        <p className="text-white text-[10px] font-medium line-clamp-2 mb-1">
                          {video.title}
                        </p>
                        <div className="flex items-center justify-between text-[9px] text-white/90">
                          <span>{video.viewCount} views</span>
                          <span>{formatTimeAgo(video.publishedAt)}</span>
                        </div>
                      </div>
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
          <div className="text-sm text-gray-600">
            <span className="font-medium">Target:</span> {channel.targetPostingTime}
          </div>
          
          <Link
            to={`/channels/${channel._id}/inspiration`}
            className="flex items-center gap-1 text-purple-600 hover:text-purple-700 transition-colors text-sm font-medium"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            Competitors
          </Link>
        </div>
      </div>

      {/* Hover Effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-purple-500/0 to-pink-500/0 group-hover:from-purple-500/5 group-hover:to-pink-500/5 transition-all duration-300 pointer-events-none" />
    </div>
  );
}
