import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { BookOpen, Users, Award, Clock, GraduationCap, Brain, Globe } from 'lucide-react';
import { useState, useEffect } from 'react';
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

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await coursesAPI.getAll({ limit: 6 });
        setCourses(response.data.courses);
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
    <div>
      <section className="relative bg-gradient-to-br from-primary-50 via-white to-primary-100 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight mb-6">
                {t('hero.title')}
              </h1>
              <p className="text-xl text-gray-600 mb-8">
                {t('hero.subtitle')}
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  to="/courses"
                  className="bg-primary-600 text-white px-8 py-4 rounded-xl hover:bg-primary-700 transition-all duration-300 font-semibold text-lg shadow-lg hover:shadow-xl text-center"
                >
                  {t('hero.getStarted')}
                </Link>
                <Link
                  to="/register"
                  className="bg-white text-primary-600 px-8 py-4 rounded-xl hover:bg-primary-50 transition-all duration-300 font-semibold text-lg shadow-lg border-2 border-primary-600 text-center"
                >
                  {t('navbar.register')}
                </Link>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="relative"
            >
              <div className="bg-white rounded-3xl shadow-2xl p-8 transform rotate-3 hover:rotate-0 transition-transform duration-500">
                <img
                  src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1471&q=80"
                  alt="Students learning"
                  className="w-full h-80 object-cover rounded-2xl"
                />
              </div>
              <div className="absolute -bottom-6 -left-6 bg-primary-600 text-white px-6 py-4 rounded-2xl shadow-xl">
                <div className="flex items-center space-x-2">
                  <Award className="h-6 w-6" />
                  <span className="font-bold">Top Rated Platform</span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { icon: <Users className="h-10 w-10" />, value: stats.students, label: t('courses.students') },
              { icon: <BookOpen className="h-10 w-10" />, value: stats.courses, label: t('navbar.courses') },
              { icon: <Award className="h-10 w-10" />, value: stats.instructors, label: t('features.expertInstructors') },
              { icon: <GraduationCap className="h-10 w-10" />, value: stats.certificates, label: t('features.certificates') }
            ].map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="text-center p-6 bg-gray-50 rounded-2xl"
              >
                <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-100 text-primary-600 rounded-2xl mb-4">
                  {stat.icon}
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-2">
                  {stat.value.toLocaleString()}+
                </div>
                <div className="text-gray-600">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              {t('features.title')}
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              {t('features.subtitle')}
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300"
              >
                <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-100 text-primary-600 rounded-2xl mb-6">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  {feature.title}
                </h3>
                <p className="text-gray-600">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              {t('courses.title')}
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              {t('courses.subtitle')}
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
            {courses.map((course) => (
              <CourseCard key={course.id} course={course} />
            ))}
          </div>

          <div className="text-center">
            <Link
              to="/courses"
              className="inline-block bg-primary-600 text-white px-8 py-4 rounded-xl hover:bg-primary-700 transition-all duration-300 font-semibold text-lg shadow-lg hover:shadow-xl"
            >
              {t('courses.viewAll')}
            </Link>
          </div>
        </div>
      </section>

      <section className="py-20 bg-gradient-to-r from-primary-600 to-primary-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
              {t('cta.title')}
            </h2>
            <p className="text-xl text-primary-100 mb-8 max-w-2xl mx-auto">
              {t('cta.subtitle')}
            </p>
            <Link
              to="/register"
              className="inline-block bg-white text-primary-600 px-8 py-4 rounded-xl hover:bg-primary-50 transition-all duration-300 font-semibold text-lg shadow-lg"
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
