import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Upload, CreditCard, Smartphone, FileText, Check, AlertCircle, Image, QrCode, Copy, CheckCircle } from 'lucide-react';
import { paymentsAPI, enrollmentsAPI } from '../services/api';
import { toast } from 'react-toastify';

const PaymentUploadModal = ({ isOpen, onClose, enrollment, courseAmount, onSuccess, onEnrollSuccess }) => {
  const [notes, setNotes] = useState('');
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [existingPayment, setExistingPayment] = useState(null);
  const [isNewEnrollment, setIsNewEnrollment] = useState(false);
  const [bankDetails, setBankDetails] = useState(null);
  const [copied, setCopied] = useState(false);
  const [loadingBankDetails, setLoadingBankDetails] = useState(false);
  const [currentEnrollmentId, setCurrentEnrollmentId] = useState(null);

  useEffect(() => {
    if (isOpen && enrollment) {
      setIsNewEnrollment(!enrollment?.id || enrollment.id === null);
      setCurrentEnrollmentId(enrollment?.id || null);
      if (enrollment?.id) {
        fetchExistingPayment();
      } else {
        setExistingPayment(null);
        setPreview(null);
        setFile(null);
        setNotes('');
      }
      fetchBankDetails();
    }
    if (!isOpen) {
      setIsNewEnrollment(false);
      setCurrentEnrollmentId(null);
      setExistingPayment(null);
      setNotes('');
      setFile(null);
      setPreview(null);
    }
  }, [isOpen, enrollment?.id]);

  useEffect(() => {
    return () => {
      if (preview) {
        URL.revokeObjectURL(preview);
      }
    };
  }, [preview]);

  const fetchBankDetails = async () => {
    setLoadingBankDetails(true);
    try {
      const response = await paymentsAPI.getBankDetails();
      if (response.data) {
        setBankDetails(response.data);
      }
    } catch (error) {
      console.error('Failed to fetch bank details');
    } finally {
      setLoadingBankDetails(false);
    }
  };

  const fetchExistingPayment = async () => {
    if (!enrollment?.id) return;
    try {
      const response = await paymentsAPI.getByEnrollment(enrollment.id);
      if (response.data) {
        setExistingPayment(response.data);
        setNotes(response.data.notes || '');
        if (response.data.proof_path) {
          setPreview(`http://localhost:5000${response.data.proof_path}`);
        }
      }
    } catch (error) {
      setExistingPayment(null);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast.success('Copied to clipboard!');
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      if (selectedFile.size > 10 * 1024 * 1024) {
        toast.error('File size must be less than 10MB');
        return;
      }
      setFile(selectedFile);
      if (preview) {
        URL.revokeObjectURL(preview);
      }
      setPreview(URL.createObjectURL(selectedFile));
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      if (droppedFile.size > 10 * 1024 * 1024) {
        toast.error('File size must be less than 10MB');
        return;
      }
      setFile(droppedFile);
      if (preview) {
        URL.revokeObjectURL(preview);
      }
      setPreview(URL.createObjectURL(droppedFile));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!file) {
      toast.error('Please upload payment proof');
      return;
    }

    setUploading(true);
    try {
      let enrollmentId = currentEnrollmentId;

      if (!enrollmentId) {
        const courseId = enrollment?.course_id || enrollment?.id;
        if (!courseId) {
          toast.error('Course not found');
          setUploading(false);
          return;
        }

        const enrollResponse = await enrollmentsAPI.enroll({ course_id: courseId });
        enrollmentId = enrollResponse.data.enrollment?.id;
        
        if (!enrollmentId) {
          toast.error('Failed to create enrollment');
          setUploading(false);
          return;
        }
        
        setCurrentEnrollmentId(enrollmentId);
        onEnrollSuccess?.(enrollResponse.data);
      }

      const formData = new FormData();
      formData.append('enrollment_id', enrollmentId);
      formData.append('payment_method', 'bank_transfer');
      if (bankDetails?.account_number) formData.append('reference_number', bankDetails.account_number);
      const amountToUse = (enrollment?.amount !== undefined && enrollment?.amount !== null && enrollment?.amount !== '') 
        ? enrollment.amount 
        : (courseAmount !== undefined && courseAmount !== null && courseAmount !== '') 
          ? courseAmount 
          : bankDetails?.amount;
      if (amountToUse) formData.append('amount', amountToUse);
      if (notes) formData.append('notes', notes);
      formData.append('proof', file);

      await paymentsAPI.upload(formData);
      toast.success('Enrollment and payment submitted successfully! Pending verification.');
      onSuccess?.();
      onClose();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to submit enrollment and payment');
    } finally {
      setUploading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
        >
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
          
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
          >
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between rounded-t-2xl">
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  {isNewEnrollment ? 'Enroll & Submit Payment' : 'Upload Payment Proof'}
                </h2>
                {existingPayment && (
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium mt-1 ${
                    existingPayment.status === 'verified' ? 'bg-green-100 text-green-700' :
                    existingPayment.status === 'rejected' ? 'bg-red-100 text-red-700' :
                    'bg-yellow-100 text-yellow-700'
                  }`}>
                    {existingPayment.status === 'verified' ? 'Verified' :
                     existingPayment.status === 'rejected' ? 'Rejected - Resubmit' :
                     'Pending Verification'}
                  </span>
                )}
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="h-5 w-5 text-gray-500" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                <div className="flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
                  <div>
                    <p className="text-sm text-blue-800 font-medium">Course: {enrollment?.title}</p>
                    <p className="text-xs text-blue-600 mt-1">
                      {isNewEnrollment 
                        ? 'Complete your enrollment by submitting payment proof. Your enrollment will be pending until payment is verified by admin.'
                        : 'Please upload a clear image of your payment receipt or transaction confirmation.'}
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">Payment Method</label>
                <div className="flex items-center gap-3 p-4 bg-primary-50 border-2 border-primary-600 rounded-xl">
                  <div className="p-2 bg-primary-100 rounded-lg">
                    <CreditCard className="h-6 w-6 text-primary-600" />
                  </div>
                  <div className="flex-1">
                    <span className="font-semibold text-primary-900">Bank Transfer</span>
                    <p className="text-xs text-primary-700">Pay via QR code or bank transfer</p>
                  </div>
                  <CheckCircle className="h-5 w-5 text-primary-600" />
                </div>
              </div>

              {loadingBankDetails ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
                </div>
              ) : bankDetails ? (
                <div className="space-y-4">
                  <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl p-6 text-white shadow-lg">
                    <div className="flex flex-col items-center text-center">
                      <p className="text-white/80 text-sm mb-1">Total Amount to Pay</p>
                      <p className="text-4xl font-bold mb-2">
                        ₱{parseFloat((courseAmount !== undefined && courseAmount !== null && courseAmount !== '') ? courseAmount : bankDetails?.amount || 0).toFixed(2)}
                      </p>
                      <p className="text-white/80 text-xs">Please pay the exact amount</p>
                    </div>
                  </div>

                  {bankDetails.qr_code_path && (
                    <div className="bg-white border-2 border-dashed border-green-300 rounded-xl p-6 text-center">
                      <p className="text-sm font-medium text-gray-700 mb-4">Scan QR Code to Pay</p>
                      <div className="flex justify-center">
                        <img
                          src={`http://localhost:5000${bankDetails.qr_code_path}`}
                          alt="Payment QR Code"
                          className="w-full max-w-xs h-auto object-cover rounded-lg shadow-md bg-white p-2"
                        />
                      </div>
                    </div>
                  )}

                  <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                    <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
                      <h4 className="font-bold text-gray-900">Bank Transfer Details</h4>
                    </div>
                    <div className="p-4 space-y-3">
                      {bankDetails.bank_name && (
                        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                          <div>
                            <p className="text-xs text-gray-500">Bank Name</p>
                            <p className="font-bold text-gray-900">{bankDetails.bank_name}</p>
                          </div>
                          <button
                            onClick={() => copyToClipboard(bankDetails.bank_name)}
                            className="p-2 text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                            title="Copy"
                          >
                            {copied ? <Check className="h-5 w-5 text-green-500" /> : <Copy className="h-5 w-5" />}
                          </button>
                        </div>
                      )}
                      
                      {bankDetails.payment_network && (
                        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                          <div>
                            <p className="text-xs text-gray-500">Payment Network</p>
                            <p className="font-bold text-gray-900">{bankDetails.payment_network}</p>
                          </div>
                          <button
                            onClick={() => copyToClipboard(bankDetails.payment_network)}
                            className="p-2 text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                            title="Copy"
                          >
                            {copied ? <Check className="h-5 w-5 text-green-500" /> : <Copy className="h-5 w-5" />}
                          </button>
                        </div>
                      )}
                      
                      {bankDetails.account_name && (
                        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                          <div>
                            <p className="text-xs text-gray-500">Account Name</p>
                            <p className="font-bold text-gray-900">{bankDetails.account_name}</p>
                          </div>
                          <button
                            onClick={() => copyToClipboard(bankDetails.account_name)}
                            className="p-2 text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                            title="Copy"
                          >
                            {copied ? <Check className="h-5 w-5 text-green-500" /> : <Copy className="h-5 w-5" />}
                          </button>
                        </div>
                      )}
                      
                      {bankDetails.account_number && (
                        <div className="flex items-center justify-between p-3 bg-primary-50 rounded-lg hover:bg-primary-100 transition-colors border-2 border-primary-200">
                          <div>
                            <p className="text-xs text-primary-600 font-medium">Account Number</p>
                            <p className="font-bold text-primary-700 text-lg tracking-wide">{bankDetails.account_number}</p>
                          </div>
                          <button
                            onClick={() => copyToClipboard(bankDetails.account_number)}
                            className="p-2 bg-primary-600 text-white hover:bg-primary-700 rounded-lg transition-colors shadow-sm"
                            title="Copy Account Number"
                          >
                            {copied ? <Check className="h-5 w-5" /> : <Copy className="h-5 w-5" />}
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 rounded-xl">
                    <AlertCircle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-amber-800">Important Reminder</p>
                      <p className="text-xs text-amber-700 mt-1">
                        After completing the payment, take a clear screenshot or photo of your payment receipt/confirmation and upload it below for verification.
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-gray-50 border border-gray-200 rounded-xl p-8 text-center">
                  <QrCode className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 font-medium">Payment instructions not available</p>
                  <p className="text-xs text-gray-500 mt-2">Please contact support for payment details</p>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Payment Proof <span className="text-red-500">*</span>
                </label>
                <div
                  onDrop={handleDrop}
                  onDragOver={(e) => e.preventDefault()}
                  className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-primary-400 transition-colors cursor-pointer"
                >
                  {preview ? (
                    <div className="relative">
                      <img
                        src={preview}
                        alt="Payment proof preview"
                        className="max-h-48 mx-auto rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setFile(null);
                          setPreview(null);
                        }}
                        className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ) : (
                    <>
                      <Upload className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                      <p className="text-sm text-gray-600 mb-2">
                        Drag and drop your payment proof here, or
                      </p>
                      <label className="cursor-pointer">
                        <span className="text-primary-600 font-medium hover:text-primary-700">
                          browse files
                        </span>
                        <input
                          type="file"
                          accept="image/*,.pdf"
                          onChange={handleFileChange}
                          className="hidden"
                        />
                      </label>
                      <p className="text-xs text-gray-500 mt-2">
                        Supports: JPG, PNG, PDF (max 10MB)
                      </p>
                    </>
                  )}
                </div>
                {file && (
                  <div className="mt-2 flex items-center gap-2 text-sm text-gray-600">
                    <Check className="h-4 w-4 text-green-500" />
                    <span>{file.name}</span>
                    <span className="text-gray-400">({(file.size / 1024 / 1024).toFixed(2)} MB)</span>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Notes <span className="text-gray-400">(Optional)</span>
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Any additional information about your payment..."
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all resize-none"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={uploading || !file}
                  className="flex-1 px-6 py-3 bg-primary-600 text-white rounded-xl font-semibold hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {uploading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      Processing...
                    </>
                  ) : (
                    <>
                      <Upload className="h-5 w-5" />
                      {isNewEnrollment ? 'Enroll & Submit' : 'Upload Proof'}
                    </>
                  )}
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default PaymentUploadModal;
