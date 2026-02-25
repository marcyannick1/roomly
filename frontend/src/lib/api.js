import axios from 'axios';

const API_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000/api/v1';

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
});

// Read access token from cookie
const getToken = () =>
  document.cookie
    .split('; ')
    .find(row => row.startsWith('access_token='))
    ?.split('=')[1];

// Attach Bearer token to every request
api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// ─── Auth ────────────────────────────────────────────────────────────────────
// Register → returns UserRead { id, email, role, is_onboarded, ... }
export const register = (data) => api.post('/auth/register', data);

// Login → returns { access_token, token_type }
export const login = (data) =>
  api.post('/auth/login', data, {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  });

export const logout = () => api.post('/auth/logout');

// fastapi-users exposes GET /users/me for the current user
export const getCurrentUser = () => api.get('/users/me');

export const forgotPassword = (email) => api.post('/auth/forgot-password', { email });
export const resetPassword = (token, password) =>
  api.post('/auth/reset-password', { token, password });
export const requestEmailVerification = () => api.post('/auth/request-verify-token');
export const verifyEmail = (token) => api.post('/auth/verify', { token });

// ─── Users ────────────────────────────────────────────────────────────────────
export const deleteUserAccount = () => api.delete('/users/me');

export const uploadProfilePhoto = (_userId, photoFile) => {
  const formData = new FormData();
  formData.append('file', photoFile);
  return api.post('/media/avatar', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};
export const deleteProfilePhoto = () => api.delete('/media/avatar');
// Kept for backward compat (LandlordDashboard calls getUserById)
export const getUserById = (userId) => api.get(`/auth/users/${userId}`);

// ─── Profiles ─────────────────────────────────────────────────────────────────
export const getStudentProfile = () => api.get('/profiles/me/student');
export const createStudentProfile = (profile) => api.post('/profiles/student', profile);
export const updateStudentProfile = (profile) => api.patch('/profiles/student', profile);

export const getLandlordProfile = () => api.get('/profiles/me/landlord');
export const createLandlordProfile = (profile) => api.post('/profiles/landlord', profile);
export const updateLandlordProfile = (profile) => api.patch('/profiles/landlord', profile);

// ─── Properties ───────────────────────────────────────────────────────────────
export const getAllListings = (params) => api.get('/properties/', { params });
export const getListing = (propertyId) => {
  if (!propertyId) throw new Error('Property ID is required');
  return api.get(`/properties/${propertyId}`);
};
export const getLandlordListings = () => api.get('/properties/me');
export const createListing = (listing) => api.post('/properties/', listing);
export const updateListing = (propertyId, listing) => {
  if (!propertyId) throw new Error('Property ID is required');
  return api.patch(`/properties/${propertyId}`, listing);
};
export const deleteListing = (propertyId) => {
  if (!propertyId) throw new Error('Property ID is required');
  return api.delete(`/properties/${propertyId}`);
};

// ─── Media ────────────────────────────────────────────────────────────────────
export const uploadPropertyImage = (propertyId, file) => {
  const formData = new FormData();
  formData.append('file', file);
  return api.post(`/media/properties/${propertyId}/images`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};
export const deletePropertyImage = (imageId) => api.delete(`/media/images/${imageId}`);
export const uploadFile = (propertyId, file) => uploadPropertyImage(propertyId, file);

// ─── Interactions ─────────────────────────────────────────────────────────────
export const getStudentFeed = () => api.get('/properties/');

export const likeListing = (_studentId, listingId) =>
  api.post('/interactions/swipe', { property_id: listingId, swipe_type: 'like' });

export const superlikeListing = (_studentId, listingId) =>
  api.post('/interactions/swipe', { property_id: listingId, swipe_type: 'superlike' });

export const unlikeListing = (_studentId, listingId) =>
  api.delete(`/interactions/swipe/${listingId}`);

export const getStudentLikedListings = () => api.get('/interactions/my-likes');
export const getLandlordReceivedLikes = () => api.get('/interactions/landlord/received-likes');
export const getInterestedStudents = () => api.get('/interactions/landlord/received-likes');

export const createMatch = (_landlordId, _studentId, swipeId) =>
  api.post(`/interactions/landlord/accept-swipe/${swipeId}`);
export const rejectSwipe = (swipeId) =>
  api.post(`/interactions/landlord/reject-swipe/${swipeId}`);

export const getStudentMatches = () => api.get('/interactions/matches');
export const getLandlordMatches = () => api.get('/interactions/matches');

// ─── Messages ─────────────────────────────────────────────────────────────────
export const getMatchMessages = (matchId) => api.get(`/messages/${matchId}`);
export const sendMessage = (message) => api.post('/messages/', message);
export const markMessageRead = (_messageId) => Promise.resolve();

// ─── Notifications ────────────────────────────────────────────────────────────
export const getNotifications = () => api.get('/notifications/');
export const markNotificationRead = (notificationId) =>
  api.patch(`/notifications/${notificationId}/read`);

// ─── Amenities ────────────────────────────────────────────────────────────────
export const getAmenities = () => api.get('/amenities/');

export default api;
