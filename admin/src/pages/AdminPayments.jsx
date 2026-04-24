import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CreditCard, Clock, CheckCircle, XCircle, Search, ChevronLeft, ChevronRight, Eye, Check, X, Download, AlertCircle } from 'lucide-react';
import { paymentsAPI } from '../services/api';
import { toast } from 'react-toastify';
import { getPaymentProofUrl, getApiUrl } from '../utils/apiUrl';

const AdminPayments = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [showProofModal, setShowProofModal] = useState(false);
  const [showVerifyModal, setShowVerifyModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectNotes, setRejectNotes] = useState('');
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    fetchPayments();
  }, []);



  const fetchPayments = async () => {
    try {
      const response = await paymentsAPI.getAll();
      console.log('Payments response:', response.data);
      setPayments(response.data);
    } catch (error) {
      console.error('Failed to load payments:', error);
      toast.error('Failed to load payments: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  const filteredPayments = payments.filter(payment => {
    const matchesSearch = 
      payment.user_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      payment.user_email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      payment.course_title?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || payment.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalPages = Math.ceil(filteredPayments.length / pageSize);
  const paginatedPayments = filteredPayments.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, statusFilter, pageSize]);

  const handleVerify = async () => {
    if (!selectedPayment) return;
    setProcessing(true);
    try {
      await paymentsAPI.verify(selectedPayment.id, { status: 'verified' });
      toast.success('Payment verified successfully');
      setShowVerifyModal(false);
      setSelectedPayment(null);
      fetchPayments();
    } catch (error) {
      toast.error('Failed to verify payment');
    } finally {
      setProcessing(false);
    }
  };

  const handleReject = async () => {
    if (!selectedPayment) return;
    setProcessing(true);
    try {
      await paymentsAPI.verify(selectedPayment.id, { status: 'rejected', notes: rejectNotes });
      toast.success('Payment rejected');
      setShowRejectModal(false);
      setSelectedPayment(null);
      setRejectNotes('');
      fetchPayments();
    } catch (error) {
      toast.error('Failed to reject payment');
    } finally {
      setProcessing(false);
    }
  };

  const openVerifyModal = (payment, e) => {
    e?.stopPropagation();
    setSelectedPayment(payment);
    setShowVerifyModal(true);
  };

  const openRejectModal = (payment, e) => {
    e?.stopPropagation();
    setSelectedPayment(payment);
    setShowRejectModal(true);
  };

  const openProofModal = (payment, e) => {
    e?.stopPropagation();
    setSelectedPayment(payment);
    setShowProofModal(true);
  };

  const stats = [
    { icon: <CreditCard className="h-6 w-6" />, label: 'Total Payments', value: payments.length, color: 'bg-blue-500' },
    { icon: <Clock className="h-6 w-6" />, label: 'Pending', value: payments.filter(p => p.status === 'pending').length, color: 'bg-yellow-500' },
    { icon: <CheckCircle className="h-6 w-6" />, label: 'Verified', value: payments.filter(p => p.status === 'verified').length, color: 'bg-green-500' },
    { icon: <XCircle className="h-6 w-6" />, label: 'Rejected', value: payments.filter(p => p.status === 'rejected').length, color: 'bg-red-500' }
  ];

  const getStatusBadge = (status) => {
    switch (status) {
      case 'verified':
        return 'bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-400';
      case 'rejected':
        return 'bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-400';
      default:
        return 'bg-yellow-100 dark:bg-yellow-900/50 text-yellow-700 dark:text-yellow-400';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'verified':
        return <CheckCircle className="h-4 w-4" />;
      case 'rejected':
        return <XCircle className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Payment Management</h1>
        <p className="text-gray-600 dark:text-gray-400">Review and verify student payments</p>
      </div>

      <div className="grid md:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-6 flex items-center space-x-4">
            <div className={`${stat.color} p-4 rounded-xl text-white`}>
              {stat.icon}
            </div>
            <div>
              <div className="text-3xl font-bold text-gray-900 dark:text-white">{stat.value}</div>
              <div className="text-gray-600 dark:text-gray-400">{stat.label}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex flex-1 items-center space-x-4">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by student or course..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
                />
              </div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="verified">Verified</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="p-12 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          </div>
        ) : filteredPayments.length === 0 ? (
          <div className="p-12 text-center">
            <CreditCard className="h-16 w-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              {searchQuery || statusFilter !== 'all' ? 'No payments match your filters' : 'No payments yet'}
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              {searchQuery || statusFilter !== 'all' ? 'Try adjusting your search or filters' : 'Payment records will appear here'}
            </p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-700/50">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-white">Student</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-white">Course</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-white">Amount</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-white">Method</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-white">Status</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-white">Date</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-white">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {paginatedPayments.map((payment) => (
                    <tr key={payment.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-primary-100 dark:bg-primary-900/50 rounded-full flex items-center justify-center">
                            <span className="text-primary-600 dark:text-primary-400 font-semibold">
                              {payment.user_name?.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div>
                            <div className="font-semibold text-gray-900 dark:text-white">{payment.user_name}</div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">{payment.user_email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-medium text-gray-900 dark:text-white line-clamp-1">{payment.course_title}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-semibold text-gray-900 dark:text-white">
                          ₱{parseFloat(payment.amount || 0).toFixed(2)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-gray-700 dark:text-gray-300 capitalize">{payment.payment_method?.replace('_', ' ')}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1 w-fit ${getStatusBadge(payment.status)}`}>
                          {getStatusIcon(payment.status)}
                          {payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-gray-700 dark:text-gray-300">
                        {new Date(payment.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={(e) => openProofModal(payment, e)}
                            className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
                            title="View Payment Proof"
                          >
                            <Eye className="h-5 w-5" />
                          </button>
                          {payment.status === 'pending' && (
                            <>
                              <button
                                onClick={(e) => openVerifyModal(payment, e)}
                                className="p-2 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/30 rounded-lg transition-colors"
                                title="Verify Payment"
                              >
                                <Check className="h-5 w-5" />
                              </button>
                              <button
                                onClick={(e) => openRejectModal(payment, e)}
                                className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                                title="Reject Payment"
                              >
                                <X className="h-5 w-5" />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                <span>Show</span>
                <select
                  value={pageSize}
                  onChange={(e) => setPageSize(Number(e.target.value))}
                  className="px-2 py-1 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                >
                  <option value={5}>5</option>
                  <option value={10}>10</option>
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                </select>
                <span>of {filteredPayments.length} payments</span>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="p-2 rounded-lg border border-gray-300 dark:border-gray-600 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700 dark:text-white"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  className="p-2 rounded-lg border border-gray-300 dark:border-gray-600 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700 dark:text-white"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      <AnimatePresence>
        {showProofModal && selectedPayment && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden"
            >
              <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">Payment Proof</h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{selectedPayment.user_name} - {selectedPayment.course_title}</p>
                </div>
                <button
                  onClick={() => {
                    setShowProofModal(false);
                    setSelectedPayment(null);
                  }}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <X className="h-5 w-5 text-gray-500" />
                </button>
              </div>
              <div className="p-6 overflow-y-auto max-h-[calc(90vh-180px)]">
                <div className="grid md:grid-cols-2 gap-6 mb-6">
                  <div className="space-y-4">
                    <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
                      <p className="text-sm text-gray-500 dark:text-gray-400">Student</p>
                      <p className="font-semibold text-gray-900 dark:text-white">{selectedPayment.user_name}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-300">{selectedPayment.user_email}</p>
                    </div>
                    <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
                      <p className="text-sm text-gray-500 dark:text-gray-400">Course</p>
                      <p className="font-semibold text-gray-900 dark:text-white">{selectedPayment.course_title}</p>
                    </div>
                    <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
                      <p className="text-sm text-gray-500 dark:text-gray-400">Amount</p>
                      <p className="font-bold text-xl text-primary-600">₱{parseFloat(selectedPayment.amount || 0).toFixed(2)}</p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
                      <p className="text-sm text-gray-500 dark:text-gray-400">Payment Method</p>
                      <p className="font-semibold text-gray-900 dark:text-white capitalize">{selectedPayment.payment_method?.replace('_', ' ')}</p>
                    </div>
                    <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
                      <p className="text-sm text-gray-500 dark:text-gray-400">Reference Number</p>
                      <p className="font-semibold text-gray-900 dark:text-white">{selectedPayment.reference_number || 'N/A'}</p>
                    </div>
                    <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
                      <p className="text-sm text-gray-500 dark:text-gray-400">Status</p>
                      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-semibold ${getStatusBadge(selectedPayment.status)}`}>
                        {getStatusIcon(selectedPayment.status)}
                        {selectedPayment.status.charAt(0).toUpperCase() + selectedPayment.status.slice(1)}
                      </span>
                    </div>
                  </div>
                </div>
                {selectedPayment.notes && (
                  <div className="p-4 bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 rounded-xl mb-6">
                    <p className="text-sm text-blue-700 dark:text-blue-300 font-medium mb-1">Notes from Student</p>
                    <p className="text-gray-700 dark:text-gray-300">{selectedPayment.notes}</p>
                  </div>
                )}
                <div className="border-2 border-gray-200 dark:border-gray-600 rounded-xl p-4">
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-3 font-medium">Payment Proof Image</p>
                  {selectedPayment.proof_path ? (
                    <div className="relative">
                      <img
                        src={getPaymentProofUrl(selectedPayment.proof_path)}
                        alt="Payment Proof"
                        className="max-w-full h-auto rounded-lg"
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.nextSibling && (e.target.nextSibling.style.display = 'flex');
                        }}
                      />
                      <div className="hidden text-center py-12 text-gray-500 dark:text-gray-400">
                        <AlertCircle className="h-12 w-12 mx-auto mb-3" />
                        <p>Failed to load image</p>
                        <a
                          href={getPaymentProofUrl(selectedPayment.proof_path)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="mt-2 inline-block text-sm text-blue-600 underline"
                        >
                          Open image in new tab
                        </a>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                      <AlertCircle className="h-12 w-12 mx-auto mb-3" />
                      <p>No payment proof uploaded</p>
                    </div>
                  )}
                </div>
              </div>
              {selectedPayment.status === 'pending' && (
                <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex gap-4">
                  <button
                    onClick={() => {
                      setShowProofModal(false);
                      openRejectModal(selectedPayment);
                    }}
                    className="flex-1 px-6 py-3 bg-red-600 text-white rounded-xl font-semibold hover:bg-red-700 transition-colors flex items-center justify-center gap-2"
                  >
                    <X className="h-5 w-5" />
                    Reject Payment
                  </button>
                  <button
                    onClick={() => {
                      setShowProofModal(false);
                      openVerifyModal(selectedPayment);
                    }}
                    className="flex-1 px-6 py-3 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
                  >
                    <Check className="h-5 w-5" />
                    Verify Payment
                  </button>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showVerifyModal && selectedPayment && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md"
            >
              <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Verify Payment</h2>
                <button
                  onClick={() => {
                    setShowVerifyModal(false);
                    setSelectedPayment(null);
                  }}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <X className="h-5 w-5 text-gray-500" />
                </button>
              </div>
              <div className="p-6">
                <div className="flex items-start gap-4 mb-6">
                  <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center flex-shrink-0">
                    <CheckCircle className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">Confirm Payment Verification</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      Are you sure you want to verify this payment from {selectedPayment.user_name} for {selectedPayment.course_title}?
                    </p>
                    <p className="text-sm font-semibold text-green-600 mt-2">
                      Amount: ₱{parseFloat(selectedPayment.amount || 0).toFixed(2)}
                    </p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <button
                    onClick={() => {
                      setShowVerifyModal(false);
                      setSelectedPayment(null);
                    }}
                    className="flex-1 px-6 py-3 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl font-semibold hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleVerify}
                    disabled={processing}
                    className="flex-1 px-6 py-3 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {processing ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        Processing...
                      </>
                    ) : (
                      <>
                        <Check className="h-5 w-5" />
                        Verify
                      </>
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showRejectModal && selectedPayment && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md"
            >
              <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Reject Payment</h2>
                <button
                  onClick={() => {
                    setShowRejectModal(false);
                    setSelectedPayment(null);
                    setRejectNotes('');
                  }}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <X className="h-5 w-5 text-gray-500" />
                </button>
              </div>
              <div className="p-6">
                <div className="flex items-start gap-4 mb-6">
                  <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center flex-shrink-0">
                    <XCircle className="h-6 w-6 text-red-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">Reject Payment</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      Are you sure you want to reject this payment from {selectedPayment.user_name}? The student will be notified and can resubmit.
                    </p>
                  </div>
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Reason for rejection <span className="text-gray-400">(Optional)</span>
                  </label>
                  <textarea
                    value={rejectNotes}
                    onChange={(e) => setRejectNotes(e.target.value)}
                    placeholder="Explain why the payment is being rejected..."
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-red-500 dark:bg-gray-700 dark:text-white resize-none"
                  />
                </div>
                <div className="flex gap-4">
                  <button
                    onClick={() => {
                      setShowRejectModal(false);
                      setSelectedPayment(null);
                      setRejectNotes('');
                    }}
                    className="flex-1 px-6 py-3 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl font-semibold hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleReject}
                    disabled={processing}
                    className="flex-1 px-6 py-3 bg-red-600 text-white rounded-xl font-semibold hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {processing ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        Processing...
                      </>
                    ) : (
                      <>
                        <X className="h-5 w-5" />
                        Reject
                      </>
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminPayments;
