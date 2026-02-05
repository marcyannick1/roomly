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
      <div className="w-full max-w-md flex flex-col items-center justify-center gap-8">
      {currentListing ? (
        <>
          <SwipeCard
            listing={currentListing}
            onLike={handleLike}
            onPass={handlePass}
            onViewDetails={() => setShowDetails(true)}
          />

          <motion.div
            className="flex justify-center gap-6 w-full"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <ActionButton
              icon={X}
              onClick={handlePass}
              color="gray"
              size="md"
            />

            <ActionButton
              icon={Info}
              onClick={() => setShowDetails(true)}
              color="blue"
              size="md"
            />

            <ActionButton
              icon={Heart}
              onClick={handleLike}
              color="primary"
              size="lg"
              filled
            />
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
        className="absolute top-8 left-8 z-20 bg-green-500 text-white px-6 py-3 rounded-2xl font-bold text-xl rotate-[-20deg] border-4 border-white shadow-2xl"
        style={{
          opacity: useTransform(x, [0, 100], [0, 1])
        }}
      >
        LIKE
      </motion.div>

      <motion.div
        className="absolute top-8 right-8 z-20 bg-red-500 text-white px-6 py-3 rounded-2xl font-bold text-xl rotate-[20deg] border-4 border-white shadow-2xl"
        style={{
          opacity: useTransform(x, [-100, 0], [1, 0])
        }}
      >
        NOPE
      </motion.div>

      <div className="w-full bg-white rounded-3xl overflow-hidden shadow-2xl border-2 border-gray-100 relative">
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
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
            </>
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
              <Home className="w-24 h-24 text-gray-300" />
            </div>
          )}

          <motion.div
            className="absolute top-4 right-4 bg-gradient-to-r from-[#fec629] to-[#f5b519] text-[#212220] px-5 py-2.5 rounded-full font-bold text-sm shadow-xl flex items-center gap-2 border-2 border-white/50"
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ delay: 0.3, type: "spring" }}
            whileHover={{ scale: 1.1, rotate: 5 }}
          >
            <Sparkles className="w-4 h-4" />
            {listing.compatibility_score || 85}% Match
          </motion.div>

          <motion.div
            className="absolute bottom-4 left-4 flex gap-2"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            {listing.room_type && (
              <div className="bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-full text-xs font-semibold text-[#212220] capitalize">
                {listing.room_type}
              </div>
            )}
            {listing.surface && (
              <div className="bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-full text-xs font-semibold text-[#212220]">
                {listing.surface}m²
              </div>
            )}
          </motion.div>
        </div>

        <motion.div
          className="p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h2 className="text-2xl font-bold text-[#212220] mb-3 line-clamp-1" style={{ fontFamily: 'Outfit' }}>
            {listing.title || 'Sans titre'}
          </h2>

          <div className="flex items-center gap-3 mb-3">
            <motion.div
              className="bg-gradient-to-r from-[#212220] to-[#3a3b39] text-white px-5 py-2.5 rounded-full font-bold text-lg shadow-lg"
              whileHover={{ scale: 1.05 }}
            >
              {listing.price || listing.rent || 0}€
            </motion.div>
            <span className="text-gray-600 font-medium">
              {listing.charges_included ? 'charges comprises' : `+ ${listing.charges || 0}€`}
            </span>
          </div>

          <div className="flex items-center gap-2 text-gray-600 mb-4">
            <MapPin className="w-4 h-4" />
            <span className="font-medium">
              {listing.city || listing.address?.city || 'Ville'}
            </span>
          </div>

          <p className="text-gray-700 leading-relaxed line-clamp-2">
            {listing.description || 'Aucune description disponible.'}
          </p>
        </motion.div>
      </div>
    </motion.div>
  );
}

function ActionButton({ icon: Icon, onClick, color, size = 'md', filled = false }) {
  const sizeClasses = {
    md: 'w-16 h-16',
    lg: 'w-20 h-20'
  };

  const colorClasses = {
    gray: 'border-gray-300 hover:border-[#212220] bg-white',
    blue: 'border-blue-300 hover:border-blue-500 bg-white',
    primary: filled
      ? 'bg-gradient-to-r from-[#fec629] to-[#f5b519] border-[#fec629] hover:shadow-2xl'
      : 'border-[#fec629] hover:border-[#f5b519] bg-white'
  };

  const iconClasses = {
    gray: 'text-[#212220]',
    blue: 'text-blue-600',
    primary: filled ? 'text-[#212220]' : 'text-[#fec629]'
  };

  return (
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
  );
}

