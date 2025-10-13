import { useQuery } from '@tanstack/react-query';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../lib/api';
import { useState } from 'react';

export default function ChannelDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [showAddInspiration, setShowAddInspiration] = useState(false);
  const [newInspiration, setNewInspiration] = useState({
    name: '',
    youtubeUrl: '',
    niche: '',
    notes: '',
  });

  const { data: channelData, refetch } = useQuery({
    queryKey: ['channel', id],
    queryFn: async () => {
      const response = await api.get(`/api/channels/${id}`);
      return response.data;
    },
  });

  const { data: inspirationData, refetch: refetchInspiration } = useQuery({
    queryKey: ['inspiration', id],
    queryFn: async () => {
      const response = await api.get(`/api/channels/${id}/inspiration-channels`);
      return response.data;
    },
  });

  const { data: tasksData } = useQuery({
    queryKey: ['tasks', id],
    queryFn: async () => {
      const response = await api.get(`/api/video-tasks?channelId=${id}`);
      return response.data;
    },
  });

  const channel = channelData?.channel;
  const inspirationChannels = inspirationData?.inspirationChannels || [];
  const tasks = tasksData?.tasks || [];

  const handleAddInspiration = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post(`/api/channels/${id}/inspiration-channels`, newInspiration);
      setShowAddInspiration(false);
      setNewInspiration({ name: '', youtubeUrl: '', niche: '', notes: '' });
      refetchInspiration();
    } catch (error) {
      alert('Failed to add inspiration channel');
    }
  };

  const handleDeleteInspiration = async (inspirationId: string) => {
    if (!confirm('Remove this inspiration channel?')) return;
    try {
      await api.delete(`/api/channels/${id}/inspiration-channels/${inspirationId}`);
      refetchInspiration();
    } catch (error) {
      alert('Failed to remove inspiration channel');
    }
  };

  if (!channel) {
    return <div className="p-8">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <button
            onClick={() => navigate('/dashboard')}
            className="text-blue-600 hover:text-blue-700 mb-2 text-sm"
          >
            ← Back to Dashboard
          </button>
          <h1 className="text-2xl font-bold text-gray-900">{channel.name}</h1>
          <a
            href={channel.youtubeUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:text-blue-700 text-sm"
          >
            View on YouTube →
          </a>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Channel Stats */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-lg font-bold mb-4">Channel Status</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <div className="text-sm text-gray-600">Status</div>
              <div className="text-lg font-semibold capitalize">{channel.status.replace('-', ' ')}</div>
            </div>
            <div>
              <div className="text-sm text-gray-600">Last Posted</div>
              <div className="text-lg font-semibold">
                {channel.lastPostedAt
                  ? new Date(channel.lastPostedAt).toLocaleDateString()
                  : 'Never'}
              </div>
            </div>
            <div>
              <div className="text-sm text-gray-600">Target Time</div>
              <div className="text-lg font-semibold">{channel.targetPostingTime}</div>
            </div>
          </div>
        </div>

        {/* Inspiration Channels */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-bold">Inspiration Channels</h2>
            <button
              onClick={() => setShowAddInspiration(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 text-sm"
            >
              + Add Inspiration
            </button>
          </div>

          {inspirationChannels.length === 0 ? (
            <p className="text-gray-600 text-center py-8">
              No inspiration channels yet. Add channels you want to model!
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {inspirationChannels.map((insp: any) => (
                <div key={insp._id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-semibold">{insp.name}</h3>
                    <button
                      onClick={() => handleDeleteInspiration(insp._id)}
                      className="text-red-600 hover:text-red-700 text-sm"
                    >
                      Remove
                    </button>
                  </div>
                  <div className="text-sm text-gray-600 mb-2">
                    <span className="font-medium">Niche:</span> {insp.niche}
                  </div>
                  {insp.notes && (
                    <div className="text-sm text-gray-600 mb-2">{insp.notes}</div>
                  )}
                  <a
                    href={insp.youtubeUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-700 text-sm"
                  >
                    View Channel →
                  </a>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Tasks */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-bold mb-4">Video Tasks</h2>
          {tasks.length === 0 ? (
            <p className="text-gray-600 text-center py-8">No tasks yet</p>
          ) : (
            <div className="space-y-3">
              {tasks.map((task: any) => (
                <div key={task._id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold">{task.title}</h3>
                      <p className="text-sm text-gray-600 mt-1">{task.description}</p>
                      {task.instructions && (
                        <p className="text-sm text-gray-500 mt-1">
                          Instructions: {task.instructions}
                        </p>
                      )}
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        task.status === 'completed'
                          ? 'bg-green-100 text-green-800'
                          : task.status === 'in-progress'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {task.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Add Inspiration Modal */}
      {showAddInspiration && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Add Inspiration Channel</h2>
            <form onSubmit={handleAddInspiration} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Channel Name
                </label>
                <input
                  type="text"
                  value={newInspiration.name}
                  onChange={(e) => setNewInspiration({ ...newInspiration, name: e.target.value })}
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
                  value={newInspiration.youtubeUrl}
                  onChange={(e) =>
                    setNewInspiration({ ...newInspiration, youtubeUrl: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Niche</label>
                <input
                  type="text"
                  value={newInspiration.niche}
                  onChange={(e) => setNewInspiration({ ...newInspiration, niche: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Notes (optional)
                </label>
                <textarea
                  value={newInspiration.notes}
                  onChange={(e) => setNewInspiration({ ...newInspiration, notes: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                  placeholder="What do you like about this channel?"
                />
              </div>
              <div className="flex gap-3">
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700"
                >
                  Add Channel
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddInspiration(false)}
                  className="flex-1 bg-gray-200 text-gray-700 py-2 rounded-lg hover:bg-gray-300"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
