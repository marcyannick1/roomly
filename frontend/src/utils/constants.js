// Images par défaut
export const DEFAULT_PROPERTY_IMAGE = "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800";
export const DEFAULT_AVATAR = "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150";
export const DEFAULT_USER_PHOTO = "https://ui-avatars.com/api/?name=User&background=6366f1&color=fff";

// Types de logement
export const ROOM_TYPES = {
  studio: "Studio",
  t2: "T2",
  t3: "T3",
  chambre: "Chambre",
  colocation: "Colocation"
};

// Statuts
export const MATCH_STATUS = {
  pending: "En attente",
  accepted: "Accepté",
  rejected: "Refusé"
};

export const VISIT_STATUS = {
  pending: "En attente",
  confirmed: "Confirmée",
  cancelled: "Annulée"
};

// API
export const API_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000';
