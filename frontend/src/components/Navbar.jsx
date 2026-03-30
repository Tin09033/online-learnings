import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Menu, X, BookOpen, User, LogOut, LayoutDashboard, Bell, AlertTriangle, AlertCircle, Info, X as XIcon, CreditCard, Video, CheckCircle } from 'lucide-react';
import { notificationsAPI } from '../services/api';
import { toast } from 'react-toastify';
import LanguageSwitcher from './LanguageSwitcher';
import { useTranslation } from 'react-i18next';

const Navbar = () => {
  const { t } = useTranslation();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [announcements, setAnnouncements] = useState([]);
  const [loadingNotifications, setLoadingNotifications] = useState(false);
  const notificationRef = useRef(null);

  useEffect(() => {
    if (user) {
      fetchNotifications();
    }
  }, [user]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchNotifications = async () => {
    setLoadingNotifications(true);
    try {
      const response = await notificationsAPI.getMy();
      setAnnouncements(response.data.slice(0, 5));
    } catch (error) {
      console.error('Failed to load notifications');
    } finally {
      setLoadingNotifications(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
    setMobileMenuOpen(false);
    setShowLogoutModal(false);
    toast.success('Logged out successfully!');
  };

  const openLogoutModal = () => {
    setShowLogoutModal(true);
    setMobileMenuOpen(false);
  };

  const getNotificationIcon = (type, priority) => {
    if (type === 'payment_confirmed') {
      return <CheckCircle className="h-4 w-4 text-green-500" />;
    }
    if (type === 'class_link') {
      return <Video className="h-4 w-4 text-purple-500" />;
    }
    if (type === 'enrollment_pending') {
      return <CreditCard className="h-4 w-4 text-orange-500" />;
    }
    switch (priority) {
      case 'urgent':
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case 'important':
        return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      default:
        return <Info className="h-4 w-4 text-blue-500" />;
    }
  };

  const getNotificationStyles = (type, priority) => {
    if (type === 'payment_confirmed') {
      return 'bg-green-50 border-green-200';
    }
    if (type === 'class_link') {
      return 'bg-purple-50 border-purple-200';
    }
    if (type === 'enrollment_pending') {
      return 'bg-orange-50 border-orange-200';
    }
    switch (priority) {
      case 'urgent':
        return 'bg-red-50 border-red-200';
      case 'important':
        return 'bg-yellow-50 border-yellow-200';
      default:
        return 'bg-blue-50 border-blue-200';
    }
  };

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-center space-x-2">
            <BookOpen className="h-8 w-8 text-primary-600" />
            <span className="text-xl font-bold text-gray-900">MASTERTALK</span>
          </Link>

          <div className="hidden md:flex items-center space-x-8">
            <Link to="/courses" className="text-gray-700 hover:text-primary-600 transition-colors font-medium">
              {t('navbar.courses')}
            </Link>
            
            {user ? (
              <div className="flex items-center space-x-4">
                {user.role === 'admin' && (
                  <Link to="/admin" className="flex items-center space-x-1 text-primary-600 hover:text-primary-700">
                    <LayoutDashboard className="h-5 w-5" />
                    <span>Admin</span>
                  </Link>
                )}
                
                {user.role === 'student' && (
                  <div className="relative" ref={notificationRef}>
                    <button
                      onClick={() => setShowNotifications(!showNotifications)}
                      className="relative p-2 text-gray-700 hover:text-primary-600 transition-colors"
                    >
                      <Bell className="h-5 w-5" />
                      {announcements.length > 0 && (
                        <span className="absolute top-0 right-0 h-5 w-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                          {announcements.length}
                        </span>
                      )}
                    </button>

                    {showNotifications && (
                      <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden">
                        <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gray-50">
                          <h3 className="font-semibold text-gray-900">{t('notifications.title')}</h3>
                          <button
                            onClick={() => setShowNotifications(false)}
                            className="p-1 hover:bg-gray-200 rounded-full transition-colors"
                          >
                            <XIcon className="h-4 w-4 text-gray-500" />
                          </button>
                        </div>
                        <div className="max-h-80 overflow-y-auto">
                          {loadingNotifications ? (
                            <div className="p-4 text-center">
                              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-600 mx-auto"></div>
                            </div>
                          ) : announcements.length === 0 ? (
                            <div className="p-8 text-center">
                              <Bell className="h-12 w-12 text-gray-300 mx-auto mb-2" />
                              <p className="text-gray-500 text-sm">{t('notifications.noNotifications')}</p>
                            </div>
                          ) : (
                            announcements.map((notification) => (
                              <div
                                key={notification.id}
                                className={`p-4 border-b border-gray-100 hover:bg-gray-50 transition-colors ${getNotificationStyles(notification.type, notification.priority)}`}
                              >
                                <div className="flex items-start gap-3">
                                  <div className="p-1.5 bg-white rounded-lg shadow-sm">
                                    {getNotificationIcon(notification.type, notification.priority)}
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                      <span className="text-xs font-medium text-gray-500">
                                        {notification.type === 'payment_confirmed' ? 'Payment' :
                                         notification.type === 'class_link' ? t('student.classLink') :
                                         notification.type === 'enrollment_pending' ? 'Enrollment' :
                                         'Teacher'}
                                      </span>
                                      <span className="text-xs text-gray-400">•</span>
                                      <span className="text-xs text-gray-400">
                                        {new Date(notification.created_at).toLocaleDateString()}
                                      </span>
                                    </div>
                                    <h4 className="font-medium text-gray-900 text-sm mb-1">{notification.title}</h4>
                                    <p className="text-xs text-gray-600 line-clamp-2">{notification.message || notification.content}</p>
                                    {notification.course_title && (
                                      <span className="inline-block mt-2 text-xs text-primary-600 bg-primary-50 px-2 py-0.5 rounded-full">
                                        {notification.course_title}
                                      </span>
                                    )}
                                    {notification.class_link && (
                                      <a
                                        href={notification.class_link}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-1 mt-2 text-xs text-purple-600 bg-purple-50 px-2 py-1 rounded-full hover:bg-purple-100 transition-colors"
                                      >
                                        <Video className="h-3 w-3" />
                                        {t('student.joinClass')}
                                      </a>
                                    )}
                                  </div>
                                </div>
                              </div>
                            ))
                          )}
                        </div>
                        <Link
                          to="/student/notifications"
                          onClick={() => setShowNotifications(false)}
                          className="block p-3 text-center text-sm font-medium text-primary-600 hover:bg-primary-50 transition-colors border-t border-gray-200"
                        >
                          {t('common.view')} {t('notifications.title')}
                        </Link>
                      </div>
                    )}
                  </div>
                )}

                <Link to="/student" className="flex items-center space-x-1 text-gray-700 hover:text-primary-600">
                  <User className="h-5 w-5" />
                  <span>{t('navbar.myPortal')}</span>
                </Link>
                <button
                  onClick={openLogoutModal}
                  className="flex items-center space-x-1 text-gray-700 hover:text-red-600 transition-colors"
                >
                  <LogOut className="h-5 w-5" />
                  <span>{t('navbar.logout')}</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <Link
                  to="/login"
                  className="text-gray-700 hover:text-primary-600 transition-colors font-medium"
                >
                  {t('navbar.login')}
                </Link>
                <Link
                  to="/register"
                  className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors font-medium"
                >
                  {t('navbar.register')}
                </Link>
              </div>
            )}
            
            <LanguageSwitcher />
          </div>

          <button
            className="md:hidden p-2"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-t">
          <div className="px-4 py-4 space-y-3">
            <Link
              to="/courses"
              className="block text-gray-700 hover:text-primary-600 font-medium"
              onClick={() => setMobileMenuOpen(false)}
            >
              {t('navbar.courses')}
            </Link>
            
            {user ? (
              <>
                <Link
                  to="/student"
                  className="block text-gray-700 hover:text-primary-600 font-medium"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {t('navbar.myPortal')}
                </Link>
                {user.role === 'admin' && (
                  <Link
                    to="/admin"
                    className="block text-primary-600 hover:text-primary-700 font-medium"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Admin
                  </Link>
                )}
                <button
                  onClick={openLogoutModal}
                  className="block text-red-600 hover:text-red-700 font-medium w-full text-left"
                >
                  {t('navbar.logout')}
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="block text-gray-700 hover:text-primary-600 font-medium"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {t('navbar.login')}
                </Link>
                <Link
                  to="/register"
                  className="block bg-primary-600 text-white px-4 py-2 rounded-lg text-center font-medium"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {t('navbar.register')}
                </Link>
              </>
            )}
          </div>
        </div>
      )}

      {showLogoutModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center">
          <div 
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setShowLogoutModal(false)}
          />
          <div className="relative bg-white rounded-2xl shadow-2xl p-8 max-w-sm w-full mx-4 animate-[fadeIn_0.2s_ease-out]">
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 mb-6">
                <LogOut className="h-8 w-8 text-red-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">{t('navbar.logout')}</h3>
              <p className="text-gray-600 mb-8">Are you sure you want to logout?</p>
              <div className="flex gap-4">
                <button
                  onClick={() => setShowLogoutModal(false)}
                  className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-colors"
                >
                  {t('common.cancel')}
                </button>
                <button
                  onClick={handleLogout}
                  className="flex-1 px-6 py-3 bg-red-600 text-white rounded-xl font-semibold hover:bg-red-700 transition-colors"
                >
                  Yes, {t('navbar.logout')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
