import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Users, BookOpen, TrendingUp, Award, Clock, CheckCircle, Activity } from 'lucide-react';
import { analyticsAPI, coursesAPI } from '../services/api';
import { toast } from 'react-toastify';

const AdminCourseAnalytics = () => {
  const { courseId } = useParams();
  const [course, setCourse] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, [courseId]);

  const fetchAnalytics = async () => {
    try {
      const response = await analyticsAPI.getCourseAnalytics(courseId);
      setCourse(response.data.course);
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

  const stats = [
    { icon: <Users className="h-6 w-6" />, label: 'Total Students', value: analytics.enrollmentStats.total_students || 0, color: 'bg-blue-500' },
    { icon: <CheckCircle className="h-6 w-6" />, label: 'Completed', value: analytics.enrollmentStats.completed_students || 0, color: 'bg-green-500' },
    { icon: <Activity className="h-6 w-6" />, label: 'Active', value: analytics.enrollmentStats.active_students || 0, color: 'bg-yellow-500' },
    { icon: <TrendingUp className="h-6 w-6" />, label: 'Avg Progress', value: `${Math.round(analytics.enrollmentStats.average_progress || 0)}%`, color: 'bg-purple-500' }
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <button
            onClick={() => window.history.back()}
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 mb-6"
          >
            <ArrowLeft className="h-5 w-5" />
            <span>Back</span>
          </button>

          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Course Analytics</h1>
            <p className="text-gray-600 mt-1">{course?.title}</p>
          </div>

          <div className="grid md:grid-cols-4 gap-6 mb-8">
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-white rounded-2xl shadow-lg p-6"
              >
                <div className="flex items-center space-x-4">
                  <div className={`${stat.color} p-4 rounded-2xl text-white`}>
                    {stat.icon}
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
                    <div className="text-gray-600 text-sm">{stat.label}</div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="bg-white rounded-2xl shadow-lg p-6"
            >
              <h2 className="text-xl font-bold text-gray-900 mb-6">Lesson Completion Rates</h2>
              <div className="space-y-4">
                {analytics.lessonStats.map((lesson) => {
                  const completionRate = analytics.enrollmentStats.total_students > 0
                    ? (lesson.completion_count / analytics.enrollmentStats.total_students) * 100
                    : 0;
                  
                  return (
                    <div key={lesson.id} className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="font-medium text-gray-700 truncate flex-1 mr-4">
                          {lesson.order_num}. {lesson.title}
                        </span>
                        <span className="text-gray-500">
                          {lesson.completion_count} / {analytics.enrollmentStats.total_students} ({Math.round(completionRate)}%)
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-primary-600 h-2 rounded-full transition-all duration-500"
                          style={{ width: `${completionRate}%` }}
                        ></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="bg-white rounded-2xl shadow-lg p-6"
            >
              <h2 className="text-xl font-bold text-gray-900 mb-6">Recent Enrollments</h2>
              <div className="space-y-4">
                {analytics.recentEnrollments.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">No enrollments yet</p>
                ) : (
                  analytics.recentEnrollments.map((enrollment) => (
                    <div key={enrollment.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                          <span className="text-primary-600 font-semibold">
                            {enrollment.student_name?.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">{enrollment.student_name}</div>
                          <div className="text-sm text-gray-500">{enrollment.student_email}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium text-primary-600">{enrollment.progress}%</div>
                        <div className="text-xs text-gray-500">{new Date(enrollment.enrolled_at).toLocaleDateString()}</div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="bg-white rounded-2xl shadow-lg p-6 lg:col-span-2"
            >
              <h2 className="text-xl font-bold text-gray-900 mb-6">Recent Activity</h2>
              <div className="space-y-4">
                {analytics.recentActivity.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">No recent activity</p>
                ) : (
                  analytics.recentActivity.map((activity, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                          <CheckCircle className="h-5 w-5 text-green-600" />
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">{activity.student_name}</div>
                          <div className="text-sm text-gray-500">completed "{activity.lesson_title}"</div>
                        </div>
                      </div>
                      <div className="text-sm text-gray-500">
                        {new Date(activity.timestamp).toLocaleString()}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default AdminCourseAnalytics;
