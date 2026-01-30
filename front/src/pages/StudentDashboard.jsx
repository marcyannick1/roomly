import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { getCurrentUser, getStudentFeed, likeListing, getStudentMatches, getStudentLikedListings, unlikeListing, updateStudentProfile } from '@/lib/api';
import { toast } from 'sonner';
import { Home, Heart, X, LogOut, User, MessageCircle, Settings, Flame, Star } from 'lucide-react';
import { motion } from 'framer-motion';

export default function StudentDashboard() {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState(location.state?.user || null);
  const [listings, setListings] = useState([]);
  const [likedListings, setLikedListings] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [matches, setMatches] = useState([]);
  const [view, setView] = useState('feed');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      let currentUser = user;
      if (!currentUser) {
        const response = await getCurrentUser();
        currentUser = response.data?.user || response.data;
        setUser(currentUser);
      }

      const userId = currentUser?.id ?? currentUser?.user_id;
      if (!userId) {
        console.error('User id introuvable');
        return;
      }

      try {
        const feedResponse = await getStudentFeed(userId);
        setListings(feedResponse.data || []);

        const matchesResponse = await getStudentMatches(userId);
        setMatches(matchesResponse.data || []);

        const likedResponse = await getStudentLikedListings(userId);
        setLikedListings(likedResponse.data || []);
      } catch (error) {
        if (error.response?.status === 404) {
          const minimalProfile = {
            user_id: userId,
            room_type: 'studio',
            furnished: true,
            smoking: false,
            pets: false,
            noise_level: 5,
            max_budget: 1000,
            guarantor_income: 0,
            university: '',
            study_level: '',
            passions: ''
          };
          
          await updateStudentProfile(minimalProfile);
          toast.success('Profil créé !');
          
          const feedResponse = await getStudentFeed(userId);
          setListings(feedResponse.data || []);

          const matchesResponse = await getStudentMatches(userId);
          setMatches(matchesResponse.data || []);

          const likedResponse = await getStudentLikedListings(userId);
          setLikedListings(likedResponse.data || []);
        } else {
          throw error;
        }
      }
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error('Erreur lors du chargement');
    }
  };

  const handleLike = async () => {
    const listing = listings[currentIndex];
    try {
      const userId = user?.id ?? user?.user_id;
      if (!userId) {
        toast.error('Utilisateur introuvable');
        return;
      }
      await likeListing(userId, listing.listing_id || listing.id);
      toast.success('Logement liké ! 💚');
      setCurrentIndex(currentIndex + 1);
    } catch (error) {
      console.error(error);
      toast.error('Erreur lors du like');
    }
  };

  const handlePass = () => {
    setCurrentIndex(currentIndex + 1);
  };

  const handleLogout = () => {
    document.cookie = 'session_token=; path=/; max-age=0';
    navigate('/');
  };

  const currentListing = listings[currentIndex];

  const navItems = [
    { id: 'feed', icon: Flame, label: 'Découvrir' },
    { id: 'matches', icon: MessageCircle, label: 'Matchs', badge: matches.length },
    { id: 'liked', icon: Star, label: 'Mes likes' },
    { id: 'profile', icon: User, label: 'Profil' },
    { id: 'settings', icon: Settings, label: 'Paramètres' },
  ];

  return (
    <div className="min-h-screen bg-white flex">
      {/* Sidebar */}
      <aside className="w-72 bg-[#fec629] text-[#212220] flex flex-col shadow-2xl fixed left-0 top-0 h-screen z-50">
        <div className="p-6 border-b border-black/10">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-[#212220] rounded-2xl flex items-center justify-center shadow-lg">
              <Flame className="w-7 h-7 text-[#fec629]" />
            </div>
            <span className="text-2xl font-bold text-[#212220]" style={{ fontFamily: 'Outfit' }}>Roomly</span>
          </div>
          
          <div className="bg-black/5 rounded-2xl p-4 border border-black/10">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-[#212220] rounded-full flex items-center justify-center font-bold text-lg shadow-lg text-[#fec629]">
                {user?.name?.charAt(0).toUpperCase() || 'U'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-[#212220] truncate">{user?.name || 'Utilisateur'}</p>
                <p className="text-xs text-[#212220]/70 truncate">{user?.email || ''}</p>
              </div>
            </div>
          </div>
        </div>

        <nav className="flex-1 py-4 px-3">
          <div className="space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = view === item.id;
              
              return (
                <button
                  key={item.id}
                  onClick={() => setView(item.id)}
                  className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-xl transition-all duration-200 group relative ${
                    isActive 
                      ? 'bg-[#212220] text-[#fec629] shadow-lg' 
                      : 'hover:bg-black/5 text-[#212220]/70 hover:text-[#212220]'
                  }`}
                  data-testid={`nav-${item.id}`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{item.label}</span>
                  
                  {item.badge !== undefined && item.badge > 0 && (
                    <span className="ml-auto bg-[#212220] text-[#fec629] text-xs font-bold px-2 py-0.5 rounded-full">
                      {item.badge}
                    </span>
                  )}
                  
                  {isActive && (
                    <motion.div
                      layoutId="activeNav"
                      className="absolute inset-0 bg-[#212220] rounded-xl -z-10"
                      transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                    />
                  )}
                </button>
              );
            })}
          </div>
        </nav>

        <div className="p-4 border-t border-black/10">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-black/5 hover:bg-black/10 text-[#212220]/70 hover:text-[#212220] transition-all duration-200"
            data-testid="logout-btn"
          >
            <LogOut className="w-5 h-5" />
            <span className="font-medium">Déconnexion</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 ml-72 bg-white min-h-screen flex items-center justify-center p-8">
        {view === 'feed' && (
          <div className="w-full max-w-md flex flex-col items-center justify-center gap-8">
            {currentListing ? (
              <>
                {/* Single Card - Centered */}
                <motion.div
                  key={currentListing.listing_id || currentListing.id}
                  drag="x"
                  dragConstraints={{ left: 0, right: 0 }}
                  dragElastic={0.7}
                  onDragEnd={(e, { offset, velocity }) => {
                    const swipe = Math.abs(offset.x) * velocity.x;
                    if (swipe > 10000) {
                      handleLike();
                    } else if (swipe < -10000) {
                      handlePass();
                    }
                  }}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1, rotate: 0, x: 0, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.3 }}
                  className="cursor-grab active:cursor-grabbing w-full"
                  data-testid="swipe-card"
                >
                  <div className="w-full bg-white rounded-3xl overflow-hidden shadow-2xl border-2 border-gray-100">
                    {/* Image */}
                    <div className="aspect-[3/4] bg-gray-100 relative">
                      {currentListing.photos?.[0]?.url ? (
                        <img
                          src={currentListing.photos[0].url}
                          alt={currentListing.title || 'Logement'}
                          className="w-full h-full object-cover"
                          draggable="false"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gray-50">
                          <Home className="w-24 h-24 text-gray-300" />
                        </div>
                      )}
                      
                      {/* Compatibility Score Badge */}
                      <div className="absolute top-4 right-4 bg-[#fec629] text-[#212220] px-4 py-2 rounded-full font-bold text-sm shadow-xl">
                        {currentListing.compatibility_score || 85}% Match
                      </div>
                    </div>

                    {/* Info */}
                    <div className="p-6">
                      <h2 className="text-2xl font-bold text-[#212220] mb-3" style={{ fontFamily: 'Outfit' }}>
                        {currentListing.title || 'Sans titre'}
                      </h2>
                      <div className="flex items-center gap-2 mb-3">
                        <div className="bg-[#212220] text-white px-4 py-2 rounded-full font-bold text-lg">
                          {currentListing.price || currentListing.rent || 0}€
                        </div>
                        <span className="text-gray-600 font-medium">
                          {currentListing.charges_included ? 'charges comprises' : `+ ${currentListing.charges || 0}€`}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-600 mb-4 flex-wrap">
                        <span className="bg-gray-100 px-3 py-1.5 rounded-full text-sm font-medium">
                          {currentListing.city || currentListing.address?.city || 'Ville'}
                        </span>
                        {currentListing.surface && (
                          <>
                            <span className="text-gray-400">•</span>
                            <span className="bg-gray-100 px-3 py-1.5 rounded-full text-sm font-medium">
                              {currentListing.surface}m²
                            </span>
                          </>
                        )}
                        {currentListing.room_type && (
                          <>
                            <span className="text-gray-400">•</span>
                            <span className="bg-gray-100 px-3 py-1.5 rounded-full text-sm font-medium capitalize">
                              {currentListing.room_type}
                            </span>
                          </>
                        )}
                      </div>
                      <p className="text-gray-700 leading-relaxed line-clamp-3">
                        {currentListing.description || 'Aucune description disponible.'}
                      </p>
                    </div>
                  </div>
                </motion.div>

                {/* Action Buttons - Below Card */}
                <div className="flex justify-center gap-6 w-full">
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handlePass}
                    data-testid="pass-btn"
                    className="w-16 h-16 rounded-full bg-white border-4 border-gray-300 flex items-center justify-center shadow-xl hover:shadow-2xl hover:border-[#212220] transition-all"
                  >
                    <X className="w-8 h-8 text-[#212220]" strokeWidth={2.5} />
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setView('details')}
                    data-testid="details-btn"
                    className="w-16 h-16 rounded-full bg-white border-4 border-gray-300 flex items-center justify-center shadow-xl hover:shadow-2xl hover:border-[#fec629] transition-all"
                  >
                    <svg className="w-7 h-7 text-[#212220]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </motion.button>
                  
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleLike}
                    data-testid="like-btn"
                    className="w-20 h-20 rounded-full bg-[#fec629] flex items-center justify-center shadow-2xl hover:shadow-3xl hover:bg-[#212220] transition-all group"
                  >
                    <Heart className="w-10 h-10 text-[#212220] group-hover:text-[#fec629]" fill="currentColor" strokeWidth={0} />
                  </motion.button>
                </div>
              </>
            ) : (
              <div className="text-center max-w-md">
                <div className="bg-white rounded-3xl p-12 shadow-xl border-2 border-gray-100">
                  <div className="w-32 h-32 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Home className="w-16 h-16 text-gray-400" />
                  </div>
                  <h3 className="text-3xl font-bold text-[#212220] mb-3" style={{ fontFamily: 'Outfit' }}>
                    Plus de logements
                  </h3>
                  <p className="text-gray-600 text-lg">
                    Revenez demain pour de nouvelles annonces ! 🏠
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Vue Détails */}
        {view === 'details' && currentListing && (
          <div className="w-full max-w-3xl mx-auto space-y-6">
            <button
              onClick={() => setView('feed')}
              className="flex items-center gap-2 text-gray-600 hover:text-[#212220] font-medium transition-colors"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Retour
            </button>

            <div className="bg-white rounded-3xl overflow-hidden shadow-2xl border-2 border-gray-100">
              <div className="relative h-96 bg-gray-100">
                {currentListing.photos?.[0] ? (
                  <img
                    src={currentListing.photos[0]}
                    alt={currentListing.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gray-50">
                    <Home className="w-32 h-32 text-gray-300" />
                  </div>
                )}
                
                <div className="absolute top-6 right-6 bg-[#fec629] text-[#212220] px-5 py-2.5 rounded-full font-bold text-lg shadow-xl">
                  {currentListing.compatibility_score || 85}% Match
                </div>
              </div>

              <div className="p-8">
                <h2 className="text-4xl font-bold text-[#212220] mb-4" style={{ fontFamily: 'Outfit' }}>
                  {currentListing.title || 'Sans titre'}
                </h2>
                
                <div className="flex items-center gap-3 mb-6">
                  <div className="bg-[#212220] text-white px-6 py-3 rounded-full font-bold text-2xl">
                    {currentListing.price || currentListing.rent || 0}€
                  </div>
                  <span className="text-gray-600 font-medium text-lg">
                    {currentListing.charges_included ? 'charges comprises' : `+ ${currentListing.charges || 0}€ charges`}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-4 mb-6">
                  <div className="bg-gray-50 p-4 rounded-2xl text-center">
                    <p className="text-gray-600 text-sm mb-1">Ville</p>
                    <p className="text-[#212220] font-bold">{currentListing.city || currentListing.address?.city || 'N/A'}</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-2xl text-center">
                    <p className="text-gray-600 text-sm mb-1">Surface</p>
                    <p className="text-[#212220] font-bold">{currentListing.surface || 0}m²</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-2xl text-center">
                    <p className="text-gray-600 text-sm mb-1">Type</p>
                    <p className="text-[#212220] font-bold capitalize">{currentListing.room_type || 'N/A'}</p>
                  </div>
                </div>

                <div className="mb-6">
                  <h3 className="text-xl font-bold text-[#212220] mb-3" style={{ fontFamily: 'Outfit' }}>
                    Description
                  </h3>
                  <p className="text-gray-700 leading-relaxed">
                    {currentListing.description || 'Aucune description disponible.'}
                  </p>
                </div>

                <div className="flex gap-4 pt-6 border-t-2 border-gray-100">
                  <button
                    onClick={() => {
                      handlePass();
                      setView('feed');
                    }}
                    className="flex-1 bg-white border-2 border-gray-300 hover:border-[#212220] text-[#212220] px-6 py-4 rounded-full font-bold text-lg transition-all flex items-center justify-center gap-2"
                  >
                    <X className="w-6 h-6" />
                    Passer
                  </button>
                  <button
                    onClick={() => {
                      handleLike();
                      setView('feed');
                    }}
                    className="flex-1 bg-[#fec629] hover:bg-[#212220] text-[#212220] hover:text-[#fec629] px-6 py-4 rounded-full font-bold text-lg transition-all flex items-center justify-center gap-2"
                  >
                    <Heart className="w-6 h-6" fill="currentColor" />
                    Liker
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Autres vues */}
        {(view === 'matches' || view === 'liked' || view === 'profile' || view === 'settings') && (
          <div className="w-full max-w-3xl mx-auto">
            <div className="bg-white rounded-3xl p-8 shadow-lg border-2 border-gray-100">
              <h2 className="text-4xl font-bold text-[#212220] mb-6" style={{ fontFamily: 'Outfit' }}>
                {view === 'matches' && `Matchs (${matches.length})`}
                {view === 'liked' && `Mes Likes (${likedListings.length})`}
                {view === 'profile' && 'Mon Profil'}
                {view === 'settings' && 'Paramètres'}
              </h2>
              
              {view === 'liked' && (
                <div className="space-y-4">
                  {likedListings.length === 0 ? (
                    <p className="text-gray-600">Aucune annonce likée pour le moment.</p>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {likedListings.map((listing) => (
                        <div
                          key={listing.id}
                          className="bg-white rounded-2xl overflow-hidden shadow-md border border-gray-200 hover:shadow-lg transition-shadow"
                        >
                          {/* Image */}
                          <div className="aspect-[4/3] bg-gray-100 relative">
                            {listing.photos?.[0]?.url ? (
                              <img
                                src={listing.photos[0].url}
                                alt={listing.title}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center bg-gray-50">
                                <Home className="w-16 h-16 text-gray-300" />
                              </div>
                            )}
                          </div>

                          {/* Info */}
                          <div className="p-4">
                            <h3 className="font-bold text-lg text-[#212220] truncate mb-2">
                              {listing.title}
                            </h3>
                            <div className="flex items-center gap-2 mb-2">
                              <span className="bg-[#fec629] text-[#212220] px-3 py-1 rounded-full font-bold text-sm">
                                {listing.price || 0}€
                              </span>
                            </div>
                            <p className="text-sm text-gray-600 mb-3">
                              {listing.city || 'Ville inconnue'} • {listing.surface || '?'}m²
                            </p>
                            <div className="flex gap-2">
                              <button
                                onClick={() => {
                                  const userId = user?.id ?? user?.user_id;
                                  unlikeListing(userId, listing.id)
                                    .then(() => {
                                      toast.success('Annonce retirée des likes');
                                      setLikedListings(likedListings.filter(l => l.id !== listing.id));
                                    })
                                    .catch(() => toast.error('Erreur'));
                                }}
                                className="flex-1 px-3 py-2 bg-red-100 hover:bg-red-200 text-red-600 rounded-lg text-sm font-medium transition-colors"
                              >
                                <X className="w-4 h-4 inline mr-1" />
                                Retirer
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {(view === 'matches' || view === 'profile' || view === 'settings') && (
                <p className="text-gray-600">Section en développement... 🚧</p>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}