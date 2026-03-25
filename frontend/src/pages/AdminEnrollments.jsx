import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, BookOpen, Calendar, CheckCircle, Clock, CreditCard, Eye, X, AlertCircle, Upload, Video } from 'lucide-react';
import { enrollmentsAPI, paymentsAPI, classLinkAPI } from '../services/api';
import { toast } from 'react-toastify';

const AdminEnrollments = () => {
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showClassLinkModal, setShowClassLinkModal] = useState(false);
  const [classLinkForm, setClassLinkForm] = useState({ class_link: '', scheduled_at: '', notes: '' });
  const [selectedCourseId, setSelectedCourseId] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchEnrollments();
  }, []);

  const fetchEnrollments = async () => {
    try {
      const response = await enrollmentsAPI.getAll();
      setEnrollments(response.data);
    } catch (error) {
      toast.error('Failed to load enrollments');
    } finally {
      setLoading(false);
    }
  };

  const viewPaymentProof = async (enrollmentId) => {
    try {
      const response = await paymentsAPI.getByEnrollment(enrollmentId);
      setSelectedPayment(response.data);
      setShowPaymentModal(true);
    } catch (error) {
      toast.error('No payment found for this enrollment');
    }
  };

  const verifyPayment = async (paymentId, status) => {
    setActionLoading(true);
    try {
      await paymentsAPI.verify(paymentId, { status });
      toast.success(`Payment ${status === 'verified' ? 'verified' : 'rejected'} successfully`);
      setShowPaymentModal(false);
      fetchEnrollments();
    } catch (error) {
      toast.error('Failed to process payment');
    } finally {
      setActionLoading(false);
    }
  };

  const openClassLinkModal = (courseId) => {
    setSelectedCourseId(courseId);
    setClassLinkForm({ class_link: '', scheduled_at: '', notes: '' });
    setShowClassLinkModal(true);
  };

  const createClassLink = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      await classLinkAPI.create({
        course_id: selectedCourseId,
        ...classLinkForm
      });
      toast.success('Class link created and notifications sent to students!');
      setShowClassLinkModal(false);
    } catch (error) {
      toast.error('Failed to create class link');
    } finally {
      setActionLoading(false);
    }
  };

  const pendingCount = enrollments.filter(e => e.status === 'pending').length;
  const stats = [
    { icon: <Users className="h-6 w-6" />, label: 'Total Enrollments', value: enrollments.length, color: 'bg-blue-500' },
    { icon: <CreditCard className="h-6 w-6" />, label: 'Pending Payment', value: pendingCount, color: 'bg-orange-500' },
    { icon: <Clock className="h-6 w-6" />, label: 'Active', value: enrollments.filter(e => e.status === 'active').length, color: 'bg-yellow-500' },
    { icon: <CheckCircle className="h-6 w-6" />, label: 'Completed', value: enrollments.filter(e => e.status === 'completed').length, color: 'bg-green-500' }
  ];

  const getPaymentStatusBadge = (enrollment) => {
    if (enrollment.status !== 'pending') return null;
    if (enrollment.payment_status === 'verified') {
      return <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">Verified</span>;
    }
    if (enrollment.payment_status === 'rejected') {
      return <span className="px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700">Rejected</span>;
    }
    if (enrollment.payment_status === 'pending') {
      return (
        <button
          onClick={() => viewPaymentProof(enrollment.id)}
          className="px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700 hover:bg-yellow-200 transition-colors"
        >
          Review Payment
        </button>
      );
    }
    return <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">No Payment</span>;
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-12"
        >
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Enrollment & Payment Management</h1>
          <p className="text-gray-600">Track enrollments and verify payments</p>
        </motion.div>

        <div className="grid md:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <div key={index} className="bg-white rounded-2xl shadow-lg p-6 flex items-center space-x-4">
              <div className={`${stat.color} p-4 rounded-2xl text-white`}>
                {stat.icon}
              </div>
              <div>
                <div className="text-3xl font-bold text-gray-900">{stat.value}</div>
                <div className="text-gray-600">{stat.label}</div>
              </div>
            </div>
          ))}
        </div>

        {loading ? (
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          </div>
        ) : enrollments.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
            <Users className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No enrollments yet</h3>
            <p className="text-gray-600">Enrollments will appear here when students join courses</p>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="bg-white rounded-2xl shadow-lg overflow-hidden"
          >
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Student</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Course</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Progress</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Status</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Payment</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {enrollments.map((enrollment) => (
                    <tr key={enrollment.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                            <span className="text-primary-600 font-semibold">
                              {enrollment.user_name?.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div>
                            <div className="font-semibold text-gray-900">{enrollment.user_name}</div>
                            <div className="text-sm text-gray-500">{enrollment.user_email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-3">
                          <BookOpen className="h-5 w-5 text-gray-400" />
                          <span className="font-medium text-gray-900 line-clamp-1">{enrollment.course_title}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="w-32">
                          <div className="flex justify-between text-sm mb-1">
                            <span className="text-gray-600">{enrollment.progress}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-primary-600 h-2 rounded-full"
                              style={{ width: `${enrollment.progress}%` }}
                            ></div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          enrollment.status === 'completed'
                            ? 'bg-green-100 text-green-700'
                            : enrollment.status === 'pending'
                            ? 'bg-orange-100 text-orange-700'
                            : 'bg-yellow-100 text-yellow-700'
                        }`}>
                          {enrollment.status === 'completed' ? 'Completed' : 
                           enrollment.status === 'pending' ? 'Pending' : 'Active'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {getPaymentStatusBadge(enrollment)}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          {enrollment.payment_proof && (
                            <button
                              onClick={() => viewPaymentProof(enrollment.id)}
                              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                              title="View Payment Proof"
                            >
                              <Eye className="h-4 w-4" />
                            </button>
                          )}
                          <button
                            onClick={() => openClassLinkModal(enrollment.course_id)}
                            className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                            title="Add Class Link"
                          >
                            <Video className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}
      </div>

      <AnimatePresence>
        {showPaymentModal && selectedPayment && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowPaymentModal(false)} />
            
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
            >
              <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between rounded-t-2xl">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Payment Verification</h2>
                  <p className="text-sm text-gray-500">{selectedPayment.course_title}</p>
                </div>
                <button
                  onClick={() => setShowPaymentModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X className="h-5 w-5 text-gray-500" />
                </button>
              </div>

              <div className="p-6 space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-50 rounded-xl p-4">
                    <label className="text-xs text-gray-500 uppercase tracking-wide">Student</label>
                    <p className="font-semibold text-gray-900">{selectedPayment.user_name || 'N/A'}</p>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-4">
                    <label className="text-xs text-gray-500 uppercase tracking-wide">Payment Method</label>
                    <p className="font-semibold text-gray-900">{selectedPayment.payment_method || 'N/A'}</p>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-4">
                    <label className="text-xs text-gray-500 uppercase tracking-wide">Reference Number</label>
                    <p className="font-semibold text-gray-900">{selectedPayment.reference_number || 'N/A'}</p>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-4">
                    <label className="text-xs text-gray-500 uppercase tracking-wide">Amount</label>
                    <p className="font-semibold text-gray-900">₱{selectedPayment.amount || '0.00'}</p>
                  </div>
                </div>

                {selectedPayment.proof_path && (
                  <div>
                    <label className="text-xs text-gray-500 uppercase tracking-wide mb-2 block">Payment Proof</label>
                    <img
                      src={`http://localhost:5000${selectedPayment.proof_path}`}
                      alt="Payment proof"
                      className="w-full max-h-96 object-contain rounded-xl border border-gray-200"
                    />
                  </div>
                )}

                {selectedPayment.notes && (
                  <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                    <label className="text-xs text-blue-600 uppercase tracking-wide">Notes</label>
                    <p className="text-blue-800 mt-1">{selectedPayment.notes}</p>
                  </div>
                )}

                {selectedPayment.status === 'pending' && (
                  <div className="flex gap-3 pt-4">
                    <button
                      onClick={() => verifyPayment(selectedPayment.id, 'rejected')}
                      disabled={actionLoading}
                      className="flex-1 px-6 py-3 bg-red-600 text-white rounded-xl font-semibold hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      <X className="h-5 w-5" />
                      Reject
                    </button>
                    <button
                      onClick={() => verifyPayment(selectedPayment.id, 'verified')}
                      disabled={actionLoading}
                      className="flex-1 px-6 py-3 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      <CheckCircle className="h-5 w-5" />
                      Verify Payment
                    </button>
                  </div>
                )}

                {selectedPayment.status !== 'pending' && (
                  <div className={`text-center py-4 rounded-xl ${
                    selectedPayment.status === 'verified' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
                  }`}>
                    <p className="font-semibold">
                      This payment has been {selectedPayment.status}
                    </p>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showClassLinkModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowClassLinkModal(false)} />
            
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg"
            >
              <div className="border-b border-gray-200 px-6 py-4 flex items-center justify-between rounded-t-2xl">
                <h2 className="text-xl font-bold text-gray-900">Add Class Link</h2>
                <button
                  onClick={() => setShowClassLinkModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X className="h-5 w-5 text-gray-500" />
                </button>
              </div>

              <form onSubmit={createClassLink} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Class Link <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="url"
                    value={classLinkForm.class_link}
                    onChange={(e) => setClassLinkForm({ ...classLinkForm, class_link: e.target.value })}
                    placeholder="https://zoom.us/j/..."
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Scheduled Date & Time <span className="text-gray-400">(Optional)</span>
                  </label>
                  <input
                    type="datetime-local"
                    value={classLinkForm.scheduled_at}
                    onChange={(e) => setClassLinkForm({ ...classLinkForm, scheduled_at: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Notes <span className="text-gray-400">(Optional)</span>
                  </label>
                  <textarea
                    value={classLinkForm.notes}
                    onChange={(e) => setClassLinkForm({ ...classLinkForm, notes: e.target.value })}
                    placeholder="Any additional instructions..."
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
                  />
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
                    <p className="text-sm text-blue-800">
                      Notifications will be sent to all enrolled students when you create the class link.
                    </p>
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowClassLinkModal(false)}
                    className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={actionLoading || !classLinkForm.class_link}
                    className="flex-1 px-6 py-3 bg-purple-600 text-white rounded-xl font-semibold hover:bg-purple-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {actionLoading ? (
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    ) : (
                      <>
                        <Video className="h-5 w-5" />
                        Create & Notify
                      </>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminEnrollments;
