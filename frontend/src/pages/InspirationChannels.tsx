import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../lib/api';
import { formatDistanceToNow } from 'date-fns';

function formatTimeAgo(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  const hours = Math.floor((Date.now() - d.getTime()) / (1000 * 60 * 60));
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return formatDistanceToNow(d, { addSuffix: true });
}

export function InspirationChannels() {
  const { channelId } = useParams();
  const [inspirationChannels, setInspirationChannels] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [channel, setChannel] = useState<any>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newCompetitor, setNewCompetitor] = useState({
    name: '',
    youtubeUrl: '',
    niche: '',
    notes: '',
  });
  const [adding, setAdding] = useState(false);

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

  const handleAddCompetitor = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCompetitor.name || !newCompetitor.youtubeUrl || !newCompetitor.niche) {
      alert('Please fill in all required fields');
      return;
    }

    setAdding(true);
    try {
      await api.post(`/api/channels/${channelId}/inspiration-channels`, newCompetitor);
      setShowAddModal(false);
      setNewCompetitor({ name: '', youtubeUrl: '', niche: '', notes: '' });
      await fetchData();
    } catch (error: any) {
      alert(error.response?.data?.error?.message || 'Failed to add competitor');
    } finally {
      setAdding(false);
    }
  };

  const handleDeleteCompetitor = async (competitorId: string) => {
    if (!confirm('Are you sure you want to remove this competitor?')) return;

    try {
      await api.delete(`/api/channels/${channelId}/inspiration-channels/${competitorId}`);
      await fetchData();
    } catch (error: any) {
      alert(error.response?.data?.error?.message || 'Failed to delete competitor');
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
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                Competitor Channels
              </h1>
              <p className="text-gray-600 mt-2">
                Track competitor performance for {channel?.name}
              </p>
            </div>
            <button
              onClick={() => setShowAddModal(true)}
              className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-xl hover:from-purple-700 hover:to-pink-700 font-semibold shadow-lg transition-all flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add Competitor
            </button>
          </div>
        </div>

        {/* Inspiration Channels Grid */}
        {inspirationChannels.length === 0 ? (
          <div className="text-center py-16">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-purple-100 rounded-full mb-4">
              <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No competitors yet</h3>
            <p className="text-gray-600 mb-4">Add competitor channels to track their performance</p>
            <button
              onClick={() => setShowAddModal(true)}
              className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-xl hover:from-purple-700 hover:to-pink-700 font-semibold"
            >
              Add First Competitor
            </button>
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

                    {inspo.notes && (
                      <p className="text-sm text-gray-500 italic mb-3">{inspo.notes}</p>
                    )}

                    {/* Recent Videos */}
                    {inspo.youtubeData?.recentVideos && inspo.youtubeData.recentVideos.length > 0 && (
                      <div className="mt-3">
                        <p className="text-xs font-semibold text-gray-700 mb-2">Recent Videos:</p>
                        <div className="grid grid-cols-2 gap-2">
                          {inspo.youtubeData.recentVideos.slice(0, 4).map((video: any, idx: number) => (
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

                  <div className="flex gap-2">
                    <a
                      href={inspo.youtubeUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 text-center bg-gradient-to-r from-purple-600 to-pink-600 text-white py-2 rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all duration-300 font-medium"
                    >
                      View on YouTube
                    </a>
                    <button
                      onClick={() => handleDeleteCompetitor(inspo._id)}
                      className="px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                      title="Remove competitor"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Competitor Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-8 w-full max-w-md shadow-2xl">
            <h2 className="text-2xl font-bold mb-6 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              Add Competitor Channel
            </h2>
            
            <form onSubmit={handleAddCompetitor} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Channel Name *
                </label>
                <input
                  type="text"
                  value={newCompetitor.name}
                  onChange={(e) => setNewCompetitor({ ...newCompetitor, name: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:ring-4 focus:ring-purple-100 transition-all outline-none"
                  placeholder="e.g., MrBeast"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  YouTube URL *
                </label>
                <input
                  type="url"
                  value={newCompetitor.youtubeUrl}
                  onChange={(e) => setNewCompetitor({ ...newCompetitor, youtubeUrl: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:ring-4 focus:ring-purple-100 transition-all outline-none"
                  placeholder="https://youtube.com/@channel"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Niche/Category *
                </label>
                <input
                  type="text"
                  value={newCompetitor.niche}
                  onChange={(e) => setNewCompetitor({ ...newCompetitor, niche: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:ring-4 focus:ring-purple-100 transition-all outline-none"
                  placeholder="e.g., Gaming, Comedy, Education"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Notes (optional)
                </label>
                <textarea
                  value={newCompetitor.notes}
                  onChange={(e) => setNewCompetitor({ ...newCompetitor, notes: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:ring-4 focus:ring-purple-100 transition-all outline-none resize-none"
                  placeholder="Why are you tracking this competitor?"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false);
                    setNewCompetitor({ name: '', youtubeUrl: '', niche: '', notes: '' });
                  }}
                  className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={adding}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all font-medium shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {adding ? 'Adding...' : 'Add Competitor'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
