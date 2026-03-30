import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { BookOpen, Users, Award } from 'lucide-react';
import { getCourseImageUrl } from '../utils/apiUrl';

const CourseCard = ({ course }) => {
  return (
    <motion.div
      whileHover={{ y: -8 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className="card-interactive overflow-hidden group"
    >
      <div className="h-48 overflow-hidden relative">
        <img
          src={getCourseImageUrl(course.image)}
          alt={course.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </div>
      <div className="p-6 relative">
        {/* Light source effect on card */}
        <div className="absolute inset-0 light-from-top pointer-events-none rounded-2xl" />
        
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 line-clamp-2 relative">
          {course.title}
        </h3>
        <p className="text-gray-600 dark:text-gray-300 mb-4 line-clamp-3 text-sm relative">
          {course.description}
        </p>
        
        <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400 mb-4 relative">
          <div className="flex items-center space-x-1.5 px-3 py-1.5 bg-surface-lowered dark:bg-gray-700 rounded-lg">
            <BookOpen className="h-4 w-4 text-primary-500" />
            <span className="font-medium">{course.lesson_count || 0} lessons</span>
          </div>
          <div className="flex items-center space-x-1.5 px-3 py-1.5 bg-surface-lowered dark:bg-gray-700 rounded-lg">
            <Users className="h-4 w-4 text-primary-500" />
            <span className="font-medium">{course.enrollment_count || 0} students</span>
          </div>
        </div>

        <div className="flex items-center justify-between relative">
          {course.instructor_name && (
            <p className="text-sm text-gray-500 dark:text-gray-400">
              by <span className="font-semibold text-primary-600">{course.instructor_name}</span>
            </p>
          )}
          <Link
            to={`/courses/${course.id}`}
            className="btn-elevated px-4 py-2 text-sm font-medium"
          >
            View Course
          </Link>
        </div>
      </div>
    </motion.div>
  );
};

export default CourseCard;
