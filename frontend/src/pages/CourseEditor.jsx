import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Plus, Trash2, Edit, Save, Image as ImageIcon, AlertTriangle, Upload, FileVideo, X, FileText } from 'lucide-react';
import { coursesAPI, lessonsAPI } from '../services/api';
import { toast } from 'react-toastify';
import { getUploadUrl, getVideoUrl } from '../utils/apiUrl';

const CourseEditor = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = Boolean(id);

  const [course, setCourse] = useState({
    title: '',
    description: '',
    image: null,
    existingImage: ''
  });
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(isEditing);
  const [saving, setSaving] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const [newLesson, setNewLesson] = useState({ title: '', content: '', video_url: '', order_num: 0 });
  const [videoFile, setVideoFile] = useState(null);
  const [videoFilePreview, setVideoFilePreview] = useState(null);
  const [documentFile, setDocumentFile] = useState(null);
  const [documentFilePreview, setDocumentFilePreview] = useState(null);
  const [removeVideoFile, setRemoveVideoFile] = useState(false);
  const [removeDocumentFile, setRemoveDocumentFile] = useState(false);
  const [editingLesson, setEditingLesson] = useState(null);
  const [showLessonForm, setShowLessonForm] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [lessonToDelete, setLessonToDelete] = useState(null);
  const [deletingLesson, setDeletingLesson] = useState(false);

  useEffect(() => {
    if (isEditing) {
      fetchCourse();
    }
  }, [id]);

  const fetchCourse = async () => {
    try {
      const response = await coursesAPI.getOne(id);
      const courseData = response.data;
      setCourse({
        title: courseData.title,
        description: courseData.description,
        existingImage: courseData.image
      });
      setLessons(courseData.lessons || []);
      if (courseData.image) {
        setImagePreview(getUploadUrl(courseData.image));
      }
    } catch (error) {
      toast.error('Failed to load course');
      navigate('/admin/courses');
    } finally {
      setLoading(false);
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

  const handleVideoFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const maxSize = 500 * 1024 * 1024;
      if (file.size > maxSize) {
        toast.error('Video file must be less than 500MB');
        return;
      }
      setVideoFile(file);
      setVideoFilePreview(URL.createObjectURL(file));
    }
  };

  const handleDocumentFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const maxSize = 50 * 1024 * 1024;
      if (file.size > maxSize) {
        toast.error('Document file must be less than 50MB');
        return;
      }
      setDocumentFile(file);
      setDocumentFilePreview({
        name: file.name,
        size: (file.size / 1024 / 1024).toFixed(2),
        type: file.type
      });
    }
  };

  const clearVideoFile = () => {
    setVideoFile(null);
    if (videoFilePreview && !videoFilePreview.startsWith('http') && !videoFilePreview.startsWith('/uploads')) {
      URL.revokeObjectURL(videoFilePreview);
    }
    if (editingLesson?.video_file) {
      setRemoveVideoFile(true);
      setVideoFilePreview(null);
    } else {
      setVideoFilePreview(null);
    }
  };

  const clearDocumentFile = () => {
    setDocumentFile(null);
    if (editingLesson?.document_file) {
      setRemoveDocumentFile(true);
      setDocumentFilePreview(null);
    } else {
      setDocumentFilePreview(null);
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
      if (isEditing) {
        await coursesAPI.update(id, {
          title: course.title,
          description: course.description,
          existingImage: course.existingImage
        });
        if (course.image) {
          const formData = new FormData();
          formData.append('image', course.image);
          await coursesAPI.update(id, { title: course.title, description: course.description });
        }
        toast.success('Course updated successfully');
      } else {
        const response = await coursesAPI.create({
          title: course.title,
          description: course.description
        });
        if (course.image) {
          const formData = new FormData();
          formData.append('image', course.image);
          await coursesAPI.update(response.data.course.id, {
            title: course.title,
            description: course.description
          });
        }
        toast.success('Course created successfully');
      }
      navigate('/admin/courses');
    } catch (error) {
      toast.error(isEditing ? 'Failed to update course' : 'Failed to create course');
    } finally {
      setSaving(false);
    }
  };

  const handleAddLesson = async () => {
    if (!newLesson.title) {
      toast.error('Lesson title is required');
      return;
    }

    let courseId = id;

    try {
      if (!isEditing) {
        setSaving(true);
        const response = await coursesAPI.create({
          title: course.title || 'Untitled Course',
          description: course.description,
          amount: course.amount || 0
        });
        courseId = response.data.course.id;
        toast.success('Course created. Adding lesson...');
        setTimeout(() => {
          navigate(`/admin/courses/${courseId}/edit`, { replace: true });
        }, 100);
      }

      if (editingLesson) {
        const formData = new FormData();
        formData.append('title', newLesson.title);
        formData.append('content', newLesson.content);
        formData.append('video_url', newLesson.video_url);
        formData.append('order_num', newLesson.order_num);
        if (videoFile) formData.append('video_file', videoFile);
        if (documentFile) formData.append('document_file', documentFile);
        if (removeVideoFile) formData.append('remove_video_file', 'true');
        if (removeDocumentFile) formData.append('remove_document_file', 'true');
        await lessonsAPI.updateWithFiles(editingLesson.id, formData);
        toast.success('Lesson updated successfully');
        setEditingLesson(null);
        setRemoveVideoFile(false);
        setRemoveDocumentFile(false);
      } else {
        if (videoFile || documentFile) {
          const formData = new FormData();
          formData.append('title', newLesson.title);
          formData.append('content', newLesson.content);
          formData.append('video_url', newLesson.video_url);
          formData.append('order_num', newLesson.order_num);
          if (videoFile) formData.append('video_file', videoFile);
          if (documentFile) formData.append('document_file', documentFile);
          await lessonsAPI.createWithFiles(courseId, formData);
        } else {
          await lessonsAPI.create(courseId, newLesson);
        }
        toast.success('Lesson added successfully');
      }
      setNewLesson({ title: '', content: '', video_url: '', order_num: 0 });
      setVideoFile(null);
      setVideoFilePreview(null);
      setDocumentFile(null);
      setDocumentFilePreview(null);
      setShowLessonForm(false);
      fetchCourse();
    } catch (error) {
      toast.error('Failed to save lesson');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteLesson = async (lessonId) => {
    const lesson = lessons.find(l => l.id === lessonId);
    setLessonToDelete(lesson);
    setShowDeleteModal(true);
  };

  const confirmDeleteLesson = async () => {
    if (!lessonToDelete) return;
    setDeletingLesson(true);

    try {
      await lessonsAPI.delete(lessonToDelete.id);
      toast.success('Lesson deleted successfully');
      setShowDeleteModal(false);
      setLessonToDelete(null);
      fetchCourse();
    } catch (error) {
      toast.error('Failed to delete lesson');
    } finally {
      setDeletingLesson(false);
    }
  };

  const cancelDeleteLesson = () => {
    setShowDeleteModal(false);
    setLessonToDelete(null);
  };

  const handleEditLesson = (lesson) => {
    setNewLesson({
      title: lesson.title,
      content: lesson.content,
      video_url: lesson.video_url,
      order_num: lesson.order_num
    });
    setEditingLesson(lesson);
    if (lesson.video_file) {
      setVideoFile(null);
      setVideoFilePreview(getVideoUrl(lesson.video_file));
    } else {
      setVideoFile(null);
      setVideoFilePreview(null);
    }
    if (lesson.document_file) {
      setDocumentFile(null);
      setDocumentFilePreview({ name: lesson.document_file.split('/').pop(), type: lesson.document_type });
    } else {
      setDocumentFile(null);
      setDocumentFilePreview(null);
    }
    setShowLessonForm(true);
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
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <button
            onClick={() => navigate('/admin/courses')}
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 mb-6"
          >
            <ArrowLeft className="h-5 w-5" />
            <span>Back to Courses</span>
          </button>

          <h1 className="text-3xl font-bold text-gray-900 mb-8">
            {isEditing ? 'Edit Course' : 'Create New Course'}
          </h1>

          <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-lg p-8 mb-8">
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Course Title *
                </label>
                <input
                  type="text"
                  value={course.title}
                  onChange={(e) => setCourse({ ...course, title: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="Enter course title"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={course.description}
                  onChange={(e) => setCourse({ ...course, description: e.target.value })}
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="Enter course description"
                />
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
                          src={imagePreview}
                          alt="Preview"
                          className="max-h-64 rounded-lg"
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

          <div className="bg-white rounded-2xl shadow-lg p-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Course Lessons</h2>
              <button
                onClick={() => {
                  setShowLessonForm(!showLessonForm);
                  setEditingLesson(null);
                  setNewLesson({ title: '', content: '', video_url: '', order_num: lessons.length + 1 });
                }}
                className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors flex items-center space-x-2"
              >
                <Plus className="h-5 w-5" />
                <span>{showLessonForm ? 'Cancel' : 'Add Lesson'}</span>
              </button>
            </div>

              {showLessonForm && (
                <div className="bg-gray-50 rounded-xl p-6 mb-6 max-h-[70vh] overflow-y-auto">
                  <h3 className="text-lg font-semibold mb-4">
                    {editingLesson ? 'Edit Lesson' : 'Add New Lesson'}
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Lesson Title *
                      </label>
                      <input
                        type="text"
                        value={newLesson.title}
                        onChange={(e) => setNewLesson({ ...newLesson, title: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                        placeholder="Enter lesson title"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Content
                      </label>
                      <textarea
                        value={newLesson.content}
                        onChange={(e) => setNewLesson({ ...newLesson, content: e.target.value })}
                        rows={4}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                        placeholder="Enter lesson content"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Video URL
                      </label>
                      <input
                        type="text"
                        value={newLesson.video_url}
                        onChange={(e) => setNewLesson({ ...newLesson, video_url: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                        placeholder="Enter video URL (YouTube, Vimeo, etc.)"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Upload Video File
                      </label>
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 hover:border-primary-500 transition-colors">
                        {videoFilePreview ? (
                          <div className="flex items-center justify-between bg-gray-100 rounded-lg p-3">
                            <div className="flex items-center space-x-3">
                              <FileVideo className="h-8 w-8 text-primary-600" />
                              <div>
                                <p className="text-sm font-medium text-gray-900 truncate max-w-xs">{videoFile?.name || videoFilePreview.split('/').pop()}</p>
                                {videoFile && <p className="text-xs text-gray-500">{(videoFile.size / 1024 / 1024).toFixed(2)} MB</p>}
                                {!videoFile && editingLesson?.video_file && <p className="text-xs text-green-500">Existing file</p>}
                              </div>
                            </div>
                            <button type="button" onClick={clearVideoFile} className="p-1 hover:bg-gray-200 rounded">
                              <X className="h-5 w-5 text-gray-500" />
                            </button>
                          </div>
                        ) : editingLesson?.video_file && !removeVideoFile ? (
                          <div className="flex items-center justify-between bg-purple-50 rounded-lg p-3 border border-purple-200">
                            <div className="flex items-center space-x-3">
                              <FileVideo className="h-8 w-8 text-purple-600" />
                              <div>
                                <p className="text-sm font-medium text-purple-900">Current video file</p>
                                <p className="text-xs text-purple-600 truncate max-w-xs">{editingLesson.video_file.split('/').pop()}</p>
                              </div>
                            </div>
                            <button type="button" onClick={clearVideoFile} className="p-1 hover:bg-purple-100 rounded text-purple-600">
                              <X className="h-5 w-5" />
                            </button>
                          </div>
                        ) : (
                          <label className="cursor-pointer flex flex-col items-center">
                            <Upload className="h-8 w-8 text-gray-400 mb-2" />
                            <span className="text-sm text-gray-600">Click to upload video</span>
                            <span className="text-xs text-gray-400 mt-1">MP4, WebM, MOV (max 500MB)</span>
                            <input
                              type="file"
                              accept="video/mp4,video/webm,video/quicktime,video/x-msvideo,video/x-matroska"
                              onChange={handleVideoFileChange}
                              className="hidden"
                            />
                          </label>
                        )}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Upload Document
                      </label>
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 hover:border-primary-500 transition-colors">
                        {documentFilePreview ? (
                          <div className="flex items-center justify-between bg-gray-100 rounded-lg p-3">
                            <div className="flex items-center space-x-3">
                              <FileText className="h-8 w-8 text-primary-600" />
                              <div>
                                <p className="text-sm font-medium text-gray-900 truncate max-w-xs">{documentFilePreview.name}</p>
                                <p className="text-xs text-gray-500">{documentFilePreview.size} MB</p>
                              </div>
                            </div>
                            <button type="button" onClick={clearDocumentFile} className="p-1 hover:bg-gray-200 rounded">
                              <X className="h-5 w-5 text-gray-500" />
                            </button>
                          </div>
                        ) : editingLesson?.document_file && !removeDocumentFile ? (
                          <div className="flex items-center justify-between bg-green-50 rounded-lg p-3 border border-green-200">
                            <div className="flex items-center space-x-3">
                              <FileText className="h-8 w-8 text-green-600" />
                              <div>
                                <p className="text-sm font-medium text-green-900">Current document file</p>
                                <p className="text-xs text-green-600 truncate max-w-xs">{editingLesson.document_file.split('/').pop()}</p>
                              </div>
                            </div>
                            <button type="button" onClick={clearDocumentFile} className="p-1 hover:bg-green-100 rounded text-green-600">
                              <X className="h-5 w-5" />
                            </button>
                          </div>
                        ) : (
                          <label className="cursor-pointer flex flex-col items-center">
                            <Upload className="h-8 w-8 text-gray-400 mb-2" />
                            <span className="text-sm text-gray-600">Click to upload document</span>
                            <span className="text-xs text-gray-400 mt-1">PDF, DOC, DOCX, XLS, TXT (max 50MB)</span>
                            <input
                              type="file"
                              accept=".pdf,.doc,.docx,.xls,.xlsx,.txt"
                              onChange={handleDocumentFileChange}
                              className="hidden"
                            />
                          </label>
                        )}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Order Number
                      </label>
                      <input
                        type="number"
                        value={newLesson.order_num}
                        onChange={(e) => setNewLesson({ ...newLesson, order_num: parseInt(e.target.value) || 0 })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                        min="0"
                      />
                    </div>
                    <button
                      onClick={handleAddLesson}
                      className="w-full bg-primary-600 text-white py-2 rounded-lg hover:bg-primary-700 transition-colors font-semibold"
                    >
                      {editingLesson ? 'Update Lesson' : 'Add Lesson'}
                    </button>
                  </div>
                </div>
              )}

              {lessons.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-gray-500">No lessons added yet</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {lessons.map((lesson, index) => (
                    <div
                      key={lesson.id}
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 bg-primary-600 text-white rounded-full flex items-center justify-center font-semibold">
                          {index + 1}
                        </div>
                        <div>
                          <div className="font-semibold text-gray-900">{lesson.title}</div>
                          <div className="flex items-center gap-2 mt-1">
                            {lesson.video_file && (
                              <span className="inline-flex items-center gap-1 text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded">
                                <FileVideo className="h-3 w-3" /> Video
                              </span>
                            )}
                            {lesson.document_file && (
                              <span className="inline-flex items-center gap-1 text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded">
                                <FileText className="h-3 w-3" /> Document
                              </span>
                            )}
                            {lesson.video_url && !lesson.video_file && (
                              <span className="inline-flex items-center gap-1 text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded">
                                <FileVideo className="h-3 w-3" /> URL
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleEditLesson(lesson)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        >
                          <Edit className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => handleDeleteLesson(lesson.id)}
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
        </motion.div>
      </div>

      {showDeleteModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <div className="fixed inset-0 bg-black/50 transition-opacity" onClick={cancelDeleteLesson}></div>
            <div className="relative bg-white rounded-2xl shadow-xl max-w-md w-full p-6 transform transition-all">
              <div className="flex flex-col items-center text-center">
                <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mb-4">
                  <AlertTriangle className="h-6 w-6 text-red-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Delete Lesson</h3>
                <p className="text-gray-600 mb-6">
                  Are you sure you want to delete <span className="font-semibold text-gray-900">"{lessonToDelete?.title}"</span>? This action cannot be undone.
                </p>
                <div className="flex space-x-3 w-full">
                  <button
                    onClick={cancelDeleteLesson}
                    disabled={deletingLesson}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={confirmDeleteLesson}
                    disabled={deletingLesson}
                    className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium disabled:opacity-50 flex items-center justify-center"
                  >
                    {deletingLesson ? (
                      <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                    ) : (
                      'Delete'
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CourseEditor;
