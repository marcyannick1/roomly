import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Home, MapPin, Trash2 } from 'lucide-react';
import { getStudentLikedListings, unlikeListing, getCurrentUser } from '@/lib/api';
import { toast } from 'sonner';
import { EmptyState } from '@/components/dashboard/EmptyState';
import { ContentCard } from '@/components/dashboard/ContentCard';

export default function LikedPage() {
  const [user, setUser] = useState(null);
  const [likedListings, setLikedListings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const userResponse = await getCurrentUser();
      const currentUser = userResponse.data?.user || userResponse.data;
      setUser(currentUser);

      const userId = currentUser?.id ?? currentUser?.user_id;
      const response = await getStudentLikedListings(userId);
      setLikedListings(response.data || []);
    } catch (error) {
      console.error('Erreur chargement likes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUnlike = async (listingId) => {
    try {
      const userId = user?.id ?? user?.user_id;
      await unlikeListing(userId, listingId);
      toast.success('❌ Like retiré');
      setLikedListings(prev => prev.filter(l => l.id !== listingId));
    } catch (error) {
      console.error('Erreur unlike:', error);
      toast.error('Erreur lors du retrait du like');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          className="w-16 h-16 border-4 border-[#fec629] border-t-transparent rounded-full"
        />
      </div>
    );
  }

  if (!likedListings || likedListings.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <EmptyState
          icon={Heart}
          title="Aucun like"
          description="Likez des logements depuis le fil d'actualité !"
        />
      </div>
    );
  }

  return (
    <ContentCard title="Mes Likes" count={likedListings.length}>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <AnimatePresence mode="popLayout">
          {likedListings.map((listing, index) => (
            <LikedCard
              key={listing.id}
              listing={listing}
              index={index}
              onUnlike={handleUnlike}
            />
          ))}
        </AnimatePresence>
      </div>
    </ContentCard>
  );
}

function LikedCard({ listing, index, onUnlike }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.8 }}
      transition={{ delay: index * 0.05 }}
      whileHover={{ scale: 1.03, y: -5 }}
      className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all border-2 border-gray-100 group relative"
    >
      <div className="relative h-48 bg-gradient-to-br from-gray-100 to-gray-200">
        {listing.photos?.[0]?.url ? (
          <>
            <img
              src={listing.photos[0].url}
              alt={listing.title}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
          </>
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Home className="w-16 h-16 text-gray-300" />
          </div>
        )}

        <motion.button
          onClick={() => onUnlike(listing.id)}
          className="absolute top-3 right-3 w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-red-500 hover:text-white transition-all group/btn"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <Trash2 className="w-5 h-5 group-hover/btn:animate-pulse" />
        </motion.button>

        <div className="absolute bottom-3 left-3 bg-gradient-to-r from-[#fec629] to-[#f5b519] text-[#212220] px-4 py-2 rounded-full font-bold shadow-lg">
          {listing.price || listing.rent || 0}€
        </div>
      </div>

      <div className="p-4">
        <h3 className="text-lg font-bold text-[#212220] mb-2 truncate group-hover:text-[#fec629] transition-colors" style={{ fontFamily: 'Outfit' }}>
          {listing.title || 'Sans titre'}
        </h3>

        <div className="flex items-center gap-2 text-gray-600 mb-2">
          <MapPin className="w-4 h-4 flex-shrink-0" />
          <span className="text-sm truncate">
            {listing.city || listing.address?.city || 'Ville'}
          </span>
        </div>

        {listing.surface && (
          <div className="text-sm text-gray-600">
            {listing.surface}m² • {listing.room_type || 'Logement'}
          </div>
        )}
      </div>
    </motion.div>
  );
}
