import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence, useMotionValue, useTransform } from 'framer-motion';
import { Home, Heart, X, Info, MapPin, Sparkles } from 'lucide-react';
import { getStudentFeed, likeListing, getCurrentUser, getStudentMatches } from '@/lib/api';
import { toast } from 'sonner';
import MatchAnimation from '@/components/MatchAnimation';

export default function FeedPage() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [listings, setListings] = useState([]);
  const [matchedListingIds, setMatchedListingIds] = useState(new Set());
  const [currentIndex, setCurrentIndex] = useState(0);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [showMatchAnimation, setShowMatchAnimation] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const response = await getCurrentUser();
      const currentUser = response.data?.user || response.data;
      setUser(currentUser);

      const role = currentUser?.role || currentUser?.user_type || (currentUser?.is_landlord ? 'landlord' : 'student');
      if (role === 'landlord') {
        navigate('/dashboard/listings', { replace: true });
        return;
      }

      const userId = currentUser?.id ?? currentUser?.user_id;
      if (!userId) return;
      const [feedResponse, matchesResponse] = await Promise.all([
        getStudentFeed(userId, 0, 1000),
        getStudentMatches(userId)
      ]);

      const matches = matchesResponse.data || [];
      const matchedIds = new Set(
        matches.map(match => match.listing_id).filter(Boolean)
      );
      setMatchedListingIds(matchedIds);

      const allListings = feedResponse.data || [];
      const filtered = allListings.filter(listing => !matchedIds.has(listing.id));
      setListings(filtered);
      setHasMore(false);
    } catch (error) {
      if (error?.response?.status === 404) {
        setListings([]);
        setHasMore(false);
      }
      console.error('Erreur chargement données:', error);
    }
  };

  const loadMoreListings = async () => {
    if (isLoadingMore || !hasMore) return;

    try {
      setIsLoadingMore(true);
      const userId = user?.id ?? user?.user_id;
      if (!userId) return;
      const nextPage = page + 1;
      const feedResponse = await getStudentFeed(userId, nextPage * 20, 1000);
      const newListings = (feedResponse.data || []).filter(
        listing => !matchedListingIds.has(listing.id)
      );

      if (newListings.length < 20) {
        setHasMore(false);
      }

      if (newListings.length > 0) {
        setListings(prev => {
          const existingIds = new Set(prev.map(item => item.id));
          const merged = [...prev];
          newListings.forEach(item => {
            if (!existingIds.has(item.id)) {
              merged.push(item);
              existingIds.add(item.id);
            }
          });
          return merged;
        });
        setPage(nextPage);
      }
    } catch (error) {
      console.error('Erreur chargement annonces:', error);
    } finally {
      setIsLoadingMore(false);
    }
  };

  const handleLike = async () => {
    try {
      const userId = user?.id ?? user?.user_id;
      const response = await likeListing(userId, currentListing.id);
      
      // Vérifier si c'est un match
      if (response.data?.match || response.data?.is_match) {
        setShowMatchAnimation(true);
        setTimeout(() => setShowMatchAnimation(false), 3000);
      } else {
        toast.success('❤️ Logement liké !');
      }
      
      setCurrentIndex(prev => prev + 1);
    } catch (error) {
      console.error('Erreur lors du like:', error);
      toast.error('Erreur lors du like');
    }
  };

  const handlePass = () => {
    setCurrentIndex(prev => prev + 1);
  };

  // Charger plus d'annonces quand on atteint la fin
  useEffect(() => {
    if (currentIndex >= listings.length - 2 && hasMore && !isLoadingMore) {
      loadMoreListings();
    }
  }, [currentIndex, listings.length, hasMore, isLoadingMore]);

  const filteredListings = listings.filter(listing => 
    listing && listing.id && listing.title
  );

  const currentListing = filteredListings[currentIndex];

  if (showDetails && currentListing) {
    return <DetailsView listing={currentListing} onBack={() => setShowDetails(false)} onLike={handleLike} onPass={handlePass} />;
  }

  return (
    <>
      <MatchAnimation show={showMatchAnimation} onComplete={() => setShowMatchAnimation(false)} />
      
      {/* Background simple et épuré */}
      <div className="fixed inset-0 bg-white -z-10" />
      
      <div className="w-full max-w-md flex flex-col items-center justify-center gap-6 relative">
        {/* Header minimaliste avec compteur */}
        {filteredListings.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full"
          >
            <div className="bg-white rounded-xl px-5 py-3 shadow-sm border border-gray-200 flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-400 font-medium">Découverte</p>
                <p className="text-lg font-semibold text-gray-900">
                  {currentIndex + 1} / {filteredListings.length}
                </p>
              </div>
              <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                <Home className="w-5 h-5 text-gray-600" />
              </div>
            </div>
          </motion.div>
        )}

      {currentListing ? (
        <>
          <SwipeCard
            listing={currentListing}
            onLike={handleLike}
            onPass={handlePass}
            onViewDetails={() => setShowDetails(true)}
          />

          <motion.div
            className="flex justify-center gap-4 w-full"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <motion.button
              onClick={handlePass}
              className="w-14 h-14 rounded-full bg-white border-2 border-gray-200 flex items-center justify-center hover:border-gray-300 transition-colors shadow-sm"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <X className="w-6 h-6 text-gray-600" />
            </motion.button>

            <motion.button
              onClick={() => setShowDetails(true)}
              className="w-14 h-14 rounded-full bg-white border-2 border-gray-200 flex items-center justify-center hover:border-gray-300 transition-colors shadow-sm"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Info className="w-6 h-6 text-gray-600" />
            </motion.button>

            <motion.button
              onClick={handleLike}
              className="w-16 h-16 rounded-full bg-gray-900 flex items-center justify-center hover:bg-gray-800 transition-colors shadow-lg"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Heart className="w-7 h-7 text-white fill-white" />
            </motion.button>
          </motion.div>
        </>
      ) : (
        <EmptyState />
      )}
      </div>
    </>
  );
}

