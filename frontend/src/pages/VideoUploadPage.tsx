import { useQuery } from '@tanstack/react-query';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { api } from '../lib/api';
import { useAuthStore } from '../store/authStore';
import { VideoUpload } from '../components/VideoUpload';

export default function VideoUploadPage() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [searchParams] = useSearchParams();
  const channelId = searchParams.get('channelId');
  const taskId = searchParams.get('taskId');

  const { data: channelData } = useQuery({
    queryKey: ['channel', channelId],
    queryFn: async () => {
      if (!channelId) return null;
      const response = await api.get(`/api/channels/${channelId}`);
      return response.data;
    },
    enabled: !!channelId,
  });

  const { data: taskData } = useQuery({
    queryKey: ['task', taskId],
    queryFn: async () => {
      if (!taskId) return null;
      const response = await api.get(`/api/video-tasks/${taskId}`);
      return response.data;
    },
    enabled: !!taskId,
  });

  const channel = channelData?.channel;
  const task = taskData?.task;

  if (!channelId) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 p-8">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
            <p className="text-gray-600">No channel selected</p>
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
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <button
            onClick={() => navigate(`/channels/${channelId}`)}
            className="inline-flex items-center text-purple-600 hover:text-purple-700 mb-4 transition-colors font-medium"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Channel
          </button>

          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              Upload Video
            </h1>
            {channel && (
              <p className="text-gray-600 mt-1">
                Uploading to: <span className="font-semibold">{channel.name}</span>
              </p>
            )}
            {task && (
              <div className="mt-2 inline-flex items-center gap-2 px-3 py-1.5 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                </svg>
                Task: {task.title}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Upload Form */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <VideoUpload
            channelId={channelId}
            taskId={taskId || undefined}
            onUploadComplete={() => {
              navigate(`/channels/${channelId}`);
            }}
          />
        </div>
      </div>
    </div>
  );
}
