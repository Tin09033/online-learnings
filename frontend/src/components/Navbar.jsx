import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Menu, X, BookOpen, User, LogOut, LayoutDashboard, Bell, AlertTriangle, AlertCircle, Info, X as XIcon, CreditCard, Video, CheckCircle, Sun, Moon } from 'lucide-react';
import { notificationsAPI } from '../services/api';
import { toast } from 'react-toastify';
import LanguageSwitcher from './LanguageSwitcher';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../context/ThemeContext';

const Navbar = () => {
  const { t } = useTranslation();
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
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
    <nav className="nav-depth sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-center space-x-2 group">
            <div className="p-2 bg-primary-50 dark:bg-primary-900/30 rounded-xl shadow-dual-sm group-hover:shadow-dual-md transition-all duration-200">
              <img src="/logo.png" alt="MASTERTALK Logo" className="h-6 w-6 object-contain" />
            </div>
            <span className="text-xl font-bold text-gray-900 dark:text-white">MASTERTALK</span>
          </Link>

          <div className="hidden md:flex items-center space-x-8">
            <Link to="/" className="text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors font-medium relative group">
              <span>{t('navbar.home', 'Home')}</span>
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary-600 group-hover:w-full transition-all duration-300"></span>
            </Link>
            <Link to="/courses" className="text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors font-medium relative group">
              <span>{t('navbar.courses')}</span>
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary-600 group-hover:w-full transition-all duration-300"></span>
            </Link>
            
            {user ? (
              <div className="flex items-center space-x-4">
                {user.role === 'student' && (
                  <div className="relative" ref={notificationRef}>
                    <button
                      onClick={() => setShowNotifications(!showNotifications)}
                      className="relative p-2 text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition-all duration-200 rounded-lg hover:bg-primary-50 dark:hover:bg-gray-700"
                    >
                      <Bell className="h-5 w-5" />
                      {announcements.length > 0 && (
                        <span className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center shadow-glow-primary-sm animate-pulse">
                          {announcements.length}
                        </span>
                      )}
                    </button>

                    {showNotifications && (
                      <div className="absolute right-0 mt-2 w-80 dropdown-elevated overflow-hidden">
                        <div className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-gray-700 bg-gradient-to-r from-gray-50 to-white dark:from-gray-800 dark:to-gray-900">
                          <h3 className="font-semibold text-gray-900 dark:text-white">{t('notifications.title')}</h3>
                          <button
                            onClick={() => setShowNotifications(false)}
                            className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                          >
                            <XIcon className="h-4 w-4 text-gray-500 dark:text-gray-400" />
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
                              <p className="text-gray-500 dark:text-gray-400 text-sm">{t('notifications.noNotifications')}</p>
                            </div>
                          ) : (
                            announcements.map((notification) => (
                              <div
                                key={notification.id}
                                className={`p-4 border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/60 transition-colors ${getNotificationStyles(notification.type, notification.priority)}`}
                              >
                                <div className="flex items-start gap-3">
                                  <div className="p-1.5 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
                                    {getNotificationIcon(notification.type, notification.priority)}
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                      <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                                        {notification.type === 'payment_confirmed' ? 'Payment' :
                                         notification.type === 'class_link' ? t('student.classLink') :
                                         notification.type === 'enrollment_pending' ? 'Enrollment' :
                                         'Teacher'}
                                      </span>
                                      <span className="text-xs text-gray-400">•</span>
                                      <span className="text-xs text-gray-400 dark:text-gray-500">
                                        {new Date(notification.created_at).toLocaleDateString()}
                                      </span>
                                    </div>
                                    <h4 className="font-medium text-gray-900 dark:text-white text-sm mb-1">{notification.title}</h4>
                                    <p className="text-xs text-gray-600 dark:text-gray-300 line-clamp-2">{notification.message || notification.content}</p>
                                    {notification.course_title && (
                                      <span className="inline-block mt-2 text-xs text-primary-600 dark:text-primary-300 bg-primary-50 dark:bg-primary-900/20 px-2 py-0.5 rounded-full">
                                        {notification.course_title}
                                      </span>
                                    )}
                                    {notification.class_link && (
                                      <a
                                        href={notification.class_link}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-1 mt-2 text-xs text-purple-600 dark:text-purple-300 bg-purple-50 dark:bg-purple-900/20 px-2 py-1 rounded-full hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-colors"
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
                          className="block p-3 text-center text-sm font-medium text-primary-600 dark:text-primary-400 hover:bg-primary-50 dark:hover:bg-gray-700 transition-colors border-t border-gray-200 dark:border-gray-700"
                        >
                          {t('common.view')} {t('notifications.title')}
                        </Link>
                      </div>
                    )}
                  </div>
                )}

                <Link to={user.role === 'admin' ? "/admin" : "/student"} className="flex items-center space-x-1 px-3 py-1.5 text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 rounded-lg hover:bg-primary-50 dark:hover:bg-gray-700 transition-all duration-200">
                  <User className="h-4 w-4" />
                  <span className="font-medium">{t('navbar.myPortal')}</span>
                </Link>
                <button
                  onClick={openLogoutModal}
                  className="flex items-center space-x-1 px-3 py-1.5 text-gray-700 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all duration-200"
                >
                  <LogOut className="h-4 w-4" />
                  <span className="font-medium">{t('navbar.logout')}</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <Link
                  to="/login"
                  className="text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors font-medium px-3 py-1.5 rounded-lg hover:bg-primary-50 dark:hover:bg-gray-700"
                >
                  {t('navbar.login')}
                </Link>
                <Link
                  to="/register"
                  className="btn-elevated px-5 py-2 font-medium"
                >
                  {t('navbar.register')}
                </Link>
              </div>
            )}
            
            <button
              onClick={toggleTheme}
              className="p-2 text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-primary-50 dark:hover:bg-gray-700 rounded-lg transition-all duration-200"
              title={theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
            >
              {theme === 'light' ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
            </button>

            <LanguageSwitcher />
          </div>

          <button
            className="md:hidden p-2 text-gray-700 dark:text-gray-300 hover:bg-primary-50 dark:hover:bg-gray-700 rounded-lg transition-colors"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="md:hidden bg-surface-raised dark:bg-gray-800 border-t border-gray-100 dark:border-gray-700 shadow-depth-lg transition-colors duration-200">
          <div className="px-4 py-4 space-y-2">
            <button
              onClick={toggleTheme}
              className="w-full flex items-center gap-3 text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-primary-50 dark:hover:bg-gray-700 font-medium px-3 py-2 rounded-lg transition-colors"
            >
              {theme === 'light' ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
              <span>{theme === 'light' ? 'Dark Mode' : 'Light Mode'}</span>
            </button>
            <Link
              to="/"
              className="block text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-primary-50 dark:hover:bg-gray-700 font-medium px-3 py-2 rounded-lg transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              {t('navbar.home', 'Home')}
            </Link>
            <Link
              to="/courses"
              className="block text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-primary-50 dark:hover:bg-gray-700 font-medium px-3 py-2 rounded-lg transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              {t('navbar.courses')}
            </Link>
            
            {user ? (
              <>
                <Link
                  to={user.role === 'admin' ? "/admin" : "/student"}
                  className="block text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-primary-50 dark:hover:bg-gray-700 font-medium px-3 py-2 rounded-lg transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {t('navbar.myPortal')}
                </Link>
                <button
                  onClick={openLogoutModal}
                  className="block text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 font-medium w-full text-left px-3 py-2 rounded-lg transition-colors"
                >
                  {t('navbar.logout')}
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="block text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-primary-50 dark:hover:bg-gray-700 font-medium px-3 py-2 rounded-lg transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {t('navbar.login')}
                </Link>
                <Link
                  to="/register"
                  className="block btn-elevated px-4 py-2 text-center font-medium mt-2"
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
          <div className="relative bg-surface-raised dark:bg-gray-800 dark:border dark:border-gray-700 rounded-2xl shadow-depth-xl p-8 max-w-sm w-full mx-4 animate-[fadeIn_0.2s_ease-out]">
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-2xl bg-red-50 shadow-dual-sm mb-6">
                <LogOut className="h-8 w-8 text-red-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{t('navbar.logout')}</h3>
              <p className="text-gray-600 dark:text-gray-300 mb-8">Are you sure you want to logout?</p>
              <div className="flex gap-4">
                <button
                  onClick={() => setShowLogoutModal(false)}
                  className="flex-1 px-6 py-3 bg-surface-sunken dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-xl font-semibold hover:bg-gray-200 dark:hover:bg-gray-600 transition-all duration-200 shadow-dual-sm"
                >
                  {t('common.cancel')}
                </button>
                <button
                  onClick={handleLogout}
                  className="flex-1 px-6 py-3 bg-red-600 text-white rounded-xl font-semibold hover:bg-red-700 transition-all duration-200 shadow-dual-md hover:shadow-dual-lg"
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
