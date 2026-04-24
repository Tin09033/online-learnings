import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Layout from './layouts/Layout';
import StudentLayout from './layouts/StudentLayout';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Courses from './pages/Courses';
import CourseDetail from './pages/CourseDetail';
import StudentProfile from './pages/StudentProfile';
import StudentNotifications from './pages/StudentNotifications';
import StudentSettings from './pages/StudentSettings';
import StudentAnnouncements from './pages/StudentAnnouncements';
import StudentPayments from './pages/StudentPayments';
import StudentDashboard from './pages/StudentDashboard';
import StudentCourses from './pages/StudentCourses';
import CourseLearning from './pages/CourseLearning';
import AdminDashboard from './pages/AdminDashboard';
import AdminCourses from './pages/AdminCourses';
import AdminEnrollments from './pages/AdminEnrollments';
import AdminUsers from './pages/AdminUsers';
import CourseEditor from './pages/CourseEditor';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="login" element={<Login />} />
            <Route path="register" element={<Register />} />
            <Route path="courses" element={<Courses />} />
            <Route path="courses/:id" element={<CourseDetail />} />
          </Route>

          <Route path="/student" element={
            <ProtectedRoute roles={['student', 'admin']}>
              <StudentLayout />
            </ProtectedRoute>
          }>
            <Route index element={<StudentDashboard />} />
            <Route path="profile" element={<StudentProfile />} />
            <Route path="notifications" element={<StudentNotifications />} />
            <Route path="courses" element={<StudentCourses />} />
            <Route path="courses/:id/learn" element={<CourseLearning />} />
            <Route path="settings" element={<StudentSettings />} />
            <Route path="announcements" element={<StudentAnnouncements />} />
            <Route path="payments" element={<StudentPayments />} />
          </Route>

          <Route path="/admin" element={
            <ProtectedRoute roles={['admin']}>
              <AdminDashboard />
            </ProtectedRoute>
          } />
          <Route path="/admin/courses" element={
            <ProtectedRoute roles={['admin']}>
              <AdminCourses />
            </ProtectedRoute>
          } />
          <Route path="/admin/courses/new" element={
            <ProtectedRoute roles={['admin']}>
              <CourseEditor />
            </ProtectedRoute>
          } />
          <Route path="/admin/courses/:id/edit" element={
            <ProtectedRoute roles={['admin']}>
              <CourseEditor />
            </ProtectedRoute>
          } />
          <Route path="/admin/enrollments" element={
            <ProtectedRoute roles={['admin']}>
              <AdminEnrollments />
            </ProtectedRoute>
          } />
          <Route path="/admin/users" element={
            <ProtectedRoute roles={['admin']}>
              <AdminUsers />
            </ProtectedRoute>
          } />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        <ToastContainer
          position="top-right"
          autoClose={1500}
          hideProgressBar={false}
          newestOnTop
          closeOnClick
          pauseOnHover={false}
          draggable={false}
          theme="colored"
        />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