function DetailsView({ listing, onBack, onLike, onPass }) {
  return (
    <motion.div
      key="details"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className="w-full max-w-3xl mx-auto space-y-6"
    >
      <motion.button
        onClick={onBack}
        className="flex items-center gap-2 text-gray-600 hover:text-[#212220] font-medium transition-colors group"
        whileHover={{ x: -5 }}
      >
        <X className="w-5 h-5 rotate-180 group-hover:animate-pulse" />
        Retour
      </motion.button>

      <motion.div
        className="bg-white rounded-3xl overflow-hidden shadow-2xl border-2 border-gray-100"
        initial={{ scale: 0.95 }}
        animate={{ scale: 1 }}
      >
        <div className="relative h-96 bg-gradient-to-br from-gray-100 to-gray-200 overflow-hidden group">
          {listing.photos?.[0] ? (
            <>
              <motion.img
                src={listing.photos[0]}
                alt={listing.title}
                className="w-full h-full object-cover"
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.3 }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
            </>
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
              <Home className="w-32 h-32 text-gray-300" />
            </div>
          )}

          <motion.div
            className="absolute top-6 right-6 bg-gradient-to-r from-[#fec629] to-[#f5b519] text-[#212220] px-6 py-3 rounded-full font-bold text-lg shadow-xl flex items-center gap-2"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2 }}
          >
            <Sparkles className="w-5 h-5" />
            {listing.compatibility_score || 85}% Match
          </motion.div>
        </div>

        <div className="p-8">
          <motion.h2
            className="text-4xl font-bold text-[#212220] mb-4"
            style={{ fontFamily: 'Outfit' }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            {listing.title || 'Sans titre'}
          </motion.h2>

          <motion.div
            className="flex items-center gap-3 mb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="bg-gradient-to-r from-[#212220] to-[#3a3b39] text-white px-6 py-3 rounded-full font-bold text-2xl shadow-lg">
              {listing.price || listing.rent || 0}€
            </div>
            <span className="text-gray-600 font-medium text-lg">
              {listing.charges_included ? 'charges comprises' : `+ ${listing.charges || 0}€ charges`}
            </span>
          </motion.div>

          <motion.div
            className="mb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <h3 className="text-xl font-bold text-[#212220] mb-3 flex items-center gap-2" style={{ fontFamily: 'Outfit' }}>
              <Info className="w-5 h-5" />
              Description
            </h3>
            <p className="text-gray-700 leading-relaxed">
              {listing.description || 'Aucune description disponible.'}
            </p>
          </motion.div>

          <motion.div
            className="flex gap-4 pt-6 border-t-2 border-gray-100"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <motion.button
              onClick={onPass}
              className="flex-1 bg-white border-2 border-gray-300 hover:border-[#212220] text-[#212220] px-6 py-4 rounded-full font-bold text-lg transition-all flex items-center justify-center gap-2 group"
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
            >
              <X className="w-6 h-6 group-hover:rotate-90 transition-transform" />
              Passer
            </motion.button>
            <motion.button
              onClick={onLike}
              className="flex-1 bg-gradient-to-r from-[#fec629] to-[#f5b519] hover:shadow-xl text-[#212220] px-6 py-4 rounded-full font-bold text-lg transition-all flex items-center justify-center gap-2 group"
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
            >
              <Heart className="w-6 h-6 group-hover:scale-110 transition-transform" fill="currentColor" />
              Liker
            </motion.button>
          </motion.div>
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
      className="text-center max-w-md"
    >
      <div className="bg-white rounded-3xl p-12 shadow-xl border-2 border-gray-100">
        <motion.div
          className="w-32 h-32 bg-gradient-to-br from-gray-50 to-gray-100 rounded-full flex items-center justify-center mx-auto mb-6"
          animate={{
            scale: [1, 1.05, 1],
            rotate: [0, 5, -5, 0]
          }}
          transition={{ duration: 3, repeat: Infinity }}
        >
          <Home className="w-16 h-16 text-gray-400" />
        </motion.div>
        <h3 className="text-3xl font-bold text-[#212220] mb-3" style={{ fontFamily: 'Outfit' }}>
          Plus de logements
        </h3>
        <p className="text-gray-600 text-lg">
          Revenez demain pour de nouvelles annonces ! 🏠
        </p>
      </div>
    </motion.div>
  );
}
