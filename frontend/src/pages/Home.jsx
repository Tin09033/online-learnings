import { Link } from 'react-router-dom';
import { motion, useScroll, useTransform, useSpring } from 'framer-motion';
import { BookOpen, Users, Award, Clock, GraduationCap, Brain, Globe, ArrowRight } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { coursesAPI } from '../services/api';
import CourseCard from '../components/CourseCard';
import ChatBot from '../components/ChatBot';
import { useTranslation } from 'react-i18next';

const Home = () => {
  const { t } = useTranslation();
  const [courses, setCourses] = useState([]);
  const [stats, setStats] = useState({
    students: 0,
    courses: 0,
    instructors: 0,
    certificates: 0
  });

  const heroRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"]
  });

  const y1 = useTransform(scrollYProgress, [0, 1], [0, 200]);
  const y2 = useTransform(scrollYProgress, [0, 1], [0, -150]);
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await coursesAPI.getAll({ limit: 6 });
        setCourses(response.data?.courses || []);
      } catch (error) {
        console.error('Error fetching courses:', error);
      }
    };
    fetchCourses();

    setTimeout(() => {
      setStats({
        students: 15000,
        courses: 250,
        instructors: 50,
        certificates: 12000
      });
    }, 500);
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.3
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.8, ease: [0.6, -0.05, 0.01, 0.9] }
    }
  };

  const features = [
    {
      icon: <Clock className="h-8 w-8" />,
      title: t('features.flexibleLearning'),
      description: t('features.flexibleLearningDesc')
    },
    {
      icon: <GraduationCap className="h-8 w-8" />,
      title: t('features.certificates'),
      description: t('features.certificatesDesc')
    },
    {
      icon: <Brain className="h-8 w-8" />,
      title: t('features.expertInstructors'),
      description: t('features.expertInstructorsDesc')
    },
    {
      icon: <Globe className="h-8 w-8" />,
      title: t('features.community'),
      description: t('features.communityDesc')
    }
  ];

  return (
    <div className="min-h-screen smooth-scroll overflow-x-hidden">
      {/* Hero Section - Cinematic Arrival */}
      <section ref={heroRef} className="relative min-h-[90vh] flex items-center overflow-hidden section-premium-hero">
        {/* Animated Background Layers */}
        <div className="absolute inset-0 z-0">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary-500/10 blur-[120px] rounded-full animate-float" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-primary-700/10 blur-[120px] rounded-full animate-float [animation-delay:2s]" />
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiMzYjgyZjYiIGZpbGwtb3BhY2l0eT0iMC4wMyI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')] opacity-30" />
        </div>
        
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              style={{ opacity }}
            >
              <motion.div variants={itemVariants} className="inline-flex items-center space-x-2 px-3 py-1 bg-primary-50 dark:bg-primary-900/30 rounded-full border border-primary-200 dark:border-primary-800 mb-6 group cursor-default">
                <span className="flex h-2 w-2 rounded-full bg-primary-500 animate-pulse" />
                <span className="text-sm font-bold text-primary-700 dark:text-primary-300 uppercase tracking-widest">{t('hero.getStarted')}</span>
              </motion.div>
              
              <motion.h1 
                variants={itemVariants}
                className="text-5xl md:text-6xl lg:text-7xl font-extrabold text-gray-900 dark:text-white leading-[1.1] mb-8"
              >
                <span className="text-gradient-premium">{t('hero.title').split(' ')[0]}</span> {t('hero.title').split(' ').slice(1).join(' ')}
              </motion.h1>
              
              <motion.p 
                variants={itemVariants}
                className="text-xl text-gray-600 dark:text-gray-400 mb-10 max-w-xl leading-relaxed"
              >
                {t('hero.subtitle')}
              </motion.p>
              
              <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-5">
                <Link
                  to="/courses"
                  className="btn-premium flex items-center justify-center group"
                >
                  <span>{t('hero.getStarted')}</span>
                  <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                </Link>
                <Link
                  to="/register"
                  className="px-8 py-3 rounded-xl bg-white/50 dark:bg-gray-800/50 backdrop-blur-md border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white font-semibold flex items-center justify-center hover:bg-white dark:hover:bg-gray-800 transition-all shadow-premium-sm hover:shadow-premium-md"
                >
                  {t('navbar.register')}
                </Link>
              </motion.div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1, ease: "easeOut" }}
              className="relative"
            >
              <motion.div 
                style={{ y: y1 }}
                className="relative z-10 card-premium-raised p-2 p-3 sm:p-5 transform lg:rotate-3 hover:rotate-0 transition-all duration-700 group hover:scale-[1.02]"
              >
                <div className="relative overflow-hidden rounded-xl">
                  <img
                    src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?ixlib=rb-4.0.3&auto=format&fit=crop&w=1471&q=80"
                    alt="Students learning"
                    className="w-full h-[400px] object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                </div>
              </motion.div>

              {/* Parallax Floating Elements */}
              <motion.div 
                style={{ y: y2 }}
                className="absolute -top-10 -right-10 z-20 hidden md:block"
              >
                <div className="card-premium-raised p-6 shadow-premium-xl border-primary-500/30 animate-float">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-primary-gradient rounded-xl flex items-center justify-center text-white shadow-glow-primary-sm">
                      <Award className="h-6 w-6" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-tighter">Verified</p>
                      <p className="text-sm font-bold text-gray-900 dark:text-white">Expert Certification</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats Section with Scroll Reveal */}
      <section className="py-24 relative bg-surface-base dark:bg-gray-950 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { icon: <Users className="h-7 w-7" />, value: stats.students, label: t('courses.students') },
              { icon: <BookOpen className="h-7 w-7" />, value: stats.courses, label: t('navbar.courses') },
              { icon: <Award className="h-7 w-7" />, value: stats.instructors, label: t('features.expertInstructors') },
              { icon: <GraduationCap className="h-7 w-7" />, value: stats.certificates, label: t('features.certificates') }
            ].map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true, margin: "-100px" }}
                className="text-center p-8 rounded-3xl group hover:bg-white dark:hover:bg-gray-900 transition-colors shadow-premium-sm hover:shadow-premium-md border border-transparent hover:border-gray-100 dark:hover:border-gray-800"
              >
                <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-gradient text-white rounded-2xl mb-6 shadow-dual-md group-hover:scale-110 transition-transform">
                  {stat.icon}
                </div>
                <div className="text-4xl font-black text-gray-900 dark:text-white mb-2 tracking-tight">
                  {stat.value.toLocaleString()}+
                </div>
                <div className="text-gray-500 dark:text-gray-400 text-sm font-bold uppercase tracking-widest">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Feature Section - Bento Lite Styling */}
      <section className="py-32 section-premium-hero">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-20"
          >
            <h2 className="text-4xl md:text-5xl font-black text-gray-900 dark:text-white mb-6">
              {t('features.title')}
            </h2>
            <div className="w-24 h-1.5 bg-primary-gradient mx-auto rounded-full mb-6" />
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              {t('features.subtitle')}
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={{ y: -10 }}
                viewport={{ once: true }}
                className="card-premium-raised p-10 group cursor-default h-full border-t-4 border-t-primary-500"
              >
                <div className="w-16 h-16 bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 rounded-2xl flex items-center justify-center mb-8 group-hover:bg-primary-gradient group-hover:text-white transition-all duration-500">
                  {feature.icon}
                </div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                  {feature.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed font-medium">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Courses with Horizontal Tilt Cards */}
      <section className="py-32 relative bg-surface-base dark:bg-gray-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6"
          >
            <div>
              <h2 className="text-4xl md:text-5xl font-black text-gray-900 dark:text-white mb-4">
                {t('courses.title')}
              </h2>
              <p className="text-xl text-gray-600 dark:text-gray-400 max-w-xl">
                {t('courses.subtitle')}
              </p>
            </div>
            <Link
              to="/courses"
              className="inline-flex items-center text-primary-600 dark:text-primary-400 font-bold hover:underline group"
            >
              <span className="text-lg">{t('courses.viewAll')}</span>
              <ArrowRight className="ml-2 h-6 w-6 transition-transform group-hover:translate-x-1" />
            </Link>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-10">
            {courses.map((course, idx) => (
              <motion.div
                key={course.id}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: idx * 0.1 }}
                viewport={{ once: true }}
              >
                <CourseCard course={course} />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section - Cinematic Glow */}
      <section className="py-32 relative overflow-hidden">
        <div className="absolute inset-0 bg-primary-gradient opacity-95" />
        <div className="absolute top-0 right-0 w-[50%] h-[50%] bg-white/10 blur-[100px] rounded-full translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 left-0 w-[50%] h-[50%] bg-primary-400/20 blur-[100px] rounded-full -translate-x-1/2 translate-y-1/2" />
        
        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-white">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-6xl font-black mb-8 tracking-tight">
              {t('cta.title')}
            </h2>
            <p className="text-xl md:text-2xl text-primary-50/80 mb-12 font-medium leading-relaxed">
              {t('cta.subtitle')}
            </p>
            <Link
              to="/register"
              className="inline-block bg-white text-primary-600 px-12 py-5 rounded-2xl hover:bg-primary-50 transition-all duration-300 font-bold text-xl shadow-premium-xl hover:scale-105"
            >
              {t('cta.button')}
            </Link>
          </motion.div>
        </div>
      </section>

      <ChatBot />
    </div>
  );
};

export default Home;
