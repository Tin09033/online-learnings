import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Bell, AlertTriangle, AlertCircle, Info, BookOpen, CreditCard, Video, CheckCircle } from 'lucide-react';
import { notificationsAPI } from '../services/api';
import { toast } from 'react-toastify';

const StudentNotifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const response = await notificationsAPI.getMy();
      setNotifications(response.data);
    } catch (error) {
      toast.error('Failed to load notifications');
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id) => {
    try {
      await notificationsAPI.markAsRead(id);
      setNotifications(notifications.map(n => 
        n.id === id ? { ...n, is_read: 1 } : n
      ));
    } catch (error) {
      console.error('Failed to mark as read');
    }
  };

  const markAllAsRead = async () => {
    try {
      await notificationsAPI.markAllAsRead();
      setNotifications(notifications.map(n => ({ ...n, is_read: 1 })));
      toast.success('All notifications marked as read');
    } catch (error) {
      toast.error('Failed to mark all as read');
    }
  };

  const getNotificationIcon = (type, priority) => {
    if (type === 'payment_confirmed') {
      return <CheckCircle className="h-6 w-6 text-green-500" />;
    }
    if (type === 'class_link') {
      return <Video className="h-6 w-6 text-purple-500" />;
    }
    if (type === 'enrollment_pending') {
      return <CreditCard className="h-6 w-6 text-orange-500" />;
    }
    switch (priority) {
      case 'urgent':
        return <AlertTriangle className="h-6 w-6 text-red-500" />;
      case 'important':
        return <AlertCircle className="h-6 w-6 text-yellow-500" />;
      default:
        return <Info className="h-6 w-6 text-blue-500" />;
    }
  };

  const getNotificationStyles = (type, priority) => {
    if (type === 'payment_confirmed') {
      return { bg: 'bg-green-50 dark:bg-green-900/20', border: 'border-green-200 dark:border-green-800', badge: 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300' };
    }
    if (type === 'class_link') {
      return { bg: 'bg-purple-50 dark:bg-purple-900/20', border: 'border-purple-200 dark:border-purple-800', badge: 'bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300' };
    }
    if (type === 'enrollment_pending') {
      return { bg: 'bg-orange-50 dark:bg-orange-900/20', border: 'border-orange-200 dark:border-orange-800', badge: 'bg-orange-100 dark:bg-orange-900 text-orange-700 dark:text-orange-300' };
    }
    switch (priority) {
      case 'urgent':
        return { bg: 'bg-red-50 dark:bg-red-900/20', border: 'border-red-200 dark:border-red-800', badge: 'bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300' };
      case 'important':
        return { bg: 'bg-yellow-50 dark:bg-yellow-900/20', border: 'border-yellow-200 dark:border-yellow-800', badge: 'bg-yellow-100 dark:bg-yellow-900 text-yellow-700 dark:text-yellow-300' };
      default:
        return { bg: 'bg-blue-50 dark:bg-blue-900/20', border: 'border-blue-200 dark:border-blue-800', badge: 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300' };
    }
  };

  const getNotificationType = (type) => {
    switch (type) {
      case 'payment_confirmed': return 'Payment';
      case 'class_link': return 'Class Link';
      case 'enrollment_pending': return 'Enrollment';
      default: return 'Announcement';
    }
  };

  const filteredNotifications = notifications.filter(n => {
    if (filter === 'all') return true;
    if (filter === 'payment') return n.type === 'payment_confirmed' || n.type === 'enrollment_pending';
    if (filter === 'class') return n.type === 'class_link';
    if (filter === 'announcement') return n.type === 'general' || !n.type;
    return true;
  });

  const unreadCount = notifications.filter(n => !n.is_read).length;

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-xl">
            <Bell className="h-8 w-8 text-blue-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Notifications</h1>
            <p className="text-gray-500 dark:text-gray-400">{unreadCount > 0 ? `${unreadCount} unread` : 'All caught up!'}</p>
          </div>
        </div>
        {unreadCount > 0 && (
          <button
            onClick={markAllAsRead}
            className="px-4 py-2 text-sm font-medium text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
          >
            Mark all as read
          </button>
        )}
      </div>

      <div className="flex flex-wrap gap-2 mb-6">
        {[
          { key: 'all', label: 'All' },
          { key: 'payment', label: 'Payment' },
          { key: 'class', label: 'Class Link' },
          { key: 'announcement', label: 'Announcements' }
        ].map(f => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === f.key
                ? 'bg-blue-500 text-white'
                : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      ) : filteredNotifications.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-12 text-center">
          <Bell className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">No notifications</h3>
          <p className="text-gray-500 dark:text-gray-400">You're all caught up!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredNotifications.map((notification, index) => {
            const styles = getNotificationStyles(notification.type, notification.priority);
            return (
              <motion.div
                key={notification.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                onClick={() => !notification.is_read && markAsRead(notification.id)}
                className={`${styles.bg} border ${styles.border} rounded-2xl p-6 cursor-pointer hover:shadow-md transition-shadow ${
                  !notification.is_read ? 'ring-2 ring-blue-200 dark:ring-blue-800' : ''
                }`}
              >
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-white dark:bg-gray-800 rounded-xl shadow-sm">
                    {getNotificationIcon(notification.type, notification.priority)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{notification.title}</h3>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${styles.badge}`}>
                        {getNotificationType(notification.type)}
                      </span>
                      {!notification.is_read && (
                        <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                      )}
                    </div>
                    <p className="text-gray-600 dark:text-gray-400 mb-3 whitespace-pre-wrap">{notification.message || notification.content}</p>
                    <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500 dark:text-gray-400">
                      {notification.course_title && (
                        <>
                          <span className="flex items-center gap-1">
                            <BookOpen className="h-4 w-4" />
                            {notification.course_title}
                          </span>
                          <span>•</span>
                        </>
                      )}
                      <span>{new Date(notification.created_at).toLocaleDateString()}</span>
                    </div>
                    {notification.class_link && (
                      <a
                        href={notification.class_link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 mt-3 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm font-medium"
                      >
                        <Video className="h-4 w-4" />
                        Join Class
                      </a>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default StudentNotifications;
