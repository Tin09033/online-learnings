import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import AdminLayout from './components/AdminLayout';
import AdminDashboard from './pages/AdminDashboard';
import AdminAnalytics from './pages/AdminAnalytics';
import AdminCourses from './pages/AdminCourses';
import AdminUsers from './pages/AdminUsers';
import AdminEnrollments from './pages/AdminEnrollments';
import AdminPayments from './pages/AdminPayments';
import AdminSettings from './pages/AdminSettings';
import AdminAnnouncements from './pages/AdminAnnouncements';
import AdminStudentGroups from './pages/AdminStudentGroups';
import AdminCourseHandouts from './pages/AdminCourseHandouts';
import AdminCourseAnalytics from './pages/AdminCourseAnalytics';
import AdminStudentProgress from './pages/AdminStudentProgress';
import AdminLessons from './pages/AdminLessons';
import CourseEditor from './pages/CourseEditor';
import Login from './pages/Login';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter basename="/admin">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={
            <ProtectedRoute roles={['admin']}>
              <AdminLayout />
            </ProtectedRoute>
          }>
            <Route index element={<AdminDashboard />} />
            <Route path="courses" element={<AdminCourses />} />
            <Route path="courses/new" element={<CourseEditor />} />
            <Route path="courses/:id/edit" element={<CourseEditor />} />
            <Route path="courses/:id/handouts" element={<AdminCourseHandouts />} />
            <Route path="courses/:id/analytics" element={<AdminCourseAnalytics />} />
            <Route path="announcements" element={<AdminAnnouncements />} />
            <Route path="student-groups" element={<AdminStudentGroups />} />
            <Route path="users" element={<AdminUsers />} />
            <Route path="users/:studentId/progress" element={<AdminStudentProgress />} />
            <Route path="enrollments" element={<AdminEnrollments />} />
            <Route path="lessons" element={<AdminLessons />} />
            <Route path="payments" element={<AdminPayments />} />
            <Route path="analytics" element={<AdminAnalytics />} />
            <Route path="settings" element={<AdminSettings />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
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
  );
}

export default App;
