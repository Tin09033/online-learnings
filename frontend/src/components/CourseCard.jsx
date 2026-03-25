import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { BookOpen, Users, Award } from 'lucide-react';

const CourseCard = ({ course }) => {
  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      transition={{ duration: 0.3 }}
      className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300"
    >
      <div className="h-48 overflow-hidden">
        <img
          src={course.image ? `http://localhost:5000${course.image}` : '/placeholder.jpg'}
          alt={course.title}
          className="w-full h-full object-cover"
        />
      </div>
      <div className="p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-2">
          {course.title}
        </h3>
        <p className="text-gray-600 mb-4 line-clamp-3">
          {course.description}
        </p>
        
        <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
          <div className="flex items-center space-x-1">
            <BookOpen className="h-4 w-4" />
            <span>{course.lesson_count || 0} lessons</span>
          </div>
          <div className="flex items-center space-x-1">
            <Users className="h-4 w-4" />
            <span>{course.enrollment_count || 0} students</span>
          </div>
        </div>

        <div className="flex items-center justify-between">
          {course.instructor_name && (
            <p className="text-sm text-gray-500">
              by <span className="font-medium text-primary-600">{course.instructor_name}</span>
            </p>
          )}
          <Link
            to={`/courses/${course.id}`}
            className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors text-sm font-medium"
          >
            View Course
          </Link>
        </div>
      </div>
    </motion.div>
  );
};

export default CourseCard;
