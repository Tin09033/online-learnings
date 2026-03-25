import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Megaphone, AlertTriangle, AlertCircle, Info, Filter, Search } from 'lucide-react';
import { announcementAPI } from '../services/api';

const StudentAnnouncements = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const fetchAnnouncements = async () => {
    try {
      const response = await announcementAPI.getStudentAnnouncements();
      setAnnouncements(response.data);
    } catch (error) {
      console.error('Error fetching announcements:', error);
    } finally {
      setLoading(false);
    }
  };

  const getPriorityStyles = (priority) => {
    switch (priority) {
      case 'urgent':
        return { bg: 'bg-red-50 dark:bg-red-900/20', border: 'border-red-200 dark:border-red-800', badge: 'bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300', icon: AlertTriangle, iconColor: 'text-red-500' };
      case 'important':
        return { bg: 'bg-yellow-50 dark:bg-yellow-900/20', border: 'border-yellow-200 dark:border-yellow-800', badge: 'bg-yellow-100 dark:bg-yellow-900 text-yellow-700 dark:text-yellow-300', icon: AlertCircle, iconColor: 'text-yellow-500' };
      default:
        return { bg: 'bg-blue-50 dark:bg-blue-900/20', border: 'border-blue-200 dark:border-blue-800', badge: 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300', icon: Info, iconColor: 'text-blue-500' };
    }
  };

  const getPriorityIcon = (priority) => {
    switch (priority) {
      case 'urgent': return <AlertTriangle className="h-5 w-5 text-red-500" />;
      case 'important': return <AlertCircle className="h-5 w-5 text-yellow-500" />;
      default: return <Info className="h-5 w-5 text-blue-500" />;
    }
  };

  const filteredAnnouncements = announcements.filter(ann => {
    const matchesFilter = filter === 'all' || ann.priority === filter;
    const matchesSearch = ann.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         ann.content?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const priorityCounts = {
    urgent: announcements.filter(a => a.priority === 'urgent').length,
    important: announcements.filter(a => a.priority === 'important').length,
    normal: announcements.filter(a => a.priority === 'normal' || !a.priority).length,
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Announcements</h1>
        <p className="text-gray-500 dark:text-gray-400">Stay updated with the latest news and updates</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 cursor-pointer hover:shadow-md transition-shadow"
          onClick={() => setFilter(filter === 'urgent' ? 'all' : 'urgent')}
        >
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-xl flex items-center justify-center">
              <AlertTriangle className="h-6 w-6 text-red-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{priorityCounts.urgent}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Urgent</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 cursor-pointer hover:shadow-md transition-shadow"
          onClick={() => setFilter(filter === 'important' ? 'all' : 'important')}
        >
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-yellow-100 dark:bg-yellow-900/30 rounded-xl flex items-center justify-center">
              <AlertCircle className="h-6 w-6 text-yellow-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{priorityCounts.important}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Important</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 cursor-pointer hover:shadow-md transition-shadow"
          onClick={() => setFilter(filter === 'normal' ? 'all' : 'normal')}
        >
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center">
              <Info className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{priorityCounts.normal}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">General</p>
            </div>
          </div>
        </motion.div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm mb-6">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="h-5 w-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search announcements..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex gap-2">
              {['all', 'urgent', 'important', 'normal'].map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors capitalize
                    ${filter === f ? 'bg-blue-500 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'}`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="divide-y divide-gray-100 dark:divide-gray-700">
          {loading ? (
            <div className="p-8 text-center">
              <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
              <p className="text-gray-500 dark:text-gray-400">Loading announcements...</p>
            </div>
          ) : filteredAnnouncements.length === 0 ? (
            <div className="p-12 text-center">
              <Megaphone className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No announcements found</h3>
              <p className="text-gray-500 dark:text-gray-400">
                {filter !== 'all' ? `No ${filter} announcements available` : 'No announcements at this time'}
              </p>
            </div>
          ) : (
            filteredAnnouncements.map((announcement, index) => {
              const styles = getPriorityStyles(announcement.priority);
              const Icon = getPriorityIcon(announcement.priority);
              return (
                <motion.div
                  key={announcement.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className={`${styles.bg} border-l-4 ${styles.border} p-6`}
                >
                  <div className="flex items-start gap-4">
                    <div className="p-2 bg-white dark:bg-gray-800 rounded-xl shadow-sm">
                      {Icon}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-semibold text-gray-900 dark:text-white text-lg">{announcement.title}</h3>
                        <span className={`px-3 py-1 ${styles.badge} rounded-full text-xs font-medium capitalize`}>
                          {announcement.priority || 'normal'}
                        </span>
                      </div>
                      <p className="text-gray-600 dark:text-gray-300 mb-3">{announcement.content}</p>
                      <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                        <span>Posted: {new Date(announcement.created_at).toLocaleDateString()}</span>
                        {announcement.course_title && (
                          <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-xs">
                            {announcement.course_title}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

export default StudentAnnouncements;
