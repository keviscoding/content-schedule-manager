import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { api } from '../lib/api';
import { useAuthStore } from '../store/authStore';
import { useState } from 'react';

interface Channel {
  _id: string;
  name: string;
  youtubeUrl: string;
  status: 'on-time' | 'due-soon' | 'overdue';
  lastPostedAt: string | null;
  nextDeadline: string | null;
  targetPostingTime: string;
}

export default function Dashboard() {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const [showAddChannel, setShowAddChannel] = useState(false);
  const [newChannel, setNewChannel] = useState({
    name: '',
    youtubeUrl: '',
    targetPostingTime: '14:00',
  });

  const { data: channelsData, refetch } = useQuery({
    queryKey: ['channels'],
    queryFn: async () => {
      const response = await api.get('/api/channels');
      return response.data;
    },
  });

  const channels: Channel[] = channelsData?.channels || [];

  const handleAddChannel = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/api/channels', newChannel);
      setShowAddChannel(false);
      setNewChannel({ name: '', youtubeUrl: '', targetPostingTime: '14:00' });
      refetch();
    } catch (error) {
      alert('Failed to create channel');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'on-time':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'due-soon':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'overdue':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getTimeSince = (date: string | null) => {
    if (!date) return 'Never posted';
    const hours = Math.floor((Date.now() - new Date(date).getTime()) / (1000 * 60 * 60));
    if (hours < 1) return 'Less than 1 hour ago';
    if (hours === 1) return '1 hour ago';
    if (hours < 24) return `${hours} hours ago`;
    const days = Math.floor(hours / 24);
    return `${days} day${days > 1 ? 's' : ''} ago`;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
              <p className="text-sm text-gray-600">Welcome back, {user?.name}</p>
            </div>
            <button
              onClick={() => {
                logout();
                navigate('/');
              }}
              className="px-4 py-2 text-sm text-gray-700 hover:text-gray-900"
            >
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm font-medium text-gray-600">Total Channels</div>
            <div className="text-3xl font-bold text-gray-900 mt-2">{channels.length}</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm font-medium text-gray-600">Overdue</div>
            <div className="text-3xl font-bold text-red-600 mt-2">
              {channels.filter((c) => c.status === 'overdue').length}
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm font-medium text-gray-600">Due Soon</div>
            <div className="text-3xl font-bold text-yellow-600 mt-2">
              {channels.filter((c) => c.status === 'due-soon').length}
            </div>
          </div>
        </div>

        {/* Add Channel Button */}
        <div className="mb-6">
          <button
            onClick={() => setShowAddChannel(true)}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 font-medium"
          >
            + Add Channel
          </button>
        </div>

        {/* Add Channel Modal */}
        {showAddChannel && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <h2 className="text-xl font-bold mb-4">Add New Channel</h2>
              <form onSubmit={handleAddChannel} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Channel Name
                  </label>
                  <input
                    type="text"
                    value={newChannel.name}
                    onChange={(e) => setNewChannel({ ...newChannel, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    YouTube URL
                  </label>
                  <input
                    type="url"
                    value={newChannel.youtubeUrl}
                    onChange={(e) => setNewChannel({ ...newChannel, youtubeUrl: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="https://youtube.com/@yourchannel"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Target Posting Time
                  </label>
                  <input
                    type="time"
                    value={newChannel.targetPostingTime}
                    onChange={(e) => setNewChannel({ ...newChannel, targetPostingTime: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div className="flex gap-3">
                  <button
                    type="submit"
                    className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700"
                  >
                    Create Channel
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowAddChannel(false)}
                    className="flex-1 bg-gray-200 text-gray-700 py-2 rounded-lg hover:bg-gray-300"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Channels Grid */}
        {channels.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <p className="text-gray-600 mb-4">No channels yet. Add your first channel to get started!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {channels.map((channel) => (
              <div
                key={channel._id}
                onClick={() => navigate(`/channels/${channel._id}`)}
                className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow cursor-pointer p-6"
              >
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-lg font-bold text-gray-900">{channel.name}</h3>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(
                      channel.status
                    )}`}
                  >
                    {channel.status.replace('-', ' ')}
                  </span>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Last posted:</span>
                    <span className="font-medium">{getTimeSince(channel.lastPostedAt)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Target time:</span>
                    <span className="font-medium">{channel.targetPostingTime}</span>
                  </div>
                </div>
                <a
                  href={channel.youtubeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="mt-4 text-blue-600 hover:text-blue-700 text-sm inline-block"
                >
                  View on YouTube →
                </a>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