function SwipeCard({ listing, onLike, onPass }) {
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 0, 200], [-20, 0, 20]);
  const opacity = useTransform(x, [-200, -100, 0, 100, 200], [0, 1, 1, 1, 0]);

  return (
    <motion.div
      drag="x"
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.7}
      style={{ x, rotate, opacity }}
      onDragEnd={(e, { offset, velocity }) => {
        if (Math.abs(offset.x) > 100 || Math.abs(velocity.x) > 500) {
          if (offset.x > 0) {
            onLike();
          } else {
            onPass();
          }
        }
      }}
      initial={{ opacity: 0, scale: 0.8, y: 50 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.8, y: -50 }}
      transition={{ duration: 0.5, type: "spring" }}
      className="cursor-grab active:cursor-grabbing w-full relative"
      whileHover={{ scale: 1.02 }}
    >
      <motion.div
        className="absolute top-8 left-8 z-20 bg-green-500 text-white px-8 py-4 rounded-2xl font-bold text-2xl rotate-[-20deg] border-4 border-white shadow-2xl"
        style={{
          opacity: useTransform(x, [0, 100], [0, 1])
        }}
      >
        ❤️ J'ADORE
      </motion.div>

      <motion.div
        className="absolute top-8 right-8 z-20 bg-red-500 text-white px-8 py-4 rounded-2xl font-bold text-2xl rotate-[20deg] border-4 border-white shadow-2xl"
        style={{
          opacity: useTransform(x, [-100, 0], [1, 0])
        }}
      >
        ❌ PASSER
      </motion.div>

      <div className="w-full bg-white rounded-2xl overflow-hidden shadow-lg border border-gray-200 relative">
        <div className="aspect-[3/4] bg-gradient-to-br from-gray-100 to-gray-200 relative overflow-hidden group">
          {listing.photos?.[0]?.url ? (
            <>
              <motion.img
                src={listing.photos[0].url}
                alt={listing.title || 'Logement'}
                className="w-full h-full object-cover"
                draggable="false"
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.3 }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
            </>
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/10 to-primary/5">
              <Home className="w-24 h-24 text-primary/40" />
            </div>
          )}

          {/* Badge Match amélioré */}
          <motion.div
            className="absolute top-6 right-6 bg-gradient-to-br from-primary via-primary to-yellow-500 text-primary-foreground px-6 py-3 rounded-2xl font-bold text-base shadow-2xl flex items-center gap-2 border-2 border-white/80"
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
            whileHover={{ scale: 1.15, rotate: 5 }}
          >
            <Sparkles className="w-5 h-5" />
            <span className="text-lg">{listing.compatibility_score || 85}%</span>
          </motion.div>

          {/* Tags en bas améliorés */}
          <motion.div
            className="absolute bottom-6 left-6 right-6 flex gap-2 flex-wrap"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            {listing.room_type && (
              <motion.div
                className="bg-white/95 backdrop-blur-md px-4 py-2 rounded-full text-sm font-bold text-foreground capitalize shadow-lg"
                whileHover={{ scale: 1.1 }}
              >
                {listing.room_type === 'studio' && '🏠'} {listing.room_type}
              </motion.div>
            )}
            {listing.surface && (
              <motion.div
                className="bg-white/95 backdrop-blur-md px-4 py-2 rounded-full text-sm font-bold text-foreground shadow-lg"
                whileHover={{ scale: 1.1 }}
              >
                📐 {listing.surface}m²
              </motion.div>
            )}
            {listing.furnished !== undefined && (
              <motion.div
                className="bg-white/95 backdrop-blur-md px-4 py-2 rounded-full text-sm font-bold text-foreground shadow-lg"
                whileHover={{ scale: 1.1 }}
              >
                {listing.furnished ? '🛋️ Meublé' : '📦 Non meublé'}
              </motion.div>
            )}
          </motion.div>
        </div>

        <motion.div
          className="p-6 bg-card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h2 className="text-2xl font-bold text-foreground mb-3 line-clamp-1" style={{ fontFamily: 'Outfit' }}>
            {listing.title || 'Sans titre'}
          </h2>

          <div className="flex items-center gap-3 mb-4">
            <motion.div
              className="bg-gradient-to-r from-primary to-yellow-500 text-primary-foreground px-6 py-3 rounded-2xl font-bold text-xl shadow-lg"
              whileHover={{ scale: 1.05, rotate: -2 }}
            >
              {listing.price || listing.rent || 0}€
            </motion.div>
            <span className="text-muted-foreground font-medium">
              {listing.charges_included ? '✅ charges comprises' : `+ ${listing.charges || 0}€ /mois`}
            </span>
          </div>

          <div className="flex items-center gap-2 text-muted-foreground mb-4">
            <MapPin className="w-5 h-5 text-primary" />
            <span className="font-semibold text-foreground">
              {listing.city || listing.address?.city || 'Ville'}
            </span>
          </div>

          <p className="text-muted-foreground leading-relaxed line-clamp-3">
            {listing.description || 'Aucune description disponible.'}
          </p>
        </motion.div>
      </div>
    </motion.div>
  );
}

