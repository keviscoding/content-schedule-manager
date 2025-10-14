import { useQuery } from '@tanstack/react-query';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { api } from '../lib/api';
import { useState } from 'react';
import { AddTaskModal } from '../components/AddTaskModal';
import { formatDistanceToNow } from 'date-fns';

export default function ChannelDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [showAddTask, setShowAddTask] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState<string | null>(null);

  const { data: channelData } = useQuery({
    queryKey: ['channel', id],
    queryFn: async () => {
      const response = await api.get(`/api/channels/${id}`);
      return response.data;
    },
  });

  const { data: videosData, refetch: refetchVideos } = useQuery({
    queryKey: ['videos', id],
    queryFn: async () => {
      const response = await api.get(`/api/videos?channelId=${id}`);
      return response.data;
    },
  });

  const { data: tasksData, refetch: refetchTasks } = useQuery({
    queryKey: ['tasks', id],
    queryFn: async () => {
      const response = await api.get(`/api/video-tasks?channelId=${id}`);
      return response.data;
    },
  });

  const channel = channelData?.channel;
  const youtubeData = channelData?.youtubeData;
  const videos = videosData?.videos || [];
  const tasks = tasksData?.tasks || [];

  const handleAddTask = (videoId: string) => {
    setSelectedVideo(videoId);
    setShowAddTask(true);
  };

  const handleUpdateTaskStatus = async (taskId: string, status: string) => {
    try {
      await api.patch(`/api/video-tasks/${taskId}`, { status });
      refetchTasks();
    } catch (error) {
      alert('Failed to update task');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-gray-100 text-gray-700 border-gray-300';
      case 'in-progress':
        return 'bg-blue-100 text-blue-700 border-blue-300';
      case 'completed':
        return 'bg-green-100 text-green-700 border-green-300';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-300';
    }
  };

  const isDeadlineClose = (deadline: string) => {
    const hoursUntil = (new Date(deadline).getTime() - Date.now()) / (1000 * 60 * 60);
    return hoursUntil > 0 && hoursUntil < 24;
  };

  const isOverdue = (deadline: string) => {
    return new Date(deadline) < new Date();
  };

  if (!channel) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-12 bg-gray-200 rounded w-1/3"></div>
            <div className="h-64 bg-gray-200 rounded-2xl"></div>
          </div>
        </div>
      </div>
    );
  }

  const pendingTasks = tasks.filter((t: any) => t.status === 'pending');
  const inProgressTasks = tasks.filter((t: any) => t.status === 'in-progress');
  const completedTasks = tasks.filter((t: any) => t.status === 'completed');

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

          <div className="flex items-start gap-6">
            {youtubeData?.profilePicture && (
              <img
                src={youtubeData.profilePicture}
                alt={channel.name}
                className="w-24 h-24 rounded-2xl shadow-xl border-4 border-white"
              />
            )}
            <div className="flex-1">
              <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
                {channel.name}
              </h1>
              {youtubeData && (
                <div className="flex items-center gap-4 text-gray-600 mb-3">
                  <span className="font-semibold">{youtubeData.subscriberCount} subscribers</span>
                  {youtubeData.latestVideoTitle && (
                    <span className="text-sm">
                      Last upload: {formatDistanceToNow(new Date(youtubeData.latestVideoDate), { addSuffix: true })}
                    </span>
                  )}
                </div>
              )}
              <div className="flex gap-3">
                <a
                  href={channel.youtubeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors font-medium"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                  </svg>
                  View on YouTube
                </a>
                <Link
                  to={`/channels/${id}/inspiration`}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all font-medium"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  Inspiration Channels
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Task Board */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Task Board</h2>
            <div className="flex gap-2">
              {videos.length > 0 && (
                <select
                  onChange={(e) => e.target.value && handleAddTask(e.target.value)}
                  className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-medium cursor-pointer"
                  value=""
                >
                  <option value="">+ Add Task to Video</option>
                  {videos.map((video: any) => (
                    <option key={video._id} value={video._id}>
                      {video.title}
                    </option>
                  ))}
                </select>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Pending Column */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
                <h3 className="font-bold text-gray-900">Pending</h3>
                <span className="ml-auto bg-gray-100 text-gray-700 px-2 py-1 rounded-full text-xs font-semibold">
                  {pendingTasks.length}
                </span>
              </div>
              <div className="space-y-3">
                {pendingTasks.map((task: any) => (
                  <div
                    key={task._id}
                    className={`bg-gray-50 rounded-xl p-4 border-2 transition-all hover:shadow-md ${
                      isOverdue(task.deadline)
                        ? 'border-red-300 bg-red-50'
                        : isDeadlineClose(task.deadline)
                        ? 'border-yellow-300 bg-yellow-50'
                        : 'border-gray-200'
                    }`}
                  >
                    <h4 className="font-semibold text-gray-900 mb-2">{task.title}</h4>
                    {task.description && (
                      <p className="text-sm text-gray-600 mb-3">{task.description}</p>
                    )}
                    <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
                      <span>
                        {isOverdue(task.deadline) ? (
                          <span className="text-red-600 font-semibold">Overdue!</span>
                        ) : (
                          `Due ${formatDistanceToNow(new Date(task.deadline), { addSuffix: true })}`
                        )}
                      </span>
                    </div>
                    <button
                      onClick={() => handleUpdateTaskStatus(task._id, 'in-progress')}
                      className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                    >
                      Start Task
                    </button>
                  </div>
                ))}
                {pendingTasks.length === 0 && (
                  <p className="text-gray-400 text-center py-8 text-sm">No pending tasks</p>
                )}
              </div>
            </div>

            {/* In Progress Column */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
                <h3 className="font-bold text-gray-900">In Progress</h3>
                <span className="ml-auto bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-xs font-semibold">
                  {inProgressTasks.length}
                </span>
              </div>
              <div className="space-y-3">
                {inProgressTasks.map((task: any) => (
                  <div
                    key={task._id}
                    className="bg-blue-50 rounded-xl p-4 border-2 border-blue-200 transition-all hover:shadow-md"
                  >
                    <h4 className="font-semibold text-gray-900 mb-2">{task.title}</h4>
                    {task.description && (
                      <p className="text-sm text-gray-600 mb-3">{task.description}</p>
                    )}
                    <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
                      <span>
                        {isOverdue(task.deadline) ? (
                          <span className="text-red-600 font-semibold">Overdue!</span>
                        ) : (
                          `Due ${formatDistanceToNow(new Date(task.deadline), { addSuffix: true })}`
                        )}
                      </span>
                    </div>
                    <button
                      onClick={() => handleUpdateTaskStatus(task._id, 'completed')}
                      className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
                    >
                      Mark Complete
                    </button>
                  </div>
                ))}
                {inProgressTasks.length === 0 && (
                  <p className="text-gray-400 text-center py-8 text-sm">No tasks in progress</p>
                )}
              </div>
            </div>

            {/* Completed Column */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <h3 className="font-bold text-gray-900">Completed</h3>
                <span className="ml-auto bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs font-semibold">
                  {completedTasks.length}
                </span>
              </div>
              <div className="space-y-3">
                {completedTasks.map((task: any) => (
                  <div
                    key={task._id}
                    className="bg-green-50 rounded-xl p-4 border-2 border-green-200 transition-all hover:shadow-md opacity-75"
                  >
                    <h4 className="font-semibold text-gray-900 mb-2 line-through">{task.title}</h4>
                    {task.description && (
                      <p className="text-sm text-gray-600 mb-3">{task.description}</p>
                    )}
                    <div className="flex items-center gap-2 text-xs text-green-600">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      Completed
                    </div>
                  </div>
                ))}
                {completedTasks.length === 0 && (
                  <p className="text-gray-400 text-center py-8 text-sm">No completed tasks</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Videos List */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Videos</h2>
          {videos.length === 0 ? (
            <p className="text-gray-400 text-center py-8">No videos yet</p>
          ) : (
            <div className="space-y-3">
              {videos.map((video: any) => (
                <div key={video._id} className="border-2 border-gray-200 rounded-xl p-4 hover:border-purple-300 transition-all">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 mb-1">{video.title}</h3>
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(video.status)}`}>
                          {video.status}
                        </span>
                        {video.deadline && (
                          <span>Deadline: {new Date(video.deadline).toLocaleDateString()}</span>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => handleAddTask(video._id)}
                      className="px-4 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors text-sm font-medium"
                    >
                      + Add Task
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Add Task Modal */}
      {showAddTask && selectedVideo && (
        <AddTaskModal
          isOpen={showAddTask}
          onClose={() => {
            setShowAddTask(false);
            setSelectedVideo(null);
          }}
          channelId={id!}
          videoId={selectedVideo}
          onTaskAdded={() => {
            refetchTasks();
            setShowAddTask(false);
            setSelectedVideo(null);
          }}
        />
      )}
    </div>
  );
}
