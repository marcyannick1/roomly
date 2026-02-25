import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion, useMotionValue, useTransform, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { getCurrentUser, getStudentFeed, likeListing, unlikeListing } from "@/lib/api";
import { Button } from "@/components/ui/button";
import {
  Heart,
  X,
  Star,
  MapPin,
  Home,
  Maximize2,
  Euro,
  MessageCircle,
  User,
  Bell,
  RefreshCw,
  Wifi,
  Car,
  Loader2,
  ChevronLeft,
  ChevronRight,
  LogOut
} from "lucide-react";
import { logout as apiLogout } from "@/lib/api";

const StudentDashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState(location.state?.user || null);
  const [listings, setListings] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [swiping, setSwiping] = useState(false);
  const [showMatch, setShowMatch] = useState(false);
  const [matchedListing, setMatchedListing] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    const init = async () => {
      try {
        if (!user) {
          const res = await getCurrentUser();
          setUser(res.data.user || res.data);
        }
      } catch {
        navigate("/login");
      }
    };
    init();
  }, []);

  useEffect(() => {
    if (user?.id) fetchListings();
  }, [user]);

  const fetchListings = async () => {
    setLoading(true);
    try {
      const res = await getStudentFeed();
      setListings(res.data || []);
    } catch {
      toast.error("Impossible de charger les annonces");
    } finally {
      setLoading(false);
    }
  };

  const handleSwipe = async (action) => {
    if (swiping || currentIndex >= listings.length) return;
    setSwiping(true);
    const listing = listings[currentIndex];

    try {
      if (action === "like" || action === "superlike") {
        await likeListing(user.id, listing.id);
        // Show match modal with 30% chance for demo effect
        if (Math.random() < 0.3) {
          setMatchedListing(listing);
          setShowMatch(true);
        } else {
          toast.success(action === "superlike" ? "⭐ Super Like envoyé!" : "❤️ Liké!");
        }
      }
    } catch (err) {
      toast.error("Erreur lors du swipe");
    } finally {
      setCurrentIndex(prev => prev + 1);
      setCurrentImageIndex(0);
      setSwiping(false);
    }
  };

  const handleLogout = async () => {
    try {
      await apiLogout();
    } catch { }
    document.cookie = "session_token=; path=/; max-age=0";
    navigate("/");
  };

  const currentListing = listings[currentIndex];

  const nextImage = () => {
    const imgs = currentListing?.photos || currentListing?.images || [];
    if (imgs.length > 1) setCurrentImageIndex(prev => (prev + 1) % imgs.length);
  };

  const prevImage = () => {
    const imgs = currentListing?.photos || currentListing?.images || [];
    if (imgs.length > 1) setCurrentImageIndex(prev => prev === 0 ? imgs.length - 1 : prev - 1);
  };

  const getListingImage = (listing, idx = 0) => {
    const photos = listing?.photos || listing?.images || [];
    return photos[idx] || "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800";
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-40 glass border-b border-slate-100">
        <div className="max-w-md mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 bg-primary rounded-xl flex items-center justify-center">
              <Home className="w-5 h-5 text-black" />
            </div>
            <span className="font-bold text-slate-900">Roomly</span>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate("/messages/list")}
              data-testid="messages-btn"
            >
              <MessageCircle className="w-5 h-5 text-slate-600" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate(`/profile/${user?.id}`)}
              data-testid="profile-btn"
            >
              <User className="w-5 h-5 text-slate-600" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleLogout}
              data-testid="logout-btn"
            >
              <LogOut className="w-5 h-5 text-slate-600" />
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="pt-16 pb-24 px-4">
        <div className="max-w-md mx-auto">
          {/* Welcome bar */}
          {user && (
            <div className="mt-4 mb-2 text-center">
              <p className="text-sm text-slate-500">
                Bonjour, <span className="font-semibold text-slate-700">{user.first_name}</span> 👋
              </p>
            </div>
          )}

          {loading ? (
            <div className="h-[65vh] flex items-center justify-center">
              <Loader2 className="w-8 h-8 text-primary animate-spin" />
            </div>
          ) : currentIndex >= listings.length ? (
            <div className="h-[65vh] flex flex-col items-center justify-center text-center p-6">
              <div className="w-20 h-20 bg-primary-50 rounded-full flex items-center justify-center mb-4">
                <RefreshCw className="w-10 h-10 text-primary" />
              </div>
              <h2 className="text-xl font-bold text-slate-900 mb-2">Plus d'annonces pour le moment</h2>
              <p className="text-slate-600 mb-6">Revenez plus tard ou ajustez vos préférences</p>
              <Button
                onClick={() => { setCurrentIndex(0); fetchListings(); }}
                className="bg-primary hover:bg-primary-hover text-black rounded-full"
                data-testid="refresh-btn"
              >
                Actualiser
              </Button>
            </div>
          ) : (
            <div className="relative h-[65vh] mt-4" data-testid="swipe-container">
              <AnimatePresence>
                {currentListing && (
                  <SwipeCard
                    key={currentListing.id}
                    listing={currentListing}
                    onSwipe={handleSwipe}
                    currentImageIndex={currentImageIndex}
                    onNextImage={nextImage}
                    onPrevImage={prevImage}
                    onViewDetails={() => navigate(`/listing/${currentListing.id}`)}
                    getImage={getListingImage}
                  />
                )}
              </AnimatePresence>
            </div>
          )}

          {/* Action Buttons */}
          {currentListing && currentIndex < listings.length && (
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
                <Star className="w-8 h-8 text-black" />
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
        </div>
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 glass border-t border-slate-100 z-40">
        <div className="max-w-md mx-auto px-6 py-3">
          <div className="flex items-center justify-around">
            <NavButton icon={Home} label="Swipe" active onClick={() => { }} />
            <NavButton icon={MessageCircle} label="Messages" onClick={() => navigate("/messages/list")} />
            <NavButton icon={User} label="Profil" onClick={() => navigate(`/profile/${user?.id}`)} />
          </div>
        </div>
      </nav>

      {/* Match Modal */}
      <AnimatePresence>
        {showMatch && matchedListing && (
          <MatchModal
            listing={matchedListing}
            onClose={() => setShowMatch(false)}
            onChat={() => { setShowMatch(false); navigate("/messages/list"); }}
            getImage={getListingImage}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

// Swipe Card Component
const SwipeCard = ({ listing, onSwipe, currentImageIndex, onNextImage, onPrevImage, onViewDetails, getImage }) => {
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 200], [-15, 15]);
  const likeOpacity = useTransform(x, [0, 100], [0, 1]);
  const dislikeOpacity = useTransform(x, [-100, 0], [1, 0]);

  const handleDragEnd = (event, info) => {
    if (info.offset.x > 100) onSwipe("like");
    else if (info.offset.x < -100) onSwipe("dislike");
  };

  const images = listing?.photos || listing?.images || [];

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
            src={getImage(listing, currentImageIndex)}
            alt={listing.title}
            className="w-full h-full object-cover"
            draggable="false"
          />

          {/* Image navigation */}
          {images.length > 1 && (
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

              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1">
                {images.map((_, idx) => (
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
            {listing.price}/mois
          </div>

          {/* Type badge */}
          <div className="absolute top-4 left-4 bg-primary/90 backdrop-blur-sm px-3 py-1.5 rounded-full text-black text-sm font-medium">
            {listing.room_type === "studio" ? "Studio" :
              listing.room_type === "apartment" ? "Appartement" :
                listing.room_type === "room" ? "Chambre" : "Colocation"}
          </div>
        </div>

        {/* Content */}
        <div className="p-5 h-2/5 flex flex-col">
          <h2 className="text-xl font-bold text-slate-900 mb-1 line-clamp-1">{listing.title}</h2>

          <div className="flex items-center gap-1 text-slate-500 text-sm mb-3">
            <MapPin className="w-4 h-4" />
            <span>{listing.city} {listing.postal_code ? `• ${listing.postal_code}` : ''}</span>
          </div>

          <div className="flex items-center gap-4 mb-3">
            {listing.surface && (
              <div className="flex items-center gap-1 text-slate-600">
                <Maximize2 className="w-4 h-4" />
                <span className="text-sm">{listing.surface} m²</span>
              </div>
            )}
            {listing.furnished && (
              <span className="text-xs bg-slate-100 px-2 py-1 rounded-full text-slate-600">Meublé</span>
            )}
            {listing.wifi && (
              <span className="text-xs bg-blue-50 px-2 py-1 rounded-full text-blue-600 flex items-center gap-1">
                <Wifi className="w-3 h-3" /> WiFi
              </span>
            )}
          </div>

          <p className="text-sm text-slate-600 line-clamp-2 flex-1">{listing.description}</p>

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
    className={`flex flex-col items-center gap-1 px-4 py-1 rounded-xl transition-colors ${active ? 'text-primary' : 'text-slate-400 hover:text-slate-600'
      }`}
    data-testid={`nav-${label.toLowerCase()}`}
  >
    <Icon className="w-5 h-5" />
    <span className="text-xs font-medium">{label}</span>
  </button>
);

// Match Modal Component
const MatchModal = ({ listing, onClose, onChat, getImage }) => (
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
        Vous avez liké <strong>{listing.title}</strong>. Commencez à discuter avec le bailleur!
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
          className="flex-1 bg-primary hover:bg-primary-hover text-black rounded-full"
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