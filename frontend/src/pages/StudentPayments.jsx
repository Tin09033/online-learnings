import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { CreditCard, Upload, CheckCircle, Clock, XCircle, FileText, AlertCircle, Copy, Building2, Smartphone, QrCode, Banknote } from 'lucide-react';
import { paymentsAPI, enrollmentsAPI } from '../services/api';
import { toast } from 'react-toastify';

const StudentPayments = () => {
  const [payments, setPayments] = useState([]);
  const [enrollments, setEnrollments] = useState([]);
  const [paymentSettings, setPaymentSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('history');
  const [showPaymentInfo, setShowPaymentInfo] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState('gcash');
  const [uploadData, setUploadData] = useState({
    enrollment_id: '',
    amount: '',
    payment_method: 'gcash',
    reference_number: '',
    notes: '',
    receipt: null
  });
  const fileInputRef = useRef(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [paymentsRes, enrollmentsRes, settingsRes] = await Promise.all([
        paymentsAPI.getMy(),
        enrollmentsAPI.getMy(),
        paymentsAPI.getBankDetails()
      ]);
      setPayments(paymentsRes.data);
      setEnrollments(enrollmentsRes.data.filter(e => e.status === 'pending'));
      setPaymentSettings(settingsRes.data);
    } catch (error) {
      console.error('Error fetching payments:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('File size must be less than 5MB');
        return;
      }
      setUploadData({ ...uploadData, receipt: file });
    }
  };

  const handleSubmitPayment = async (e) => {
    e.preventDefault();
    if (!uploadData.enrollment_id) {
      toast.error('Please select a course');
      return;
    }
    if (!uploadData.amount) {
      toast.error('Please enter payment amount');
      return;
    }
    if (!uploadData.reference_number) {
      toast.error('Please enter reference number');
      return;
    }
    if (!uploadData.receipt) {
      toast.error('Please upload payment screenshot');
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('enrollment_id', uploadData.enrollment_id);
      formData.append('amount', uploadData.amount);
      formData.append('payment_method', uploadData.payment_method);
      formData.append('reference_number', uploadData.reference_number);
      formData.append('notes', uploadData.notes);
      formData.append('receipt', uploadData.receipt);

      await paymentsAPI.upload(formData);
      toast.success('Payment submitted successfully! Awaiting verification.');
      setUploadData({
        enrollment_id: '',
        amount: '',
        payment_method: 'gcash',
        reference_number: '',
        notes: '',
        receipt: null
      });
      if (fileInputRef.current) fileInputRef.current.value = '';
      fetchData();
      setActiveTab('history');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to submit payment');
    } finally {
      setUploading(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard!');
  };

  const getStatusStyles = (status) => {
    switch (status) {
      case 'verified':
        return { bg: 'bg-green-100 dark:bg-green-900/30', text: 'text-green-700 dark:text-green-400', icon: CheckCircle };
      case 'pending':
        return { bg: 'bg-yellow-100 dark:bg-yellow-900/30', text: 'text-yellow-700 dark:text-yellow-400', icon: Clock };
      case 'rejected':
        return { bg: 'bg-red-100 dark:bg-red-900/30', text: 'text-red-700 dark:text-red-400', icon: XCircle };
      default:
        return { bg: 'bg-gray-100 dark:bg-gray-700', text: 'text-gray-700 dark:text-gray-400', icon: AlertCircle };
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP'
    }).format(amount);
  };

  const paymentMethods = [
    {
      id: 'gcash',
      name: 'GCash',
      icon: Smartphone,
      color: 'bg-blue-500',
      description: 'Pay using GCash e-wallet'
    },
    {
      id: 'paymaya',
      name: 'PayMaya',
      icon: Smartphone,
      color: 'bg-pink-500',
      description: 'Pay using PayMaya e-wallet'
    },
    {
      id: 'bdo',
      name: 'BDO Bank',
      icon: Building2,
      color: 'bg-blue-700',
      description: 'Bank transfer via BDO'
    },
    {
      id: 'bpi',
      name: 'BPI Bank',
      icon: Building2,
      color: 'bg-red-600',
      description: 'Bank transfer via BPI'
    },
    {
      id: 'unionbank',
      name: 'UnionBank',
      icon: Building2,
      color: 'bg-orange-500',
      description: 'Bank transfer via UnionBank'
    },
    {
      id: 'maya',
      name: 'Maya',
      icon: Smartphone,
      color: 'bg-green-500',
      description: 'Pay using Maya e-wallet'
    }
  ];

  const getMethodDetails = (method) => {
    const settings = paymentSettings || {};
    switch (method) {
      case 'gcash':
        return {
          name: 'GCash',
          accountName: settings.account_name || 'LearnHub',
          accountNumber: settings.account_number || '09123456789',
          instructions: 'Send payment to the GCash number above. Use your email as the reference.'
        };
      case 'paymaya':
      case 'maya':
        return {
          name: 'Maya',
          accountName: settings.account_name || 'LearnHub',
          accountNumber: settings.account_number || '09123456789',
          instructions: 'Send payment to the Maya number above. Use your name as the reference.'
        };
      case 'bdo':
        return {
          name: 'BDO',
          accountName: settings.account_name || 'LearnHub Inc.',
          accountNumber: settings.account_number || '1234567890',
          instructions: 'Transfer to the BDO account above. Use your name and course as reference.'
        };
      case 'bpi':
        return {
          name: 'BPI',
          accountName: settings.account_name || 'LearnHub Inc.',
          accountNumber: settings.account_number || '1234567890',
          instructions: 'Transfer to the BPI account above. Use your name and course as reference.'
        };
      case 'unionbank':
        return {
          name: 'UnionBank',
          accountName: settings.account_name || 'LearnHub Inc.',
          accountNumber: settings.account_number || '1234567890',
          instructions: 'Transfer to the UnionBank account above. Use your name and course as reference.'
        };
      default:
        return {
          name: method,
          accountName: settings.account_name || 'LearnHub',
          accountNumber: settings.account_number || 'Contact support',
          instructions: 'Please contact support for payment details.'
        };
    }
  };

  const totalPending = payments.filter(p => p.status === 'pending').reduce((sum, p) => sum + (parseFloat(p.amount) || 0), 0);
  const totalVerified = payments.filter(p => p.status === 'verified').reduce((sum, p) => sum + (parseFloat(p.amount) || 0), 0);

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Payments</h1>
        <p className="text-gray-500 dark:text-gray-400">Manage your course payments securely via Philippine payment methods</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4"
        >
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center">
              <CreditCard className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{payments.length}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Total Payments</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4"
        >
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-yellow-100 dark:bg-yellow-900/30 rounded-xl flex items-center justify-center">
              <Clock className="h-6 w-6 text-yellow-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{formatCurrency(totalPending)}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Pending</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4"
        >
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{formatCurrency(totalVerified)}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Verified</p>
            </div>
          </div>
        </motion.div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm mb-6">
        {activeTab === 'history' && (
          <div className="overflow-x-auto">
            {loading ? (
              <div className="p-12 text-center">
                <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
                <p className="text-gray-500 dark:text-gray-400">Loading payments...</p>
              </div>
            ) : payments.length === 0 ? (
              <div className="p-12 text-center">
                <CreditCard className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No payments yet</h3>
                <p className="text-gray-500 dark:text-gray-400">You haven't made any payments</p>
              </div>
            ) : (
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-700/50">
                  <tr className="text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">
                    <th className="px-6 py-4">Course</th>
                    <th className="px-6 py-4">Amount</th>
                    <th className="px-6 py-4">Method</th>
                    <th className="px-6 py-4">Reference</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                  {payments.map((payment) => {
                    const statusStyles = getStatusStyles(payment.status);
                    const StatusIcon = statusStyles.icon;
                    return (
                      <tr key={payment.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                        <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">
                          {payment.course_title || `Payment #${payment.id}`}
                        </td>
                        <td className="px-6 py-4 font-bold text-green-600 dark:text-green-400">
                          {formatCurrency(payment.amount)}
                        </td>
                        <td className="px-6 py-4">
                          <span className="inline-flex items-center gap-1 px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full text-xs font-medium capitalize">
                            {payment.payment_method?.replace('_', ' ')}
                          </span>
                        </td>
                        <td className="px-6 py-4 font-mono text-sm text-gray-600 dark:text-gray-400">
                          {payment.reference_number || '-'}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${statusStyles.bg} ${statusStyles.text}`}>
                            <StatusIcon className="h-3 w-3" />
                            {payment.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                          {new Date(payment.created_at).toLocaleDateString('en-PH', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                          })}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentPayments;
