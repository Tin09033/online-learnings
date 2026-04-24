import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { LayoutDashboard, BookOpen, Users, GraduationCap, LogOut, Menu, X, Search, Sun, Moon, Bell, Settings, ChevronRight, Home, Megaphone, BarChart3, CreditCard, UserCheck } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { toast } from 'react-toastify';

const AdminLayout = () => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showNotifications, setShowNotifications] = useState(false);
  const searchRef = useRef(null);
  const notificationRef = useRef(null);

  const activities = [
    { id: 1, type: 'user', message: 'New user registered: John Doe', time: '2 minutes ago' },
    { id: 2, type: 'course', message: 'Course "React Basics" was updated', time: '15 minutes ago' },
    { id: 3, type: 'enrollment', message: 'Sarah enrolled in "Advanced JavaScript"', time: '1 hour ago' },
    { id: 4, type: 'user', message: 'New user registered: Mike Smith', time: '2 hours ago' },
  ];

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
      const searchType = location.pathname.includes('/courses') ? 'courses' :
                         location.pathname.includes('/users') ? 'users' : 'all';
      navigate(`/${searchType}?search=${encodeURIComponent(searchQuery.trim())}`);
      setShowSearch(false);
      setSearchQuery('');
    }
  };

  const menuItems = [
    { path: '/', icon: <LayoutDashboard className="h-5 w-5" />, label: 'Dashboard' },
    { path: '/courses', icon: <BookOpen className="h-5 w-5" />, label: 'Courses' },
    { path: '/announcements', icon: <Megaphone className="h-5 w-5" />, label: 'Announcements' },
    { path: '/student-groups', icon: <UserCheck className="h-5 w-5" />, label: 'Student Groups' },
    { path: '/users', icon: <Users className="h-5 w-5" />, label: 'Users' },
    { path: '/enrollments', icon: <GraduationCap className="h-5 w-5" />, label: 'Enrollments' },
    { path: '/payments', icon: <CreditCard className="h-5 w-5" />, label: 'Payments' },
    { path: '/analytics', icon: <BarChart3 className="h-5 w-5" />, label: 'Analytics' },
  ];

  const isActive = (path) => location.pathname === path;

  const getBreadcrumbs = () => {
    const paths = location.pathname.split('/').filter(Boolean);
    const breadcrumbs = [{ label: 'Home', path: '/' }];
    let currentPath = '';
    
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
    <div className="min-h-screen flex">
      <div className="min-h-screen flex-1 bg-gray-100 dark:bg-gray-900 transition-colors duration-200">
        <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-gray-900 text-white transform transition-transform duration-300 lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
          <div className="p-6 border-b border-gray-800">
            <Link to="/" className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center overflow-hidden">
                <img src="/logo.png" className="w-full h-full object-cover" alt="Logo" />
              </div>
              <div>
                <h1 className="text-xl font-bold">Admin Panel</h1>
                <p className="text-xs text-gray-400">MASTERTALK</p>
              </div>
            </Link>
          </div>

          <nav className="p-4 space-y-2">
            {menuItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-colors ${
                  isActive(item.path)
                    ? 'bg-primary-600 text-white'
                    : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                }`}
              >
                {item.icon}
                <span className="font-medium">{item.label}</span>
              </Link>
            ))}
          </nav>

          <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-800">
            <div className="flex items-center justify-between">
              <Link
                to="/settings"
                className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-800 transition-colors"
              >
                <div className="w-10 h-10 bg-primary-600 rounded-full flex items-center justify-center font-semibold">
                  {user?.name?.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="font-medium text-sm">{user?.name}</p>
                  <p className="text-xs text-gray-400">Administrator</p>
                </div>
              </Link>
              <button
                onClick={openLogoutModal}
                className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
                title="Logout"
              >
                <LogOut className="h-5 w-5" />
              </button>
            </div>
          </div>
        </aside>

        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        <div className="flex-1 lg:ml-64">
          <header className="bg-white dark:bg-gray-800 shadow-sm sticky top-0 z-30 transition-colors duration-200">
            <div className="px-4 py-4 flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => setSidebarOpen(true)}
                  className="lg:hidden p-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
                >
                  <Menu className="h-6 w-6" />
                </button>

                <nav className="hidden lg:flex items-center space-x-2 text-sm">
                  {getBreadcrumbs().map((crumb, index, arr) => (
                    <div key={crumb.path} className="flex items-center space-x-2">
                      {index > 0 && <ChevronRight className="h-4 w-4 text-gray-400" />}
                      {index === arr.length - 1 ? (
                        <span className="text-gray-900 dark:text-white font-medium">{crumb.label}</span>
                      ) : (
                        <Link to={crumb.path} className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200">
                          {index === 0 ? <Home className="h-4 w-4" /> : crumb.label}
                        </Link>
                      )}
                    </div>
                  ))}
                </nav>
              </div>

              <div className="flex items-center space-x-3">
                <div ref={searchRef} className="relative">
                  <button
                    onClick={() => setShowSearch(!showSearch)}
                    className="p-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                  >
                    <Search className="h-5 w-5" />
                  </button>
                  {showSearch && (
                    <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-700 rounded-xl shadow-lg border border-gray-200 dark:border-gray-600 p-4 animate-[fadeIn_0.2s_ease-out]">
                      <form onSubmit={handleSearch}>
                        <div className="relative">
                          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                          <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search courses, users..."
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-gray-800 dark:text-white"
                            autoFocus
                          />
                        </div>
                        <div className="mt-3 text-xs text-gray-500 dark:text-gray-400">
                          Press Enter to search
                        </div>
                      </form>
                    </div>
                  )}
                </div>

                <button
                  onClick={toggleTheme}
                  className="p-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                  title={theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
                >
                  {theme === 'light' ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
                </button>

                <div ref={notificationRef} className="relative">
                  <button
                    onClick={() => setShowNotifications(!showNotifications)}
                    className="p-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors relative"
                  >
                    <Bell className="h-5 w-5" />
                    <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                  </button>
                  {showNotifications && (
                    <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-700 rounded-xl shadow-lg border border-gray-200 dark:border-gray-600 animate-[fadeIn_0.2s_ease-out]">
                      <div className="p-4 border-b border-gray-200 dark:border-gray-600">
                        <h3 className="font-semibold text-gray-900 dark:text-white">Notifications</h3>
                      </div>
                      <div className="max-h-80 overflow-y-auto">
                        {activities.map((activity) => (
                          <div key={activity.id} className="p-4 border-b border-gray-100 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors">
                            <p className="text-sm text-gray-900 dark:text-white">{activity.message}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{activity.time}</p>
                          </div>
                        ))}
                      </div>
                      <div className="p-3 text-center border-t border-gray-200 dark:border-gray-600">
                        <button className="text-sm text-primary-600 hover:text-primary-700 font-medium">
                          View All Activity
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                <Link
                  to="/settings"
                  className="p-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                  title="Settings"
                >
                  <Settings className="h-5 w-5" />
                </Link>

                <a
                  href="https://darkslategrey-butterfly-132527.hostingersite.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hidden md:inline-flex text-sm text-primary-600 hover:text-primary-700 font-medium"
                >
                  View Website
                </a>
              </div>
            </div>
          </header>

          {showLogoutModal && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center">
              <div 
                className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                onClick={() => setShowLogoutModal(false)}
              />
              <div className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 max-w-sm w-full mx-4 animate-[fadeIn_0.2s_ease-out]">
                <div className="text-center">
                  <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 dark:bg-red-900/30 mb-6">
                    <LogOut className="h-8 w-8 text-red-600" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Logout</h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-8">Are you sure you want to logout, Admin?</p>
                  <div className="flex gap-4">
                    <button
                      onClick={() => setShowLogoutModal(false)}
                      className="flex-1 px-6 py-3 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl font-semibold hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleLogout}
                      className="flex-1 px-6 py-3 bg-red-600 text-white rounded-xl font-semibold hover:bg-red-700 transition-colors"
                    >
                      Yes, Logout
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          <main className="p-6">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
};

export default AdminLayout;
