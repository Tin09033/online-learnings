import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Trash2, Edit, Megaphone, AlertTriangle, AlertCircle, Info, X, Save, Calendar, Users, Clock, Send, UserCheck } from 'lucide-react';
import { announcementAPI, coursesAPI, studentGroupAPI } from '../services/api';
import { toast } from 'react-toastify';

const AdminAnnouncements = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [courses, setCourses] = useState([]);
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingAnnouncement, setEditingAnnouncement] = useState(null);
  const [filterType, setFilterType] = useState('all');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [announcementToDelete, setAnnouncementToDelete] = useState(null);
  const [deletingAnnouncement, setDeletingAnnouncement] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    priority: 'normal',
    course_id: '',
    send_to_all: false,
    scheduled_at: '',
    group_ids: []
  });

  useEffect(() => {
    fetchAnnouncements();
    fetchCourses();
    fetchGroups();
  }, []);

  const fetchAnnouncements = async () => {
    try {
      const response = await announcementAPI.getAll();
      setAnnouncements(response.data);
    } catch (error) {
      toast.error('Failed to load announcements');
    } finally {
      setLoading(false);
    }
  };

  const fetchCourses = async () => {
    try {
      const response = await coursesAPI.getAll({ limit: 100 });
      setCourses(response.data.courses);
    } catch (error) {
      console.error('Failed to load courses');
    }
  };

  const fetchGroups = async () => {
    try {
      const response = await studentGroupAPI.getAll();
      setGroups(response.data);
    } catch (error) {
      console.error('Failed to load groups');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.title || !formData.content || !formData.priority) {
      toast.error('Please fill up all');
      return;
    }

    if (!formData.course_id && !formData.send_to_all && (!formData.group_ids || formData.group_ids.length === 0)) {
      toast.error('Please select a course');
      return;
    }

    if (formData.scheduled_at) {
      const scheduledDate = new Date(formData.scheduled_at);
      if (scheduledDate <= new Date()) {
        toast.error('Scheduled date must be in the future');
        return;
      }
    }

    try {
      const submitData = { ...formData };
      if (submitData.send_to_all) {
        submitData.course_id = null;
      }
      
      if (editingAnnouncement) {
        await announcementAPI.update(editingAnnouncement.id, submitData);
        toast.success('Announcement updated successfully');
      } else {
        await announcementAPI.create(submitData);
        toast.success(formData.scheduled_at ? 'Announcement scheduled successfully' : 'Announcement published successfully');
      }
      setShowModal(false);
      setEditingAnnouncement(null);
      setFormData({ title: '', content: '', priority: 'normal', course_id: '', send_to_all: false, scheduled_at: '', group_ids: [] });
      fetchAnnouncements();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save announcement');
    }
  };

  const handleEdit = (announcement) => {
    setEditingAnnouncement(announcement);
    setFormData({
      title: announcement.title,
      content: announcement.content,
      priority: announcement.priority,
      course_id: announcement.course_id || '',
      send_to_all: !announcement.course_id,
      scheduled_at: announcement.scheduled_at ? announcement.scheduled_at.slice(0, 16) : '',
      group_ids: announcement.groups?.map(g => g.id) || []
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    const announcement = announcements.find(a => a.id === id);
    setAnnouncementToDelete(announcement);
    setShowDeleteModal(true);
  };

  const confirmDeleteAnnouncement = async () => {
    if (!announcementToDelete) return;
    setDeletingAnnouncement(true);
    
    try {
      await announcementAPI.delete(announcementToDelete.id);
      toast.success('Announcement deleted successfully');
      setShowDeleteModal(false);
      setAnnouncementToDelete(null);
      fetchAnnouncements();
    } catch (error) {
      toast.error('Failed to delete announcement');
    } finally {
      setDeletingAnnouncement(false);
    }
  };

  const cancelDeleteAnnouncement = () => {
    setShowDeleteModal(false);
    setAnnouncementToDelete(null);
  };

  const getPriorityIcon = (priority) => {
    switch (priority) {
      case 'urgent':
        return <AlertTriangle className="h-5 w-5 text-red-500" />;
      case 'important':
        return <AlertCircle className="h-5 w-5 text-yellow-500" />;
      default:
        return <Info className="h-5 w-5 text-blue-500" />;
    }
  };

  const getPriorityBadge = (priority) => {
    switch (priority) {
      case 'urgent':
        return 'bg-red-100 text-red-700';
      case 'important':
        return 'bg-yellow-100 text-yellow-700';
      default:
        return 'bg-blue-100 text-blue-700';
    }
  };

  const getStatusBadge = (announcement) => {
    if (announcement.scheduled_at && new Date(announcement.scheduled_at) > new Date()) {
      return { text: 'Scheduled', class: 'bg-purple-100 text-purple-700' };
    }
    if (!announcement.course_id && (!announcement.groups || announcement.groups.length === 0)) {
      return { text: 'Broadcast', class: 'bg-green-100 text-green-700' };
    }
    if (announcement.groups && announcement.groups.length > 0) {
      return { text: `Groups (${announcement.groups.length})`, class: 'bg-indigo-100 text-indigo-700' };
    }
    return null;
  };

  const filteredAnnouncements = announcements.filter(a => {
    if (filterType === 'scheduled') {
      return a.scheduled_at && new Date(a.scheduled_at) > new Date();
    }
    if (filterType === 'broadcast') {
      return !a.course_id && (!a.groups || a.groups.length === 0);
    }
    if (filterType === 'course') {
      return a.course_id;
    }
    if (filterType === 'groups') {
      return a.groups && a.groups.length > 0;
    }
    return true;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Announcements</h1>
          <p className="text-gray-600 dark:text-gray-400">Create and manage course announcements</p>
        </div>
        <button
          onClick={() => {
            setEditingAnnouncement(null);
            setFormData({ title: '', content: '', priority: 'normal', course_id: '', send_to_all: false, scheduled_at: '', group_ids: [] });
            setShowModal(true);
          }}
          className="bg-primary-600 text-white px-6 py-3 rounded-xl hover:bg-primary-700 transition-colors flex items-center space-x-2 shadow-lg"
        >
          <Plus className="h-5 w-5" />
          <span>New Announcement</span>
        </button>
      </div>

      <div className="flex flex-wrap gap-2">
        {[
          { key: 'all', label: 'All' },
          { key: 'scheduled', label: 'Scheduled', icon: <Clock className="h-4 w-4" /> },
          { key: 'broadcast', label: 'Broadcast', icon: <Users className="h-4 w-4" /> },
          { key: 'course', label: 'Course-specific', icon: <Megaphone className="h-4 w-4" /> },
          { key: 'groups', label: 'Groups', icon: <UserCheck className="h-4 w-4" /> }
        ].map(filter => (
          <button
            key={filter.key}
            onClick={() => setFilterType(filter.key)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center space-x-2 ${
              filterType === filter.key
                ? 'bg-primary-600 text-white'
                : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
          >
            {filter.icon}
            <span>{filter.label}</span>
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      ) : filteredAnnouncements.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-12 text-center">
          <Megaphone className="h-16 w-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">No announcements found</h3>
          <p className="text-gray-600 dark:text-gray-400">Create announcements to notify students about important updates</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredAnnouncements.map((announcement, index) => {
            const statusBadge = getStatusBadge(announcement);
            return (
              <motion.div
                key={announcement.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.05 }}
                className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4 flex-1">
                    <div className={`p-3 rounded-xl ${
                      announcement.priority === 'urgent' ? 'bg-red-100' :
                      announcement.priority === 'important' ? 'bg-yellow-100' : 'bg-blue-100'
                    }`}>
                      {getPriorityIcon(announcement.priority)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{announcement.title}</h3>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityBadge(announcement.priority)}`}>
                          {announcement.priority}
                        </span>
                        {statusBadge && (
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusBadge.class}`}>
                            {statusBadge.text}
                          </span>
                        )}
                      </div>
                      <p className="text-gray-600 dark:text-gray-400 mb-3 whitespace-pre-wrap">{announcement.content}</p>
                      <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                        <span>By {announcement.author_name || 'Admin'}</span>
                        <span>•</span>
                        {announcement.scheduled_at && new Date(announcement.scheduled_at) > new Date() ? (
                          <span className="flex items-center gap-1 text-purple-600">
                            <Calendar className="h-4 w-4" />
                            Scheduled: {new Date(announcement.scheduled_at).toLocaleString()}
                          </span>
                        ) : (
                          <span>{new Date(announcement.created_at).toLocaleDateString()}</span>
                        )}
                        {announcement.course_title && (
                          <>
                            <span>•</span>
                            <span className="flex items-center gap-1">
                              <Megaphone className="h-4 w-4" />
                              {announcement.course_title}
                            </span>
                          </>
                        )}
                        {announcement.groups && announcement.groups.length > 0 && (
                          <>
                            <span>•</span>
                            <span className="flex items-center gap-1">
                              <UserCheck className="h-4 w-4" />
                              {announcement.groups.map(g => g.name).join(', ')}
                            </span>
                          </>
                        )}
                        {!announcement.course_id && (!announcement.groups || announcement.groups.length === 0) && (
                          <span className="flex items-center gap-1">
                            <Users className="h-4 w-4" />
                            All Students
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 ml-4">
                    <button
                      onClick={() => handleEdit(announcement)}
                      className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
                      title="Edit"
                    >
                      <Edit className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => handleDelete(announcement.id)}
                      className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700 sticky top-0 bg-white dark:bg-gray-800">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                {editingAnnouncement ? 'Edit Announcement' : 'Create New Announcement'}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Title *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
                  placeholder="Enter announcement title"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Content *
                </label>
                <textarea
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
                  placeholder="Enter announcement content"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Priority
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {['normal', 'important', 'urgent'].map((priority) => (
                    <button
                      key={priority}
                      type="button"
                      onClick={() => setFormData({ ...formData, priority })}
                      className={`p-3 rounded-lg border-2 transition-all flex flex-col items-center space-y-1 ${
                        formData.priority === priority
                          ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300'
                          : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 text-gray-700 dark:text-gray-300'
                      }`}
                    >
                      {getPriorityIcon(priority)}
                      <span className="text-sm font-medium capitalize">{priority}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.send_to_all}
                    onChange={(e) => setFormData({ ...formData, send_to_all: e.target.checked, course_id: '' })}
                    className="w-5 h-5 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                  />
                  <div className="flex items-center space-x-2">
                    <Users className="h-5 w-5 text-gray-400" />
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Send to All Students</span>
                  </div>
                </label>
                <p className="text-xs text-gray-500 mt-1 ml-8">Broadcast this announcement to all enrolled students</p>
              </div>

              {!formData.send_to_all && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Select Course
                    </label>
                    <select
                      value={formData.course_id}
                      onChange={(e) => setFormData({ ...formData, course_id: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
                    >
                      <option value="">Select a course</option>
                      {courses.map(course => (
                        <option key={course.id} value={course.id}>{course.title}</option>
                      ))}
                    </select>
                  </div>

                  {groups.length > 0 && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Send to Groups
                      </label>
                      <div className="border border-gray-300 dark:border-gray-600 rounded-lg p-3 max-h-40 overflow-y-auto space-y-2">
                        {groups.map(group => (
                          <label
                            key={group.id}
                            className={`flex items-center space-x-3 p-2 rounded-lg cursor-pointer transition-colors ${
                              formData.group_ids?.includes(group.id)
                                ? 'bg-primary-50 dark:bg-primary-900/30'
                                : 'hover:bg-gray-50 dark:hover:bg-gray-700'
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={formData.group_ids?.includes(group.id) || false}
                              onChange={(e) => {
                                const current = formData.group_ids || [];
                                if (e.target.checked) {
                                  setFormData({ ...formData, group_ids: [...current, group.id] });
                                } else {
                                  setFormData({ ...formData, group_ids: current.filter(id => id !== group.id) });
                                }
                              }}
                              className="w-4 h-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                            />
                            <div className="flex items-center space-x-2 flex-1">
                              <Users className="h-4 w-4 text-gray-400" />
                              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{group.name}</span>
                              <span className="text-xs text-gray-500">({group.member_count || 0} members)</span>
                            </div>
                          </label>
                        ))}
                      </div>
                      <p className="text-xs text-gray-500 mt-1">Select one or more groups to send this announcement</p>
                    </div>
                  )}
                </>
              )}

              <div>
                <label className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={!!formData.scheduled_at}
                    onChange={(e) => setFormData({ ...formData, scheduled_at: e.target.checked ? getDefaultScheduledDate() : '' })}
                    className="w-5 h-5 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                  />
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-5 w-5 text-gray-400" />
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Schedule for Later</span>
                  </div>
                </label>
                <p className="text-xs text-gray-500 mt-1 ml-8">Set a date and time to automatically publish this announcement</p>
              </div>

              {formData.scheduled_at && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Scheduled Date & Time
                  </label>
                  <input
                    type="datetime-local"
                    value={formData.scheduled_at}
                    onChange={(e) => setFormData({ ...formData, scheduled_at: e.target.value })}
                    min={new Date().toISOString().slice(0, 16)}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>
              )}

              <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-6 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors flex items-center space-x-2"
                >
                  <Send className="h-4 w-4" />
                  <span>{formData.scheduled_at ? 'Schedule' : 'Publish'}</span>
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {showDeleteModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <div className="fixed inset-0 bg-black/50 transition-opacity" onClick={cancelDeleteAnnouncement}></div>
            <div className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-xl max-w-md w-full p-6 transform transition-all">
              <div className="flex flex-col items-center text-center">
                <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mb-4">
                  <AlertTriangle className="h-6 w-6 text-red-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Delete Announcement</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  Are you sure you want to delete <span className="font-semibold text-gray-900 dark:text-white">"{announcementToDelete?.title}"</span>? This action cannot be undone.
                </p>
                <div className="flex space-x-3 w-full">
                  <button
                    onClick={cancelDeleteAnnouncement}
                    disabled={deletingAnnouncement}
                    className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors font-medium disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={confirmDeleteAnnouncement}
                    disabled={deletingAnnouncement}
                    className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium disabled:opacity-50 flex items-center justify-center"
                  >
                    {deletingAnnouncement ? (
                      <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                    ) : 'Delete'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

function getDefaultScheduledDate() {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(9, 0, 0, 0);
  return tomorrow.toISOString().slice(0, 16);
}

export default AdminAnnouncements;
