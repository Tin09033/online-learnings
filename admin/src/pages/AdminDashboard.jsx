import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Users, BookOpen, GraduationCap, TrendingUp, Plus, ChevronRight, Activity } from 'lucide-react';
import { usersAPI } from '../services/api';
import { toast } from 'react-toastify';

const AdminDashboard = () => {
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
    { icon: <Users className="h-8 w-8" />, label: 'Total Users', value: stats?.stats?.total_users || 0, color: 'bg-blue-500', link: '/users' },
    { icon: <GraduationCap className="h-8 w-8" />, label: 'Total Students', value: stats?.stats?.total_students || 0, color: 'bg-green-500', link: '/users' },
    { icon: <BookOpen className="h-8 w-8" />, label: 'Total Courses', value: stats?.stats?.total_courses || 0, color: 'bg-purple-500', link: '/courses' },
    { icon: <TrendingUp className="h-8 w-8" />, label: 'Total Enrollments', value: stats?.stats?.total_enrollments || 0, color: 'bg-orange-500', link: '/enrollments' }
  ];

  const quickStats = [
    { label: 'Active Enrollments', value: stats?.recentEnrollments?.filter(e => e.status === 'active').length || 0, color: 'text-yellow-500' },
    { label: 'Completed', value: stats?.recentEnrollments?.filter(e => e.status === 'completed').length || 0, color: 'text-green-500' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
        <p className="text-gray-600 dark:text-gray-400">Welcome to LearnHub Admin Panel</p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => (
          <Link
            key={index}
            to={stat.link}
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-6 hover:shadow-md transition-all duration-200 group"
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`${stat.color} p-4 rounded-xl text-white group-hover:scale-110 transition-transform`}>
                {stat.icon}
              </div>
              <ChevronRight className="h-5 w-5 text-gray-400 group-hover:text-primary-600 transition-colors" />
            </div>
            <div className="text-3xl font-bold text-gray-900 dark:text-white mb-1">{stat.value}</div>
            <div className="text-gray-600 dark:text-gray-400">{stat.label}</div>
          </Link>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-6 transition-colors">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">Recent Courses</h2>
            <Link to="/courses" className="text-primary-600 hover:text-primary-700 text-sm font-medium">
              View All
            </Link>
          </div>
          <div className="space-y-4">
              {stats?.recentCourses?.slice(0, 5).map((course) => (
                <div key={course.id} className="flex items-center space-x-4 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                  {course.image && course.image.trim() !== '' ? (
                    <img
                      src={course.image.startsWith('http') ? course.image : course.image.startsWith('/uploads') ? course.image : `/uploads${course.image}`}
                      alt={course.title}
                      className="w-14 h-14 object-cover rounded-lg"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.nextSibling && (e.target.nextSibling.style.display = 'flex');
                      }}
                    />
                  ) : (
                    <div className="w-14 h-14 flex items-center justify-center bg-gray-100 dark:bg-gray-700 rounded-lg">
                      <BookOpen className="h-6 w-6 text-gray-400" />
                    </div>
                  )}
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-gray-900 dark:text-white truncate">{course.title}</div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">{course.instructor_name || 'Unknown'}</div>
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  {course.lesson_count || 0} lessons
                </div>
              </div>
            ))}
            {(!stats?.recentCourses || stats.recentCourses.length === 0) && (
              <div className="text-center py-8">
                <BookOpen className="h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                <p className="text-gray-500 dark:text-gray-400">No courses yet</p>
              </div>
            )}
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-6 transition-colors">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">Recent Activity</h2>
            <Activity className="h-5 w-5 text-gray-400" />
          </div>
          <div className="space-y-4">
            {stats?.recentEnrollments?.slice(0, 5).map((enrollment, index) => (
              <div key={enrollment.id || index} className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-primary-100 dark:bg-primary-900/50 rounded-full flex items-center justify-center flex-shrink-0">
                  <Users className="h-4 w-4 text-primary-600 dark:text-primary-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-900 dark:text-white">
                    <span className="font-medium">{enrollment.user_name}</span> enrolled in{' '}
                    <span className="font-medium">{enrollment.course_title}</span>
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {new Date(enrollment.enrolled_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
            {(!stats?.recentEnrollments || stats.recentEnrollments.length === 0) && (
              <div className="text-center py-8">
                <GraduationCap className="h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                <p className="text-gray-500 dark:text-gray-400">No enrollments yet</p>
              </div>
            )}
          </div>

          {quickStats.some(q => q.value > 0) && (
            <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Quick Stats</h3>
              <div className="flex justify-between">
                {quickStats.map((stat, index) => (
                  <div key={index} className="text-center">
                    <div className={`text-2xl font-bold ${stat.color}`}>{stat.value}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-6 transition-colors">
        <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Quick Actions</h2>
        <div className="grid md:grid-cols-4 gap-4">
          <Link to="/courses/new" className="p-4 bg-primary-50 dark:bg-primary-900/30 rounded-xl hover:bg-primary-100 dark:hover:bg-primary-900/50 transition-colors flex items-center space-x-3">
            <Plus className="h-6 w-6 text-primary-600 dark:text-primary-400" />
            <span className="font-semibold text-gray-900 dark:text-white">Add Course</span>
          </Link>
          <Link to="/courses" className="p-4 bg-purple-50 dark:bg-purple-900/30 rounded-xl hover:bg-purple-100 dark:hover:bg-purple-900/50 transition-colors flex items-center space-x-3">
            <BookOpen className="h-6 w-6 text-purple-600 dark:text-purple-400" />
            <span className="font-semibold text-gray-900 dark:text-white">Manage Courses</span>
          </Link>
          <Link to="/users" className="p-4 bg-green-50 dark:bg-green-900/30 rounded-xl hover:bg-green-100 dark:hover:bg-green-900/50 transition-colors flex items-center space-x-3">
            <Users className="h-6 w-6 text-green-600 dark:text-green-400" />
            <span className="font-semibold text-gray-900 dark:text-white">Manage Users</span>
          </Link>
          <Link to="/enrollments" className="p-4 bg-orange-50 dark:bg-orange-900/30 rounded-xl hover:bg-orange-100 dark:hover:bg-orange-900/50 transition-colors flex items-center space-x-3">
            <TrendingUp className="h-6 w-6 text-orange-600 dark:text-orange-400" />
            <span className="font-semibold text-gray-900 dark:text-white">View Enrollments</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
