import axios from 'axios';

const API_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: `${API_URL}/api`,
  withCredentials: true,
});

// Auth
export const register = (data) => api.post('/auth/register', data);
export const login = (data) => api.post('/auth/login', data);
export const googleCallback = (sessionId) => api.post('/auth/google/callback', { session_id: sessionId });
export const getCurrentUser = () => api.get('/auth/me');
export const logout = () => api.post('/auth/logout');

// Profiles
export const getStudentProfile = (userId) => api.get(`/students/profile/${userId}`);
export const updateStudentProfile = (profile) => api.post('/students/profile', profile);
export const getLandlordProfile = (userId) => api.get(`/landlords/profile/${userId}`);
export const updateLandlordProfile = (profile) => api.post('/landlords/profile', profile);

// Listings
export const createListing = (listing) => api.post('/listings', listing);
export const getListing = (listingId) => api.get(`/listings/${listingId}`);
export const getLandlordListings = (landlordId) => api.get(`/listings/landlord/${landlordId}`);
export const updateListing = (listingId, listing) => api.put(`/listings/${listingId}`, listing);
export const deleteListing = (listingId) => api.delete(`/listings/${listingId}`);

// Matching
export const getStudentFeed = (studentId) => api.get(`/students/${studentId}/feed`);
export const likeListing = (studentId, listingId) => api.post(`/students/${studentId}/like/${listingId}`);
export const unlikeListing = (studentId, listingId) => api.delete(`/students/${studentId}/unlike/${listingId}`);
export const getInterestedStudents = (listingId) => api.get(`/listings/${listingId}/interested-students`);
export const createMatch = (landlordId, studentId, listingId) => api.post(`/landlords/${landlordId}/match/${studentId}/${listingId}`);
export const getStudentMatches = (studentId) => api.get(`/students/${studentId}/matches`);
export const getLandlordMatches = (landlordId) => api.get(`/landlords/${landlordId}/matches`);

// Messages
export const sendMessage = (message) => api.post('/messages', message);
export const getMatchMessages = (matchId) => api.get(`/matches/${matchId}/messages`);
export const markMessageRead = (messageId) => api.patch(`/messages/${messageId}/read`);

// Upload
export const uploadFile = (file) => {
  const formData = new FormData();
  formData.append('file', file);
  return api.post('/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
};

export default api;
