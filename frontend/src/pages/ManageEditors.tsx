import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate, useParams } from 'react-router-dom';
import { api } from '../lib/api';
import { useState } from 'react';

export default function ManageEditors() {
  const navigate = useNavigate();
  const { channelId } = useParams();
  const queryClient = useQueryClient();
  const [editorEmail, setEditorEmail] = useState('');
  const [showAddEditor, setShowAddEditor] = useState(false);

  const { data: channelData } = useQuery({
    queryKey: ['channel', channelId],
    queryFn: async () => {
      const response = await api.get(`/api/channels/${channelId}`);
      return response.data;
    },
  });

  const { data: editorsData, refetch } = useQuery({
    queryKey: ['channel-editors', channelId],
    queryFn: async () => {
      const response = await api.get(`/api/channels/${channelId}/editors`);
      return response.data;
    },
  });

  const { data: allUsersData } = useQuery({
    queryKey: ['all-editors'],
    queryFn: async () => {
      const response = await api.get('/api/auth/users?role=editor');
      return response.data;
    },
  });

  const addEditorMutation = useMutation({
    mutationFn: async (email: string) => {
      // First find the user by email
      const users = allUsersData?.users || [];
      const editor = users.find((u: any) => u.email === email);
      
      if (!editor) {
        throw new Error('Editor not found');
      }

      await api.post(`/api/channels/${channelId}/editors`, {
        editorId: editor._id,
      });
    },
    onSuccess: () => {
      refetch();
      setEditorEmail('');
      setShowAddEditor(false);
    },
    onError: (error: any) => {
      alert(error.response?.data?.error?.message || 'Failed to add editor');
    },
  });

  const removeEditorMutation = useMutation({
    mutationFn: async (editorId: string) => {
      await api.delete(`/api/channels/${channelId}/editors/${editorId}`);
    },
    onSuccess: () => {
      refetch();
    },
  });

  const channel = channelData?.channel;
  const editors = editorsData?.editors || [];
  const allEditors = allUsersData?.users || [];
  const assignedEditorIds = editors.map((e: any) => e.editorId._id);
  const availableEditors = allEditors.filter((e: any) => !assignedEditorIds.includes(e._id));

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
              Manage Editors
            </h1>
            {channel && (
              <p className="text-gray-600 mt-1">
                Channel: <span className="font-semibold">{channel.name}</span>
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Add Editor Button */}
        <div className="mb-6">
          <button
            onClick={() => setShowAddEditor(true)}
            className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-xl hover:from-purple-700 hover:to-pink-700 font-semibold shadow-lg transition-all flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add Editor
          </button>
        </div>

        {/* Editors List */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          {editors.length === 0 ? (
            <div className="p-16 text-center">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-purple-100 rounded-full mb-4">
                <svg className="w-10 h-10 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">No editors assigned</h3>
              <p className="text-gray-600">Add editors to give them access to this channel</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {editors.map((assignment: any) => (
                <div key={assignment._id} className="p-6 flex items-center justify-between hover:bg-gray-50 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                      <span className="text-white font-bold text-lg">
                        {assignment.editorId.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{assignment.editorId.name}</h3>
                      <p className="text-sm text-gray-600">{assignment.editorId.email}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      if (confirm(`Remove ${assignment.editorId.name} from this channel?`)) {
                        removeEditorMutation.mutate(assignment.editorId._id);
                      }
                    }}
                    className="px-4 py-2 bg-red-100 text-red-700 rounded-xl hover:bg-red-200 transition-colors font-medium text-sm"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Add Editor Modal */}
        {showAddEditor && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl p-8 w-full max-w-md shadow-2xl">
              <h2 className="text-2xl font-bold mb-6 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                Add Editor
              </h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Select Editor
                  </label>
                  <select
                    value={editorEmail}
                    onChange={(e) => setEditorEmail(e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:ring-4 focus:ring-purple-100 transition-all outline-none"
                  >
                    <option value="">Choose an editor...</option>
                    {availableEditors.map((editor: any) => (
                      <option key={editor._id} value={editor.email}>
                        {editor.name} ({editor.email})
                      </option>
                    ))}
                  </select>
                  {availableEditors.length === 0 && (
                    <p className="text-sm text-gray-500 mt-2">
                      All editors are already assigned to this channel
                    </p>
                  )}
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddEditor(false);
                      setEditorEmail('');
                    }}
                    className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => editorEmail && addEditorMutation.mutate(editorEmail)}
                    disabled={!editorEmail || addEditorMutation.isPending}
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all font-medium shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {addEditorMutation.isPending ? 'Adding...' : 'Add Editor'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
