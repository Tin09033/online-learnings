import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

const resources = {
  en: {
    translation: {
      navbar: {
        home: 'Home',
        courses: 'Courses',
        myPortal: 'My Portal',
        profile: 'Profile',
        settings: 'Settings',
        notifications: 'Notifications',
        logout: 'Logout',
        login: 'Login',
        register: 'Register',
        about: 'About',
        contact: 'Contact',
        pricing: 'Pricing'
      },
      hero: {
        title: 'Master Your Skills with Expert-Led Courses',
        subtitle: 'Join thousands of learners and start your journey to success. Access premium courses taught by industry experts.',
        getStarted: 'Get Started',
        learnMore: 'Learn More',
        watchDemo: 'Watch Demo'
      },
      features: {
        title: 'Why Choose Us',
        subtitle: 'Discover what makes our platform the best choice for your learning journey',
        expertInstructors: 'Expert Instructors',
        expertInstructorsDesc: 'Learn from industry professionals with years of experience',
        flexibleLearning: 'Flexible Learning',
        flexibleLearningDesc: 'Study at your own pace, anywhere, anytime',
        certificates: 'Certificates',
        certificatesDesc: 'Earn recognized certificates upon completion',
        community: 'Community',
        communityDesc: 'Join a supportive community of learners'
      },
      courses: {
        title: 'Popular Courses',
        subtitle: 'Explore our most popular courses',
        viewAll: 'View All Courses',
        enrollNow: 'Enroll Now',
        free: 'Free',
        students: 'students',
        lessons: 'lessons',
        hours: 'hours',
        rating: 'rating'
      },
      testimonials: {
        title: 'What Our Students Say',
        subtitle: 'Hear from our satisfied learners'
      },
      pricing: {
        title: 'Simple Pricing',
        subtitle: 'Choose the plan that fits your needs',
        monthly: 'Monthly',
        yearly: 'Yearly',
        save: 'Save 20%',
        getStarted: 'Get Started',
        contactSales: 'Contact Sales',
        features: {
          access: 'Access to all courses',
          certificates: 'Certificates of completion',
          support: '24/7 support',
          updates: 'Free updates',
          mentor: '1-on-1 mentor access',
          community: 'Community access'
        }
      },
      cta: {
        title: 'Ready to Start Learning?',
        subtitle: 'Join thousands of students already learning on our platform',
        button: 'Get Started Now'
      },
      footer: {
        rights: 'All rights reserved.',
        quickLinks: 'Quick Links',
        resources: 'Resources',
        support: 'Support',
        newsletter: 'Newsletter',
        newsletterText: 'Subscribe to our newsletter for the latest updates',
        subscribe: 'Subscribe',
        emailPlaceholder: 'Enter your email'
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
        paymentRejected: 'Payment Rejected',
        activeCourses: 'Active Courses',
        lessonsInProgress: 'lessons in progress',
        certificatesEarned: 'Course certificates earned',
        awaitingPayment: 'Awaiting payment approval',
        totalEnrolled: 'Total Enrolled',
        allTimeEnrollments: 'All time enrollments',
        noActiveEnrollments: 'You have no active enrollments',
        noCompletedCourses: 'You have not completed any courses yet',
        noPendingEnrollments: 'No pending enrollments',
        noEnrollmentHistory: 'No enrollment history yet',
        inProgress: 'In Progress',
        class: 'Class',
        details: 'Details',
        classLink: 'Class Link',
        joinClass: 'Join Class',
        manageCourses: 'Manage your enrolled courses'
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
        register: 'Đăng ký',
        about: 'Giới thiệu',
        contact: 'Liên hệ',
        pricing: 'Bảng giá'
      },
      hero: {
        title: 'Làm Chủ Kỹ Năng Với Các Khóa Học Từ Chuyên Gia',
        subtitle: 'Tham gia cùng hàng nghìn người học và bắt đầu hành trình thành công. Truy cập các khóa học chất lượng cao từ các chuyên gia trong ngành.',
        getStarted: 'Bắt đầu ngay',
        learnMore: 'Tìm hiểu thêm',
        watchDemo: 'Xem demo'
      },
      features: {
        title: 'Tại Sao Chọn Chúng Tôi',
        subtitle: 'Khám phá những gì làm cho nền tảng của chúng tôi trở thành lựa chọn tốt nhất cho hành trình học tập của bạn',
        expertInstructors: 'Giảng viên chuyên gia',
        expertInstructorsDesc: 'Học từ các chuyên gia trong ngành với nhiều năm kinh nghiệm',
        flexibleLearning: 'Học linh hoạt',
        flexibleLearningDesc: 'Học theo tốc độ của bạn, mọi lúc mọi nơi',
        certificates: 'Chứng chỉ',
        certificatesDesc: 'Nhận chứng chỉ được công nhận khi hoàn thành',
        community: 'Cộng đồng',
        communityDesc: 'Tham gia cộng đồng hỗ trợ người học'
      },
      courses: {
        title: 'Khóa Học Phổ Biến',
        subtitle: 'Khám phá các khóa học phổ biến nhất của chúng tôi',
        viewAll: 'Xem Tất Cả Khóa Học',
        enrollNow: 'Đăng ký ngay',
        free: 'Miễn phí',
        students: 'học viên',
        lessons: 'bài học',
        hours: 'giờ',
        rating: 'đánh giá'
      },
      testimonials: {
        title: 'Học Viên Nói Gì Về Chúng Tôi',
        subtitle: 'Lắng nghe từ những người học hài lòng của chúng tôi'
      },
      pricing: {
        title: 'Bảng Giá Đơn Giản',
        subtitle: 'Chọn gói phù hợp với nhu cầu của bạn',
        monthly: 'Hàng tháng',
        yearly: 'Hàng năm',
        save: 'Tiết kiệm 20%',
        getStarted: 'Bắt đầu',
        contactSales: 'Liên hệ bán hàng',
        features: {
          access: 'Truy cập tất cả khóa học',
          certificates: 'Chứng chỉ hoàn thành',
          support: 'Hỗ trợ 24/7',
          updates: 'Cập nhật miễn phí',
          mentor: 'Tiếp cận mentor 1-1',
          community: 'Truy cập cộng đồng'
        }
      },
      cta: {
        title: 'Sẵn sàng bắt đầu học?',
        subtitle: 'Tham gia cùng hàng nghìn học viên đang học trên nền tảng của chúng tôi',
        button: 'Bắt đầu ngay'
      },
      footer: {
        rights: 'Tất cả các quyền được bảo lưu.',
        quickLinks: 'Liên kết nhanh',
        resources: 'Tài nguyên',
        support: 'Hỗ trợ',
        newsletter: 'Bản tin',
        newsletterText: 'Đăng ký nhận bản tin của chúng tôi để cập nhật mới nhất',
        subscribe: 'Đăng ký',
        emailPlaceholder: 'Nhập email của bạn'
      },
      student: {
        myCourses: 'Khóa Học Của Tôi',
        allCourses: 'Tất Cả Khóa Học',
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
        paymentRejected: 'Thanh toán bị từ chối',
        activeCourses: 'Khóa học đang hoạt động',
        lessonsInProgress: 'bài học đang tiến hành',
        certificatesEarned: 'Chứng chỉ khóa học đã nhận',
        awaitingPayment: 'Đang chờ phê duyệt thanh toán',
        totalEnrolled: 'Tổng số đăng ký',
        allTimeEnrollments: 'Đăng ký mọi thời điểm',
        noActiveEnrollments: 'Bạn không có đăng ký đang hoạt động',
        noCompletedCourses: 'Bạn chưa hoàn thành khóa học nào',
        noPendingEnrollments: 'Không có đăng ký đang chờ',
        noEnrollmentHistory: 'Chưa có lịch sử đăng ký',
        inProgress: 'Đang tiến hành',
        class: 'Lớp học',
        details: 'Chi tiết',
        classLink: 'Link Lớp Học',
        joinClass: 'Tham gia lớp học',
        manageCourses: 'Quản lý các khóa học đã đăng ký'
      },
      profile: {
        title: 'Hồ Sơ Của Tôi',
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
        title: 'Cài Đặt',
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
        title: 'Thanh Toán',
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
        title: 'Thông Báo',
        noAnnouncements: 'Không có thông báo',
        urgent: 'Khẩn cấp',
        important: 'Quan trọng',
        normal: 'Bình thường'
      },
      notifications: {
        title: 'Thông Báo',
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
        dashboard: 'Bảng Quản Trị',
        managePlatform: 'Quản lý nền tảng học tập',
        totalUsers: 'Tổng Người Dùng',
        totalStudents: 'Tổng Học Sinh',
        totalCourses: 'Tổng Khóa Học',
        totalEnrollments: 'Tổng Đăng Ký',
        recentCourses: 'Khóa Học Gần Đây',
        recentEnrollments: 'Đăng Ký Gần Đây',
        quickActions: 'Thao Tác Nhanh',
        addCourse: 'Thêm Khóa Học',
        manageCourses: 'Quản Lý Khóa Học',
        manageUsers: 'Quản Lý Người Dùng',
        viewEnrollments: 'Xem Đăng Ký',
        viewAll: 'Xem Tất Cả',
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
    },
    react: {
      useSuspense: true
    }
  });

export default i18n;
