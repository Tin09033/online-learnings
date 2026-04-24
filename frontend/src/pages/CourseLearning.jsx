import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BookOpen, 
  Play, 
  CheckCircle, 
  ChevronLeft, 
  ChevronRight, 
  Clock, 
  Video, 
  FileText, 
  Download, 
  Lock, 
  X,
  Maximize2,
  List,
  Award,
  Eye,
  ExternalLink
} from 'lucide-react';
import { coursesAPI, lessonProgressAPI, handoutAPI } from '../services/api';
import { toast } from 'react-toastify';
import { getHandoutUrl, getVideoUrl, getDocumentUrl } from '../utils/apiUrl';
import PdfViewerModal from '../components/PdfViewerModal';

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
  const [sidebarOpen, setSidebarOpen] = useState(true);
  // Mobile-only states
  const [mobileLessonsOpen, setMobileLessonsOpen] = useState(false);
  const [pdfViewer, setPdfViewer] = useState(null); // { url, title }

  useEffect(() => {
    fetchCourse();
    fetchHandouts();
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
        <div className="w-12 h-12 border-4 border-primary-500/20 border-t-primary-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (!course) return null;

  const totalLessons = course.lessons?.length || 0;
  const completedLessons = Object.values(course.lessonProgress || {}).filter(p => p.completed).length;
  const progress = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;
  const isLessonCompleted = selectedLesson && course.lessonProgress?.[selectedLesson.id]?.completed;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 -m-4 sm:-m-6 lg:-m-8">
      <AnimatePresence>
        {showCelebration && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-md"
          >
            <motion.div
              initial={{ scale: 0.5, y: 50 }}
              animate={{ scale: 1, y: 0 }}
              className="bg-white dark:bg-gray-800 p-10 rounded-[2.5rem] text-center shadow-premium-xl max-w-sm mx-4 border border-white/20"
            >
              <div className="w-24 h-24 bg-primary-gradient rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-dual-lg">
                <Award className="h-12 w-12 text-white" />
              </div>
              <h2 className="text-3xl font-black text-gray-900 dark:text-white mb-2 tracking-tight">Amazing Job!</h2>
              <p className="text-gray-500 dark:text-gray-400 font-medium leading-relaxed">You've mastered all the modules in this course. Your certificate is ready!</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex h-screen overflow-hidden">
        {/* Module Sidebar */}
        <AnimatePresence duration={0.3}>
          {sidebarOpen && (
            <motion.aside
              initial={{ x: -320, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -320, opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="w-80 bg-white dark:bg-gray-800 border-r border-gray-100 dark:border-gray-700 flex flex-col z-40 hidden lg:flex"
            >
              <div className="p-6 border-b border-gray-50 dark:border-gray-700">
                <Link to="/student/courses" className="text-primary-500 hover:text-primary-600 flex items-center gap-2 text-sm font-black uppercase tracking-widest mb-4">
                  <ChevronLeft className="h-4 w-4" />
                  Course Exit
                </Link>
                <h2 className="text-xl font-black text-gray-900 dark:text-white leading-tight tracking-tight line-clamp-2">
                  {course.title}
                </h2>
                <div className="mt-4">
                  <div className="flex justify-between text-xs font-black uppercase tracking-widest text-gray-400 mb-2">
                    <span>Progress</span>
                    <span>{progress}%</span>
                  </div>
                  <div className="h-2 w-full bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                    <motion.div 
                      className="h-full bg-primary-gradient"
                      initial={{ width: 0 }}
                      animate={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar">
                {course.lessons?.map((lesson, index) => {
                  const isCompleted = course.lessonProgress?.[lesson.id]?.completed;
                  const isActive = selectedLesson?.id === lesson.id;
                  return (
                    <motion.button
                      key={lesson.id}
                      whileHover={{ x: 4 }}
                      onClick={() => handleLessonSelect(lesson, index)}
                      className={`w-full text-left p-4 rounded-2xl transition-all flex items-center gap-4 group
                        ${isActive 
                          ? 'bg-primary-gradient text-white shadow-dual-md' 
                          : 'hover:bg-gray-50 dark:hover:bg-gray-700/50'}`}
                    >
                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors
                        ${isActive ? 'bg-white/20' : isCompleted ? 'bg-green-100 dark:bg-green-900/40 text-green-600' : 'bg-gray-100 dark:bg-gray-700'}`}>
                        {isCompleted ? <CheckCircle className="h-4 w-4" /> : <span className="text-xs font-bold">{index + 1}</span>}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm font-bold truncate ${isActive ? 'text-white' : 'text-gray-900 dark:text-white'}`}>
                          {lesson.title}
                        </p>
                        <p className={`text-[10px] font-black uppercase tracking-widest ${isActive ? 'text-white/60' : 'text-gray-400'}`}>
                          {lesson.duration || '10 min'}
                        </p>
                      </div>
                    </motion.button>
                  );
                })}
              </div>

              {handouts.length > 0 && (
                <div className="p-4 border-t border-gray-50 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-900/20">
                  <h3 className="text-xs font-black uppercase tracking-widest text-gray-400 mb-3 px-2">Handouts</h3>
                  <div className="space-y-2">
                    {handouts.slice(0, 3).map((handout) => (
                      <a
                        key={handout.id}
                        href={getHandoutUrl(handout.file_path)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 p-3 bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 hover:shadow-premium-sm transition-all"
                      >
                        <FileText className="h-4 w-4 text-primary-500" />
                        <span className="text-xs font-bold text-gray-700 dark:text-gray-300 truncate">{handout.title}</span>
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </motion.aside>
          )}
        </AnimatePresence>

        {/* ── Mobile Lesson Drawer (bottom sheet) ── */}
        <AnimatePresence>
          {mobileLessonsOpen && (
            <>
              {/* Backdrop */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setMobileLessonsOpen(false)}
                className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm lg:hidden"
              />
              {/* Sheet */}
              <motion.div
                initial={{ y: '100%' }}
                animate={{ y: 0 }}
                exit={{ y: '100%' }}
                transition={{ type: 'spring', damping: 28, stiffness: 260 }}
                className="fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-gray-800 rounded-t-[2rem] max-h-[80dvh] flex flex-col lg:hidden shadow-2xl"
              >
                {/* Handle */}
                <div className="flex-shrink-0 flex flex-col items-center pt-3 pb-4 px-6 border-b border-gray-100 dark:border-gray-700">
                  <div className="w-10 h-1 bg-gray-300 dark:bg-gray-600 rounded-full mb-4" />
                  <div className="w-full flex items-center justify-between">
                    <h3 className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-widest">Lessons</h3>
                    <button onClick={() => setMobileLessonsOpen(false)} className="text-gray-400 hover:text-gray-700 dark:hover:text-white">
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                  {/* Progress mini-bar */}
                  <div className="w-full mt-3">
                    <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">
                      <span>Progress</span><span>{progress}%</span>
                    </div>
                    <div className="h-1.5 w-full bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                      <div className="h-full bg-primary-gradient" style={{ width: `${progress}%` }} />
                    </div>
                  </div>
                </div>
                {/* Lesson list */}
                <div className="flex-1 overflow-y-auto p-4 space-y-2">
                  {course?.lessons?.map((lesson, index) => {
                    const isCompleted = course.lessonProgress?.[lesson.id]?.completed;
                    const isActive = selectedLesson?.id === lesson.id;
                    return (
                      <button
                        key={lesson.id}
                        onClick={() => { handleLessonSelect(lesson, index); setMobileLessonsOpen(false); }}
                        className={`w-full text-left p-4 rounded-2xl transition-all flex items-center gap-4
                          ${isActive
                            ? 'bg-primary-gradient text-white shadow-dual-md'
                            : 'bg-gray-50 dark:bg-gray-700/50'}`}
                      >
                        <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0
                          ${isActive ? 'bg-white/20' : isCompleted ? 'bg-green-100 dark:bg-green-900/40 text-green-600' : 'bg-gray-200 dark:bg-gray-600'}`}>
                          {isCompleted ? <CheckCircle className="h-4 w-4" /> : <span className="text-xs font-bold">{index + 1}</span>}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={`text-sm font-bold truncate ${isActive ? 'text-white' : 'text-gray-900 dark:text-white'}`}>{lesson.title}</p>
                          <p className={`text-[10px] font-black uppercase tracking-widest ${isActive ? 'text-white/60' : 'text-gray-400'}`}>{lesson.duration || '10 min'}</p>
                        </div>
                      </button>
                    );
                  })}
                  {/* Handouts in mobile drawer too */}
                  {handouts.length > 0 && (
                    <div className="pt-4 border-t border-gray-100 dark:border-gray-700">
                      <h4 className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-3 px-1">Handouts</h4>
                      <div className="space-y-2">
                        {handouts.map((handout) => (
                          <button
                            key={handout.id}
                            onClick={() => { setPdfViewer({ url: getHandoutUrl(handout.file_path), title: handout.title }); setMobileLessonsOpen(false); }}
                            className="w-full flex items-center gap-3 p-3 bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 text-left"
                          >
                            <FileText className="h-4 w-4 text-primary-500 flex-shrink-0" />
                            <span className="text-xs font-bold text-gray-700 dark:text-gray-300 truncate">{handout.title}</span>
                            <Eye className="h-3.5 w-3.5 text-gray-400 ml-auto flex-shrink-0" />
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* ── PDF Viewer Modal ── */}
        {pdfViewer && (
          <PdfViewerModal
            url={pdfViewer.url}
            title={pdfViewer.title}
            onClose={() => setPdfViewer(null)}
          />
        )}

        {/* Main Learning Content */}
        <main className="flex-1 overflow-y-auto relative bg-gray-50 dark:bg-gray-900 transition-all duration-300">
          <header className="sticky top-0 z-30 p-4 sm:p-6 flex items-center justify-between gap-4 pointer-events-none">
            {/* Desktop sidebar toggle */}
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-3 bg-white dark:bg-gray-800 rounded-2xl shadow-premium-sm pointer-events-auto hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors border border-gray-100 dark:border-gray-700 hidden lg:flex items-center justify-center"
            >
              {sidebarOpen ? <X className="h-5 w-5 text-gray-500" /> : <List className="h-5 w-5 text-primary-500" />}
            </button>
            {/* Mobile: lesson list button */}
            <button
              onClick={() => setMobileLessonsOpen(true)}
              className="p-3 bg-white dark:bg-gray-800 rounded-2xl shadow-premium-sm pointer-events-auto border border-gray-100 dark:border-gray-700 flex items-center gap-2 lg:hidden"
            >
              <List className="h-5 w-5 text-primary-500" />
              <span className="text-xs font-black text-gray-600 dark:text-gray-300">{currentLessonIndex + 1}/{totalLessons}</span>
            </button>
            {/* Course title shown when desktop sidebar is closed */}
            {!sidebarOpen && (
              <motion.h1
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="text-lg font-black text-gray-900 dark:text-white tracking-tight pointer-events-auto hidden lg:block"
              >
                {course.title}
              </motion.h1>
            )}
          </header>

          <div className="max-w-5xl mx-auto px-4 sm:px-6 pb-40 lg:pb-24">
            <motion.div 
              layout
              className="space-y-8"
            >
              {selectedLesson ? (
                <>
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <span className="px-3 py-1 bg-primary-50 dark:bg-primary-900/30 text-primary-600 rounded-full text-[10px] font-black uppercase tracking-widest">
                        Module {currentLessonIndex + 1}
                      </span>
                      {isLessonCompleted && (
                        <span className="flex items-center gap-1 text-green-500 text-[10px] font-black uppercase tracking-widest">
                          <CheckCircle className="h-3 w-3" />
                          Mastered
                        </span>
                      )}
                    </div>
                    <h2 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">{selectedLesson.title}</h2>
                  </div>

                  {/* Video Player Container */}
                  <div className="group relative rounded-[2.5rem] overflow-hidden bg-black shadow-premium-xl border border-white/10 card-premium-raised">
                    <div className="aspect-video">
                      {selectedLesson.video_url ? (
                        <video
                          src={selectedLesson.video_url}
                          controls
                          className="w-full h-full"
                        />
                      ) : selectedLesson.video_file ? (
                        <video
                          src={getVideoUrl(selectedLesson.video_file)}
                          controls
                          className="w-full h-full"
                        />
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center text-white/40 space-y-4">
                          <Video className="w-16 h-16 opacity-20" />
                          <p className="font-bold">No video content for this lesson.</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Documents — responsive card */}
                  {selectedLesson.document_file && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-4 sm:p-6 bg-white dark:bg-gray-800 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-premium-sm group overflow-hidden relative"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-primary-50 dark:bg-primary-900/30 rounded-2xl flex items-center justify-center text-primary-500 flex-shrink-0">
                            <FileText className="h-6 w-6" />
                          </div>
                          <div>
                            <p className="font-bold text-gray-900 dark:text-white">Lesson Resources</p>
                            <p className="text-xs text-gray-500">Support materials for this module</p>
                          </div>
                        </div>
                        {/* Action buttons — full-width on mobile */}
                        <div className="flex items-center gap-2 w-full sm:w-auto">
                          {/* View inline (PDF modal) */}
                          <button
                            onClick={() => setPdfViewer({ url: getDocumentUrl(selectedLesson.document_file), title: 'Lesson Resources' })}
                            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-xl text-sm font-black hover:bg-gray-200 dark:hover:bg-gray-600 transition-all active:scale-95"
                          >
                            <Eye className="h-4 w-4" />
                            View
                          </button>
                          {/* Download */}
                          <a
                            href={getDocumentUrl(selectedLesson.document_file)}
                            download
                            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 bg-primary-gradient text-white rounded-xl text-sm font-black shadow-dual-sm hover:shadow-dual-md transition-all active:scale-95"
                          >
                            <Download className="h-4 w-4" />
                            Download
                          </a>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {/* Content Body */}
                  <div className="prose prose-lg dark:prose-invert max-w-none prose-headings:font-black prose-p:text-gray-600 dark:prose-p:text-gray-400">
                    <p className="whitespace-pre-wrap leading-relaxed">
                      {selectedLesson.content || 'No detailed content available for this lesson.'}
                    </p>
                  </div>
                </>
              ) : (
                <div className="py-24 text-center">
                  <div className="w-20 h-20 bg-gray-100 dark:bg-gray-800 rounded-[2rem] flex items-center justify-center mx-auto mb-6">
                    <Play className="h-10 w-10 text-gray-300" />
                  </div>
                  <h3 className="text-xl font-black text-gray-900 dark:text-white">Ready to start?</h3>
                  <p className="text-gray-500 font-medium">Select your first module from the list to begin.</p>
                </div>
              )}
            </motion.div>
          </div>

          {/* Persistent Player Navigation */}
          <footer className="fixed bottom-8 left-1/2 lg:left-auto lg:right-8 -translate-x-1/2 lg:translate-x-0 z-40">
            <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl px-4 py-4 rounded-[2rem] shadow-premium-xl border border-white/20 flex items-center gap-4">
              <button
                onClick={handlePrevious}
                disabled={currentLessonIndex === 0}
                className="p-3 text-gray-400 hover:text-gray-900 dark:hover:text-white disabled:opacity-30 transition-colors"
              >
                <ChevronLeft className="h-6 w-6 font-bold" />
              </button>

              {!isLessonCompleted ? (
                <button
                  onClick={handleComplete}
                  disabled={completing}
                  className="px-8 py-3 bg-primary-gradient text-white rounded-[1.25rem] font-black text-sm shadow-dual-md hover:shadow-dual-lg transition-all active:scale-95 flex items-center gap-2 min-w-[180px] justify-center"
                >
                  {completing ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><CheckCircle className="h-5 w-5" /> Mark as Mastered</>}
                </button>
              ) : (
                <button
                  onClick={handleNext}
                  disabled={currentLessonIndex === totalLessons - 1}
                  className="px-8 py-3 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-[1.25rem] font-black text-sm shadow-dual-md hover:shadow-dual-lg transition-all active:scale-95 flex items-center gap-2 min-w-[180px] justify-center disabled:opacity-30"
                >
                  Next Module <ChevronRight className="h-5 w-5" />
                </button>
              )}

              <button
                onClick={handleNext}
                disabled={currentLessonIndex === totalLessons - 1}
                className="p-3 text-gray-400 hover:text-gray-900 dark:hover:text-white disabled:opacity-30 transition-colors"
              >
                <ChevronRight className="h-6 w-6 font-bold" />
              </button>
            </div>
          </footer>
        </main>
      </div>
    </div>
  );
};

export default CourseLearning;
