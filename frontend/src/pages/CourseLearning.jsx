import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { BookOpen, Play, CheckCircle, ChevronLeft, ChevronRight, Clock, Video, FileText, Download, Lock, X } from 'lucide-react';
import { coursesAPI, lessonProgressAPI, handoutAPI } from '../services/api';
import { toast } from 'react-toastify';

const CourseLearning = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedLesson, setSelectedLesson] = useState(null);
  const [currentLessonIndex, setCurrentLessonIndex] = useState(0);
  const [handouts, setHandouts] = useState([]);
  const [completing, setCompleting] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);

  useEffect(() => {
    fetchCourse();
    fetchHandouts(); // Fetch handouts regardless of enrollment
  }, [id]);

  useEffect(() => {
    if (course?.lessons?.length > 0 && !selectedLesson) {
      setSelectedLesson(course.lessons[0]);
    }
  }, [course]);

  const fetchCourse = async () => {
    try {
      const response = await coursesAPI.getOne(id);
      setCourse(response.data);
      
      if (response.data.lessons?.length > 0 && !response.data.lastIncompleteLesson) {
        setSelectedLesson(response.data.lessons[0]);
      } else if (response.data.lastIncompleteLesson) {
        const lesson = response.data.lessons.find(l => l.id === response.data.lastIncompleteLesson.id);
        if (lesson) {
          setSelectedLesson(lesson);
          const index = response.data.lessons.findIndex(l => l.id === lesson.id);
          setCurrentLessonIndex(index);
        }
      }
    } catch (error) {
      toast.error('Failed to load course');
      navigate('/student/courses');
    } finally {
      setLoading(false);
    }
  };

  const fetchHandouts = async () => {
    try {
      const response = await handoutAPI.getByCourse(id);
      let handoutsData = [];
      
      if (Array.isArray(response.data)) {
        handoutsData = response.data;
      } else if (response.data && typeof response.data === 'object') {
        handoutsData = response.data.handouts || response.data.data || [];
      }
      
      setHandouts(handoutsData);
    } catch (error) {
      console.error('Failed to fetch handouts:', error);
      setHandouts([]);
    }
  };

  const handleLessonSelect = async (lesson, index) => {
    if (course.enrollment) {
      setSelectedLesson(lesson);
      setCurrentLessonIndex(index);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleComplete = async () => {
    if (!selectedLesson || completing) return;
    setCompleting(true);
    try {
      await lessonProgressAPI.markComplete(selectedLesson.id);
      await fetchCourse();
      
      if (currentLessonIndex < course.lessons.length - 1) {
        const nextLesson = course.lessons[currentLessonIndex + 1];
        setSelectedLesson(nextLesson);
        setCurrentLessonIndex(currentLessonIndex + 1);
        toast.success('Lesson completed! Moving to next lesson.');
      } else {
        toast.success('Congratulations! You completed the course!');
        setShowCelebration(true);
        setTimeout(() => setShowCelebration(false), 3000);
      }
    } catch (error) {
      toast.error('Failed to mark lesson as complete');
    } finally {
      setCompleting(false);
    }
  };

  const handlePrevious = () => {
    if (currentLessonIndex > 0) {
      handleLessonSelect(course.lessons[currentLessonIndex - 1], currentLessonIndex - 1);
    }
  };

  const handleNext = () => {
    if (currentLessonIndex < course.lessons.length - 1) {
      handleLessonSelect(course.lessons[currentLessonIndex + 1], currentLessonIndex + 1);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          Course not found
        </h2>
        <Link to="/student/courses" className="text-blue-500 hover:text-blue-600">
          Go back to My Courses
        </Link>
      </div>
    );
  }

  if (!course.enrollment) {
    return (
      <div className="max-w-7xl mx-auto">
        <div className="text-center py-12 mb-6 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl">
          <BookOpen className="h-16 w-16 text-yellow-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            You are not enrolled in this course
          </h2>
          <p className="text-gray-500 dark:text-gray-400 mb-4">
            Please enroll first to access the course content
          </p>
          <Link to="/courses" className="inline-flex items-center gap-2 px-6 py-3 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors">
            Browse Courses
          </Link>
        </div>

        {handouts.length > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <FileText className="h-6 w-6 text-green-600" />
              Course Handouts Preview ({handouts.length})
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
              Enroll in this course to access these handouts
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {handouts.map((handout) => (
                <div
                  key={handout.id}
                  className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <FileText className="h-5 w-5 text-gray-400" />
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300 truncate">{handout.title}</span>
                  </div>
                  <p className="text-xs text-gray-500">Available after enrollment</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  const totalLessons = course.lessons?.length || 0;
  const completedLessons = Object.values(course.lessonProgress || {}).filter(p => p.completed).length;
  const progress = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;
  const isLessonCompleted = selectedLesson && course.lessonProgress?.[selectedLesson.id]?.completed;

  return (
    <div className="max-w-7xl mx-auto">
      {showCelebration && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring' }}
            className="bg-white dark:bg-gray-800 rounded-2xl p-8 text-center max-w-md mx-4"
          >
            <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="h-10 w-10 text-green-500" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Congratulations!</h2>
            <p className="text-gray-600 dark:text-gray-300">You have completed all lessons in this course!</p>
          </motion.div>
        </motion.div>
      )}

      <div className="flex items-center justify-between mb-6">
        <div>
          <Link to="/student/courses" className="text-blue-500 hover:text-blue-600 flex items-center gap-1 text-sm mb-2">
            <ChevronLeft className="h-4 w-4" />
            Back to My Courses
          </Link>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{course.title}</h1>
        </div>
        <div className="bg-blue-500 text-white px-4 py-2 rounded-lg">
          <span className="font-semibold">{progress}%</span> Complete
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 sticky top-4">
            <h2 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              Course Modules
            </h2>
            <div className="space-y-2 max-h-[50vh] overflow-y-auto">
              {course.lessons?.map((lesson, index) => {
                const isCompleted = course.lessonProgress?.[lesson.id]?.completed;
                const isActive = selectedLesson?.id === lesson.id;
                return (
                  <button
                    key={lesson.id}
                    onClick={() => handleLessonSelect(lesson, index)}
                    className={`w-full text-left p-3 rounded-lg transition-all flex items-center gap-3
                      ${isActive ? 'bg-blue-500 text-white' : 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600'}
                      ${isCompleted && !isActive ? 'opacity-75' : ''}`}
                  >
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0
                      ${isActive ? 'bg-white/20' : isCompleted ? 'bg-green-100 dark:bg-green-900/30' : 'bg-gray-200 dark:bg-gray-600'}`}>
                      {isCompleted ? (
                        <CheckCircle className={`h-4 w-4 ${isActive ? 'text-white' : 'text-green-500'}`} />
                      ) : (
                        <span className={`text-sm font-medium ${isActive ? 'text-white' : 'text-gray-600 dark:text-gray-300'}`}>
                          {index + 1}
                        </span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-medium truncate ${isActive ? 'text-white' : 'text-gray-900 dark:text-white'}`}>
                        {lesson.title}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Course Handouts ({handouts.length})
              </h3>
              <div className="space-y-2 max-h-[30vh] overflow-y-auto">
                {handouts.map((handout) => (
                  <a
                    key={handout.id}
                    href={`http://localhost:5000${handout.file_path}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between gap-2 p-3 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border border-green-200 dark:border-green-800 rounded-lg hover:from-green-100 hover:to-emerald-100 dark:hover:from-green-900/30 dark:hover:to-emerald-900/30 transition-all"
                  >
                    <div className="flex items-center gap-2">
                      <FileText className="h-5 w-5 text-green-600" />
                      <span className="text-sm font-medium text-green-800 dark:text-green-300 truncate">{handout.title}</span>
                    </div>
                    <Download className="h-4 w-4 text-green-600 flex-shrink-0" />
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-2">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
            {selectedLesson ? (
              <>
                <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      Module {currentLessonIndex + 1} of {totalLessons}
                    </span>
                    {isLessonCompleted && (
                      <span className="flex items-center gap-1 text-green-500 text-sm">
                        <CheckCircle className="h-4 w-4" />
                        Completed
                      </span>
                    )}
                  </div>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">{selectedLesson.title}</h2>
                </div>

                {selectedLesson.video_url && (
                  <div className="aspect-video bg-black">
                    <video
                      src={selectedLesson.video_url}
                      controls
                      className="w-full h-full"
                    />
                  </div>
                )}

                {selectedLesson.video_file && (
                  <div className="aspect-video bg-black">
                    <video
                      src={`http://localhost:5000${selectedLesson.video_file}`}
                      controls
                      className="w-full h-full"
                    />
                  </div>
                )}

                {selectedLesson.document_file && (
                  <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                    <a
                      href={`http://localhost:5000${selectedLesson.document_file}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 text-blue-700 dark:text-blue-300 hover:text-blue-900 dark:hover:text-blue-200"
                    >
                      <FileText className="h-6 w-6" />
                      <div>
                        <p className="font-medium">Download Lesson Document</p>
                        <p className="text-sm opacity-75">Click to view or download the document</p>
                      </div>
                      <Download className="h-5 w-5 ml-auto" />
                    </a>
                  </div>
                )}

                <div className="p-6">
                  <div className="prose dark:prose-invert max-w-none">
                    <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                      {selectedLesson.content || 'No content available for this lesson.'}
                    </p>
                  </div>

                  <div className="mt-8 flex items-center justify-between pt-6 border-t border-gray-200 dark:border-gray-700">
                    <button
                      onClick={handlePrevious}
                      disabled={currentLessonIndex === 0}
                      className="flex items-center gap-2 px-4 py-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ChevronLeft className="h-5 w-5" />
                      Previous
                    </button>

                    {!isLessonCompleted ? (
                      <button
                        onClick={handleComplete}
                        disabled={completing}
                        className="flex items-center gap-2 bg-green-500 text-white px-6 py-2 rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50"
                      >
                        {completing ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                            Marking...
                          </>
                        ) : (
                          <>
                            <CheckCircle className="h-5 w-5" />
                            Mark as Complete
                          </>
                        )}
                      </button>
                    ) : currentLessonIndex < totalLessons - 1 ? (
                      <button
                        onClick={handleNext}
                        className="flex items-center gap-2 bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition-colors"
                      >
                        Next Lesson
                        <ChevronRight className="h-5 w-5" />
                      </button>
                    ) : (
                      <span className="text-green-500 font-medium flex items-center gap-2">
                        <CheckCircle className="h-5 w-5" />
                        Course Completed!
                      </span>
                    )}
                  </div>
                </div>
              </>
            ) : (
              <div className="p-12 text-center">
                <BookOpen className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 dark:text-gray-400">Select a lesson to start learning</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseLearning;
