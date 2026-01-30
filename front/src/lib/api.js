import axios from 'axios';

const API_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
});

// Add token to requests
api.interceptors.request.use((config) => {
  // Get token from cookie
  const token = document.cookie
    .split('; ')
    .find(row => row.startsWith('session_token='))
    ?.split('=')[1];
  
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  
  return config;
});

// Auth
export const register = (data) => api.post('/auth/register', data);
export const login = (data) => api.post('/auth/login', data);
export const googleCallback = (sessionId) => api.post('/auth/google/callback', { session_id: sessionId });
export const getCurrentUser = () => api.get('/auth/me');
export const logout = () => api.post('/auth/logout');

// Users
export const getUserById = (userId) => api.get(`/users/${userId}`);
export const uploadProfilePhoto = (userId, photoFile) => {
  const formData = new FormData();
  formData.append('photo', photoFile);
  return api.post(`/users/${userId}/photo`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
};
export const deleteProfilePhoto = (userId) => api.delete(`/users/${userId}/photo`);
export const deleteUserAccount = (userId) => api.delete(`/users/${userId}`);

// Profiles
export const getStudentProfile = (userId) => api.get(`/students/profile/${userId}`);
export const updateStudentProfile = (profile) => api.post('/students/profile', profile);
export const getLandlordProfile = (userId) => api.get(`/landlords/profile/${userId}`);
export const updateLandlordProfile = (profile) => api.post('/landlords/profile', profile);

// Listings
export const createListing = (listing) => api.post('/listings', listing);
export const getListing = (listingId) => {
  if (!listingId) throw new Error('Listing ID is required');
  return api.get(`/listings/${listingId}`);
};
export const getLandlordListings = (landlordId) => {
  if (!landlordId) throw new Error('Landlord ID is required');
  return api.get(`/listings/landlord/${Number(landlordId)}`);
};
export const updateListing = (listingId, listing) => {
  if (!listingId) throw new Error('Listing ID is required');
  
  const formData = new FormData();
  
  // Ajouter tous les champs simples
  formData.append('title', listing.title || '');
  formData.append('room_type', listing.type || 'studio');
  formData.append('price', listing.rent || 0);
  formData.append('city', listing.address?.city || '');
  formData.append('owner_id', listing.landlord_id || '');
  
  // Champs optionnels texte
  formData.append('description', listing.description || '');
  formData.append('address', listing.address?.street || '');
  formData.append('postal_code', listing.address?.postal_code || '');
  
  // Champs optionnels numériques
  formData.append('surface', listing.surface || 0);
  formData.append('deposit', listing.deposit || 0);
  formData.append('available_from', listing.available_from || '');
  
  // Booléens
  formData.append('charges_included', listing.charges > 0 ? 'true' : 'false');
  formData.append('furnished', listing.furnished ? 'true' : 'false');
  
  // Équipements
  formData.append('wifi', listing.wifi ? 'true' : 'false');
  formData.append('workspace', listing.workspace ? 'true' : 'false');
  formData.append('parking', listing.parking ? 'true' : 'false');
  formData.append('pets', listing.pets ? 'true' : 'false');
  formData.append('tv', listing.tv ? 'true' : 'false');
  formData.append('elevator', listing.elevator ? 'true' : 'false');
  formData.append('washing_machine', listing.washing_machine ? 'true' : 'false');
  formData.append('dryer', listing.dryer ? 'true' : 'false');
  formData.append('ac', listing.ac ? 'true' : 'false');
  formData.append('kitchen', listing.kitchen ? 'true' : 'false');
  formData.append('garden', listing.garden ? 'true' : 'false');
  formData.append('balcony', listing.balcony ? 'true' : 'false');
  
  // Photos (si des fichiers File sont fournis)
  if (listing.photoFiles && listing.photoFiles.length > 0) {
    listing.photoFiles.forEach(file => {
      formData.append('photos', file);
    });
  }
  
  return api.put(`/listings/${listingId}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
};
export const deleteListing = (listingId) => {
  if (!listingId) throw new Error('Listing ID is required');
  return api.delete(`/listings/${listingId}`);
};

// Matching
export const getStudentFeed = (studentId) => api.get(`/students/${studentId}/feed`);
export const likeListing = (studentId, listingId) => api.post(`/students/${studentId}/like/${listingId}`);
export const unlikeListing = (studentId, listingId) => api.delete(`/students/${studentId}/reaction/${listingId}`);
export const getStudentLikedListings = (studentId) => api.get(`/students/${studentId}/liked`);
export const getInterestedStudents = (listingId) => api.get(`/listings/${listingId}/interested-students`);
export const getLandlordReceivedLikes = (landlordId) => api.get(`/landlords/${landlordId}/likes`);
export const createMatch = (landlordId, studentId, listingId) => api.post(`/landlords/${landlordId}/match/${studentId}/${listingId}`);
export const getStudentMatches = (userId) => api.get(`/matches/user/${userId}`);
export const getLandlordMatches = (landlordId) => api.get(`/matches/landlord/${landlordId}`);

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
