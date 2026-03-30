/**
 * API URL Helper Utility
 * Handles environment-based URL generation for API calls and static assets
 */

/**
 * Get the base API URL based on environment
 * @returns {string} Base API URL
 */
export const getApiBaseUrl = () => {
  // If VITE_API_URL is set (production), use it
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  // Development: use relative path (Vite proxy handles it)
  return '';
};

/**
 * Get full URL for API endpoint
 * @param {string} path - API path (e.g., '/api/courses')
 * @returns {string} Full API URL
 */
export const getApiUrl = (path) => {
  const base = getApiBaseUrl();
  if (base) {
    return `${base}${path}`;
  }
  return path;
};

/**
 * Get URL for uploaded files (images, videos, documents)
 * @param {string} path - File path from database (e.g., '/uploads/avatars/...')
 * @returns {string} Full URL to the file
 */
export const getUploadUrl = (path) => {
  if (!path) return null;
  
  // If path already has full URL, return as-is
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path;
  }
  
  // If path is a data URL (base64), return as-is
  if (path.startsWith('data:')) {
    return path;
  }
  
  const base = getApiBaseUrl();
  
  // In production, prepend the API base URL
  if (base) {
    // Ensure path starts with /
    const normalizedPath = path.startsWith('/') ? path : `/${path}`;
    return `${base}${normalizedPath}`;
  }
  
  // In development, the Vite proxy handles /uploads
  // Return path as-is (relative)
  return path;
};

/**
 * Get URL for course image
 * @param {string} imagePath - Image path from database
 * @returns {string} Full URL to the image or placeholder
 */
export const getCourseImageUrl = (imagePath) => {
  if (!imagePath) {
    return '/placeholder.jpg';
  }
  return getUploadUrl(imagePath);
};

/**
 * Get URL for user avatar
 * @param {string} avatarPath - Avatar path from database
 * @returns {string} Full URL to the avatar
 */
export const getAvatarUrl = (avatarPath) => {
  if (!avatarPath) {
    return null; // Let component handle default avatar
  }
  return getUploadUrl(avatarPath);
};

/**
 * Get URL for video file
 * @param {string} videoPath - Video path from database
 * @returns {string} Full URL to the video
 */
export const getVideoUrl = (videoPath) => {
  if (!videoPath) return null;
  return getUploadUrl(videoPath);
};

/**
 * Get URL for document file
 * @param {string} documentPath - Document path from database
 * @returns {string} Full URL to the document
 */
export const getDocumentUrl = (documentPath) => {
  if (!documentPath) return null;
  return getUploadUrl(documentPath);
};

/**
 * Get URL for handout file
 * @param {string} handoutPath - Handout path from database
 * @returns {string} Full URL to the handout
 */
export const getHandoutUrl = (handoutPath) => {
  if (!handoutPath) return null;
  return getUploadUrl(handoutPath);
};

/**
 * Get URL for payment proof image
 * @param {string} proofPath - Proof path from database
 * @returns {string} Full URL to the proof image
 */
export const getPaymentProofUrl = (proofPath) => {
  if (!proofPath) return null;
  return getUploadUrl(proofPath);
};

/**
 * Get URL for QR code image
 * @param {string} qrPath - QR code path from database
 * @returns {string} Full URL to the QR code
 */
export const getQrCodeUrl = (qrPath) => {
  if (!qrPath) return null;
  return getUploadUrl(qrPath);
};

export default {
  getApiBaseUrl,
  getApiUrl,
  getUploadUrl,
  getCourseImageUrl,
  getAvatarUrl,
  getVideoUrl,
  getDocumentUrl,
  getHandoutUrl,
  getPaymentProofUrl,
  getQrCodeUrl
};
