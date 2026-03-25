import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Upload, Trash2, Edit, FileText, Download, X, Save } from 'lucide-react';
import { handoutAPI, coursesAPI } from '../services/api';
import { toast } from 'react-toastify';

const AdminCourseHandouts = () => {
  const { courseId } = useParams();
  const [course, setCourse] = useState(null);
  const [handouts, setHandouts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingHandout, setEditingHandout] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    file: null
  });

  useEffect(() => {
    fetchData();
  }, [courseId]);

  const fetchData = async () => {
    try {
      const [courseRes, handoutsRes] = await Promise.all([
        coursesAPI.getOne(courseId),
        handoutAPI.getByCourse(courseId)
      ]);
      setCourse(courseRes.data);
      setHandouts(handoutsRes.data);
    } catch (error) {
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        toast.error('File size must be less than 10MB');
        return;
      }
      setFormData({ ...formData, file });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.title) {
      toast.error('Title is required');
      return;
    }

    if (!editingHandout && !formData.file) {
      toast.error('File is required');
      return;
    }

    setUploading(true);
    try {
      if (editingHandout) {
        await handoutAPI.update(editingHandout.id, {
          title: formData.title,
          description: formData.description
        });
        toast.success('Handout updated successfully');
      } else {
        await handoutAPI.add(courseId, {
          title: formData.title,
          description: formData.description,
          file: formData.file
        });
        toast.success('Handout added successfully');
      }
      setShowModal(false);
      setEditingHandout(null);
      setFormData({ title: '', description: '', file: null });
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save handout');
    } finally {
      setUploading(false);
    }
  };

  const handleEdit = (handout) => {
    setEditingHandout(handout);
    setFormData({
      title: handout.title,
      description: handout.description || '',
      file: null
    });
    setShowModal(true);
  };

  const handleDelete = async (handoutId) => {
    if (!window.confirm('Are you sure you want to delete this handout?')) return;
    
    try {
      await handoutAPI.delete(handoutId);
      toast.success('Handout deleted successfully');
      fetchData();
    } catch (error) {
      toast.error('Failed to delete handout');
    }
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return 'N/A';
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const getFileIcon = (fileType) => {
    if (fileType?.includes('pdf')) return '📄';
    if (fileType?.includes('word') || fileType?.includes('document')) return '📝';
    if (fileType?.includes('excel') || fileType?.includes('sheet')) return '📊';
    if (fileType?.includes('image')) return '🖼️';
    return '📁';
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <button
            onClick={() => window.history.back()}
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 mb-6"
          >
            <ArrowLeft className="h-5 w-5" />
            <span>Back</span>
          </button>

          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Course Handouts</h1>
              <p className="text-gray-600 mt-1">{course?.title}</p>
            </div>
            <button
              onClick={() => {
                setEditingHandout(null);
                setFormData({ title: '', description: '', file: null });
                setShowModal(true);
              }}
              className="bg-primary-600 text-white px-6 py-3 rounded-xl hover:bg-primary-700 transition-colors flex items-center space-x-2 shadow-lg"
            >
              <Upload className="h-5 w-5" />
              <span>Add Handout</span>
            </button>
          </div>

          {handouts.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
              <FileText className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No handouts yet</h3>
              <p className="text-gray-600 mb-6">Upload handouts for students to download</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {handouts.map((handout, index) => (
                <motion.div
                  key={handout.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow"
                >
                  <div className="flex items-start space-x-4 mb-4">
                    <div className="text-4xl">{getFileIcon(handout.file_type)}</div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 truncate">{handout.title}</h3>
                      <p className="text-sm text-gray-500">{formatFileSize(handout.file_size)}</p>
                    </div>
                  </div>
                  
                  {handout.description && (
                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                      {handout.description}
                    </p>
                  )}

                  <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                    <a
                      href={`http://localhost:5000${handout.file_path}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center space-x-2 text-primary-600 hover:text-primary-700"
                    >
                      <Download className="h-4 w-4" />
                      <span className="text-sm font-medium">Download</span>
                    </a>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleEdit(handout)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(handout.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl shadow-2xl w-full max-w-lg"
          >
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">
                {editingHandout ? 'Edit Handout' : 'Add New Handout'}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Title *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="Enter handout title"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="Enter description (optional)"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  File {!editingHandout && '*'}
                </label>
                <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg hover:border-primary-500 transition-colors">
                  <div className="space-y-2 text-center">
                    {formData.file ? (
                      <div className="flex items-center justify-center space-x-2">
                        <FileText className="h-8 w-8 text-primary-600" />
                        <span className="text-sm text-gray-600">{formData.file.name}</span>
                      </div>
                    ) : editingHandout ? (
                      <div className="text-sm text-gray-500">
                        <p>Current file: {editingHandout.title}</p>
                        <p className="mt-1">Upload new file to replace</p>
                      </div>
                    ) : (
                      <>
                        <Upload className="mx-auto h-12 w-12 text-gray-400" />
                        <div className="text-sm text-gray-600">
                          <label className="cursor-pointer text-primary-600 hover:text-primary-500">
                            <span>Upload a file</span>
                            <input
                              type="file"
                              onChange={handleFileChange}
                              className="hidden"
                              accept=".pdf,.doc,.docx,.xls,.xlsx,.txt,.jpg,.jpeg,.png,.gif"
                            />
                          </label>
                          <p className="mt-1">or drag and drop</p>
                        </div>
                        <p className="text-xs text-gray-500">PDF, DOC, DOCX, XLS, XLSX, TXT, JPG, PNG up to 10MB</p>
                      </>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={uploading}
                  className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 flex items-center space-x-2"
                >
                  <Save className="h-4 w-4" />
                  <span>{uploading ? 'Saving...' : 'Save'}</span>
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default AdminCourseHandouts;
