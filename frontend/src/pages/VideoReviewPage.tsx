import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { api } from '../lib/api';
import { useAuthStore } from '../store/authStore';
import { VideoPlayer } from '../components/VideoPlayer';
import { useState } from 'react';
import { formatDistanceToNow } from 'date-fns';

export default function VideoReviewPage() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const queryClient = useQueryClient();
  const [selectedVideo, setSelectedVideo] = useState<any>(null);
  const [rejectionNotes, setRejectionNotes] = useState('');
  const [filter, setFilter] = useState<'pending' | 'all'>('pending');

  const { data: videosData, isLoading } = useQuery({
    queryKey: ['videos', filter],
    queryFn: async () => {
      const params = filter === 'pending' ? '?status=pending' : '';
      const response = await api.get(`/api/videos${params}`);
      return response.data;
    },
  });

  const approveMutation = useMutation({
    mutationFn: async (videoId: string) => {
      await api.post(`/api/videos/${videoId}/approve`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['videos'] });
      setSelectedVideo(null);
    },
  });

  const rejectMutation = useMutation({
    mutationFn: async ({ videoId, notes }: { videoId: string; notes: string }) => {
      await api.post(`/api/videos/${videoId}/reject`, { notes });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['videos'] });
      setSelectedVideo(null);
      setRejectionNotes('');
    },
  });

  const markPostedMutation = useMutation({
    mutationFn: async (videoId: string) => {
      await api.post(`/api/videos/${videoId}/mark-posted`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['videos'] });
      setSelectedVideo(null);
    },
  });

  const videos = videosData?.videos || [];
  const pendingCount = videos.filter((v: any) => v.status === 'pending').length;
  const approvedCount = videos.filter((v: any) => v.status === 'approved').length;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-700 border-yellow-300';
      case 'approved':
        return 'bg-green-100 text-green-700 border-green-300';
      case 'rejected':
        return 'bg-red-100 text-red-700 border-red-300';
      case 'posted':
        return 'bg-blue-100 text-blue-700 border-blue-300';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-300';
    }
  };

  if (user?.role !== 'owner') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 p-8">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
            <p className="text-gray-600">Only owners can review videos</p>
            <button
              onClick={() => navigate('/dashboard')}
              className="mt-4 px-6 py-2 bg-purple-600 text-white rounded-xl hover:bg-purple-700"
            >
              Go to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-lg shadow-lg border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <button
            onClick={() => navigate('/dashboard')}
            className="inline-flex items-center text-purple-600 hover:text-purple-700 mb-4 transition-colors font-medium"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Dashboard
          </button>

          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                Review Videos
              </h1>
              <p className="text-gray-600 mt-1">Approve or reject submitted videos</p>
            </div>

            {/* Stats */}
            <div className="flex gap-4">
              <div className="bg-yellow-100 rounded-xl px-4 py-2 border-2 border-yellow-300">
                <div className="text-2xl font-bold text-yellow-700">{pendingCount}</div>
                <div className="text-xs text-yellow-600">Pending</div>
              </div>
              <div className="bg-green-100 rounded-xl px-4 py-2 border-2 border-green-300">
                <div className="text-2xl font-bold text-green-700">{approvedCount}</div>
                <div className="text-xs text-green-600">Approved</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filter */}
        <div className="mb-6 flex gap-2">
          <button
            onClick={() => setFilter('pending')}
            className={`px-4 py-2 rounded-xl font-medium transition-all ${
              filter === 'pending'
                ? 'bg-purple-600 text-white shadow-lg'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            Pending Review
          </button>
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-xl font-medium transition-all ${
              filter === 'all'
                ? 'bg-purple-600 text-white shadow-lg'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            All Videos
          </button>
        </div>

        {/* Videos Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-2xl shadow-lg p-6 animate-pulse">
                <div className="h-48 bg-gray-200 rounded-xl mb-4"></div>
                <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        ) : videos.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg p-16 text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-purple-100 rounded-full mb-4">
              <svg className="w-10 h-10 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">No videos to review</h3>
            <p className="text-gray-600">Videos will appear here when editors upload them</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {videos.map((video: any) => (
              <div
                key={video._id}
                className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all cursor-pointer"
                onClick={() => setSelectedVideo(video)}
              >
                {/* Thumbnail */}
                <div className="relative h-48 bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                  <svg className="w-16 h-16 text-white opacity-50" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" />
                  </svg>
                  <div className="absolute top-3 right-3">
                    <span className={`px-3 py-1.5 rounded-full text-xs font-semibold border-2 ${getStatusColor(video.status)}`}>
                      {video.status}
                    </span>
                  </div>
                </div>

                {/* Info */}
                <div className="p-4">
                  <h3 className="font-bold text-gray-900 mb-2 line-clamp-2">{video.title}</h3>
                  <div className="space-y-1 text-sm text-gray-600">
                    <p className="flex items-center gap-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z" />
                      </svg>
                      {video.channelId?.name || 'Unknown Channel'}
                    </p>
                    <p className="flex items-center gap-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {formatDistanceToNow(new Date(video.createdAt), { addSuffix: true })}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Video Review Modal */}
      {selectedVideo && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">Review Video</h2>
              <button
                onClick={() => {
                  setSelectedVideo(null);
                  setRejectionNotes('');
                }}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Video Player */}
            <div className="p-6">
              <VideoPlayer videoUrl={selectedVideo.fileUrl} title={selectedVideo.title} className="mb-6" />

              {/* Video Info */}
              <div className="space-y-4">
                <div>
                  <h3 className="text-xl font-bold text-gray-900">{selectedVideo.title}</h3>
                  <p className="text-sm text-gray-500 mt-1">
                    Uploaded {formatDistanceToNow(new Date(selectedVideo.createdAt), { addSuffix: true })}
                  </p>
                </div>

                {selectedVideo.description && (
                  <div>
                    <h4 className="font-semibold text-gray-700 mb-1">Description</h4>
                    <p className="text-gray-600">{selectedVideo.description}</p>
                  </div>
                )}

                {selectedVideo.tags && selectedVideo.tags.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-gray-700 mb-2">Tags</h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedVideo.tags.map((tag: string, index: number) => (
                        <span
                          key={index}
                          className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-medium"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-200">
                  <div>
                    <h4 className="font-semibold text-gray-700 mb-1">Channel</h4>
                    <p className="text-gray-600">{selectedVideo.channelId?.name}</p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-700 mb-1">Status</h4>
                    <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold border-2 ${getStatusColor(selectedVideo.status)}`}>
                      {selectedVideo.status}
                    </span>
                  </div>
                </div>

                {/* Rejection Notes Input (for pending videos) */}
                {selectedVideo.status === 'pending' && (
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Rejection Notes (optional)
                    </label>
                    <textarea
                      value={rejectionNotes}
                      onChange={(e) => setRejectionNotes(e.target.value)}
                      rows={3}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:ring-4 focus:ring-purple-100 transition-all outline-none resize-none"
                      placeholder="Explain what needs to be changed..."
                    />
                  </div>
                )}

                {/* Rejection Notes Display (for rejected videos) */}
                {selectedVideo.status === 'rejected' && selectedVideo.rejectionNotes && (
                  <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4">
                    <h4 className="font-semibold text-red-700 mb-1">Rejection Notes</h4>
                    <p className="text-red-600">{selectedVideo.rejectionNotes}</p>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 mt-6">
                {selectedVideo.status === 'pending' && (
                  <>
                    <button
                      onClick={() => rejectMutation.mutate({ videoId: selectedVideo._id, notes: rejectionNotes })}
                      disabled={rejectMutation.isPending}
                      className="flex-1 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors font-semibold disabled:opacity-50"
                    >
                      Reject
                    </button>
                    <button
                      onClick={() => approveMutation.mutate(selectedVideo._id)}
                      disabled={approveMutation.isPending}
                      className="flex-1 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors font-semibold disabled:opacity-50"
                    >
                      Approve
                    </button>
                  </>
                )}
                {selectedVideo.status === 'approved' && (
                  <button
                    onClick={() => markPostedMutation.mutate(selectedVideo._id)}
                    disabled={markPostedMutation.isPending}
                    className="flex-1 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-semibold disabled:opacity-50"
                  >
                    Mark as Posted
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
