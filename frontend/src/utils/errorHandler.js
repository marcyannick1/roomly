import { toast } from 'sonner';

export const handleApiError = (error, navigate) => {
  if (error.response?.status === 401) {
    toast.error("Session expirée, veuillez vous reconnecter");
    localStorage.removeItem('roomly_token');
    localStorage.removeItem('user');
    if (navigate) navigate('/login');
  } else if (error.response?.status === 404) {
    toast.error("Ressource introuvable");
  } else if (error.response?.status === 403) {
    toast.error("Accès non autorisé");
  } else if (error.response?.status === 422) {
    toast.error("Données invalides");
  } else {
    toast.error(error.response?.data?.detail || "Erreur serveur");
  }
};

export const getPhotoUrl = (photos) => {
  if (!photos || photos.length === 0) {
    return "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800";
  }
  return photos[0]?.url || photos[0] || "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800";
};

export const getUserName = (user) => {
  if (!user) return "Utilisateur inconnu";
  if (user.first_name && user.last_name) {
    return `${user.first_name} ${user.last_name}`;
  }
  return user.name || user.email || "Utilisateur";
};