function ActionButton({ icon: Icon, onClick, color, size = 'md', filled = false, label }) {
  const sizeClasses = {
    md: 'w-16 h-16',
    lg: 'w-20 h-20'
  };

  const colorClasses = {
    gray: 'border-border hover:border-foreground bg-card/90 backdrop-blur-xl',
    blue: 'border-blue-300 hover:border-blue-500 bg-card/90 backdrop-blur-xl',
    primary: filled
      ? 'bg-gradient-to-br from-primary via-primary to-yellow-500 border-primary/50 hover:shadow-2xl'
      : 'border-primary hover:border-yellow-500 bg-card/90 backdrop-blur-xl'
  };

  const iconClasses = {
    gray: 'text-foreground',
    blue: 'text-blue-600',
    primary: filled ? 'text-primary-foreground' : 'text-primary'
  };

  return (
    <div className="flex flex-col items-center gap-2">
      <motion.button
        whileHover={{ scale: 1.15, y: -5 }}
        whileTap={{ scale: 0.95 }}
        onClick={onClick}
        className={`${sizeClasses[size]} rounded-full border-4 ${colorClasses[color]} flex items-center justify-center shadow-xl hover:shadow-2xl transition-all relative overflow-hidden group`}
      >
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
          animate={{ x: [-200, 200] }}
          transition={{ duration: 2, repeat: Infinity }}
        />
        <Icon
          className={`${size === 'lg' ? 'w-10 h-10' : 'w-8 h-8'} ${iconClasses[color]} relative z-10`}
          fill={filled ? 'currentColor' : 'none'}
          strokeWidth={filled ? 0 : 2.5}
        />
      </motion.button>
      {label && (
        <span className="text-xs font-medium text-muted-foreground">{label}</span>
      )}
    </div>
  );
}

