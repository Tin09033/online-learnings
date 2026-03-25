import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, BookOpen, Award, CheckCircle, Clock, TrendingUp, Calendar } from 'lucide-react';
import { analyticsAPI } from '../services/api';
import { toast } from 'react-toastify';

const AdminStudentProgress = () => {
  const { studentId } = useParams();
  const [student, setStudent] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, [studentId]);

  const fetchAnalytics = async () => {
    try {
      const response = await analyticsAPI.getStudentAnalytics(studentId);
      setStudent(response.data.student);
      setAnalytics(response.data);
    } catch (error) {
      toast.error('Failed to load student analytics');
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
    { icon: <BookOpen className="h-6 w-6" />, label: 'Enrolled Courses', value: analytics.overallStats.totalEnrolled, color: 'bg-blue-500' },
    { icon: <Award className="h-6 w-6" />, label: 'Completed', value: analytics.overallStats.totalCompleted, color: 'bg-green-500' },
    { icon: <Clock className="h-6 w-6" />, label: 'In Progress', value: analytics.overallStats.totalInProgress, color: 'bg-yellow-500' },
    { icon: <CheckCircle className="h-6 w-6" />, label: 'Lessons Done', value: analytics.overallStats.totalLessonsCompleted, color: 'bg-purple-500' }
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

          <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
            <div className="flex items-center space-x-6">
              <div className="w-20 h-20 bg-primary-100 rounded-full flex items-center justify-center">
                <span className="text-3xl font-bold text-primary-600">
                  {student?.name?.charAt(0).toUpperCase()}
                </span>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{student?.name}</h1>
                <p className="text-gray-600">{student?.email}</p>
                <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                  <span className="flex items-center space-x-1">
                    <Calendar className="h-4 w-4" />
                    <span>Joined {new Date(student?.created_at).toLocaleDateString()}</span>
                  </span>
                  <span className="flex items-center space-x-1">
                    <TrendingUp className="h-4 w-4" />
                    <span>Avg Progress: {analytics.overallStats.averageProgress}%</span>
                  </span>
                </div>
              </div>
            </div>
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
              <h2 className="text-xl font-bold text-gray-900 mb-6">Enrolled Courses</h2>
              <div className="space-y-4">
                {analytics.enrollments.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">No enrollments yet</p>
                ) : (
                  analytics.enrollments.map((enrollment) => (
                    <div key={enrollment.id} className="p-4 bg-gray-50 rounded-xl">
                      <div className="flex items-center space-x-4 mb-3">
                        {enrollment.image && enrollment.image.trim() !== '' ? (
                          <img
                            src={enrollment.image.startsWith('http') ? enrollment.image : enrollment.image.startsWith('/uploads') ? enrollment.image : `/uploads${enrollment.image}`}
                            alt={enrollment.title}
                            className="w-16 h-16 object-cover rounded-lg"
                            onError={(e) => {
                              e.target.style.display = 'none';
                              e.target.nextSibling && (e.target.nextSibling.style.display = 'flex');
                            }}
                          />
                        ) : (
                          <div className="w-16 h-16 flex items-center justify-center bg-gray-100 dark:bg-gray-700 rounded-lg">
                            <BookOpen className="h-6 w-6 text-gray-400" />
                          </div>
                        )}
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900">{enrollment.title}</h3>
                          <div className="flex items-center space-x-2 text-sm text-gray-500">
                            <span>{enrollment.total_lessons} lessons</span>
                            <span>•</span>
                            <span>{new Date(enrollment.enrolled_at).toLocaleDateString()}</span>
                          </div>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          enrollment.status === 'completed'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-yellow-100 text-yellow-700'
                        }`}>
                          {enrollment.status === 'completed' ? 'Completed' : 'Active'}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${enrollment.progress}%` }}
                        ></div>
                      </div>
                      <div className="flex justify-between text-sm mt-1">
                        <span className="text-gray-500">Progress</span>
                        <span className="font-semibold text-primary-600">{enrollment.progress}%</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="bg-white rounded-2xl shadow-lg p-6"
            >
              <h2 className="text-xl font-bold text-gray-900 mb-6">Recently Completed Lessons</h2>
              <div className="space-y-4">
                {analytics.completedLessons.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">No completed lessons yet</p>
                ) : (
                  analytics.completedLessons.slice(0, 10).map((lesson, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                          <CheckCircle className="h-4 w-4 text-green-600" />
                        </div>
                        <div>
                          <div className="font-medium text-gray-900 text-sm">{lesson.lesson_title}</div>
                          <div className="text-xs text-gray-500">{lesson.course_title}</div>
                        </div>
                      </div>
                      <div className="text-xs text-gray-500">
                        {new Date(lesson.completed_at).toLocaleDateString()}
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

export default AdminStudentProgress;
