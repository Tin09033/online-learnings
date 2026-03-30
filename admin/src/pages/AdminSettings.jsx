import { useState, useEffect } from 'react';
import { User, Lock, Bell, Moon, Sun, Shield, Save, CreditCard, Upload, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { authAPI, paymentsAPI } from '../services/api';
import { toast } from 'react-toastify';
import { getQrCodeUrl } from '../utils/apiUrl';

const AdminSettings = () => {
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();
  
  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    email: user?.email || '',
  });
  
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  
  const [notifications, setNotifications] = useState({
    emailNotifications: true,
    newUserAlerts: true,
    newEnrollmentAlerts: true,
    courseUpdates: true,
  });

  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');

  const [paymentSettings, setPaymentSettings] = useState({
    bank_name: '',
    account_name: '',
    account_number: '',
    amount: '',
    instructions: '',
  });
  const [qrCodeFile, setQrCodeFile] = useState(null);
  const [qrCodePreview, setQrCodePreview] = useState(null);
  const [currentQrCode, setCurrentQrCode] = useState(null);

  useEffect(() => {
    if (activeTab === 'payment') {
      fetchPaymentSettings();
    }
  }, [activeTab]);

  const fetchPaymentSettings = async () => {
    try {
      const response = await paymentsAPI.getBankDetails();
      if (response.data) {
        setPaymentSettings({
          bank_name: response.data.bank_name || '',
          account_name: response.data.account_name || '',
          account_number: response.data.account_number || '',
          amount: response.data.amount || '',
          instructions: response.data.instructions || '',
        });
        if (response.data.qr_code_path) {
          setCurrentQrCode(response.data.qr_code_path);
        }
      }
    } catch (error) {
      console.error('Failed to fetch payment settings');
    }
  };

  const handleQrCodeChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('File size must be less than 5MB');
        return;
      }
      setQrCodeFile(file);
      if (qrCodePreview) {
        URL.revokeObjectURL(qrCodePreview);
      }
      setQrCodePreview(URL.createObjectURL(file));
    }
  };

  const handlePaymentSettingsUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('bank_name', paymentSettings.bank_name);
      formData.append('account_name', paymentSettings.account_name);
      formData.append('account_number', paymentSettings.account_number);
      formData.append('amount', paymentSettings.amount);
      formData.append('instructions', paymentSettings.instructions);
      if (qrCodeFile) {
        formData.append('qr_code', qrCodeFile);
      }

      await paymentsAPI.updatePaymentSettings(formData);
      toast.success('Payment settings updated successfully');
      setQrCodeFile(null);
      fetchPaymentSettings();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update payment settings');
    } finally {
      setLoading(false);
    }
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await authAPI.updateProfile(profileData);
      toast.success('Profile updated successfully');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    
    if (passwordData.newPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    
    setLoading(true);
    try {
      await authAPI.changePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      });
      toast.success('Password changed successfully');
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to change password');
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: 'profile', label: 'Profile', icon: <User className="h-5 w-5" /> },
    { id: 'security', label: 'Security', icon: <Lock className="h-5 w-5" /> },
    { id: 'notifications', label: 'Notifications', icon: <Bell className="h-5 w-5" /> },
    { id: 'payment', label: 'Payment', icon: <CreditCard className="h-5 w-5" /> },
    { id: 'appearance', label: 'Appearance', icon: theme === 'light' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" /> },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Settings</h1>
        <p className="text-gray-600 dark:text-gray-400">Manage your account settings</p>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm overflow-hidden transition-colors">
        <div className="md:flex">
          <div className="md:w-64 bg-gray-50 dark:bg-gray-700/50 p-6 border-r border-gray-200 dark:border-gray-700">
            <nav className="space-y-1">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-colors ${
                    activeTab === tab.id
                      ? 'bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400'
                      : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  {tab.icon}
                  <span className="font-medium">{tab.label}</span>
                </button>
              ))}
            </nav>
          </div>

          <div className="flex-1 p-6">
            {activeTab === 'profile' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Profile Information</h2>
                  <form onSubmit={handleProfileUpdate} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Full Name
                      </label>
                      <input
                        type="text"
                        value={profileData.name}
                        onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Email Address
                      </label>
                      <input
                        type="email"
                        value={profileData.email}
                        onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={loading}
                      className="bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 flex items-center space-x-2"
                    >
                      <Save className="h-4 w-4" />
                      <span>Save Changes</span>
                    </button>
                  </form>
                </div>

                <div className="pt-6 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex items-center space-x-4">
                    <div className="w-20 h-20 bg-primary-100 dark:bg-primary-900/50 rounded-full flex items-center justify-center">
                      <span className="text-3xl font-bold text-primary-600 dark:text-primary-400">
                        {user?.name?.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white">{user?.name}</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Administrator</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Member since {user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'security' && (
              <div className="space-y-6">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Change Password</h2>
                <form onSubmit={handlePasswordChange} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Current Password
                    </label>
                    <input
                      type="password"
                      value={passwordData.currentPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      New Password
                    </label>
                    <input
                      type="password"
                      value={passwordData.newPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Confirm New Password
                    </label>
                    <input
                      type="password"
                      value={passwordData.confirmPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
                      required
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={loading}
                    className="bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 flex items-center space-x-2"
                  >
                    <Lock className="h-4 w-4" />
                    <span>Update Password</span>
                  </button>
                </form>

                <div className="pt-6 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex items-start space-x-4">
                    <div className="p-3 bg-yellow-100 dark:bg-yellow-900/30 rounded-xl">
                      <Shield className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white">Two-Factor Authentication</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        Add an extra layer of security to your account by enabling two-factor authentication.
                      </p>
                      <button className="mt-3 text-sm text-primary-600 hover:text-primary-700 font-medium">
                        Enable 2FA
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'notifications' && (
              <div className="space-y-6">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Notification Preferences</h2>
                <div className="space-y-4">
                  {[
                    { key: 'emailNotifications', label: 'Email Notifications', description: 'Receive notifications via email' },
                    { key: 'newUserAlerts', label: 'New User Alerts', description: 'Get notified when new users register' },
                    { key: 'newEnrollmentAlerts', label: 'New Enrollment Alerts', description: 'Get notified when students enroll' },
                    { key: 'courseUpdates', label: 'Course Updates', description: 'Updates about course content changes' },
                  ].map((item) => (
                    <div key={item.key} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                      <div>
                        <h3 className="font-medium text-gray-900 dark:text-white">{item.label}</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{item.description}</p>
                      </div>
                      <button
                        onClick={() => setNotifications({ ...notifications, [item.key]: !notifications[item.key] })}
                        className={`relative w-12 h-6 rounded-full transition-colors ${
                          notifications[item.key] ? 'bg-primary-600' : 'bg-gray-300 dark:bg-gray-600'
                        }`}
                      >
                        <span
                          className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                            notifications[item.key] ? 'left-7' : 'left-1'
                          }`}
                        />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'payment' && (
              <div className="space-y-6">
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4 mb-6">
                  <h3 className="font-semibold text-blue-900 dark:text-blue-300 mb-1">Philippine Payment Methods</h3>
                  <p className="text-sm text-blue-700 dark:text-blue-400">
                    Configure your Philippine payment details. Students can pay via GCash, PayMaya, Maya, BDO, BPI, and UnionBank.
                  </p>
                </div>
                
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Payment Settings</h2>
                
                <form onSubmit={handlePaymentSettingsUpdate} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Account Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={paymentSettings.account_name}
                        onChange={(e) => setPaymentSettings({ ...paymentSettings, account_name: e.target.value })}
                        placeholder="e.g., Juan Dela Cruz"
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Account Number <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={paymentSettings.account_number}
                        onChange={(e) => setPaymentSettings({ ...paymentSettings, account_number: e.target.value })}
                        placeholder="e.g., 09123456789 or 1234567890"
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Bank / E-Wallet Name
                      </label>
                      <input
                        type="text"
                        value={paymentSettings.bank_name}
                        onChange={(e) => setPaymentSettings({ ...paymentSettings, bank_name: e.target.value })}
                        placeholder="e.g., GCash, BDO, UnionBank"
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Default Course Fee (PHP)
                      </label>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">₱</span>
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          value={paymentSettings.amount}
                          onChange={(e) => setPaymentSettings({ ...paymentSettings, amount: e.target.value })}
                          placeholder="e.g., 5000.00"
                          className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      QR Code Image
                    </label>
                    <div className="flex flex-col md:flex-row gap-4 items-start">
                      {(qrCodePreview || currentQrCode) && (
                        <div className="relative">
                          <img
                            src={qrCodePreview || getQrCodeUrl(currentQrCode)}
                            alt="QR Code Preview"
                            className="w-32 h-32 object-contain rounded-lg border border-gray-300 dark:border-gray-600"
                          />
                          {qrCodePreview && (
                            <button
                              type="button"
                              onClick={() => {
                                setQrCodeFile(null);
                                setQrCodePreview(null);
                              }}
                              className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                      )}
                      <label className="flex flex-col items-center justify-center w-32 h-32 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer hover:border-primary-500 transition-colors">
                        <Upload className="h-8 w-8 text-gray-400 mb-1" />
                        <span className="text-xs text-gray-500">Upload QR</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleQrCodeChange}
                          className="hidden"
                        />
                      </label>
                    </div>
                    <p className="text-xs text-gray-500 mt-2">Supported formats: JPG, PNG (max 5MB)</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Additional Instructions (Optional)
                    </label>
                    <textarea
                      value={paymentSettings.instructions}
                      onChange={(e) => setPaymentSettings({ ...paymentSettings, instructions: e.target.value })}
                      placeholder="Any special instructions for students..."
                      rows={3}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white resize-none"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 flex items-center space-x-2"
                  >
                    <Save className="h-4 w-4" />
                    <span>Save Payment Settings</span>
                  </button>
                </form>
              </div>
            )}

            {activeTab === 'appearance' && (
              <div className="space-y-6">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Appearance Settings</h2>
                <div className="space-y-4">
                  <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium text-gray-900 dark:text-white">Dark Mode</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Switch between light and dark themes</p>
                      </div>
                      <button
                        onClick={toggleTheme}
                        className={`relative w-12 h-6 rounded-full transition-colors ${
                          theme === 'dark' ? 'bg-primary-600' : 'bg-gray-300 dark:bg-gray-600'
                        }`}
                      >
                        <span
                          className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                            theme === 'dark' ? 'left-7' : 'left-1'
                          }`}
                        />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminSettings;