function DetailsView({ listing, onBack, onLike, onPass }) {
  return (
    <motion.div
      key="details"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        className="bg-card/95 backdrop-blur-xl rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border-2 border-border/50 relative"
        onClick={e => e.stopPropagation()}
      >
        {/* Header Image */}
        <div className="relative h-80 rounded-t-3xl overflow-hidden">
          {listing.photos?.[0]?.url ? (
            <>
              <motion.img
                src={listing.photos[0].url}
                alt={listing.title}
                className="w-full h-full object-cover"
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.3 }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
            </>
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/10 to-primary/5">
              <Home className="w-32 h-32 text-primary/40" />
            </div>
          )}
          
          {/* Back Button */}
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={onBack}
            className="absolute top-6 left-6 w-12 h-12 rounded-full bg-card/90 backdrop-blur-xl border border-border/50 flex items-center justify-center text-foreground shadow-xl hover:bg-card transition-colors"
          >
            <X className="w-6 h-6" />
          </motion.button>

          {/* Price Badge */}
          <div className="absolute top-6 right-6 bg-gradient-to-br from-primary via-primary to-yellow-500 text-black px-6 py-3 rounded-full font-bold text-2xl shadow-xl">
            {listing.price || listing.rent || 0}€
            <span className="text-sm font-normal ml-1">/mois</span>
          </div>

          {/* Match Badge */}
          <motion.div
            className="absolute top-20 right-6 bg-card/90 backdrop-blur-xl border border-border/50 px-4 py-2 rounded-full text-sm font-bold shadow-lg flex items-center gap-2"
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ delay: 0.2, type: "spring" }}
          >
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-foreground">{listing.compatibility_score || 85}% Match</span>
          </motion.div>

          {/* Bottom Info */}
          <div className="absolute bottom-0 left-0 right-0 p-6">
            <h2 className="text-white text-4xl font-bold mb-2" style={{ fontFamily: 'Outfit' }}>
              {listing.title || 'Sans titre'}
            </h2>
            <div className="flex items-center gap-2 text-white/90">
              <MapPin className="w-5 h-5" />
              <span className="text-lg">{listing.city || listing.address?.city || 'Ville'}</span>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-8 space-y-8">
          {/* Quick Stats */}
          <div className="grid grid-cols-3 gap-4">
            {listing.surface && (
              <motion.div
                whileHover={{ y: -4 }}
                className="bg-background/50 backdrop-blur-sm rounded-2xl p-4 text-center border border-border/50"
              >
                <div className="text-3xl mb-2">📐</div>
                <div className="text-2xl font-bold text-foreground">{listing.surface}m²</div>
                <div className="text-sm text-muted-foreground">Surface</div>
              </motion.div>
            )}
            {listing.room_type && (
              <motion.div
                whileHover={{ y: -4 }}
                className="bg-background/50 backdrop-blur-sm rounded-2xl p-4 text-center border border-border/50"
              >
                <div className="text-3xl mb-2">🏠</div>
                <div className="text-2xl font-bold text-foreground capitalize">{listing.room_type}</div>
                <div className="text-sm text-muted-foreground">Type</div>
              </motion.div>
            )}
            {listing.furnished !== undefined && (
              <motion.div
                whileHover={{ y: -4 }}
                className="bg-background/50 backdrop-blur-sm rounded-2xl p-4 text-center border border-border/50"
              >
                <div className="text-3xl mb-2">{listing.furnished ? '🛋️' : '📦'}</div>
                <div className="text-2xl font-bold text-foreground">{listing.furnished ? 'Meublé' : 'Vide'}</div>
                <div className="text-sm text-muted-foreground">Ameublement</div>
              </motion.div>
            )}
          </div>

          {/* Price Details */}
          {listing.charges !== undefined && (
            <motion.div
              className="bg-background/30 backdrop-blur-sm rounded-2xl p-4 border border-border/50 flex items-center justify-between"
              whileHover={{ scale: 1.01 }}
            >
              <span className="text-muted-foreground font-medium">
                {listing.charges_included ? '✅ Charges comprises' : `💰 Charges : ${listing.charges}€/mois`}
              </span>
            </motion.div>
          )}

          {/* Description */}
          {listing.description && (
            <div className="bg-background/30 backdrop-blur-sm rounded-2xl p-6 border border-border/50">
              <h3 className="text-xl font-bold text-foreground mb-3 flex items-center gap-2" style={{ fontFamily: 'Outfit' }}>
                <Info className="w-5 h-5 text-primary" />
                Description
              </h3>
              <p className="text-muted-foreground leading-relaxed">{listing.description}</p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-4">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={onPass}
              className="flex-1 py-4 rounded-2xl bg-background/50 backdrop-blur-sm border-2 border-border/50 text-foreground font-semibold text-lg hover:bg-background transition-colors flex items-center justify-center gap-2"
            >
              <X className="w-5 h-5" />
              Passer
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={onLike}
              className="flex-1 py-4 rounded-2xl bg-gradient-to-br from-primary via-primary to-yellow-500 text-black font-bold text-lg shadow-xl hover:shadow-2xl transition-shadow flex items-center justify-center gap-2"
            >
              <Heart className="w-5 h-5" fill="currentColor" />
              J'adore !
            </motion.button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

function EmptyState() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="text-center max-w-md w-full"
    >
      <div className="bg-card/80 backdrop-blur-xl rounded-3xl p-12 shadow-2xl border-2 border-border/50">
        <motion.div
          className="w-32 h-32 bg-gradient-to-br from-primary/20 to-primary/10 rounded-full flex items-center justify-center mx-auto mb-6"
          animate={{
            scale: [1, 1.05, 1],
            rotate: [0, 5, -5, 0]
          }}
          transition={{ duration: 3, repeat: Infinity }}
        >
          <Home className="w-16 h-16 text-primary" />
        </motion.div>
        <h3 className="text-3xl font-bold text-foreground mb-3" style={{ fontFamily: 'Outfit' }}>
          🎉 Vous avez tout vu !
        </h3>
        <p className="text-muted-foreground text-lg mb-6">
          Pas de nouvelles annonces pour le moment. Revenez demain pour découvrir de nouveaux logements !
        </p>
        <motion.div
          className="bg-primary/10 rounded-2xl p-4 border border-primary/20"
          whileHover={{ scale: 1.02 }}
        >
          <p className="text-sm text-foreground font-medium">
            💡 <span className="font-bold">Astuce :</span> Ajustez vos préférences pour voir plus d'annonces
          </p>
        </motion.div>
      </div>
    </motion.div>
  );
}
