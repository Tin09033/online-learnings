import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Trash2, Save, Image as ImageIcon, Plus, Edit, Play, FileText, Eye, EyeOff, AlertTriangle, CheckCircle, Upload, Download } from 'lucide-react';
import { coursesAPI, lessonsAPI, handoutAPI } from '../services/api';
import { toast } from 'react-toastify';
import { getUploadUrl, getHandoutUrl } from '../utils/apiUrl';

const CourseEditor = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = Boolean(id);

  const [course, setCourse] = useState({
    title: '',
    description: '',
    amount: '',
    status: 'draft',
    image: null,
    existingImage: ''
  });
  const [loading, setLoading] = useState(Boolean(id));
  const [saving, setSaving] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);

  const [lessons, setLessons] = useState([]);
  const [loadingLessons, setLoadingLessons] = useState(false);
  const [showLessonModal, setShowLessonModal] = useState(false);
  const [editingLesson, setEditingLesson] = useState(null);
  const [lessonForm, setLessonForm] = useState({
    title: '',
    content: '',
    video_url: '',
    order_num: 1
  });
  const [savingLesson, setSavingLesson] = useState(false);
  const [deleteLessonModal, setDeleteLessonModal] = useState(false);
  const [lessonToDelete, setLessonToDelete] = useState(null);
  const [deletingLesson, setDeletingLesson] = useState(false);

  const [handouts, setHandouts] = useState([]);
  const [loadingHandouts, setLoadingHandouts] = useState(false);
  const [showHandoutModal, setShowHandoutModal] = useState(false);
  const [handoutForm, setHandoutForm] = useState({ title: '', file: null });
  const [uploadingHandout, setUploadingHandout] = useState(false);

  useEffect(() => {
    if (isEditing && id) {
      fetchCourse();
      fetchLessons();
      fetchHandouts();
    } else {
      setLoading(false);
    }
  }, [id]);

  const fetchCourse = async () => {
    if (!id) return;
    try {
      const response = await coursesAPI.getOne(id);
      const courseData = response.data;
      setCourse({
        title: courseData.title || '',
        description: courseData.description || '',
        amount: courseData.amount || '',
        status: courseData.status || 'draft',
        existingImage: courseData.image || ''
      });
      if (courseData.image) {
        setImagePreview(courseData.image);
      }
    } catch (error) {
      toast.error('Failed to load course');
      navigate('/courses', { state: { refresh: true } });
    } finally {
      setLoading(false);
    }
  };

  const fetchLessons = async () => {
    if (!id) return;
    setLoadingLessons(true);
    try {
      const response = await lessonsAPI.getByCourse(id);
      setLessons(response.data || []);
    } catch (error) {
      console.error('Failed to load lessons:', error);
    } finally {
      setLoadingLessons(false);
    }
  };

  const fetchHandouts = async () => {
    if (!id) return;
    setLoadingHandouts(true);
    try {
      const response = await handoutAPI.getByCourse(id);
      setHandouts(response.data || []);
    } catch (error) {
      console.error('Failed to load handouts:', error);
    } finally {
      setLoadingHandouts(false);
    }
  };

  const handleUploadHandout = async (e) => {
    e.preventDefault();
    if (!handoutForm.title || !handoutForm.file) {
      toast.error('Title and file are required');
      return;
    }

    setUploadingHandout(true);
    try {
      const formData = new FormData();
      formData.append('title', handoutForm.title);
      formData.append('file', handoutForm.file);
      
      const response = await fetch(`/api/courses/${id}/handouts`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: formData
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Upload failed');
      }
      
      toast.success('Handout uploaded successfully');
      setShowHandoutModal(false);
      setHandoutForm({ title: '', file: null });
      fetchHandouts();
    } catch (error) {
      console.error('Upload error:', error);
      toast.error(error.message || 'Failed to upload handout');
    } finally {
      setUploadingHandout(false);
    }
  };

  const handleDeleteHandout = async (handoutId) => {
    if (!window.confirm('Delete this handout?')) return;
    try {
      await handoutAPI.delete(handoutId);
      toast.success('Handout deleted');
      fetchHandouts();
    } catch (error) {
      toast.error('Failed to delete handout');
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setCourse({ ...course, image: file });
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!course.title) {
      toast.error('Course title is required');
      return;
    }

    setSaving(true);
    try {
      const courseData = {
        title: course.title,
        description: course.description,
        amount: course.amount,
        status: course.status,
      };
      
      if (course.image) {
        courseData.image = course.image;
      }
      
      if (isEditing) {
        courseData.existingImage = course.existingImage;
        await coursesAPI.update(id, courseData);
        toast.success('Course updated successfully');
      } else {
        const response = await coursesAPI.create(courseData);
        toast.success('Course created successfully');
        navigate(`/courses/${response.data.course.id}/edit`, { state: { refresh: true } });
        return;
      }
    } catch (error) {
      toast.error(isEditing ? 'Failed to update course' : 'Failed to create course');
    } finally {
      setSaving(false);
    }
  };

  const handleStatusToggle = async () => {
    const newStatus = course.status === 'published' ? 'draft' : 'published';
    setSaving(true);
    try {
      await coursesAPI.updateStatus(id, newStatus);
      setCourse({ ...course, status: newStatus });
      toast.success(newStatus === 'published' ? 'Course published!' : 'Course unpublished');
    } catch (error) {
      toast.error('Failed to update status');
    } finally {
      setSaving(false);
    }
  };

  const openLessonModal = (lesson = null) => {
    if (lesson) {
      setEditingLesson(lesson);
      setLessonForm({
        title: lesson.title || '',
        content: lesson.content || '',
        video_url: lesson.video_url || '',
        order_num: lesson.order_num || 1
      });
    } else {
      setEditingLesson(null);
      setLessonForm({
        title: '',
        content: '',
        video_url: '',
        order_num: lessons.length + 1
      });
    }
    setShowLessonModal(true);
  };

  const handleSaveLesson = async (e) => {
    e.preventDefault();
    if (!lessonForm.title) {
      toast.error('Lesson title is required');
      return;
    }

    setSavingLesson(true);
    try {
      const formData = new FormData();
      formData.append('title', lessonForm.title);
      formData.append('content', lessonForm.content);
      formData.append('video_url', lessonForm.video_url);
      formData.append('order_num', lessonForm.order_num);

      if (editingLesson) {
        await lessonsAPI.update(editingLesson.id, formData);
        toast.success('Lesson updated successfully');
      } else {
        await lessonsAPI.create(id, formData);
        toast.success('Lesson added successfully');
      }
      setShowLessonModal(false);
      fetchLessons();
    } catch (error) {
      toast.error(editingLesson ? 'Failed to update lesson' : 'Failed to add lesson');
    } finally {
      setSavingLesson(false);
    }
  };

  const handleDeleteLesson = (lesson) => {
    setLessonToDelete(lesson);
    setDeleteLessonModal(true);
  };

  const confirmDeleteLesson = async () => {
    if (!lessonToDelete) return;
    setDeletingLesson(true);
    try {
      await lessonsAPI.delete(lessonToDelete.id);
      toast.success('Lesson deleted successfully');
      setDeleteLessonModal(false);
      setLessonToDelete(null);
      fetchLessons();
    } catch (error) {
      toast.error('Failed to delete lesson');
    } finally {
      setDeletingLesson(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div>
        <button
          onClick={() => navigate('/courses', { state: { refresh: true } })}
          className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft className="h-5 w-5" />
          <span>Back to Courses</span>
        </button>

        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">
            {isEditing ? 'Edit Course' : 'Create New Course'}
          </h1>
          {isEditing && (
            <div className="flex items-center space-x-3">
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                course.status === 'published' 
                  ? 'bg-green-100 text-green-700' 
                  : 'bg-yellow-100 text-yellow-700'
              }`}>
                {course.status === 'published' ? 'Published' : 'Draft'}
              </span>
              <button
                onClick={handleStatusToggle}
                disabled={saving}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                  course.status === 'published'
                    ? 'bg-yellow-500 text-white hover:bg-yellow-600'
                    : 'bg-green-500 text-white hover:bg-green-600'
                }`}
              >
                {course.status === 'published' ? (
                  <>
                    <EyeOff className="h-4 w-4" />
                    <span>Unpublish</span>
                  </>
                ) : (
                  <>
                    <Eye className="h-4 w-4" />
                    <span>Publish</span>
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm p-8">
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Course Title *
            </label>
            <input
              type="text"
              value={course.title}
              onChange={(e) => setCourse({ ...course, title: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
              placeholder="Enter course title"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              value={course.description || ''}
              onChange={(e) => setCourse({ ...course, description: e.target.value })}
              rows={4}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
              placeholder="Enter course description"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Amount to Pay (PHP)
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-medium">₱</span>
              <input
                type="number"
                value={course.amount}
                onChange={(e) => setCourse({ ...course, amount: e.target.value })}
                className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                placeholder="0.00"
                min="0"
                step="0.01"
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">Set the course price in Philippine Pesos. Enter 0 for free courses.</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Course Image
            </label>
            <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg hover:border-primary-500 transition-colors">
              <div className="space-y-2 text-center">
                {imagePreview ? (
                  <div className="relative inline-block">
                    <img 
                      src={imagePreview.startsWith('data:') ? imagePreview : getUploadUrl(imagePreview)} 
                      alt="Preview" 
                      className="max-h-48 rounded-lg" 
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setImagePreview(null);
                        setCourse({ ...course, image: null, existingImage: '' });
                      }}
                      className="absolute -top-2 -right-2 bg-red-500 text-white p-1 rounded-full"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ) : (
                  <>
                    <ImageIcon className="mx-auto h-12 w-12 text-gray-400" />
                    <div className="text-sm text-gray-600">
                      <label className="cursor-pointer text-primary-600 hover:text-primary-500">
                        <span>Upload an image</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageChange}
                          className="hidden"
                        />
                      </label>
                    </div>
                    <p className="text-xs text-gray-500">PNG, JPG, GIF up to 5MB</p>
                  </>
                )}
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={saving}
            className="w-full bg-primary-600 text-white py-3 rounded-lg hover:bg-primary-700 transition-colors font-semibold disabled:opacity-50 flex items-center justify-center space-x-2"
          >
            <Save className="h-5 w-5" />
            <span>{saving ? 'Saving...' : (isEditing ? 'Update Course' : 'Create Course')}</span>
          </button>
        </div>
      </form>

      {isEditing && (
        <div className="bg-white rounded-2xl shadow-sm p-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900 flex items-center space-x-2">
              <FileText className="h-6 w-6" />
              <span>Course Lessons</span>
              <span className="bg-primary-100 text-primary-700 px-2 py-1 rounded-full text-sm">
                {lessons.length}
              </span>
            </h2>
            <button
              onClick={() => openLessonModal()}
              className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors flex items-center space-x-2"
            >
              <Plus className="h-5 w-5" />
              <span>Add Lesson</span>
            </button>
          </div>

          {loadingLessons ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
            </div>
          ) : lessons.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-xl">
              <FileText className="h-12 w-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">No lessons added yet</p>
              <p className="text-sm text-gray-400 mt-1">Add lessons to allow students to start learning</p>
            </div>
          ) : (
            <div className="space-y-3">
              {lessons.map((lesson, index) => (
                <div
                  key={lesson.id}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-primary-600 text-white rounded-full flex items-center justify-center font-bold">
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{lesson.title}</p>
                      <p className="text-sm text-gray-500 line-clamp-1">
                        {lesson.content?.substring(0, 80) || 'No content'}...
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => openLessonModal(lesson)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    >
                      <Edit className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => handleDeleteLesson(lesson)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {isEditing && (
        <div className="bg-white rounded-2xl shadow-sm p-8 mt-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900 flex items-center space-x-2">
              <Upload className="h-6 w-6" />
              <span>Course Handouts</span>
              <span className="bg-green-100 text-green-700 px-2 py-1 rounded-full text-sm">
                {handouts.length}
              </span>
            </h2>
            <button
              onClick={() => setShowHandoutModal(true)}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
            >
              <Plus className="h-5 w-5" />
              <span>Upload Handout</span>
            </button>
          </div>

          {loadingHandouts ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto"></div>
            </div>
          ) : handouts.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-xl">
              <Upload className="h-12 w-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">No handouts uploaded yet</p>
              <p className="text-sm text-gray-400 mt-1">Upload handouts for students to download</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {handouts.map((handout) => (
                <div
                  key={handout.id}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                      <FileText className="h-5 w-5 text-green-600" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium text-gray-900 truncate">{handout.title}</p>
                      <p className="text-xs text-gray-500">{handout.file_path?.split('/').pop()}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-1">
                    <a
                      href={getHandoutUrl(handout.file_path)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    >
                      <Download className="h-4 w-4" />
                    </a>
                    <button
                      onClick={() => handleDeleteHandout(handout.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {showHandoutModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900">Upload Handout</h3>
              <button
                onClick={() => {
                  setShowHandoutModal(false);
                  setHandoutForm({ title: '', file: null });
                }}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <Trash2 className="h-5 w-5 text-gray-500" />
              </button>
            </div>

            <form onSubmit={handleUploadHandout} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Handout Title *
                </label>
                <input
                  type="text"
                  value={handoutForm.title}
                  onChange={(e) => setHandoutForm({ ...handoutForm, title: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  placeholder="e.g., Module 1 Study Guide"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  File *
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-green-500 transition-colors">
                  <input
                    type="file"
                    onChange={(e) => setHandoutForm({ ...handoutForm, file: e.target.files[0] })}
                    className="hidden"
                    id="handout-file"
                    accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx"
                  />
                  <label htmlFor="handout-file" className="cursor-pointer">
                    <Upload className="h-10 w-10 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-600">
                      {handoutForm.file ? handoutForm.file.name : 'Click to upload file'}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">PDF, DOC, PPT, XLS (max 10MB)</p>
                  </label>
                </div>
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowHandoutModal(false);
                    setHandoutForm({ title: '', file: null });
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={uploadingHandout}
                  className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center justify-center"
                >
                  {uploadingHandout ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                  ) : (
                    <>
                      <Upload className="h-4 w-4 mr-2" />
                      Upload
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showLessonModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900">
                {editingLesson ? 'Edit Lesson' : 'Add New Lesson'}
              </h3>
              <button
                onClick={() => setShowLessonModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <Trash2 className="h-5 w-5 text-gray-500" />
              </button>
            </div>

            <form onSubmit={handleSaveLesson} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Lesson Title *
                </label>
                <input
                  type="text"
                  value={lessonForm.title}
                  onChange={(e) => setLessonForm({ ...lessonForm, title: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  placeholder="Enter lesson title"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Content
                </label>
                <textarea
                  value={lessonForm.content}
                  onChange={(e) => setLessonForm({ ...lessonForm, content: e.target.value })}
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  placeholder="Enter lesson content"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Order Number
                </label>
                <input
                  type="number"
                  value={lessonForm.order_num}
                  onChange={(e) => setLessonForm({ ...lessonForm, order_num: parseInt(e.target.value) || 1 })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  min="1"
                />
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowLessonModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingLesson}
                  className="flex-1 bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50"
                >
                  {savingLesson ? 'Saving...' : (editingLesson ? 'Update' : 'Add Lesson')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {deleteLessonModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertTriangle className="h-8 w-8 text-red-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Delete Lesson</h3>
              <p className="text-gray-600 mb-6">
                Are you sure you want to delete "{lessonToDelete?.title}"? This action cannot be undone.
              </p>
              <div className="flex space-x-3">
                <button
                  onClick={() => {
                    setDeleteLessonModal(false);
                    setLessonToDelete(null);
                  }}
                  disabled={deletingLesson}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDeleteLesson}
                  disabled={deletingLesson}
                  className="flex-1 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
                >
                  {deletingLesson ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CourseEditor;
