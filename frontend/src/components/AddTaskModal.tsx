import { useState, useEffect } from 'react';
import { api } from '../lib/api';

interface AddTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  channelId: string;
  videoId: string;
  onTaskAdded: () => void;
}

export function AddTaskModal({ isOpen, onClose, channelId, videoId, onTaskAdded }: AddTaskModalProps) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    deadline: '',
    editorId: '',
  });
  const [loading, setLoading] = useState(false);
  const [editors, setEditors] = useState<any[]>([]);

  useEffect(() => {
    if (isOpen) {
      fetchEditors();
    }
  }, [isOpen]);

  const fetchEditors = async () => {
    try {
      const res = await api.get(`/api/channels/${channelId}/editors`);
      setEditors(res.data.editors);
    } catch (error) {
      console.error('Error fetching editors:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await api.post(`/api/video-tasks`, {
        videoId,
        ...formData,
      });
      
      // Success animation
      const modal = document.getElementById('task-modal-content');
      modal?.classList.add('scale-95', 'opacity-0');
      
      setTimeout(() => {
        onTaskAdded();
        onClose();
        setFormData({ title: '', description: '', deadline: '', editorId: '' });
      }, 200);
    } catch (error) {
      console.error('Error creating task:', error);
      alert('Failed to create task');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn">
      <div
        id="task-modal-content"
        className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto transition-all duration-200"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">Create New Task</h2>
              <p className="text-purple-100 text-sm mt-1">Assign a video editing task to your team</p>
            </div>
            <button
              onClick={onClose}
              className="text-white/80 hover:text-white transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Title */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Task Title *
            </label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:ring-4 focus:ring-purple-100 transition-all outline-none"
              placeholder="e.g., Edit intro sequence"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={4}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:ring-4 focus:ring-purple-100 transition-all outline-none resize-none"
              placeholder="Provide details about what needs to be done..."
            />
          </div>

          {/* Deadline */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Deadline *
            </label>
            <input
              type="datetime-local"
              required
              value={formData.deadline}
              onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:ring-4 focus:ring-purple-100 transition-all outline-none"
            />
          </div>

          {/* Editor Assignment */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Assign to Editor
            </label>
            <select
              value={formData.editorId}
              onChange={(e) => setFormData({ ...formData, editorId: e.target.value })}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:ring-4 focus:ring-purple-100 transition-all outline-none"
            >
              <option value="">Select an editor (optional)</option>
              {editors.map((editor) => (
                <option key={editor._id} value={editor.editorId._id}>
                  {editor.editorId.name} ({editor.editorId.email})
                </option>
              ))}
            </select>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all font-medium shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Creating...
                </span>
              ) : (
                'Create Task'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
