import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, useMotionValue, useTransform, AnimatePresence } from "framer-motion";
import axios from "axios";
import { useAuth } from "../App";
import { toast } from "sonner";
import { Button } from "../components/ui/button";
import { 
  Heart, 
  X, 
  Star, 
  MapPin, 
  Home, 
  Maximize2, 
  Euro,
  MessageCircle,
  Map,
  Calendar,
  User,
  Bell,
  Filter,
  RefreshCw,
  Wifi,
  Car,
  Loader2,
  ChevronLeft,
  ChevronRight
} from "lucide-react";

const StudentDashboard = () => {
  const navigate = useNavigate();
  const { user, token, API } = useAuth();
  
  // Vérifier que l'utilisateur est bien un étudiant (pas un bailleur)
  useEffect(() => {
    if (user && user.is_landlord) {
      // Rediriger les bailleurs vers le dashboard bailleur
      navigate('/landlord/dashboard', { replace: true });
    } else if (!user) {
      // Rediriger les non-authentifiés vers la connexion
      navigate('/login', { replace: true });
    }
  }, [user, navigate]);
  
  const [properties, setProperties] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [swiping, setSwiping] = useState(false);
  const [showMatch, setShowMatch] = useState(false);
  const [matchedProperty, setMatchedProperty] = useState(null);
  const [notifications, setNotifications] = useState(0);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    fetchProperties();
    fetchNotifications();
  }, []);

  const fetchProperties = async () => {
    try {
      const response = await axios.get(`${API}/properties/swipe?token=${token}&limit=20`);
      setProperties(response.data);
    } catch (error) {
      console.error("Error fetching properties:", error);
      // If no properties for swipe, get all properties
      try {
        const allProps = await axios.get(`${API}/properties?limit=20`);
        setProperties(allProps.data);
      } catch (err) {
        toast.error("Erreur lors du chargement des annonces");
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchNotifications = async () => {
    try {
      const response = await axios.get(`${API}/notifications/unread-count?token=${token}`);
      setNotifications(response.data.count);
    } catch (error) {
      console.error("Error fetching notifications:", error);
    }
  };

  const handleSwipe = async (action) => {
    if (swiping || currentIndex >= properties.length) return;
    
    setSwiping(true);
    const property = properties[currentIndex];

    try {
      const response = await axios.post(`${API}/swipes?token=${token}`, {
        property_id: property.id,
        action: action
      });

      if (response.data.match) {
        setMatchedProperty(property);
        setShowMatch(true);
      }

      setCurrentIndex(prev => prev + 1);
      setCurrentImageIndex(0);
    } catch (error) {
      console.error("Swipe error:", error);
      // Still advance even if there's an error (property might already be swiped)
      setCurrentIndex(prev => prev + 1);
      setCurrentImageIndex(0);
    } finally {
      setSwiping(false);
    }
  };

  const currentProperty = properties[currentIndex];

  const nextImage = () => {
    if (currentProperty?.images?.length > 1) {
      setCurrentImageIndex(prev => (prev + 1) % currentProperty.images.length);
    }
  };

  const prevImage = () => {
    if (currentProperty?.images?.length > 1) {
      setCurrentImageIndex(prev => prev === 0 ? currentProperty.images.length - 1 : prev - 1);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-8 pt-24">
      <div className="max-w-md mx-auto">
        {loading ? (
          <div className="h-[65vh] flex items-center justify-center">
            <Loader2 className="w-8 h-8 text-primary animate-spin" />
          </div>
        ) : currentIndex >= properties.length ? (
            <div className="h-[65vh] flex flex-col items-center justify-center text-center p-6">
              <div className="w-20 h-20 bg-primary-50 rounded-full flex items-center justify-center mb-4">
                <RefreshCw className="w-10 h-10 text-primary" />
              </div>
              <h2 className="text-xl font-bold text-slate-900 mb-2">Plus d'annonces pour le moment</h2>
              <p className="text-slate-600 mb-6">Revenez plus tard ou ajustez vos filtres</p>
              <Button
                onClick={() => {
                  setCurrentIndex(0);
                  fetchProperties();
                }}
                className="bg-primary hover:bg-primary-hover text-white rounded-full"
                data-testid="refresh-btn"
              >
                Actualiser
              </Button>
            </div>
          ) : (
            <div className="relative h-[65vh] mt-4" data-testid="swipe-container">
              <AnimatePresence>
                {currentProperty && (
                  <SwipeCard
                    key={currentProperty.id}
                    property={currentProperty}
                    onSwipe={handleSwipe}
                    currentImageIndex={currentImageIndex}
                    onNextImage={nextImage}
                    onPrevImage={prevImage}
                    onViewDetails={() => navigate(`/property/${currentProperty.id}`)}
                  />
                )}
              </AnimatePresence>
            </div>
          )}

          {/* Action Buttons */}
          {currentProperty && currentIndex < properties.length && (
            <div className="flex justify-center items-center gap-6 mt-6">
              <Button
                onClick={() => handleSwipe("dislike")}
                disabled={swiping}
                className="w-14 h-14 rounded-full bg-white border-2 border-red-200 hover:bg-red-50 hover:border-red-300 shadow-md transition-all active:scale-90"
                data-testid="dislike-btn"
              >
                <X className="w-7 h-7 text-red-500" />
              </Button>
              
              <Button
                onClick={() => handleSwipe("superlike")}
                disabled={swiping}
                className="w-16 h-16 rounded-full bg-primary hover:bg-primary-hover shadow-lg shadow-primary/30 transition-all active:scale-90"
                data-testid="superlike-btn"
              >
                <Star className="w-8 h-8 text-white" />
              </Button>
              
              <Button
                onClick={() => handleSwipe("like")}
                disabled={swiping}
                className="w-14 h-14 rounded-full bg-white border-2 border-green-200 hover:bg-green-50 hover:border-green-300 shadow-md transition-all active:scale-90"
                data-testid="like-btn"
              >
                <Heart className="w-7 h-7 text-green-500" />
              </Button>
            </div>
          )}

          {/* Match Modal */}
          <AnimatePresence>
            {showMatch && matchedProperty && (
              <MatchModal
                property={matchedProperty}
                onClose={() => setShowMatch(false)}
                onChat={() => {
                  setShowMatch(false);
                  navigate('/matches');
                }}
              />
            )}
          </AnimatePresence>
        </div>
    </div>
  );
};

// Swipe Card Component
const SwipeCard = ({ property, onSwipe, currentImageIndex, onNextImage, onPrevImage, onViewDetails }) => {
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 200], [-15, 15]);
  const likeOpacity = useTransform(x, [0, 100], [0, 1]);
  const dislikeOpacity = useTransform(x, [-100, 0], [1, 0]);
  
  const handleDragEnd = (event, info) => {
    if (info.offset.x > 100) {
      onSwipe("like");
    } else if (info.offset.x < -100) {
      onSwipe("dislike");
    }
  };

  const amenityIcons = {
    wifi: Wifi,
    parking: Car,
  };

  return (
    <motion.div
      className="absolute inset-0 cursor-grab active:cursor-grabbing"
      style={{ x, rotate }}
      drag="x"
      dragConstraints={{ left: 0, right: 0 }}
      onDragEnd={handleDragEnd}
      initial={{ scale: 0.95, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0.95, opacity: 0 }}
      transition={{ duration: 0.2 }}
      data-testid="swipe-card"
    >
      <div className="h-full w-full bg-white rounded-3xl shadow-xl overflow-hidden border border-slate-100">
        {/* Image */}
        <div className="relative h-3/5">
          <img
            src={property.images?.[currentImageIndex] || "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800"}
            alt={property.title}
            className="w-full h-full object-cover"
            draggable="false"
          />
          
          {/* Image navigation */}
          {property.images?.length > 1 && (
            <>
              <button
                onClick={(e) => { e.stopPropagation(); onPrevImage(); }}
                className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-black/30 hover:bg-black/50 rounded-full flex items-center justify-center text-white"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); onNextImage(); }}
                className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-black/30 hover:bg-black/50 rounded-full flex items-center justify-center text-white"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
              
              {/* Image dots */}
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1">
                {property.images.map((_, idx) => (
                  <div
                    key={idx}
                    className={`w-2 h-2 rounded-full ${idx === currentImageIndex ? 'bg-white' : 'bg-white/50'}`}
                  />
                ))}
              </div>
            </>
          )}
          
          {/* Like/Dislike stamps */}
          <motion.div
            className="absolute top-8 left-8 bg-green-500 text-white px-4 py-2 rounded-xl font-bold text-xl transform -rotate-12"
            style={{ opacity: likeOpacity }}
          >
            LIKE
          </motion.div>
          <motion.div
            className="absolute top-8 right-8 bg-red-500 text-white px-4 py-2 rounded-xl font-bold text-xl transform rotate-12"
            style={{ opacity: dislikeOpacity }}
          >
            NOPE
          </motion.div>
          
          {/* Price badge */}
          <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-full font-bold text-slate-900 flex items-center gap-1">
            <Euro className="w-4 h-4" />
            {property.price}/mois
          </div>
          
          {/* Property type badge */}
          <div className="absolute top-4 left-4 bg-primary/90 backdrop-blur-sm px-3 py-1.5 rounded-full text-white text-sm font-medium">
            {property.property_type === "studio" ? "Studio" : 
             property.property_type === "apartment" ? "Appartement" :
             property.property_type === "room" ? "Chambre" : "Colocation"}
          </div>
        </div>
        
        {/* Content */}
        <div className="p-5 h-2/5 flex flex-col">
          <h2 className="text-xl font-bold text-slate-900 mb-1 line-clamp-1">{property.title}</h2>
          
          <div className="flex items-center gap-1 text-slate-500 text-sm mb-3">
            <MapPin className="w-4 h-4" />
            <span>{property.city} • {property.postal_code}</span>
          </div>
          
          <div className="flex items-center gap-4 mb-3">
            <div className="flex items-center gap-1 text-slate-600">
              <Maximize2 className="w-4 h-4" />
              <span className="text-sm">{property.surface} m²</span>
            </div>
            <div className="flex items-center gap-1 text-slate-600">
              <Home className="w-4 h-4" />
              <span className="text-sm">{property.rooms} pièce{property.rooms > 1 ? 's' : ''}</span>
            </div>
            {property.furnished && (
              <span className="text-xs bg-slate-100 px-2 py-1 rounded-full text-slate-600">Meublé</span>
            )}
          </div>
          
          <p className="text-sm text-slate-600 line-clamp-2 flex-1">{property.description}</p>
          
          <button
            onClick={onViewDetails}
            className="mt-3 text-primary font-semibold text-sm hover:underline"
            data-testid="view-details-btn"
          >
            Voir les détails →
          </button>
        </div>
      </div>
    </motion.div>
  );
};

// Navigation Button Component
const NavButton = ({ icon: Icon, label, active, onClick }) => (
  <button
    onClick={onClick}
    className={`flex flex-col items-center gap-1 px-4 py-1 rounded-xl transition-colors ${
      active ? 'text-primary' : 'text-slate-400 hover:text-slate-600'
    }`}
    data-testid={`nav-${label.toLowerCase()}`}
  >
    <Icon className="w-5 h-5" />
    <span className="text-xs font-medium">{label}</span>
  </button>
);

// Match Modal Component
const MatchModal = ({ property, onClose, onChat }) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
    onClick={onClose}
  >
    <motion.div
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0.8, opacity: 0 }}
      className="bg-white rounded-3xl p-8 max-w-sm w-full text-center"
      onClick={e => e.stopPropagation()}
      data-testid="match-modal"
    >
      <div className="w-20 h-20 bg-gradient-to-br from-primary to-pink-500 rounded-full flex items-center justify-center mx-auto mb-6">
        <Heart className="w-10 h-10 text-white" fill="white" />
      </div>
      
      <h2 className="text-2xl font-bold text-slate-900 mb-2">C'est un Match! 🎉</h2>
      <p className="text-slate-600 mb-6">
        Vous avez liké <strong>{property.title}</strong>. Commencez à discuter avec le bailleur!
      </p>
      
      <div className="flex gap-3">
        <Button
          variant="outline"
          className="flex-1 rounded-full"
          onClick={onClose}
          data-testid="continue-swiping-btn"
        >
          Continuer à swiper
        </Button>
        <Button
          className="flex-1 bg-primary hover:bg-primary-hover text-white rounded-full"
          onClick={onChat}
          data-testid="start-chat-btn"
        >
          <MessageCircle className="w-4 h-4 mr-2" />
          Discuter
        </Button>
      </div>
    </motion.div>
  </motion.div>
);

export default StudentDashboard;
