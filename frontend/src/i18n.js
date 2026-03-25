import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

const resources = {
  en: {
    translation: {
      navbar: {
        home: 'Home',
        courses: 'Courses',
        myPortal: 'MyPortal',
        profile: 'Profile',
        settings: 'Settings',
        notifications: 'Notifications',
        logout: 'Logout',
        login: 'Login',
        register: 'Register'
      },
      student: {
        myCourses: 'My Courses',
        allCourses: 'All Courses',
        enrolled: 'Enrolled',
        pending: 'Pending',
        completed: 'Completed',
        history: 'History',
        progress: 'Progress',
        continue: 'Continue',
        start: 'Start',
        resume: 'Resume',
        viewAll: 'View All',
        noCourses: 'No courses found',
        searchCourses: 'Search courses...',
        sortBy: 'Sort by',
        dateEnrolled: 'Date Enrolled',
        title: 'Title',
        lessons: 'lessons',
        enrolledDate: 'Enrolled',
        paymentPending: 'Payment Pending',
        paymentVerified: 'Payment Verified',
        paymentRejected: 'Payment Rejected'
      },
      profile: {
        title: 'My Profile',
        name: 'Full Name',
        email: 'Email',
        phone: 'Phone',
        address: 'Address',
        joinedDate: 'Joined Date',
        editProfile: 'Edit Profile',
        saveChanges: 'Save Changes',
        cancel: 'Cancel'
      },
      settings: {
        title: 'Settings',
        account: 'Account Settings',
        notifications: 'Notification Settings',
        privacy: 'Privacy Settings',
        theme: 'Theme',
        light: 'Light',
        dark: 'Dark',
        language: 'Language',
        english: 'English',
        vietnamese: 'Vietnamese'
      },
      payments: {
        title: 'Payments',
        uploadProof: 'Upload Payment Proof',
        status: 'Status',
        date: 'Date',
        amount: 'Amount',
        pending: 'Pending',
        verified: 'Verified',
        rejected: 'Rejected',
        noPayments: 'No payment history'
      },
      announcements: {
        title: 'Announcements',
        noAnnouncements: 'No announcements',
        urgent: 'Urgent',
        important: 'Important',
        normal: 'Normal'
      },
      notifications: {
        title: 'Notifications',
        markAllRead: 'Mark all as read',
        noNotifications: 'No notifications'
      },
      common: {
        loading: 'Loading...',
        error: 'An error occurred',
        retry: 'Retry',
        save: 'Save',
        cancel: 'Cancel',
        delete: 'Delete',
        edit: 'Edit',
        close: 'Close',
        confirm: 'Confirm',
        back: 'Back',
        next: 'Next',
        previous: 'Previous',
        search: 'Search',
        filter: 'Filter',
        sort: 'Sort',
        view: 'View',
        download: 'Download',
        upload: 'Upload'
      },
      admin: {
        dashboard: 'Admin Dashboard',
        managePlatform: 'Manage your learning platform',
        totalUsers: 'Total Users',
        totalStudents: 'Total Students',
        totalCourses: 'Total Courses',
        totalEnrollments: 'Total Enrollments',
        recentCourses: 'Recent Courses',
        recentEnrollments: 'Recent Enrollments',
        quickActions: 'Quick Actions',
        addCourse: 'Add Course',
        manageCourses: 'Manage Courses',
        manageUsers: 'Manage Users',
        viewEnrollments: 'View Enrollments',
        viewAll: 'View All',
        unknown: 'Unknown'
      }
    }
  },
  vi: {
    translation: {
      navbar: {
        home: 'Trang chủ',
        courses: 'Khóa học',
        myPortal: 'Cổng của tôi',
        profile: 'Hồ sơ',
        settings: 'Cài đặt',
        notifications: 'Thông báo',
        logout: 'Đăng xuất',
        login: 'Đăng nhập',
        register: 'Đăng ký'
      },
      student: {
        myCourses: 'Khóa học của tôi',
        allCourses: 'Tất cả khóa học',
        enrolled: 'Đã đăng ký',
        pending: 'Đang chờ',
        completed: 'Hoàn thành',
        history: 'Lịch sử',
        progress: 'Tiến độ',
        continue: 'Tiếp tục',
        start: 'Bắt đầu',
        resume: 'Tiếp tục học',
        viewAll: 'Xem tất cả',
        noCourses: 'Không tìm thấy khóa học',
        searchCourses: 'Tìm kiếm khóa học...',
        sortBy: 'Sắp xếp theo',
        dateEnrolled: 'Ngày đăng ký',
        title: 'Tiêu đề',
        lessons: 'bài học',
        enrolledDate: 'Ngày đăng ký',
        paymentPending: 'Chờ thanh toán',
        paymentVerified: 'Đã thanh toán',
        paymentRejected: 'Thanh toán bị từ chối'
      },
      profile: {
        title: 'Hồ sơ của tôi',
        name: 'Họ và tên',
        email: 'Email',
        phone: 'Số điện thoại',
        address: 'Địa chỉ',
        joinedDate: 'Ngày tham gia',
        editProfile: 'Chỉnh sửa hồ sơ',
        saveChanges: 'Lưu thay đổi',
        cancel: 'Hủy'
      },
      settings: {
        title: 'Cài đặt',
        account: 'Cài đặt tài khoản',
        notifications: 'Cài đặt thông báo',
        privacy: 'Cài đặt quyền riêng tư',
        theme: 'Giao diện',
        light: 'Sáng',
        dark: 'Tối',
        language: 'Ngôn ngữ',
        english: 'Tiếng Anh',
        vietnamese: 'Tiếng Việt'
      },
      payments: {
        title: 'Thanh toán',
        uploadProof: 'Tải lên minh chứng thanh toán',
        status: 'Trạng thái',
        date: 'Ngày',
        amount: 'Số tiền',
        pending: 'Đang chờ',
        verified: 'Đã xác minh',
        rejected: 'Bị từ chối',
        noPayments: 'Không có lịch sử thanh toán'
      },
      announcements: {
        title: 'Thông báo',
        noAnnouncements: 'Không có thông báo',
        urgent: 'Khẩn cấp',
        important: 'Quan trọng',
        normal: 'Bình thường'
      },
      notifications: {
        title: 'Thông báo',
        markAllRead: 'Đánh dấu tất cả đã đọc',
        noNotifications: 'Không có thông báo'
      },
      common: {
        loading: 'Đang tải...',
        error: 'Đã xảy ra lỗi',
        retry: 'Thử lại',
        save: 'Lưu',
        cancel: 'Hủy',
        delete: 'Xóa',
        edit: 'Sửa',
        close: 'Đóng',
        confirm: 'Xác nhận',
        back: 'Quay lại',
        next: 'Tiếp theo',
        previous: 'Trước đó',
        search: 'Tìm kiếm',
        filter: 'Lọc',
        sort: 'Sắp xếp',
        view: 'Xem',
        download: 'Tải xuống',
        upload: 'Tải lên'
      },
      admin: {
        dashboard: 'Bảng quản trị',
        managePlatform: 'Quản lý nền tảng học tập',
        totalUsers: 'Tổng người dùng',
        totalStudents: 'Tổng học sinh',
        totalCourses: 'Tổng khóa học',
        totalEnrollments: 'Tổng đăng ký',
        recentCourses: 'Khóa học gần đây',
        recentEnrollments: 'Đăng ký gần đây',
        quickActions: 'Thao tác nhanh',
        addCourse: 'Thêm khóa học',
        manageCourses: 'Quản lý khóa học',
        manageUsers: 'Quản lý người dùng',
        viewEnrollments: 'Xem đăng ký',
        viewAll: 'Xem tất cả',
        unknown: 'Không xác định'
      }
    }
  }
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false
    },
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage']
    }
  });

export default i18n;
