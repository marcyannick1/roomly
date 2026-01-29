import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { getCurrentUser, getStudentFeed, likeListing, getStudentMatches } from '@/lib/api';
import { toast } from 'sonner';
import { Home, Heart, X, LogOut, User, MessageCircle, Settings, Flame, Star, Menu } from 'lucide-react';
import { motion, useMotionValue, useTransform } from 'framer-motion';

export default function StudentDashboard() {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState(location.state?.user || null);
  const [listings, setListings] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [matches, setMatches] = useState([]);
  const [view, setView] = useState('feed'); // 'feed', 'matches', 'profile', 'settings'

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    document.body.classList.add('has-dashboard-sidebar');
    return () => {
      document.body.classList.remove('has-dashboard-sidebar');
    };
  }, []);

  const loadData = async () => {
    try {
      let currentUser = user;
      if (!currentUser) {
        const response = await getCurrentUser();
        currentUser = response.data?.user || response.data;
        setUser(currentUser);
      }
      
      console.log('Current user in StudentDashboard:', currentUser);

      const userId = currentUser?.id ?? currentUser?.user_id ?? location.state?.user?.id ?? location.state?.user?.user_id;
      if (!userId) {
        console.error('User id introuvable');
        return;
      }

      const feedResponse = await getStudentFeed(userId);
      setListings(feedResponse.data);

      const matchesResponse = await getStudentMatches(userId);
      setMatches(matchesResponse.data);
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const handleLike = async () => {
    const listing = listings[currentIndex];
    try {
      const userId = user?.id ?? user?.user_id ?? location.state?.user?.id ?? location.state?.user?.user_id;
      if (!userId) {
        toast.error('Utilisateur introuvable');
        return;
      }
      await likeListing(userId, listing.listing_id);
      toast.success('Logement liké ! 💚');
      setCurrentIndex(currentIndex + 1);
    } catch (error) {
      toast.error('Erreur');
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

  // Navigation items for sidebar
  const navItems = [
    { id: 'feed', icon: Flame, label: 'Découvrir', path: null },
    { id: 'matches', icon: MessageCircle, label: 'Matchs', badge: matches.length, path: null },
    { id: 'liked', icon: Star, label: 'Mes likes', path: null },
    { id: 'profile', icon: User, label: 'Profil', path: `/profile/${user?.id}` },
    { id: 'settings', icon: Settings, label: 'Paramètres', path: null },
  ];

  return (
    <div className="min-h-screen bg-white flex">
      {/* Sidebar */}
      <aside className="dashboard-sidebar w-72 bg-[#fec629] text-[#212220] flex flex-col shadow-2xl fixed left-0 top-0 h-screen z-50">
        {/* Logo & User Profile */}
        <div className="p-6 border-b border-white/10">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-[#212220] rounded-2xl flex items-center justify-center shadow-lg p-2">
              <img src="/logo.svg" alt="Roomly" className="w-full h-full" />
            </div>
            <span className="text-2xl font-bold text-[#212220]" style={{ fontFamily: 'Outfit' }}>Roomly</span>
          </div>
          
          {/* User Profile Card */}
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

        {/* Navigation Items */}
        <nav className="flex-1 py-4 px-3">
          <div className="space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = view === item.id;
              
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    if (item.path) {
                      navigate(item.path);
                    } else {
                      setView(item.id);
                    }
                  }}
                  className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-xl transition-all duration-200 group relative ${
                    isActive 
                      ? 'bg-[#212220] text-[#fec629] shadow-lg' 
                      : 'hover:bg-black/5 text-[#212220]/70 hover:text-[#212220]'
                  }`}
                  data-testid={`nav-${item.id}`}
                >
                  <Icon className={`w-5 h-5 ${isActive ? 'text-[#fec629]' : 'text-[#212220]/70'}`} />
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

        {/* Logout Button */}
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
      <main className="flex-1 ml-72 bg-white">
        <div className="max-w-2xl mx-auto px-6 py-8">
          {view === 'feed' && (
            <>
              {currentListing ? (
                <div className="relative h-[calc(100vh-120px)] flex items-center justify-center">
                  {/* Next cards stack (background) */}
                  {listings.slice(currentIndex + 1, currentIndex + 3).map((listing, index) => (
                    <div
                      key={listing.listing_id}
                      className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
                      style={{
                        zIndex: 10 - index,
                        scale: 1 - (index + 1) * 0.05,
                        opacity: 1 - (index + 1) * 0.3,
                      }}
                    >
                      <div className="w-[380px] h-[580px] bg-white rounded-3xl shadow-2xl border-2 border-gray-100" />
                    </div>
                  ))}

                  {/* Current card (draggable) */}
                  <motion.div
                    key={currentListing.listing_id}
                    drag="x"
                    dragConstraints={{ left: 0, right: 0 }}
                    dragElastic={0.7}
                    onDragEnd={(e, { offset, velocity }) => {
                      const swipe = Math.abs(offset.x) * velocity.x;
                      if (swipe > 10000) {
                        // Swiped right = like
                        handleLike();
                      } else if (swipe < -10000) {
                        // Swiped left = pass
                        handlePass();
                      }
                    }}
                    animate={{ rotate: 0, x: 0 }}
                    exit={{ 
                      x: 1000,
                      rotate: 45,
                      opacity: 0,
                      transition: { duration: 0.3 }
                    }}
                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 cursor-grab active:cursor-grabbing"
                    style={{ zIndex: 20 }}
                    data-testid="swipe-card"
                  >
                    {/* Card */}
                    <div className="w-[380px] h-[580px] bg-white rounded-3xl overflow-hidden shadow-2xl border-2 border-gray-100 flex flex-col">
                      {/* Image - Reduced height */}
                      <div className="h-[340px] bg-gray-100 relative flex-shrink-0">
                        {currentListing.photos?.[0] ? (
                          <img
                            src={currentListing.photos[0]}
                            alt={currentListing.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gray-50">
                            <Home className="w-20 h-20 text-gray-300" />
                          </div>
                        )}
                        
                        {/* Compatibility Score Badge */}
                        <div className="absolute top-4 right-4 bg-[#fec629] text-[#212220] px-4 py-1.5 rounded-full font-bold text-sm shadow-xl">
                          {currentListing.compatibility_score}% Match
                        </div>
                      </div>

                      {/* Info - Compact */}
                      <div className="p-5 flex-1 flex flex-col overflow-hidden">
                        <h2 className="text-2xl font-bold text-[#212220] mb-2 line-clamp-1" style={{ fontFamily: 'Outfit' }}>
                          {currentListing.title}
                        </h2>
                        <div className="flex items-center gap-2 mb-3">
                          <div className="bg-[#212220] text-white px-3 py-1 rounded-full font-bold text-base">
                            {currentListing.rent}€
                          </div>
                          <span className="text-gray-600 text-sm font-medium">+ {currentListing.charges}€ charges</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-600 mb-3 flex-wrap">
                          <span className="bg-gray-100 px-2.5 py-1 rounded-full text-xs font-medium">{currentListing.address?.city}</span>
                          <span className="text-gray-400">•</span>
                          <span className="bg-gray-100 px-2.5 py-1 rounded-full text-xs font-medium">{currentListing.surface}m²</span>
                          <span className="text-gray-400">•</span>
                          <span className="bg-gray-100 px-2.5 py-1 rounded-full text-xs font-medium">{currentListing.rooms} pièce(s)</span>
                        </div>
                        <p className="text-gray-700 text-sm leading-relaxed line-clamp-3">
                          {currentListing.description}
                        </p>
                      </div>
                    </div>
                  </motion.div>

                  {/* Action Buttons - Centered at bottom */}
                  <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex justify-center gap-4 z-30">
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handlePass}
                      data-testid="pass-btn"
                      className="w-16 h-16 rounded-full bg-white border-3 border-gray-300 flex items-center justify-center shadow-xl hover:shadow-2xl hover:border-[#212220] transition-all duration-200"
                    >
                      <X className="w-8 h-8 text-[#212220]" />
                    </motion.button>

                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setView('details')}
                      data-testid="details-btn"
                      className="w-16 h-16 rounded-full bg-white border-3 border-gray-300 flex items-center justify-center shadow-xl hover:shadow-2xl hover:border-[#fec629] transition-all duration-200"
                    >
                      <svg className="w-6 h-6 text-[#212220]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </motion.button>
                    
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handleLike}
                      data-testid="like-btn"
                      className="w-20 h-20 rounded-full bg-[#fec629] flex items-center justify-center shadow-2xl hover:shadow-3xl hover:bg-[#212220] transition-all duration-200 group"
                    >
                      <Heart className="w-10 h-10 text-[#212220] group-hover:text-[#fec629]" fill="currentColor" />
                    </motion.button>
                  </div>
                </div>
              ) : (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center py-32" 
                  data-testid="no-listings"
                >
                  <div className="bg-white rounded-3xl p-12 shadow-xl border-2 border-gray-100">
                    <div className="w-32 h-32 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
                      <Home className="w-16 h-16 text-gray-400" />
                    </div>
                    <h3 className="text-3xl font-bold text-[#212220] mb-3" style={{ fontFamily: 'Outfit' }}>
                      Plus de logements pour aujourd'hui
                    </h3>
                    <p className="text-gray-600 text-lg">
                      Revenez demain pour découvrir de nouvelles annonces ! 🏠
                    </p>
                  </div>
                </motion.div>
              )}
            </>
          )}

          {view === 'details' && currentListing && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-6"
            >
              {/* Back button */}
              <button
                onClick={() => setView('feed')}
                className="flex items-center gap-2 text-gray-600 hover:text-[#212220] font-medium transition-colors"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Retour au swipe
              </button>

              {/* Full details card */}
              <div className="bg-white rounded-3xl overflow-hidden shadow-2xl border-2 border-gray-100">
                {/* Image Gallery */}
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
                  
                  {/* Compatibility Score Badge */}
                  <div className="absolute top-6 right-6 bg-[#fec629] text-[#212220] px-5 py-2.5 rounded-full font-bold text-lg shadow-xl">
                    {currentListing.compatibility_score}% Match
                  </div>
                </div>

                {/* Full Info */}
                <div className="p-8">
                  <h2 className="text-4xl font-bold text-[#212220] mb-4" style={{ fontFamily: 'Outfit' }}>
                    {currentListing.title}
                  </h2>
                  
                  <div className="flex items-center gap-3 mb-6">
                    <div className="bg-[#212220] text-white px-6 py-3 rounded-full font-bold text-2xl">
                      {currentListing.rent}€
                    </div>
                    <span className="text-gray-600 font-medium text-lg">+ {currentListing.charges}€ charges</span>
                  </div>

                  {/* Details Grid */}
                  <div className="grid grid-cols-3 gap-4 mb-6">
                    <div className="bg-gray-50 p-4 rounded-2xl text-center">
                      <p className="text-gray-600 text-sm mb-1">Ville</p>
                      <p className="text-[#212220] font-bold">{currentListing.address?.city}</p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-2xl text-center">
                      <p className="text-gray-600 text-sm mb-1">Surface</p>
                      <p className="text-[#212220] font-bold">{currentListing.surface}m²</p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-2xl text-center">
                      <p className="text-gray-600 text-sm mb-1">Pièces</p>
                      <p className="text-[#212220] font-bold">{currentListing.rooms}</p>
                    </div>
                  </div>

                  {/* Description */}
                  <div className="mb-6">
                    <h3 className="text-xl font-bold text-[#212220] mb-3" style={{ fontFamily: 'Outfit' }}>
                      Description
                    </h3>
                    <p className="text-gray-700 leading-relaxed">
                      {currentListing.description}
                    </p>
                  </div>

                  {/* Equipments */}
                  {currentListing.equipments && currentListing.equipments.length > 0 && (
                    <div className="mb-6">
                      <h3 className="text-xl font-bold text-[#212220] mb-3" style={{ fontFamily: 'Outfit' }}>
                        Équipements
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {currentListing.equipments.map((equipment, index) => (
                          <span key={index} className="bg-gray-100 px-4 py-2 rounded-full text-sm font-medium text-gray-700">
                            {equipment}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Action buttons */}
                  <div className="flex gap-4 pt-6 border-t-2 border-gray-100">
                    <button
                      onClick={handlePass}
                      className="flex-1 bg-white border-2 border-gray-300 hover:border-[#212220] text-[#212220] px-6 py-4 rounded-full font-bold text-lg transition-all flex items-center justify-center gap-2"
                    >
                      <X className="w-6 h-6" />
                      Passer
                    </button>
                    <button
                      onClick={handleLike}
                      className="flex-1 bg-[#fec629] hover:bg-[#212220] text-[#212220] hover:text-[#fec629] px-6 py-4 rounded-full font-bold text-lg transition-all flex items-center justify-center gap-2"
                    >
                      <Heart className="w-6 h-6" fill="currentColor" />
                      Liker
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {view === 'matches' && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-6" 
              data-testid="matches-list"
            >
              <div className="bg-white rounded-3xl p-8 shadow-lg border-2 border-gray-100">
                <h2 className="text-4xl font-bold text-[#212220] mb-2" style={{ fontFamily: 'Outfit' }}>
                  Vos matchs 💬
                </h2>
                <p className="text-gray-600">Vous avez {matches.length} match{matches.length !== 1 ? 's' : ''}</p>
              </div>
              
              {matches.length === 0 ? (
                <div className="bg-white rounded-3xl p-12 shadow-lg border-2 border-gray-100 text-center">
                  <div className="w-32 h-32 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
                    <MessageCircle className="w-16 h-16 text-gray-400" />
                  </div>
                  <h3 className="text-2xl font-bold text-[#212220] mb-3" style={{ fontFamily: 'Outfit' }}>
                    Aucun match pour le moment
                  </h3>
                  <p className="text-gray-600">
                    Continuez à liker des logements pour obtenir des matchs ! 💚
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {matches.map((match) => (
                    <motion.div
                      key={match.match_id}
                      whileHover={{ scale: 1.02 }}
                      className="bg-white rounded-2xl p-6 shadow-lg border-2 border-gray-100 hover:border-[#fec629] hover:shadow-xl transition-all cursor-pointer"
                      onClick={() => navigate(`/messages/${match.match_id}`)}
                      data-testid={`match-${match.match_id}`}
                    >
                      <div className="flex gap-5">
                        <div className="w-28 h-28 bg-gray-50 rounded-2xl overflow-hidden flex-shrink-0 shadow-md">
                          {match.listing?.photos?.[0] ? (
                            <img
                              src={match.listing.photos[0]}
                              alt={match.listing.title}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Home className="w-12 h-12 text-gray-300" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1">
                          <h3 className="text-xl font-bold text-[#212220] mb-2" style={{ fontFamily: 'Outfit' }}>
                            {match.listing?.title}
                          </h3>
                          <p className="text-gray-600 font-medium mb-3">
                            {match.listing?.rent}€/mois • {match.listing?.address?.city}
                          </p>
                          <button className="bg-[#fec629] hover:bg-[#212220] text-[#212220] hover:text-[#fec629] px-6 py-2.5 rounded-full font-semibold shadow-md hover:shadow-lg transition-all">
                            💬 Envoyer un message
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {view === 'settings' && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-white rounded-3xl p-8 shadow-lg border-2 border-gray-100"
            >
              <h2 className="text-4xl font-bold text-[#212220] mb-6" style={{ fontFamily: 'Outfit' }}>
                Paramètres ⚙️
              </h2>
              <p className="text-gray-600">Paramètres en cours de développement... 🚧</p>
            </motion.div>
          )}

          {view === 'liked' && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-white rounded-3xl p-8 shadow-lg border-2 border-gray-100"
            >
              <h2 className="text-4xl font-bold text-[#212220] mb-6" style={{ fontFamily: 'Outfit' }}>
                Mes Likes ⭐
              </h2>
              <p className="text-gray-600">Liste de vos likes en cours de développement... 🚧</p>
            </motion.div>
          )}
        </div>
      </main>
    </div>
  );
}