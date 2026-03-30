import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { BookOpen, Search, ChevronRight, Play, History, Calendar, Users, Clock, CheckCircle, Video, ArrowUpDown, Filter, ExternalLink, CreditCard, X, Award } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { enrollmentsAPI } from '../services/api';
import { toast } from 'react-toastify';
import { useTranslation } from 'react-i18next';
import { getCourseImageUrl } from '../utils/apiUrl';

const StudentCourses = () => {
  const { user } = useAuth();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [courseTab, setCourseTab] = useState('enrolled');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('enrolled_at');
  const [sortOrder, setSortOrder] = useState('desc');
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [showClassLinkModal, setShowClassLinkModal] = useState(false);
  const [classLinkData, setClassLinkData] = useState(null);

  useEffect(() => {
    fetchEnrollments();
  }, []);

  const fetchEnrollments = async () => {
    try {
      const response = await enrollmentsAPI.getMy();
      setEnrollments(response.data);
      setError(null);
    } catch (err) {
      console.error('Error fetching enrollments:', err);
      setError(err.message || 'Failed to load courses');
      toast.error('Failed to load courses');
    } finally {
      setLoading(false);
    }
  };

  const enrolledCourses = enrollments.filter(e => e.status === 'active');
  const completedCourses = enrollments.filter(e => e.status === 'completed');
  const pendingCourses = enrollments.filter(e => e.status === 'pending');
  const historyCourses = enrollments;

  const totalActiveLessons = enrolledCourses.reduce((sum, e) => sum + (parseInt(e.total_lessons) || 0), 0);
  const totalCompletedLessons = completedCourses.length;

  const coursesToDisplay = courseTab === 'enrolled' ? enrolledCourses : 
                           courseTab === 'completed' ? completedCourses : 
                           courseTab === 'pending' ? pendingCourses : historyCourses;

  const filteredCourses = coursesToDisplay.filter(c => 
    c.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const sortedCourses = [...filteredCourses].sort((a, b) => {
    let comparison = 0;
    switch (sortBy) {
      case 'enrolled_at':
        comparison = new Date(a.enrolled_at) - new Date(b.enrolled_at);
        break;
      case 'progress':
        comparison = (a.progress || 0) - (b.progress || 0);
        break;
      case 'title':
        comparison = (a.title || '').localeCompare(b.title || '');
        break;
      default:
        comparison = 0;
    }
    return sortOrder === 'asc' ? comparison : -comparison;
  });

  const toggleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  };

  const handleViewClassLink = (course) => {
    if (course.class_link) {
      setClassLinkData({
        title: course.title,
        class_link: course.class_link,
        scheduled_at: course.class_scheduled_at,
        payment_status: course.payment_status
      });
      setShowClassLinkModal(true);
    } else {
      toast.info('No class link available for this course yet');
    }
  };

  const getPaymentStatusBadge = (status) => {
    switch (status) {
      case 'verified':
        return { bg: 'bg-green-100 dark:bg-green-900/30', text: 'text-green-700 dark:text-green-400', label: 'Paid' };
      case 'rejected':
        return { bg: 'bg-red-100 dark:bg-red-900/30', text: 'text-red-700 dark:text-red-400', label: 'Payment Rejected' };
      case 'pending':
        return { bg: 'bg-yellow-100 dark:bg-yellow-900/30', text: 'text-yellow-700 dark:text-yellow-400', label: 'Awaiting Approval' };
      default:
        return { bg: 'bg-gray-100 dark:bg-gray-700', text: 'text-gray-700 dark:text-gray-300', label: 'Pending' };
    }
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{t('student.myCourses')}</h1>
        <p className="text-gray-500 dark:text-gray-400">{t('student.manageCourses') || 'Manage your enrolled courses'}</p>
      </div>

      {/* Stats Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-5 text-white"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm font-medium">{t('student.activeCourses') || 'Active Courses'}</p>
              <p className="text-3xl font-bold mt-1">{enrolledCourses.length}</p>
            </div>
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
              <BookOpen className="h-6 w-6" />
            </div>
          </div>
          <div className="mt-3 flex items-center gap-1 text-blue-100 text-xs">
            <Clock className="h-3 w-3" />
            <span>{totalActiveLessons} {t('student.lessonsInProgress') || 'lessons in progress'}</span>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl p-5 text-white"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm font-medium">{t('student.completed')}</p>
              <p className="text-3xl font-bold mt-1">{completedCourses.length}</p>
            </div>
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
              <CheckCircle className="h-6 w-6" />
            </div>
          </div>
          <div className="mt-3 flex items-center gap-1 text-green-100 text-xs">
            <Award className="h-3 w-3" />
            <span>{t('student.certificatesEarned') || 'Course certificates earned'}</span>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-gradient-to-br from-yellow-500 to-orange-500 rounded-2xl p-5 text-white"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-yellow-100 text-sm font-medium">{t('student.pending')}</p>
              <p className="text-3xl font-bold mt-1">{pendingCourses.length}</p>
            </div>
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
              <CreditCard className="h-6 w-6" />
            </div>
          </div>
          <div className="mt-3 flex items-center gap-1 text-yellow-100 text-xs">
            <Clock className="h-3 w-3" />
            <span>{t('student.awaitingPayment') || 'Awaiting payment approval'}</span>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl p-5 text-white"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm font-medium">{t('student.totalEnrolled') || 'Total Enrolled'}</p>
              <p className="text-3xl font-bold mt-1">{enrollments.length}</p>
            </div>
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
              <Users className="h-6 w-6" />
            </div>
          </div>
          <div className="mt-3 flex items-center gap-1 text-purple-100 text-xs">
            <BookOpen className="h-3 w-3" />
            <span>{t('student.allTimeEnrollments') || 'All time enrollments'}</span>
          </div>
        </motion.div>
      </div>

      <div className="flex gap-2 mb-6 flex-wrap">
        {[
          { id: 'enrolled', label: t('student.enrolled'), count: enrolledCourses.length },
          { id: 'pending', label: t('student.pending'), count: pendingCourses.length },
          { id: 'completed', label: t('student.completed'), count: completedCourses.length },
          { id: 'history', label: t('student.history'), count: historyCourses.length, icon: History },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setCourseTab(tab.id)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all flex items-center gap-2
              ${courseTab === tab.id ? 'bg-blue-500 text-white' : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
          >
            {tab.icon && <tab.icon className="h-4 w-4" />}
            {tab.label}
            <span className={`px-2 py-0.5 rounded-full text-xs
              ${courseTab === tab.id ? 'bg-blue-400' : 'bg-gray-200 dark:bg-gray-600'}`}>
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm mb-6">
        <div className="p-4 flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="h-5 w-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder={t('student.searchCourses')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-100 dark:bg-gray-700 border border-transparent rounded-xl text-sm focus:bg-white dark:focus:bg-gray-600 focus:border-blue-500 outline-none text-gray-900 dark:text-white"
            />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1">
              <Filter className="h-4 w-4" />
              {t('common.sort')}:
            </span>
            <select
              value={sortBy}
              onChange={(e) => toggleSort(e.target.value)}
              className="px-3 py-2 bg-gray-100 dark:bg-gray-700 border border-transparent rounded-xl text-sm text-gray-900 dark:text-white outline-none"
            >
              <option value="enrolled_at">{t('student.dateEnrolled')}</option>
              <option value="progress">{t('student.progress')}</option>
              <option value="title">{t('student.title')}</option>
            </select>
            <button
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              className="p-2 bg-gray-100 dark:bg-gray-700 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              title={sortOrder === 'asc' ? 'Ascending' : 'Descending'}
            >
              <ArrowUpDown className={`h-4 w-4 text-gray-600 dark:text-gray-300 transition-transform ${sortOrder === 'asc' ? 'rotate-180' : ''}`} />
            </button>
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 mb-6">
          <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
          <button
            onClick={fetchEnrollments}
            className="mt-2 text-sm text-red-500 hover:text-red-600 underline"
          >
            {t('common.retry')}
          </button>
        </div>
      )}

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm overflow-hidden animate-pulse">
              <div className="h-40 bg-gray-200 dark:bg-gray-700"></div>
              <div className="p-4 space-y-3">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
              </div>
            </div>
          ))}
        </div>
      ) : sortedCourses.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-12 text-center">
          {courseTab === 'history' ? (
            <History className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          ) : (
            <BookOpen className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          )}
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{t('student.noCourses')}</h3>
          <p className="text-gray-500 dark:text-gray-400 mb-4">
            {courseTab === 'enrolled' ? t('student.noActiveEnrollments') || 'You have no active enrollments' : 
             courseTab === 'completed' ? t('student.noCompletedCourses') || 'You have not completed any courses yet' :
             courseTab === 'pending' ? t('student.noPendingEnrollments') || 'No pending enrollments' :
             t('student.noEnrollmentHistory') || 'No enrollment history yet'}
          </p>
          <Link to="/courses" className="inline-block bg-blue-500 text-white px-6 py-2.5 rounded-xl hover:bg-blue-600">
            {t('navbar.courses')}
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sortedCourses.map((enrollment, index) => {
            const paymentBadge = getPaymentStatusBadge(enrollment.payment_status);
            return (
              <motion.div
                key={enrollment.enrollment_id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm overflow-hidden hover:shadow-md transition-shadow"
              >
                <div className="h-40 overflow-hidden relative">
                  <img
                    src={getCourseImageUrl(enrollment.course_image)}
                    alt={enrollment.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-2 right-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium
                      ${enrollment.status === 'completed' ? 'bg-green-100 dark:bg-green-900/70 text-green-700 dark:text-green-300' :
                        enrollment.status === 'pending' ? 'bg-orange-100 dark:bg-orange-900/70 text-orange-700 dark:text-orange-300' :
                        'bg-blue-100 dark:bg-blue-900/70 text-blue-700 dark:text-blue-300'}`}>
                      {enrollment.status === 'completed' ? t('student.completed') :
                       enrollment.status === 'pending' ? t('student.pending') : t('student.inProgress') || 'In Progress'}
                    </span>
                  </div>
                </div>
                
                <div className="p-4">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-1 line-clamp-1">{enrollment.title}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-3 line-clamp-2">{enrollment.description}</p>
                  
                  {/* Instructor & Lessons */}
                  <div className="flex items-center gap-3 mb-3 text-xs text-gray-500 dark:text-gray-400">
                    {enrollment.instructor_name && (
                      <div className="flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        <span>{enrollment.instructor_name}</span>
                      </div>
                    )}
                    {enrollment.total_lessons > 0 && (
                      <div className="flex items-center gap-1">
                        <Video className="h-3 w-3" />
                        <span>{enrollment.total_lessons} {t('student.lessons')}</span>
                      </div>
                    )}
                  </div>
                  
                  {/* Enrollment Date for History */}
                  {courseTab === 'history' && enrollment.enrolled_at && (
                    <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400 mb-3">
                      <Calendar className="h-3 w-3" />
                      <span>{t('student.enrolledDate')}: {new Date(enrollment.enrolled_at).toLocaleDateString()}</span>
                    </div>
                  )}
                  
                  {/* Payment Status for Enrolled/History */}
                  {(courseTab === 'enrolled' || courseTab === 'history') && enrollment.payment_status && (
                    <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium mb-3 ${paymentBadge.bg} ${paymentBadge.text}`}>
                      <CreditCard className="h-3 w-3" />
                      {paymentBadge.label}
                    </div>
                  )}
                  
                  {/* Progress Bar */}
                  <div className="mb-3">
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-600 dark:text-gray-400">{t('student.progress')}</span>
                      <span className="font-medium text-blue-600">{enrollment.progress || 0}%</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div
                        className="bg-blue-500 h-2 rounded-full transition-all"
                        style={{ width: `${enrollment.progress || 0}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Quick Action Buttons */}
                  <div className="flex flex-wrap gap-2 mb-3">
                    {enrollment.status === 'active' && (
                      <Link
                        to={`/student/courses/${enrollment.course_id || enrollment.id}/learn`}
                        className="flex-1 flex items-center justify-center gap-1 bg-blue-500 text-white px-3 py-2 rounded-lg text-sm font-medium hover:bg-blue-600 transition-colors"
                      >
                        <Play className="h-4 w-4" />
                        {enrollment.progress > 0 ? t('student.resume') : t('student.start')}
                      </Link>
                    )}
                    {enrollment.class_link && enrollment.payment_status === 'verified' && (
                      <button
                        onClick={() => handleViewClassLink(enrollment)}
                        className="flex items-center justify-center gap-1 bg-purple-500 text-white px-3 py-2 rounded-lg text-sm font-medium hover:bg-purple-600 transition-colors"
                      >
                        <Video className="h-4 w-4" />
                        {t('student.class') || 'Class'}
                      </button>
                    )}
                    <Link
                      to={`/courses/${enrollment.course_id}`}
                      className="flex items-center justify-center gap-1 text-blue-500 text-sm font-medium hover:text-blue-600"
                    >
                      {t('student.details') || 'Details'} <ChevronRight className="h-4 w-4" />
                    </Link>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Class Link Modal */}
      {showClassLinkModal && classLinkData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setShowClassLinkModal(false)}
          />
          <div className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-6 max-w-md w-full mx-4 animate-[fadeIn_0.2s_ease-out]">
            <button
              onClick={() => setShowClassLinkModal(false)}
              className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
            >
              <X className="h-5 w-5" />
            </button>
            
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <Video className="h-8 w-8 text-purple-500" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{t('student.classLink') || 'Class Link'}</h3>
              <p className="text-gray-500 dark:text-gray-400">{classLinkData.title}</p>
            </div>
            
            {classLinkData.scheduled_at && (
              <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4 mb-4">
                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                  <Clock className="h-4 w-4" />
                  <span>{new Date(classLinkData.scheduled_at).toLocaleString()}</span>
                </div>
              </div>
            )}
            
            <a
              href={classLinkData.class_link}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center justify-center gap-2 bg-purple-500 text-white px-6 py-3 rounded-xl font-semibold hover:bg-purple-600 transition-colors"
            >
              <ExternalLink className="h-5 w-5" />
              {t('student.joinClass') || 'Join Class'}
            </a>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentCourses;
