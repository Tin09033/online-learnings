import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  BookOpen, 
  CheckCircle, 
  Clock, 
  TrendingUp, 
  Layout, 
  Megaphone, 
  ArrowRight,
  PlayCircle,
  Award,
  Calendar
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authAPI, enrollmentsAPI, announcementAPI } from '../services/api';
import { BentoGrid, BentoCell } from '../components/BentoGrid';
import { useTranslation } from 'react-i18next';
import { getCourseImageUrl } from '../utils/apiUrl';

const StudentDashboard = () => {
  const { user } = useAuth();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [enrollments, setEnrollments] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, enrollRes, announceRes] = await Promise.all([
          authAPI.getLearningStats(),
          enrollmentsAPI.getMy(),
          announcementAPI.getStudentAnnouncements()
        ]);
        
        setStats(statsRes.data);
        setEnrollments(enrollRes.data);
        setAnnouncements(announceRes.data);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-primary-500/20 border-t-primary-500 rounded-full animate-spin" />
          <p className="text-gray-500 animate-pulse font-medium">Curating your space...</p>
        </div>
      </div>
    );
  }

  const activeEnrollments = enrollments.filter(e => e.status === 'active');
  const lastActive = activeEnrollments[0]; // Assuming sorted by last accessed or enrolled
  const latestAnnounce = announcements[0];

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-4xl font-black text-gray-900 dark:text-white tracking-tight">
              {t('student.welcomeBack') || 'Welcome back,'} {user?.name?.split(' ')[0]}
            </h1>
            <p className="text-gray-500 dark:text-gray-400 mt-2 font-medium">
              You've completed <span className="text-primary-500 font-bold">{stats?.completedLessons || 0}</span> lessons this week. Keep the momentum!
            </p>
          </motion.div>
        </div>
        <div className="flex items-center gap-3">
          <div className="px-4 py-2 bg-white dark:bg-gray-800 rounded-2xl shadow-premium-sm border border-gray-100 dark:border-gray-800 flex items-center gap-2">
            <Calendar className="w-4 h-4 text-primary-500" />
            <span className="text-sm font-bold text-gray-700 dark:text-gray-200">
              {new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
            </span>
          </div>
        </div>
      </header>

      <BentoGrid>
        {/* Welcome & Progress Ring */}
        <BentoCell 
          colSpan={2} 
          title="Overall Progress" 
          subtitle="Learning Journey"
          icon={<TrendingUp className="w-6 h-6" />}
          delay={0.1}
        >
          <div className="flex items-center justify-between h-full pt-4">
            <div className="space-y-4">
              <div className="space-y-1">
                <p className="text-3xl font-black text-gray-900 dark:text-white">{stats?.averageProgress || 0}%</p>
                <p className="text-sm font-bold text-gray-400 capitalize">Average Completion</p>
              </div>
              <Link 
                to="/student/courses"
                className="inline-flex items-center gap-2 text-primary-500 font-bold text-sm hover:gap-3 transition-all"
              >
                View Analytics <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="relative w-24 h-24">
              <svg className="w-full h-full transform -rotate-90">
                <circle
                  cx="48"
                  cy="48"
                  r="36"
                  stroke="currentColor"
                  strokeWidth="8"
                  fill="transparent"
                  className="text-gray-100 dark:text-gray-800"
                />
                <motion.circle
                  cx="48"
                  cy="48"
                  r="36"
                  stroke="currentColor"
                  strokeWidth="8"
                  fill="transparent"
                  strokeDasharray={226}
                  initial={{ strokeDashoffset: 226 }}
                  animate={{ strokeDashoffset: 226 - (226 * (stats?.averageProgress || 0)) / 100 }}
                  transition={{ duration: 1.5, ease: "easeOut" }}
                  className="text-primary-500"
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <Layout className="w-6 h-6 text-primary-500/50" />
              </div>
            </div>
          </div>
        </BentoCell>

        {/* Continue Learning */}
        <BentoCell 
          colSpan={2} 
          rowSpan={2}
          title={lastActive ? "Continue Learning" : "Start Learning"}
          subtitle={lastActive ? lastActive.title : "Browse our catalog"}
          icon={<PlayCircle className="w-6 h-6" />}
          delay={0.2}
          onClick={() => lastActive ? navigate(`/student/courses/${lastActive.course_id}/learn`) : navigate('/courses')}
          className="bg-primary-gradient text-white !border-none"
        >
          <div className="h-full flex flex-col justify-between pt-6">
            {lastActive ? (
              <>
                <div className="relative rounded-2xl overflow-hidden aspect-video shadow-dual-lg group-hover:scale-[1.02] transition-transform duration-500">
                  <img 
                    src={getCourseImageUrl(lastActive.course_image)} 
                    alt={lastActive.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors" />
                  <div className="absolute bottom-4 left-4 right-4">
                    <div className="h-1.5 w-full bg-white/20 rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${lastActive.progress}%` }}
                        transition={{ duration: 1, delay: 0.5 }}
                        className="h-full bg-white" 
                      />
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between mt-4">
                  <span className="text-sm font-bold text-white/80">{lastActive.progress}% Complete</span>
                  <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-md">
                    <PlayCircle className="w-5 h-5" />
                  </div>
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center flex-1 space-y-4 text-center">
                <div className="p-4 bg-white/10 rounded-3xl backdrop-blur-xl">
                  <BookOpen className="w-12 h-12" />
                </div>
                <p className="font-bold text-lg">You haven't started any courses yet.</p>
                <button className="px-6 py-2 bg-white text-primary-600 rounded-xl font-black text-sm shadow-premium-lg">
                  Browse Catalog
                </button>
              </div>
            )}
          </div>
        </BentoCell>

        {/* Quick Stats Stack */}
        <BentoCell 
          rowSpan={2}
          title="Achievements"
          subtitle="Your Milestones"
          icon={<Award className="w-6 h-6" />}
          delay={0.3}
        >
          <div className="space-y-6 pt-6">
            <div className="flex items-center gap-4 group/stat">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center text-blue-500 group-hover/stat:bg-blue-500 group-hover/stat:text-white transition-all shadow-dual-sm">
                <BookOpen className="w-6 h-6" />
              </div>
              <div>
                <p className="text-lg font-black text-gray-900 dark:text-white">{stats?.totalEnrolled || 0}</p>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Enrolled</p>
              </div>
            </div>
            <div className="flex items-center gap-4 group/stat">
              <div className="w-12 h-12 rounded-2xl bg-green-50 dark:bg-green-900/30 flex items-center justify-center text-green-500 group-hover/stat:bg-green-500 group-hover/stat:text-white transition-all shadow-dual-sm">
                <CheckCircle className="w-6 h-6" />
              </div>
              <div>
                <p className="text-lg font-black text-gray-900 dark:text-white">{stats?.completed || 0}</p>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Completed</p>
              </div>
            </div>
            <div className="flex items-center gap-4 group/stat">
              <div className="w-12 h-12 rounded-2xl bg-orange-50 dark:bg-orange-900/30 flex items-center justify-center text-orange-500 group-hover/stat:bg-orange-500 group-hover/stat:text-white transition-all shadow-dual-sm">
                <Clock className="w-6 h-6" />
              </div>
              <div>
                <p className="text-lg font-black text-gray-900 dark:text-white">{stats?.inProgress || 0}</p>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Active</p>
              </div>
            </div>
          </div>
        </BentoCell>

        {/* Announcements */}
        <BentoCell 
          title="Latest Bulletin"
          subtitle="Announcements"
          icon={<Megaphone className="w-6 h-6" />}
          delay={0.4}
          onClick={() => navigate('/student/announcements')}
        >
          <div className="h-full flex flex-col pt-4">
            {latestAnnounce ? (
              <div className="space-y-2">
                <h4 className="font-bold text-gray-900 dark:text-white line-clamp-2">{latestAnnounce.title}</h4>
                <p className="text-xs text-gray-500 line-clamp-3 leading-relaxed">{latestAnnounce.content}</p>
                <div className="pt-2">
                  <span className="text-[10px] font-black uppercase tracking-widest text-primary-500">
                    {new Date(latestAnnounce.created_at).toLocaleDateString()}
                  </span>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-center py-4">
                <Megaphone className="w-8 h-8 text-gray-200 mb-2" />
                <p className="text-xs font-bold text-gray-400">No new updates today</p>
              </div>
            )}
          </div>
        </BentoCell>

        {/* Quick Actions / Shortcuts */}
        <BentoCell 
          title="Shortcuts"
          subtitle="Quick Actions"
          delay={0.5}
        >
          <div className="grid grid-cols-2 gap-3 pt-2">
            <button 
              onClick={() => navigate('/courses')}
              className="p-3 bg-gray-50 dark:bg-gray-800/50 rounded-2xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-left group/action"
            >
              <Search className="w-5 h-5 text-primary-500 mb-2 group-hover/action:scale-110 transition-transform" />
              <p className="text-xs font-black dark:text-white">Explore</p>
            </button>
            <button 
              onClick={() => navigate('/student/settings')}
              className="p-3 bg-gray-50 dark:bg-gray-800/50 rounded-2xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-left group/action"
            >
              <Settings className="w-5 h-5 text-primary-500 mb-2 group-hover/action:scale-110 transition-transform" />
              <p className="text-xs font-black dark:text-white">Profile</p>
            </button>
          </div>
        </BentoCell>
      </BentoGrid>
    </div>
  );
};

export default StudentDashboard;
