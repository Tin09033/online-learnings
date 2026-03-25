import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, Users, Play, CheckCircle, Lock, ChevronLeft, ChevronRight, Clock, Award, PartyPopper, FileText, Download, Megaphone, AlertTriangle, AlertCircle, Info, X, Upload, CreditCard, Video, List, ChevronDown, ChevronUp, ExternalLink, RotateCcw } from 'lucide-react';
import { coursesAPI, enrollmentsAPI, lessonProgressAPI, handoutAPI, announcementAPI, paymentsAPI, classLinkAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import PaymentUploadModal from '../components/PaymentUploadModal';

const CourseDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);
  const [selectedLesson, setSelectedLesson] = useState(null);
  const [completing, setCompleting] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  const [currentLessonIndex, setCurrentLessonIndex] = useState(0);
  const [handouts, setHandouts] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [showAnnouncements, setShowAnnouncements] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState(null);
  const [classLink, setClassLink] = useState(null);
  const [pendingEnrollment, setPendingEnrollment] = useState(null);
  const [enrollingWithPayment, setEnrollingWithPayment] = useState(false);

  useEffect(() => {
    fetchCourse();
  }, [id]);

  useEffect(() => {
    if (course?.enrollment) {
      fetchHandouts();
      fetchAnnouncements();
    }
  }, [course?.enrollment]);

  useEffect(() => {
    if (course?.enrollment?.id) {
      fetchPaymentStatus(course.enrollment.id);
      fetchClassLink();
    }
  }, [course?.enrollment]);

  const courseRef = useRef(null);
  useEffect(() => {
    courseRef.current = course;
  }, [course]);

  useEffect(() => {
    const handleFocus = () => {
      fetchCourse();
    };
    window.addEventListener('focus', handleFocus);
    const interval = setInterval(() => {
      if (courseRef.current?.enrollment && courseRef.current.enrollment.status !== 'completed') {
        fetchCourse();
      }
    }, 3000);
    return () => {
      window.removeEventListener('focus', handleFocus);
      clearInterval(interval);
    };
  }, []);

  useEffect(() => {
    if (course?.lastIncompleteLesson && course?.enrollment && !selectedLesson) {
      const lastLesson = course.lessons.find(l => l.id === course.lastIncompleteLesson.id);
      if (lastLesson) {
        setSelectedLesson(lastLesson);
        const index = course.lessons.findIndex(l => l.id === lastLesson.id);
        setCurrentLessonIndex(index);
      }
    }
  }, [course]);

  const fetchCourse = async () => {
    try {
      const response = await coursesAPI.getOne(id);

      setCourse(response.data);
      
      if (response.data.lessons?.length > 0 && !response.data.lastIncompleteLesson) {
        setSelectedLesson(response.data.lessons[0]);
      }

      if (response.data.enrollment?.id) {
        try {
          const paymentRes = await paymentsAPI.getByEnrollment(response.data.enrollment.id);
          setPaymentStatus(paymentRes.data);
        } catch (err) {
          console.error('Failed to fetch payment status');
        }
      }
    } catch (error) {
      toast.error('Failed to load course');
      navigate('/courses');
    } finally {
      setLoading(false);
    }
  };

  const fetchHandouts = async () => {
    try {
      const response = await handoutAPI.getStudent(id);
      setHandouts(response.data);
    } catch (error) {
      if (error.response?.status !== 403) {
        console.error('Failed to load handouts');
      }
    }
  };

  const fetchAnnouncements = async () => {
    try {
      const response = await announcementAPI.getStudent(id);
      setAnnouncements(response.data);
    } catch (error) {
      if (error.response?.status !== 403) {
        console.error('Failed to load announcements');
      }
    }
  };

  const fetchPaymentStatus = async (enrollmentId) => {
    if (!enrollmentId) return;
    try {
      const response = await paymentsAPI.getByEnrollment(enrollmentId);
      setPaymentStatus(response.data);
    } catch (error) {
      setPaymentStatus(null);
    }
  };

  const fetchClassLink = async () => {
    try {
      const response = await classLinkAPI.getMyByCourse(id);
      setClassLink(response.data);
    } catch (error) {
      setClassLink(null);
    }
  };

  const handleEnroll = async () => {
    if (!user) {
      toast.error('Please login to enroll');
      navigate('/login');
      return;
    }

    if (!id) {
      toast.error('Course not found');
      return;
    }

    setEnrolling(true);
    try {
      const payload = { course_id: parseInt(id, 10) };
      const response = await enrollmentsAPI.enroll(payload);
      toast.success(response.data.message || 'Enrolled successfully! Please upload payment proof.');
      
      if (response.data.enrollment) {
        const enrollmentData = {
          ...response.data.enrollment,
          title: course?.title
        };
        setPendingEnrollment(enrollmentData);
        setShowPaymentModal(true);
      }
      
      fetchCourse();
      setTimeout(() => fetchCourse(), 1000);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to enroll');
    } finally {
      setEnrolling(false);
    }
  };

  const handlePaymentSuccess = () => {
    fetchCourse();
    setTimeout(() => fetchCourse(), 1000);
    if (course?.enrollment) {
      fetchPaymentStatus(course.enrollment.id);
    }
  };

  const isClassTime = () => {
    if (!classLink?.scheduled_at) return false;
    const now = new Date();
    const scheduled = new Date(classLink.scheduled_at);
    const diff = scheduled - now;
    return diff <= 0 && diff > -2 * 60 * 60 * 1000;
  };

  const handleToggleComplete = async () => {
    if (!course.enrollment || completing) return;

    setCompleting(true);
    try {
      const isCompleted = course.lessonProgress?.[selectedLesson?.id]?.completed;
      
      if (isCompleted) {
        await lessonProgressAPI.markIncomplete(selectedLesson.id);
        toast.success('Lesson marked as incomplete');
      } else {
        const response = await lessonProgressAPI.markComplete(selectedLesson.id);
        toast.success('Lesson completed!');
        
        if (response.data.progress >= 100 && !showCelebration) {
          setShowCelebration(true);
          setTimeout(() => setShowCelebration(false), 5000);
        }
      }
      
      fetchCourse();
    } catch (error) {
      toast.error('Failed to update lesson progress');
    } finally {
      setCompleting(false);
    }
  };

  const handleLessonSelect = (lesson, index) => {
    if (!course.enrollment) return;
    setSelectedLesson(lesson);
    setCurrentLessonIndex(index);
  };

  const handlePreviousLesson = () => {
    if (currentLessonIndex > 0) {
      const prevLesson = course.lessons[currentLessonIndex - 1];
      handleLessonSelect(prevLesson, currentLessonIndex - 1);
    }
  };

  const handleNextLesson = () => {
    if (currentLessonIndex < course.lessons.length - 1) {
      const nextLesson = course.lessons[currentLessonIndex + 1];
      handleLessonSelect(nextLesson, currentLessonIndex + 1);
    }
  };

  const handleResume = () => {
    if (course.lastIncompleteLesson) {
      const lesson = course.lessons.find(l => l.id === course.lastIncompleteLesson.id);
      const index = course.lessons.findIndex(l => l.id === course.lastIncompleteLesson.id);
      handleLessonSelect(lesson, index);
    }
  };

  const isLessonCompleted = (lessonId) => {
    return course?.lessonProgress?.[lessonId]?.completed === true;
  };

  const getVideoDuration = (videoUrl) => {
    return '10:00';
  };

  const getContentDuration = (content) => {
    if (!content) return '5 min read';
    const words = content.split(/\s+/).length;
    const minutes = Math.ceil(words / 200);
    return `${minutes} min read`;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!course) return null;

  const completedCount = course.completedLessonsCount || 0;
  const totalLessons = course.lessons?.length || 0;
  const isLastLesson = currentLessonIndex === totalLessons - 1;
  const isFirstLesson = currentLessonIndex === 0;
  const currentLessonCompleted = isLessonCompleted(selectedLesson?.id);
  const allLessonsCompleted = completedCount === totalLessons && totalLessons > 0;

  return (
    <div className="min-h-screen bg-gray-50">
      <AnimatePresence>
        {showCelebration && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="bg-white rounded-3xl p-12 text-center max-w-lg mx-4 shadow-2xl"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', damping: 10 }}
                className="mb-6"
              >
                <div className="w-24 h-24 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center mx-auto">
                  <PartyPopper className="h-12 w-12 text-white" />
                </div>
              </motion.div>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Congratulations!</h2>
              <p className="text-gray-600 mb-6">
                You've completed the entire course! Great job on your learning journey.
              </p>
              <div className="flex items-center justify-center space-x-2 text-yellow-600 mb-6">
                <Award className="h-6 w-6" />
                <span className="font-semibold">Course Completed</span>
              </div>
              <button
                onClick={() => setShowCelebration(false)}
                className="bg-primary-600 text-white px-8 py-3 rounded-xl hover:bg-primary-700 transition-colors font-semibold"
              >
                Continue Learning
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <section className="bg-gradient-to-r from-primary-600 to-primary-700 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
                {course.title}
              </h1>
              <p className="text-xl text-primary-100 mb-8">
                {course.description}
              </p>
              
              <div className="flex flex-wrap gap-6 text-primary-100 mb-8">
                <div className="flex items-center space-x-2">
                  <BookOpen className="h-5 w-5" />
                  <span>{totalLessons} lessons</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Users className="h-5 w-5" />
                  <span>{course.enrollment_count} students</span>
                </div>
                {course.instructor_name && (
                  <div className="flex items-center space-x-2">
                    <span>by <strong className="text-white">{course.instructor_name}</strong></span>
                  </div>
                )}
              </div>

              {!course.enrollment ? (
                <div className="flex flex-wrap gap-4">
                  <button
                    onClick={() => {
                      if (!user) {
                        toast.error('Please login to enroll');
                        navigate('/login');
                        return;
                      }
                      setEnrollingWithPayment(true);
                      setPendingEnrollment({ id: null, course_id: id, title: course.title, amount: course.amount });
                      setShowPaymentModal(true);
                    }}
                    disabled={enrolling}
                    className="bg-white text-primary-600 px-8 py-4 rounded-xl hover:bg-primary-50 transition-all duration-300 font-semibold text-lg shadow-lg disabled:opacity-50"
                  >
                    {enrolling ? 'Processing...' : 'Enroll Now'}
                  </button>
                  <button
                    onClick={() => {
                      if (!user) {
                        navigate('/login');
                        return;
                      }
                      toast.info('Please enroll first to start learning');
                    }}
                    className="bg-yellow-500 text-white px-8 py-4 rounded-xl hover:bg-yellow-600 transition-all duration-300 font-semibold text-lg shadow-lg opacity-70 cursor-not-allowed"
                    disabled
                  >
                    Start Learning
                  </button>
                </div>
              ) : course.enrollment.status === 'pending' || course.enrollment.status === 'active' ? (
                <div className="space-y-4">
                  <div className="bg-yellow-500/20 text-white px-6 py-3 rounded-xl inline-flex items-center space-x-2">
                    <Clock className="h-5 w-5" />
                    <span className="font-semibold">Pending Payment Confirmation</span>
                    <button onClick={fetchCourse} className="ml-2 bg-white/20 px-2 py-1 rounded text-xs hover:bg-white/30">
                      Refresh
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-4">
                    {paymentStatus?.status === 'rejected' ? (
                      <button
                        onClick={() => setShowPaymentModal(true)}
                        className="bg-white text-primary-600 px-8 py-4 rounded-xl hover:bg-primary-50 transition-all duration-300 font-semibold text-lg shadow-lg inline-flex items-center space-x-2"
                      >
                        <Upload className="h-5 w-5" />
                        <span>Resubmit Payment Proof</span>
                      </button>
                    ) : (
                      <button
                        onClick={() => setShowPaymentModal(true)}
                        className="bg-white/20 text-white px-8 py-4 rounded-xl hover:bg-white/30 transition-all duration-300 font-semibold text-lg shadow-lg inline-flex items-center space-x-2"
                      >
                        <Upload className="h-5 w-5" />
                        <span>Upload Payment Proof</span>
                      </button>
                    )}
                    <button
                      className="bg-yellow-500 text-white px-8 py-4 rounded-xl font-semibold text-lg shadow-lg opacity-50 cursor-not-allowed"
                      disabled
                    >
                      Start Learning
                    </button>
                  </div>
                </div>
              ) : course.enrollment.status === 'completed' ? (
                <div className="space-y-4">
                  <div className="bg-white/20 text-white px-6 py-3 rounded-xl inline-flex items-center space-x-2">
                    <CheckCircle className="h-5 w-5" />
                    <span className="font-semibold">
                      {course.enrollment.progress}% Complete ({completedCount}/{totalLessons} lessons)
                    </span>
                  </div>
                  
                  <div className="flex flex-wrap gap-3">
                    <button
                      onClick={() => navigate(`/student/courses/${course.id}/learn`)}
                      className="bg-yellow-500 text-white px-8 py-4 rounded-xl hover:bg-yellow-600 transition-all duration-300 font-semibold text-lg shadow-lg inline-flex items-center space-x-2"
                    >
                      <Play className="h-5 w-5" />
                      <span>{course.lastIncompleteLesson ? 'Resume Learning' : 'Start Learning'}</span>
                    </button>
                    <button
                      onClick={() => navigate('/student/courses')}
                      className="bg-purple-500 text-white px-8 py-4 rounded-xl hover:bg-purple-600 transition-all duration-300 font-semibold text-lg shadow-lg inline-flex items-center space-x-2"
                    >
                      <BookOpen className="h-5 w-5" />
                      <span>View All Lessons</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="bg-white/20 text-white px-6 py-3 rounded-xl inline-flex items-center space-x-2">
                    <CheckCircle className="h-5 w-5" />
                    <span className="font-semibold">
                      {course.enrollment.progress}% Complete ({completedCount}/{totalLessons} lessons)
                    </span>
                  </div>
                  
                  <div className="flex flex-wrap gap-3">
                    <button
                      onClick={() => navigate(`/student/courses/${course.id}/learn`)}
                      className="bg-yellow-500 text-white px-8 py-4 rounded-xl hover:bg-yellow-600 transition-all duration-300 font-semibold text-lg shadow-lg inline-flex items-center space-x-2"
                    >
                      <Play className="h-5 w-5" />
                      <span>{course.lastIncompleteLesson ? 'Resume Learning' : 'Start Learning'}</span>
                    </button>
                    <button
                      onClick={() => navigate('/student/courses')}
                      className="bg-purple-500 text-white px-8 py-4 rounded-xl hover:bg-purple-600 transition-all duration-300 font-semibold text-lg shadow-lg inline-flex items-center space-x-2"
                    >
                      <BookOpen className="h-5 w-5" />
                      <span>View All Lessons</span>
                    </button>
                  </div>
                </div>
              )}

              {course.enrollment && (handouts.length > 0 || announcements.length > 0) && (
                <div className="mt-8 space-y-6">
                  {handouts.length > 0 && (
                    <div className="bg-white rounded-2xl shadow-lg p-6">
                      <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center space-x-2">
                        <FileText className="h-5 w-5" />
                        <span>Course Materials</span>
                      </h3>
                      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {handouts.map((handout) => (
                          <a
                            key={handout.id}
                            href={`http://localhost:5000${handout.file_path}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center space-x-3 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
                          >
                            <div className="text-2xl">
                              {handout.file_type?.includes('pdf') ? '📄' : '📎'}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="font-medium text-gray-900 truncate">{handout.title}</div>
                              {handout.description && (
                                <div className="text-xs text-gray-500 truncate">{handout.description}</div>
                              )}
                            </div>
                            <Download className="h-5 w-5 text-gray-400" />
                          </a>
                        ))}
                      </div>
                    </div>
                  )}

                  {announcements.length > 0 && (
                    <div className="bg-white rounded-2xl shadow-lg p-6">
                      <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center space-x-2">
                        <Megaphone className="h-5 w-5" />
                        <span>Announcements</span>
                      </h3>
                      <div className="space-y-4">
                        {announcements.map((announcement) => (
                          <div
                            key={announcement.id}
                            className={`p-4 rounded-xl ${
                              announcement.priority === 'urgent'
                                ? 'bg-red-50 border-l-4 border-red-500'
                                : announcement.priority === 'important'
                                ? 'bg-yellow-50 border-l-4 border-yellow-500'
                                : 'bg-blue-50 border-l-4 border-blue-500'
                            }`}
                          >
                            <div className="flex items-start space-x-3">
                              <div className="mt-1">
                                {announcement.priority === 'urgent' ? (
                                  <AlertTriangle className="h-5 w-5 text-red-500" />
                                ) : announcement.priority === 'important' ? (
                                  <AlertCircle className="h-5 w-5 text-yellow-500" />
                                ) : (
                                  <Info className="h-5 w-5 text-blue-500" />
                                )}
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center justify-between mb-1">
                                  <h4 className="font-semibold text-gray-900">{announcement.title}</h4>
                                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                                    announcement.priority === 'urgent'
                                      ? 'bg-red-100 text-red-700'
                                      : announcement.priority === 'important'
                                      ? 'bg-yellow-100 text-yellow-700'
                                      : 'bg-blue-100 text-blue-700'
                                  }`}>
                                    {announcement.priority}
                                  </span>
                                </div>
                                <p className="text-gray-600 text-sm whitespace-pre-wrap">{announcement.content}</p>
                                <div className="text-xs text-gray-500 mt-2">
                                  {new Date(announcement.created_at).toLocaleDateString()}
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </section>

      {totalLessons > 0 && (
        <section className="py-12 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <List className="h-6 w-6" />
                Course Curriculum
              </h2>
              <span className="text-gray-500">{totalLessons} lessons</span>
            </div>

            {totalLessons === 0 ? (
              <div className="text-center py-12 bg-gray-50 rounded-2xl">
                <BookOpen className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">No lessons available yet. Check back soon!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {course.lessons.map((lesson, index) => {
                  const isCompleted = isLessonCompleted(lesson.id);
                  const isSelected = selectedLesson?.id === lesson.id;
                  
                  return (
                    <div
                      key={lesson.id}
                      className={`border rounded-xl overflow-hidden transition-all ${
                        isSelected 
                          ? 'border-primary-500 shadow-lg' 
                          : 'border-gray-200 hover:border-gray-300'
                      } ${!course.enrollment ? 'opacity-75' : ''}`}
                    >
                      <button
                        onClick={() => course.enrollment ? handleLessonSelect(lesson, index) : toast.info('Please enroll to access lessons')}
                        className="w-full px-6 py-4 flex items-center justify-between bg-white hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex items-center gap-4">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                            isCompleted 
                              ? 'bg-green-100 text-green-600' 
                              : 'bg-gray-100 text-gray-600'
                          }`}>
                            {isCompleted ? (
                              <CheckCircle className="h-5 w-5" />
                            ) : (
                              <span className="font-semibold">{index + 1}</span>
                            )}
                          </div>
                          <div className="text-left">
                            <h3 className={`font-semibold ${isCompleted ? 'text-gray-500 line-through' : 'text-gray-900'}`}>
                              {lesson.title}
                            </h3>
                            <p className="text-sm text-gray-500">
                              {lesson.video_url ? 'Video lesson' : 'Text lesson'} • {getContentDuration(lesson.content)}
                            </p>
                          </div>
                        </div>
                        {isSelected ? (
                          <ChevronUp className="h-5 w-5 text-primary-600" />
                        ) : (
                          <ChevronDown className="h-5 w-5 text-gray-400" />
                        )}
                      </button>

                      <AnimatePresence>
                        {isSelected && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="overflow-hidden"
                          >
                            <div className="px-6 py-6 bg-gray-50 border-t border-gray-200">
                              {lesson.video_url && (
                                <div className="mb-6">
                                  <div className="aspect-video bg-black rounded-xl overflow-hidden">
                                    <video
                                      src={lesson.video_url}
                                      controls
                                      className="w-full h-full object-contain"
                                    />
                                  </div>
                                </div>
                              )}
                              
                              {lesson.content && (
                                <div className="prose prose-gray max-w-none mb-6">
                                  <div className="whitespace-pre-wrap text-gray-700 leading-relaxed">
                                    {lesson.content}
                                  </div>
                                </div>
                              )}

                              {!lesson.video_url && !lesson.content && (
                                <p className="text-gray-500 italic">No content available for this lesson.</p>
                              )}

                              <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                                <div className="flex items-center gap-2">
                                  {isCompleted && (
                                    <span className="text-green-600 text-sm font-medium flex items-center gap-1">
                                      <CheckCircle className="h-4 w-4" />
                                      Completed
                                    </span>
                                  )}
                                </div>
                                {course.enrollment ? (
                                  <button
                                    onClick={handleToggleComplete}
                                    disabled={completing}
                                    className={`px-6 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 flex items-center gap-2 ${
                                      isCompleted
                                        ? 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                        : 'bg-primary-600 text-white hover:bg-primary-700'
                                    }`}
                                  >
                                    {completing ? (
                                      <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                                    ) : isCompleted ? (
                                      <>
                                        <RotateCcw className="h-4 w-4" />
                                        Mark as Incomplete
                                      </>
                                    ) : (
                                      <>
                                        <CheckCircle className="h-4 w-4" />
                                        Mark as Complete
                                      </>
                                    )}
                                  </button>
                                ) : (
                                  <div className="flex items-center gap-2 text-gray-500">
                                    <Lock className="h-4 w-4" />
                                    <span className="text-sm">Enroll to access lessons</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })}
              </div>
            )}

            {course.enrollment && totalLessons > 1 && (
              <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-200">
                <button
                  onClick={handlePreviousLesson}
                  disabled={isFirstLesson}
                  className="flex items-center gap-2 px-6 py-3 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="h-5 w-5" />
                  Previous Lesson
                </button>
                <button
                  onClick={handleNextLesson}
                  disabled={isLastLesson}
                  className="flex items-center gap-2 px-6 py-3 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next Lesson
                  <ChevronRight className="h-5 w-5" />
                </button>
              </div>
            )}
          </div>
        </section>
      )}

      <PaymentUploadModal
        isOpen={showPaymentModal}
        onClose={() => {
          setShowPaymentModal(false);
          setPendingEnrollment(null);
        }}
        enrollment={pendingEnrollment || (course?.enrollment ? { id: course.enrollment.id, title: course.title, amount: course.amount } : null)}
        courseAmount={course?.amount}
        onSuccess={() => {
          handlePaymentSuccess();
          setPendingEnrollment(null);
          setEnrollingWithPayment(false);
        }}
        onEnrollSuccess={() => {
          fetchCourse();
          setEnrollingWithPayment(false);
        }}
      />
    </div>
  );
};

export default CourseDetail;
