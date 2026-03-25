import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { Users, BookOpen, TrendingUp, GraduationCap, Award, Clock, CheckCircle, Activity } from 'lucide-react';
import { analyticsAPI } from '../services/api';
import { toast } from 'react-toastify';

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

const AdminAnalytics = () => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState('30');

  useEffect(() => {
    fetchAnalytics();
  }, [dateRange]);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const response = await analyticsAPI.getDashboard();
      setAnalytics(response.data);
    } catch (error) {
      toast.error('Failed to load analytics');
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

  if (!analytics) return null;

  const statCards = [
    { icon: <Users className="h-6 w-6" />, label: 'Total Users', value: analytics.stats?.total_users || 0, color: 'bg-blue-500', change: '+12%' },
    { icon: <GraduationCap className="h-6 w-6" />, label: 'Total Students', value: analytics.stats?.total_students || 0, color: 'bg-green-500', change: '+8%' },
    { icon: <BookOpen className="h-6 w-6" />, label: 'Total Courses', value: analytics.stats?.total_courses || 0, color: 'bg-purple-500', change: '+5%' },
    { icon: <TrendingUp className="h-6 w-6" />, label: 'Total Enrollments', value: analytics.stats?.total_enrollments || 0, color: 'bg-orange-500', change: '+15%' }
  ];

  const enrollmentData = analytics.enrollmentTrends || [
    { date: 'Mon', enrollments: 12 },
    { date: 'Tue', enrollments: 19 },
    { date: 'Wed', enrollments: 15 },
    { date: 'Thu', enrollments: 25 },
    { date: 'Fri', enrollments: 22 },
    { date: 'Sat', enrollments: 30 },
    { date: 'Sun', enrollments: 18 }
  ];

  const courseDistribution = analytics.courseDistribution || [
    { name: 'Completed', value: analytics.stats?.completed_enrollments || 0 },
    { name: 'Active', value: analytics.stats?.active_enrollments || 0 },
    { name: 'Inactive', value: analytics.stats?.total_enrollments - analytics.stats?.active_enrollments - analytics.stats?.completed_enrollments || 0 }
  ];

  const topCourses = analytics.topCourses || [];
  const recentActivity = analytics.recentActivity || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Analytics</h1>
          <p className="text-gray-600 dark:text-gray-400">Platform performance and insights</p>
        </div>
        <select
          value={dateRange}
          onChange={(e) => setDateRange(e.target.value)}
          className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
        >
          <option value="7">Last 7 days</option>
          <option value="30">Last 30 days</option>
          <option value="90">Last 90 days</option>
        </select>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`${stat.color} p-3 rounded-xl text-white`}>
                {stat.icon}
              </div>
              <span className="text-green-500 text-sm font-medium">{stat.change}</span>
            </div>
            <div className="text-3xl font-bold text-gray-900 dark:text-white mb-1">{stat.value}</div>
            <div className="text-gray-600 dark:text-gray-400 text-sm">{stat.label}</div>
          </motion.div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-6"
        >
          <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-6">Enrollment Trends</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={enrollmentData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis dataKey="date" stroke="#6B7280" />
                <YAxis stroke="#6B7280" />
                <Tooltip />
                <Line type="monotone" dataKey="enrollments" stroke="#3B82F6" strokeWidth={2} dot={{ fill: '#3B82F6' }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-6"
        >
          <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-6">Enrollment Status</h2>
          <div className="h-64 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={courseDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {courseDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-center gap-4 mt-4">
            {courseDistribution.map((entry, index) => (
              <div key={index} className="flex items-center space-x-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
                <span className="text-sm text-gray-600 dark:text-gray-400">{entry.name}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-6"
        >
          <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-6">Top Performing Courses</h2>
          <div className="space-y-4">
            {topCourses.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No course data available</p>
            ) : (
              topCourses.slice(0, 5).map((course, index) => (
                <div key={course.id} className="flex items-center space-x-4 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                  <div className="w-8 h-8 bg-primary-100 dark:bg-primary-900/50 rounded-full flex items-center justify-center text-primary-600 dark:text-primary-400 font-bold">
                    {index + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-gray-900 dark:text-white truncate">{course.title}</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">{course.enrollment_count} students</div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium text-primary-600 dark:text-primary-400">{course.completion_rate || 0}%</div>
                    <div className="text-xs text-gray-500">completion</div>
                  </div>
                </div>
              ))
            )}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-6"
        >
          <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-6">Recent Activity</h2>
          <div className="space-y-4">
            {recentActivity.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No recent activity</p>
            ) : (
              recentActivity.slice(0, 6).map((activity, index) => (
                <div key={index} className="flex items-start space-x-3">
                  <div className="w-10 h-10 bg-green-100 dark:bg-green-900/50 rounded-full flex items-center justify-center flex-shrink-0">
                    <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-900 dark:text-white">
                      <span className="font-medium">{activity.user_name || 'User'}</span>
                      <span className="text-gray-600 dark:text-gray-400"> - {activity.action || 'completed lesson'}</span>
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {activity.course_title ? `${activity.course_title} - ` : ''}
                      {new Date(activity.timestamp || activity.created_at).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default AdminAnalytics;
