import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { notificationsAPI } from '../services/api';
import {
  Home, BookOpen, Target, Trophy, Users, Layers, Settings, LogOut, Menu, X, Search,
  Sun, Moon, Bell, ChevronRight, GraduationCap, BarChart3, CreditCard, Megaphone,
  FileText, ExternalLink
} from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { toast } from 'react-toastify';
import LanguageSwitcher from '../components/LanguageSwitcher';
import { useTranslation } from 'react-i18next';

const StudentLayout = () => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const searchRef = useRef(null);
  const notificationRef = useRef(null);

  const menuItems = [
    { path: '/student', icon: Home, label: 'Overview' },
    { path: '/student/courses', icon: BookOpen, label: t('student.myCourses') },
    { path: '/student/announcements', icon: Megaphone, label: t('announcements.title') },
    { path: '/student/payments', icon: CreditCard, label: t('payments.title') },
    { path: '/student/settings', icon: Settings, label: t('settings.title') },
  ];

  useEffect(() => {
    fetchNotifications();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSearch(false);
      }
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchNotifications = async () => {
    try {
      const response = await notificationsAPI.getMy();
      setNotifications(response.data.slice(0, 5));
      const unreadRes = await notificationsAPI.getUnreadCount();
      setUnreadCount(unreadRes.data.count || 0);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  const handleLogout = () => {
    toast.success('Successfully logged out!', {
      position: 'top-right',
      autoClose: 1500,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: false,
      draggable: false,
      theme: 'colored',
    });
    setTimeout(() => {
      logout();
      navigate('/login');
      setShowLogoutModal(false);
    }, 500);
  };

  const openLogoutModal = () => {
    setShowLogoutModal(true);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/courses?search=${encodeURIComponent(searchQuery.trim())}`);
      setShowSearch(false);
      setSearchQuery('');
    }
  };

  const markAsRead = async (id) => {
    try {
      await notificationsAPI.markAsRead(id);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const isActive = (path) => location.pathname === path;

  const getBreadcrumbs = () => {
    const paths = location.pathname.split('/').filter(Boolean);
    const breadcrumbs = [{ label: 'Overview', path: '/student' }];
    let currentPath = '/student';
    
    paths.forEach((segment, index) => {
      currentPath += `/${segment}`;
      const menuItem = menuItems.find(item => item.path === currentPath);
      if (menuItem) {
        breadcrumbs.push({ label: menuItem.label, path: currentPath });
      } else if (segment === 'new') {
        breadcrumbs.push({ label: 'Create New', path: currentPath });
      } else if (segment === 'edit') {
        breadcrumbs.push({ label: 'Edit', path: currentPath });
      } else if (!isNaN(segment)) {
        breadcrumbs.push({ label: `ID: ${segment}`, path: currentPath });
      }
    });
    
    return breadcrumbs;
  };

  return (
    <div className="flex min-h-screen section-lowered transition-colors duration-200">
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-gray-900 text-white transform transition-transform duration-300 lg:translate-x-0 shadow-depth-xl ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="p-4 border-b border-gray-800 bg-gray-900/50">
          <Link to="/student" className="flex items-center gap-3 group">
            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center overflow-hidden shadow-dual-md group-hover:shadow-dual-lg transition-all duration-300">
              <img src="/logo.png" alt="Logo" className="w-full h-full object-cover" />
            </div>
            <div>
              <h1 className="font-bold text-lg">MASTERTALK</h1>
              <p className="text-xs text-gray-400">{t('navbar.myPortal')}</p>
            </div>
          </Link>
        </div>

        <nav className="py-4 overflow-y-auto h-[calc(100vh-180px)]">
          <ul className="space-y-1 px-3">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.path);
              return (
                <li key={item.path}>
                  <Link
                    to={item.path}
                    onClick={() => setSidebarOpen(false)}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200
                      ${active ? 'bg-primary-gradient text-white shadow-dual-md' : 'text-gray-400 hover:bg-gray-800 hover:text-white'}`}
                  >
                    <Icon className="h-5 w-5 flex-shrink-0" />
                    <span className="font-medium">{item.label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-800 bg-gray-900/50">
          <Link
            to="/student/courses"
            className="flex items-center gap-3 mb-3 p-2 rounded-xl hover:bg-gray-800 transition-colors group"
          >
            <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-purple-500 rounded-xl flex items-center justify-center flex-shrink-0 shadow-dual-sm group-hover:shadow-dual-md transition-all duration-300">
              <span className="text-sm font-semibold">{user?.name?.charAt(0)?.toUpperCase()}</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{t('navbar.myPortal')}</p>
              <p className="text-xs text-gray-400 truncate">{user?.email}</p>
            </div>
          </Link>
          <button
            onClick={openLogoutModal}
            className="w-full flex items-center gap-3 px-3 py-2.5 text-gray-400 hover:text-white hover:bg-red-500/10 hover:border hover:border-red-500/30 rounded-xl transition-all duration-200"
          >
            <LogOut className="h-5 w-5" />
            <span className="font-medium">{t('navbar.logout')}</span>
          </button>
        </div>
      </aside>

      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <div className="flex-1 lg:ml-64 dark:bg-gray-900 transition-colors duration-200">
        <header className="nav-depth sticky top-0 z-30 transition-colors duration-200">
          <div className="px-4 sm:px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-white hover:bg-primary-50 dark:hover:bg-gray-700 rounded-lg transition-all duration-200"
              >
                <Menu className="h-6 w-6" />
              </button>
            </div>

            <div className="flex items-center gap-2 sm:gap-3">
              <div ref={searchRef} className="relative">
                <button
                  onClick={() => setShowSearch(!showSearch)}
                  className="p-2 text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-white hover:bg-primary-50 dark:hover:bg-gray-700 rounded-lg transition-all duration-200"
                >
                  <Search className="h-5 w-5" />
                </button>
                {showSearch && (
                  <div className="absolute right-0 mt-2 w-80 dropdown-elevated p-4 animate-[fadeIn_0.2s_ease-out]">
                    <form onSubmit={handleSearch}>
                      <div className="relative">
                        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <input
                          type="text"
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          placeholder="Search courses, lessons..."
                          className="w-full pl-12 pr-4 py-3 input-sunken focus-glow"
                          autoFocus
                        />
                      </div>
                      <div className="mt-2 text-xs text-gray-500">
                        Press Enter to search
                      </div>
                    </form>
                  </div>
                )}
              </div>

              <button
                onClick={toggleTheme}
                className="p-2 text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-white hover:bg-primary-50 dark:hover:bg-gray-700 rounded-lg transition-all duration-200"
                title={theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
              >
                {theme === 'light' ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
              </button>

              <LanguageSwitcher />

              <div ref={notificationRef} className="relative">
                <button
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="p-2 text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-white hover:bg-primary-50 dark:hover:bg-gray-700 rounded-lg transition-all duration-200 relative"
                >
                  <Bell className="h-5 w-5" />
                  {unreadCount > 0 && (
                    <span className="absolute top-0.5 right-0.5 w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse"></span>
                  )}
                </button>
                {showNotifications && (
                  <div className="absolute right-0 mt-2 w-80 dropdown-elevated animate-[fadeIn_0.2s_ease-out]">
                    <div className="p-4 border-b border-gray-100 dark:border-gray-700 bg-gradient-to-r from-gray-50 to-white dark:from-gray-800 dark:to-gray-900">
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold text-gray-900 dark:text-white">{t('notifications.title')}</h3>
                        {unreadCount > 0 && (
                          <button
                            onClick={() => {
                              notificationsAPI.markAllAsRead();
                              setUnreadCount(0);
                              setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
                            }}
                            className="text-xs text-primary-600 hover:text-primary-700 font-medium"
                          >
                            {t('notifications.markAllRead')}
                          </button>
                        )}
                      </div>
                    </div>
                    <div className="max-h-80 overflow-y-auto">
                      {notifications.length === 0 ? (
                        <div className="p-8 text-center">
                          <Bell className="h-12 w-12 text-gray-300 mx-auto mb-2" />
                          <p className="text-sm text-gray-500 dark:text-gray-400">{t('notifications.noNotifications')}</p>
                        </div>
                      ) : (
                        notifications.map((notification) => (
                          <div
                            key={notification.id}
                            className={`p-4 border-b border-gray-100 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors cursor-pointer
                              ${!notification.is_read ? 'bg-blue-50/50 dark:bg-gray-600/50' : ''}`}
                            onClick={() => {
                              if (!notification.is_read) markAsRead(notification.id);
                            }}
                          >
                            <div className="flex items-start gap-3">
                              {!notification.is_read && (
                                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                              )}
                              <div className={!notification.is_read ? '' : 'ml-5'}>
                                <p className="text-sm text-gray-900 dark:text-white">{notification.message || notification.title}</p>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                  {new Date(notification.created_at).toLocaleDateString()}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                    <div className="p-3 text-center border-t border-gray-200 dark:border-gray-600">
                      <Link
                        to="/student/notifications"
                        onClick={() => setShowNotifications(false)}
                        className="text-sm text-blue-500 hover:text-blue-600 font-medium"
                      >
                        {t('common.view')} {t('notifications.title')}
                      </Link>
                    </div>
                  </div>
                )}
              </div>

              <Link
                to="/"
                className="hidden md:inline-flex items-center gap-2 px-4 py-2 btn-elevated font-medium text-sm"
              >
                <Home className="h-4 w-4" />
                {t('navbar.courses')}
              </Link>
            </div>
          </div>
        </header>

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

        <main className="p-4 sm:p-6 lg:p-8 min-h-[calc(100vh-73px)] dark:bg-gray-900 transition-colors duration-200">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default StudentLayout;
