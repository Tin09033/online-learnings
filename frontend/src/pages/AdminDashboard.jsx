import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Users, BookOpen, GraduationCap, TrendingUp, Plus, ChevronRight } from 'lucide-react';
import { usersAPI } from '../services/api';
import { toast } from 'react-toastify';
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from '../components/LanguageSwitcher';
import { useTheme } from '../context/ThemeContext';
import { Sun, Moon } from 'lucide-react';
import { getCourseImageUrl } from '../utils/apiUrl';

const AdminDashboard = () => {
  const { t } = useTranslation();
  const { theme, toggleTheme } = useTheme();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      const response = await usersAPI.getDashboard();
      setStats(response.data);
    } catch (error) {
      toast.error('Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  const statCards = [
    { icon: <Users className="h-8 w-8" />, label: t('admin.totalUsers'), value: stats?.stats?.total_users || 0, color: 'bg-blue-500', link: '/admin/users' },
    { icon: <GraduationCap className="h-8 w-8" />, label: t('admin.totalStudents'), value: stats?.stats?.total_students || 0, color: 'bg-green-500', link: '/admin/users' },
    { icon: <BookOpen className="h-8 w-8" />, label: t('admin.totalCourses'), value: stats?.stats?.total_courses || 0, color: 'bg-purple-500', link: '/admin/courses' },
    { icon: <TrendingUp className="h-8 w-8" />, label: t('admin.totalEnrollments'), value: stats?.stats?.total_enrollments || 0, color: 'bg-orange-500', link: '/admin/enrollments' }
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="flex justify-end gap-3 mb-6">
          <button
            onClick={toggleTheme}
            className="p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors"
            title={theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
          >
            {theme === 'light' ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
          </button>
          <LanguageSwitcher />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-12"
        >
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{t('admin.dashboard')}</h1>
          <p className="text-gray-600 dark:text-gray-400">{t('admin.managePlatform')}</p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {statCards.map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Link
                to={stat.link}
                className="block bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-300"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className={`${stat.color} p-4 rounded-2xl text-white`}>
                    {stat.icon}
                  </div>
                  <ChevronRight className="h-5 w-5 text-gray-400" />
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-1">{stat.value}</div>
                <div className="text-gray-600">{stat.label}</div>
              </Link>
            </motion.div>
          ))}
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="bg-white rounded-2xl shadow-lg p-6"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Recent Courses</h2>
              <Link to="/admin/courses" className="text-primary-600 hover:text-primary-700 font-medium text-sm">
                View All
              </Link>
            </div>
            <div className="space-y-4">
              {stats?.recentCourses?.slice(0, 5).map((course) => (
                <div key={course.id} className="flex items-center space-x-4 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                  <img
                    src={getCourseImageUrl(course.image)}
                    alt={course.title}
                    className="w-16 h-16 object-cover rounded-lg"
                  />
                    <div className="flex-1">
                    <div className="font-semibold text-gray-900 dark:text-white line-clamp-1">{course.title}</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">{course.instructor_name || t('admin.unknown')}</div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="bg-white rounded-2xl shadow-lg p-6"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Recent Enrollments</h2>
              <Link to="/admin/enrollments" className="text-primary-600 hover:text-primary-700 font-medium text-sm">
                View All
              </Link>
            </div>
            <div className="space-y-4">
              {stats?.recentEnrollments?.slice(0, 5).map((enrollment) => (
                <div key={enrollment.id} className="flex items-center space-x-4 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
                    <Users className="h-6 w-6 text-primary-600" />
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold text-gray-900">{enrollment.user_name}</div>
                    <div className="text-sm text-gray-500 line-clamp-1">{enrollment.course_title}</div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="mt-8 bg-white rounded-2xl shadow-lg p-6"
        >
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">{t('admin.quickActions')}</h2>
          <div className="grid md:grid-cols-4 gap-4">
            <Link
              to="/admin/courses/new"
              className="p-4 bg-primary-50 dark:bg-primary-900/20 rounded-xl hover:bg-primary-100 dark:hover:bg-primary-900/30 transition-colors flex items-center space-x-3"
            >
              <Plus className="h-6 w-6 text-primary-600" />
              <span className="font-semibold text-gray-900 dark:text-white">{t('admin.addCourse')}</span>
            </Link>
            <Link
              to="/admin/courses"
              className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-xl hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-colors flex items-center space-x-3"
            >
              <BookOpen className="h-6 w-6 text-purple-600" />
              <span className="font-semibold text-gray-900 dark:text-white">{t('admin.manageCourses')}</span>
            </Link>
            <Link
              to="/admin/users"
              className="p-4 bg-green-50 dark:bg-green-900/20 rounded-xl hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors flex items-center space-x-3"
            >
              <Users className="h-6 w-6 text-green-600" />
              <span className="font-semibold text-gray-900 dark:text-white">{t('admin.manageUsers')}</span>
            </Link>
            <Link
              to="/admin/enrollments"
              className="p-4 bg-orange-50 dark:bg-orange-900/20 rounded-xl hover:bg-orange-100 dark:hover:bg-orange-900/30 transition-colors flex items-center space-x-3"
            >
              <TrendingUp className="h-6 w-6 text-orange-600" />
              <span className="font-semibold text-gray-900 dark:text-white">{t('admin.viewEnrollments')}</span>
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default AdminDashboard;
