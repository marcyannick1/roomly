import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Home, MapPin, Calendar, Phone, Mail, CheckCircle2, MessageCircle, Sparkles } from 'lucide-react';
import { getStudentMatches, getCurrentUser } from '@/lib/api';
import { EmptyState } from '@/components/dashboard/EmptyState';
import { ContentCard } from '@/components/dashboard/ContentCard';

export default function MatchesPage() {
  const [user, setUser] = useState(null);
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMatch, setSelectedMatch] = useState(null);

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
      const matchesResponse = await getStudentMatches(userId);
      setMatches(matchesResponse.data || []);
    } catch (error) {
      console.error('Erreur chargement matchs:', error);
    } finally {
      setLoading(false);
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

  if (!matches || matches.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <EmptyState
          icon={CheckCircle2}
          title="Aucun match"
          description="Likez des logements pour créer des matchs !"
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <ContentCard title="Mes Matchs" count={matches.length}>
        <div className="grid gap-6">
          <AnimatePresence mode="popLayout">
            {matches.map((match, index) => (
              <MatchCard
                key={match.id}
                match={match}
                index={index}
                onClick={() => setSelectedMatch(match)}
              />
            ))}
          </AnimatePresence>
        </div>
      </ContentCard>

      <AnimatePresence>
        {selectedMatch && (
          <MatchDetails
            match={selectedMatch}
            onClose={() => setSelectedMatch(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function MatchCard({ match, index, onClick }) {
  const listing = match.listing || {};
  const landlord = match.landlord || {};

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ delay: index * 0.1 }}
      whileHover={{ scale: 1.02, y: -5 }}
      onClick={onClick}
      className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all cursor-pointer border-2 border-gray-100 group"
    >
      <div className="flex gap-4 p-6">
        <div className="relative w-32 h-32 rounded-xl overflow-hidden flex-shrink-0 bg-gradient-to-br from-gray-100 to-gray-200">
          {listing.photos?.[0]?.url ? (
            <>
              <img
                src={listing.photos[0].url}
                alt={listing.title}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
            </>
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Home className="w-12 h-12 text-gray-300" />
            </div>
          )}

          <motion.div
            className="absolute top-2 right-2 bg-gradient-to-r from-[#fec629] to-[#f5b519] text-[#212220] px-2 py-1 rounded-full text-xs font-bold flex items-center gap-1"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.3 }}
          >
            <Sparkles className="w-3 h-3" />
            Match
          </motion.div>
        </div>

        <div className="flex-1 min-w-0">
          <h3 className="text-xl font-bold text-[#212220] mb-2 truncate group-hover:text-[#fec629] transition-colors" style={{ fontFamily: 'Outfit' }}>
            {listing.title || 'Sans titre'}
          </h3>

          <div className="flex items-center gap-2 mb-3">
            <div className="bg-gradient-to-r from-[#212220] to-[#3a3b39] text-white px-4 py-1.5 rounded-full font-bold text-sm">
              {listing.price || listing.rent || 0}€
            </div>
            {listing.surface && (
              <span className="text-gray-600 text-sm font-medium">
                {listing.surface}m²
              </span>
            )}
          </div>

          <div className="flex items-center gap-2 text-gray-600 mb-3">
            <MapPin className="w-4 h-4 flex-shrink-0" />
            <span className="text-sm truncate">
              {listing.city || listing.address?.city || 'Ville inconnue'}
            </span>
          </div>

          <div className="flex items-center gap-3 text-sm text-gray-600">
            <div className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              {new Date(match.created_at).toLocaleDateString('fr-FR')}
            </div>
            {landlord.phone && (
              <div className="flex items-center gap-1">
                <Phone className="w-4 h-4" />
                <span className="truncate">{landlord.phone}</span>
              </div>
            )}
          </div>
        </div>

        <motion.div
          className="flex-shrink-0 w-10 h-10 rounded-full bg-[#fec629] flex items-center justify-center group-hover:scale-110 transition-transform"
          whileHover={{ rotate: 15 }}
        >
          <Heart className="w-5 h-5 text-[#212220]" fill="currentColor" />
        </motion.div>
      </div>
    </motion.div>
  );
}

function MatchDetails({ match, onClose }) {
  const listing = match.listing || {};
  const landlord = match.landlord || {};

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl"
      >
        <div className="relative h-64 bg-gradient-to-br from-gray-100 to-gray-200">
          {listing.photos?.[0]?.url ? (
            <>
              <img
                src={listing.photos[0].url}
                alt={listing.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            </>
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Home className="w-24 h-24 text-gray-300" />
            </div>
          )}

          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white transition-colors"
          >
            <span className="text-2xl">×</span>
          </button>

          <div className="absolute bottom-4 left-4 right-4">
            <h2 className="text-3xl font-bold text-white mb-2" style={{ fontFamily: 'Outfit' }}>
              {listing.title || 'Sans titre'}
            </h2>
            <div className="flex items-center gap-2">
              <MapPin className="w-5 h-5 text-white" />
              <span className="text-white font-medium">
                {listing.city || listing.address?.city || 'Ville inconnue'}
              </span>
            </div>
          </div>
        </div>

        <div className="p-8 space-y-6">
          <div className="flex items-center gap-4">
            <div className="bg-gradient-to-r from-[#212220] to-[#3a3b39] text-white px-6 py-3 rounded-full font-bold text-2xl">
              {listing.price || listing.rent || 0}€
            </div>
            <span className="text-gray-600 text-lg font-medium">
              {listing.charges_included ? 'charges comprises' : `+ ${listing.charges || 0}€`}
            </span>
          </div>

          {listing.description && (
            <div>
              <h3 className="text-xl font-bold text-[#212220] mb-3 flex items-center gap-2" style={{ fontFamily: 'Outfit' }}>
                <Home className="w-5 h-5" />
                Description
              </h3>
              <p className="text-gray-700 leading-relaxed">
                {listing.description}
              </p>
            </div>
          )}

          <div className="border-t-2 border-gray-100 pt-6">
            <h3 className="text-xl font-bold text-[#212220] mb-4 flex items-center gap-2" style={{ fontFamily: 'Outfit' }}>
              <Phone className="w-5 h-5" />
              Contact du propriétaire
            </h3>
            <div className="space-y-3">
              {landlord.first_name && (
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-[#fec629] rounded-full flex items-center justify-center">
                    <span className="font-bold text-[#212220]">
                      {landlord.first_name[0]}{landlord.last_name?.[0] || ''}
                    </span>
                  </div>
                  <span className="font-medium text-gray-900">
                    {landlord.first_name} {landlord.last_name || ''}
                  </span>
                </div>
              )}
              {landlord.phone && (
                <div className="flex items-center gap-3 text-gray-700">
                  <Phone className="w-5 h-5 text-[#fec629]" />
                  <a href={`tel:${landlord.phone}`} className="hover:text-[#fec629] transition-colors">
                    {landlord.phone}
                  </a>
                </div>
              )}
              {landlord.email && (
                <div className="flex items-center gap-3 text-gray-700">
                  <Mail className="w-5 h-5 text-[#fec629]" />
                  <a href={`mailto:${landlord.email}`} className="hover:text-[#fec629] transition-colors">
                    {landlord.email}
                  </a>
                </div>
              )}
            </div>
          </div>

          <motion.button
            whileHover={{ scale: 1.02, y: -2 }}
            whileTap={{ scale: 0.98 }}
            onClick={onClose}
            className="w-full bg-gradient-to-r from-[#fec629] to-[#f5b519] text-[#212220] px-6 py-4 rounded-full font-bold text-lg flex items-center justify-center gap-2 hover:shadow-xl transition-all"
          >
            <MessageCircle className="w-6 h-6" />
            Contacter le propriétaire
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
}
