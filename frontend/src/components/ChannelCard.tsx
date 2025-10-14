import { Link } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';

interface ChannelCardProps {
  channel: any;
  youtubeData?: any;
}

export function ChannelCard({ channel, youtubeData }: ChannelCardProps) {
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
      <div className="absolute top-4 right-4 z-10">
        <span className={`${getStatusColor(channel.status)} text-white text-xs font-semibold px-3 py-1.5 rounded-full shadow-lg`}>
          {getStatusText(channel.status)}
        </span>
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
        <Link to={`/channels/${channel._id}`}>
          <h3 className="text-xl font-bold text-gray-900 hover:text-purple-600 transition-colors mb-2">
            {channel.name}
          </h3>
        </Link>

        {youtubeData && (
          <div className="space-y-2 mb-4">
            <p className="text-sm text-gray-600">
              <span className="font-semibold">{youtubeData.subscriberCount}</span> subscribers
            </p>
            {youtubeData.latestVideoTitle && (
              <div className="text-sm text-gray-500">
                <p className="font-medium text-gray-700">Latest video:</p>
                <p className="truncate">{youtubeData.latestVideoTitle}</p>
                <p className="text-xs text-gray-400 mt-1">
                  {formatDistanceToNow(new Date(youtubeData.latestVideoDate), { addSuffix: true })}
                </p>
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
            Inspiration
          </Link>
        </div>
      </div>

      {/* Hover Effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-purple-500/0 to-pink-500/0 group-hover:from-purple-500/5 group-hover:to-pink-500/5 transition-all duration-300 pointer-events-none" />
    </div>
  );
}
