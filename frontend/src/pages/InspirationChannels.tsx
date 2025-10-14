import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../lib/api';
import { formatDistanceToNow } from 'date-fns';

export function InspirationChannels() {
  const { channelId } = useParams();
  const [inspirationChannels, setInspirationChannels] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [channel, setChannel] = useState<any>(null);

  useEffect(() => {
    fetchData();
  }, [channelId]);

  const fetchData = async () => {
    try {
      const [channelRes, inspoRes] = await Promise.all([
        api.get(`/api/channels/${channelId}`),
        api.get(`/api/channels/${channelId}/inspiration-channels`),
      ]);
      setChannel(channelRes.data.channel);
      setInspirationChannels(inspoRes.data.inspirationChannels);
    } catch (error) {
      console.error('Error fetching inspiration channels:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-12 bg-gray-200 rounded w-1/3"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-64 bg-gray-200 rounded-2xl"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link
            to={`/channels/${channelId}`}
            className="inline-flex items-center text-purple-600 hover:text-purple-700 mb-4 transition-colors"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to {channel?.name}
          </Link>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            Inspiration Channels
          </h1>
          <p className="text-gray-600 mt-2">
            Channels that inspire your content for {channel?.name}
          </p>
        </div>

        {/* Inspiration Channels Grid */}
        {inspirationChannels.length === 0 ? (
          <div className="text-center py-16">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-purple-100 rounded-full mb-4">
              <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No inspiration channels yet</h3>
            <p className="text-gray-600">Add channels that inspire your content</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {inspirationChannels.map((inspo) => (
              <div
                key={inspo._id}
                className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden group"
              >
                {/* Thumbnail */}
                {inspo.youtubeData?.latestVideoThumbnail && (
                  <div className="relative h-48 overflow-hidden">
                    <img
                      src={inspo.youtubeData.latestVideoThumbnail}
                      alt={inspo.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    <div className="absolute bottom-4 left-4 right-4">
                      <h3 className="text-white font-bold text-lg truncate">{inspo.name}</h3>
                    </div>
                  </div>
                )}

                {/* Content */}
                <div className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    {inspo.youtubeData?.profilePicture && (
                      <img
                        src={inspo.youtubeData.profilePicture}
                        alt={inspo.name}
                        className="w-12 h-12 rounded-full border-2 border-purple-200"
                      />
                    )}
                    <div>
                      <p className="text-sm font-semibold text-gray-900">{inspo.name}</p>
                      {inspo.youtubeData?.subscriberCount && (
                        <p className="text-xs text-gray-500">{inspo.youtubeData.subscriberCount} subscribers</p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs font-medium rounded-full">
                        {inspo.niche}
                      </span>
                    </div>

                    {inspo.youtubeData?.latestVideoTitle && (
                      <div className="text-sm text-gray-600">
                        <p className="font-medium text-gray-700">Latest:</p>
                        <p className="truncate">{inspo.youtubeData.latestVideoTitle}</p>
                        <p className="text-xs text-gray-400 mt-1">
                          {formatDistanceToNow(new Date(inspo.youtubeData.latestVideoDate), { addSuffix: true })}
                        </p>
                      </div>
                    )}

                    {inspo.notes && (
                      <p className="text-sm text-gray-500 italic">{inspo.notes}</p>
                    )}
                  </div>

                  <a
                    href={inspo.youtubeUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block w-full text-center bg-gradient-to-r from-purple-600 to-pink-600 text-white py-2 rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all duration-300 font-medium"
                  >
                    View on YouTube
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
