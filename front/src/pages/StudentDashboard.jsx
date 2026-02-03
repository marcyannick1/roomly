import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { getCurrentUser, getStudentFeed, likeListing, getStudentMatches, getStudentLikedListings, unlikeListing, updateStudentProfile, getStudentProfile, getUserById, deleteProfilePhoto, uploadProfilePhoto, deleteUserAccount, getUserNotifications, getUnreadNotificationsCount, markNotificationAsRead, markAllNotificationsAsRead, getMatchMessages, sendMessage } from '@/lib/api';
import { toast } from 'sonner';
import { Home, Heart, X, LogOut, User, MessageCircle, Settings, Flame, Star, Bell, Send, CheckCircle2 } from 'lucide-react';
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
  const [studentProfile, setStudentProfile] = useState(null);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileForm, setProfileForm] = useState({});
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [selectedMatch, setSelectedMatch] = useState(null);
  const [messages, setMessages] = useState([]);
  const [messageText, setMessageText] = useState('');
  const [viewingProfile, setViewingProfile] = useState(null); // Pour afficher le profil du bailleur
  const [viewingListing, setViewingListing] = useState(null); // Pour afficher les détails du logement

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

      // Toujours recharger les données utilisateur pour avoir la photo à jour
      try {
        const userResponse = await getUserById(userId);
        const updatedUser = userResponse.data;
        setUser(updatedUser);
        currentUser = updatedUser;
      } catch (error) {
        console.error('Erreur lors du rechargement utilisateur:', error);
      }

      try {
        const feedResponse = await getStudentFeed(userId);
        setListings(feedResponse.data || []);

        const matchesResponse = await getStudentMatches(userId);
        setMatches(matchesResponse.data || []);

        const likedResponse = await getStudentLikedListings(userId);
        setLikedListings(likedResponse.data || []);

        const profileResponse = await getStudentProfile(userId);
        setStudentProfile(profileResponse.data);
        setProfileForm(profileResponse.data);
        
        // Charger les notifications
        const notificationsResponse = await getUserNotifications(userId);
        setNotifications(notificationsResponse.data || []);
        
        const unreadResponse = await getUnreadNotificationsCount(userId);
        setUnreadCount(unreadResponse.data?.count || 0);
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

          const profileResponse = await getStudentProfile(userId);
          setStudentProfile(profileResponse.data);
          setProfileForm(profileResponse.data);
          
          // Charger les notifications
          const notificationsResponse = await getUserNotifications(userId);
          setNotifications(notificationsResponse.data || []);
          
          const unreadResponse = await getUnreadNotificationsCount(userId);
          setUnreadCount(unreadResponse.data?.count || 0);
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
    const listing = filteredListings[currentIndex];
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

  // Filtrer les listings pour exclure ceux avec un match ou un like existant
  const filteredListings = listings.filter(listing => {
    const listingId = listing.id || listing.listing_id;
    // Exclure s'il y a un match
    const hasMatch = matches.some(m => m.listing_id === listingId);
    // Exclure s'il y a déjà un like (ou si le like a été rejeté, il n'y a plus de trace)
    const alreadyLiked = likedListings.some(l => l.id === listingId || l.listing_id === listingId);
    return !hasMatch && !alreadyLiked;
  });

  const currentListing = filteredListings[currentIndex];

  const navItems = [
    { id: 'feed', icon: Flame, label: 'Découvrir' },
    { id: 'matches', icon: CheckCircle2, label: 'Matchs', badge: matches.length },
    { id: 'messages', icon: MessageCircle, label: 'Messages' },
    { id: 'liked', icon: Star, label: 'Mes likes' },
    { id: 'notifications', icon: Bell, label: 'Notifications', badge: unreadCount },
    { id: 'profile', icon: User, label: 'Profil' },
    { id: 'settings', icon: Settings, label: 'Paramètres' },
  ];
  
  const handleMarkAsRead = async (notificationId) => {
    try {
      await markNotificationAsRead(notificationId);
      toast.success('Notification marquée comme lue');
      loadData();
    } catch (error) {
      console.error('Erreur:', error);
      toast.error('Erreur lors de la mise à jour');
    }
  };
  
  const handleMarkAllAsRead = async () => {
    try {
      const userId = user?.id ?? user?.user_id;
      await markAllNotificationsAsRead(userId);
      toast.success('Toutes les notifications ont été marquées comme lues');
      loadData();
    } catch (error) {
      console.error('Erreur:', error);
      toast.error('Erreur lors de la mise à jour');
    }
  };

  const loadMessages = async (match) => {
    try {
      const response = await getMatchMessages(match.id);
      setMessages(response.data || []);
    } catch (error) {
      console.error('Erreur lors du chargement des messages:', error);
      toast.error('Erreur lors du chargement des messages');
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!messageText.trim() || !selectedMatch) return;

    try {
      await sendMessage(selectedMatch.id, {
        content: messageText
      });
      setMessageText('');
      loadMessages(selectedMatch);
      toast.success('Message envoyé');
    } catch (error) {
      console.error('Erreur lors de l\'envoi:', error);
      toast.error('Erreur lors de l\'envoi du message');
    }
  };

  const selectMatch = (match) => {
    setSelectedMatch(match);
    loadMessages(match);
  };

  return (
    <div className="min-h-screen bg-white flex">
      {/* Sidebar */}
      <aside className="w-72 bg-[#fec629] text-[#212220] flex flex-col shadow-2xl fixed left-0 top-0 h-screen z-50">
        <div className="p-6 border-b border-black/10">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-[#212220] rounded-2xl flex items-center justify-center shadow-lg p-1">
              <img 
                src="/logo.svg" 
                alt="Roomly Logo" 
                className="w-full h-full object-contain"
              />
            </div>
            <span className="text-2xl font-bold text-[#212220]" style={{ fontFamily: 'Outfit' }}>Roomly</span>
          </div>
          
          <div className="bg-black/5 rounded-2xl p-4 border border-black/10">
            <div className="flex items-center gap-3">
              {user?.photo ? (
                <img 
                  src={user.photo} 
                  alt={user.name} 
                  className="w-12 h-12 rounded-full object-cover shadow-lg border-2 border-[#212220]"
                />
              ) : (
                <div className="w-12 h-12 bg-[#212220] rounded-full flex items-center justify-center font-bold text-lg shadow-lg text-[#fec629]">
                  {user?.name?.charAt(0).toUpperCase() || 'U'}
                </div>
              )}
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
        {(view === 'matches' || view === 'liked' || view === 'profile' || view === 'settings' || view === 'notifications' || view === 'messages') && (
          <div className="w-full max-w-3xl mx-auto">
            <div className="bg-white rounded-3xl p-8 shadow-lg border-2 border-gray-100">
              <h2 className="text-4xl font-bold text-[#212220] mb-6" style={{ fontFamily: 'Outfit' }}>
                {view === 'matches' && `Matchs (${matches.length})`}
                {view === 'liked' && `Mes Likes (${likedListings.length})`}
                {view === 'profile' && 'Mon Profil'}
                {view === 'notifications' && `Notifications (${unreadCount} non lue${unreadCount > 1 ? 's' : ''})`}
                {view === 'messages' && 'Mes Messages'}
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

              {view === 'profile' && studentProfile && (
                <div className="space-y-6">
                  {/* Photo de profil */}
                  <div className="flex justify-center mb-6">
                    {user?.photo ? (
                      <img 
                        src={user.photo} 
                        alt={user.name} 
                        className="w-32 h-32 rounded-full object-cover border-4 border-[#fec629] shadow-xl"
                      />
                    ) : (
                      <div className="w-32 h-32 bg-[#212220] rounded-full flex items-center justify-center font-bold text-6xl shadow-xl text-[#fec629]">
                        {user?.name?.charAt(0).toUpperCase() || 'U'}
                      </div>
                    )}
                  </div>
                  {!isEditingProfile ? (
                    <>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-gray-50 rounded-xl p-4">
                          <h3 className="text-sm font-semibold text-gray-600 mb-2">Type de logement</h3>
                          <p className="text-lg font-medium capitalize">{studentProfile.room_type || 'Non renseigné'}</p>
                        </div>
                        <div className="bg-gray-50 rounded-xl p-4">
                          <h3 className="text-sm font-semibold text-gray-600 mb-2">Budget maximum</h3>
                          <p className="text-lg font-medium">{studentProfile.max_budget || 0}€/mois</p>
                        </div>
                        <div className="bg-gray-50 rounded-xl p-4">
                          <h3 className="text-sm font-semibold text-gray-600 mb-2">Meublé</h3>
                          <p className="text-lg font-medium">{studentProfile.furnished ? 'Oui' : 'Non'}</p>
                        </div>
                        <div className="bg-gray-50 rounded-xl p-4">
                          <h3 className="text-sm font-semibold text-gray-600 mb-2">Fumeur</h3>
                          <p className="text-lg font-medium">{studentProfile.smoking ? 'Oui' : 'Non'}</p>
                        </div>
                        <div className="bg-gray-50 rounded-xl p-4">
                          <h3 className="text-sm font-semibold text-gray-600 mb-2">Animaux</h3>
                          <p className="text-lg font-medium">{studentProfile.pets ? 'Oui' : 'Non'}</p>
                        </div>
                        <div className="bg-gray-50 rounded-xl p-4">
                          <h3 className="text-sm font-semibold text-gray-600 mb-2">Niveau de bruit toléré</h3>
                          <p className="text-lg font-medium">{studentProfile.noise_level || 5}/10</p>
                        </div>
                        <div className="bg-gray-50 rounded-xl p-4">
                          <h3 className="text-sm font-semibold text-gray-600 mb-2">Université</h3>
                          <p className="text-lg font-medium">{studentProfile.university || 'Non renseigné'}</p>
                        </div>
                        <div className="bg-gray-50 rounded-xl p-4">
                          <h3 className="text-sm font-semibold text-gray-600 mb-2">Niveau d'études</h3>
                          <p className="text-lg font-medium">{studentProfile.study_level || 'Non renseigné'}</p>
                        </div>
                      </div>
                      <div className="bg-gray-50 rounded-xl p-4">
                        <h3 className="text-sm font-semibold text-gray-600 mb-2">Centres d'intérêt</h3>
                        <p className="text-lg">{studentProfile.passions || 'Non renseigné'}</p>
                      </div>
                      <div className="space-y-3">
                        <div className="flex gap-3">
                          <Button
                            onClick={() => setIsEditingProfile(true)}
                            className="flex-1 bg-[#fec629] hover:bg-[#e5b525] text-[#212220] font-semibold"
                          >
                            Modifier mon profil
                          </Button>
                          {user?.photo ? (
                            <Button
                              onClick={async () => {
                                if (window.confirm('Êtes-vous sûr de vouloir supprimer votre photo de profil ?')) {
                                  try {
                                    const userId = user?.id ?? user?.user_id;
                                    await deleteProfilePhoto(userId);
                                    const userResponse = await getUserById(userId);
                                    setUser(userResponse.data);
                                    toast.success('Photo supprimée');
                                  } catch (error) {
                                    console.error(error);
                                    toast.error('Erreur lors de la suppression');
                                  }
                                }
                              }}
                              variant="outline"
                              className="border-red-500 text-red-500 hover:bg-red-50 font-semibold"
                            >
                              Supprimer la photo
                            </Button>
                          ) : (
                            <Button
                              onClick={() => {
                                const input = document.createElement('input');
                                input.type = 'file';
                                input.accept = 'image/*';
                                input.onchange = async (e) => {
                                  const file = e.target.files[0];
                                  if (file) {
                                    try {
                                      const userId = user?.id ?? user?.user_id;
                                      await uploadProfilePhoto(userId, file);
                                      const userResponse = await getUserById(userId);
                                      setUser(userResponse.data);
                                      toast.success('Photo ajoutée avec succès');
                                    } catch (error) {
                                      console.error(error);
                                      toast.error("Erreur lors de l'ajout de la photo");
                                    }
                                  }
                                };
                                input.click();
                              }}
                              variant="outline"
                              className="border-[#fec629] text-[#fec629] hover:bg-[#fec629] hover:text-[#212220] font-semibold"
                            >
                              Ajouter une photo
                            </Button>
                          )}
                        </div>
                        <Button
                          onClick={async () => {
                            if (window.confirm('⚠️ ATTENTION : Cette action est irréversible. Voulez-vous vraiment supprimer définitivement votre compte et toutes vos données ?')) {
                              try {
                                const userId = user?.id ?? user?.user_id;
                                await deleteUserAccount(userId);
                                toast.success('Compte supprimé');
                                // Déconnexion et redirection
                                document.cookie = 'session_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
                                navigate('/login');
                              } catch (error) {
                                console.error(error);
                                toast.error('Erreur lors de la suppression du compte');
                              }
                            }
                          }}
                          variant="outline"
                          className="w-full border-red-600 text-red-600 hover:bg-red-600 hover:text-white font-semibold"
                        >
                          Supprimer mon compte
                        </Button>
                      </div>
                    </>
                  ) : (
                    <form onSubmit={async (e) => {
                      e.preventDefault();
                      try {
                        await updateStudentProfile(profileForm);
                        setStudentProfile(profileForm);
                        setIsEditingProfile(false);
                        toast.success('Profil mis à jour !');
                      } catch (error) {
                        console.error(error);
                        toast.error('Erreur lors de la mise à jour');
                      }
                    }} className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Type de logement</label>
                          <select
                            value={profileForm.room_type || ''}
                            onChange={(e) => setProfileForm({...profileForm, room_type: e.target.value})}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#fec629]"
                          >
                            <option value="studio">Studio</option>
                            <option value="T1">T1</option>
                            <option value="T2">T2</option>
                            <option value="colocation">Colocation</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Budget max (€/mois)</label>
                          <input
                            type="number"
                            value={profileForm.max_budget || ''}
                            onChange={(e) => setProfileForm({...profileForm, max_budget: parseFloat(e.target.value)})}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#fec629]"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Université</label>
                          <input
                            type="text"
                            value={profileForm.university || ''}
                            onChange={(e) => setProfileForm({...profileForm, university: e.target.value})}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#fec629]"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Niveau d'études</label>
                          <input
                            type="text"
                            value={profileForm.study_level || ''}
                            onChange={(e) => setProfileForm({...profileForm, study_level: e.target.value})}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#fec629]"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Niveau de bruit (1-10)</label>
                          <input
                            type="number"
                            min="1"
                            max="10"
                            value={profileForm.noise_level || 5}
                            onChange={(e) => setProfileForm({...profileForm, noise_level: parseInt(e.target.value)})}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#fec629]"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Centres d'intérêt</label>
                        <textarea
                          value={profileForm.passions || ''}
                          onChange={(e) => setProfileForm({...profileForm, passions: e.target.value})}
                          rows="3"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#fec629]"
                        />
                      </div>
                      <div className="flex gap-2 flex-wrap">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={profileForm.furnished || false}
                            onChange={(e) => setProfileForm({...profileForm, furnished: e.target.checked})}
                            className="w-4 h-4 text-[#fec629] focus:ring-[#fec629] rounded"
                          />
                          <span className="text-sm">Meublé</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={profileForm.smoking || false}
                            onChange={(e) => setProfileForm({...profileForm, smoking: e.target.checked})}
                            className="w-4 h-4 text-[#fec629] focus:ring-[#fec629] rounded"
                          />
                          <span className="text-sm">Fumeur</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={profileForm.pets || false}
                            onChange={(e) => setProfileForm({...profileForm, pets: e.target.checked})}
                            className="w-4 h-4 text-[#fec629] focus:ring-[#fec629] rounded"
                          />
                          <span className="text-sm">Animaux</span>
                        </label>
                      </div>
                      <div className="flex gap-3">
                        <Button type="submit" className="bg-[#fec629] hover:bg-[#e5b525] text-[#212220] font-semibold">
                          Enregistrer
                        </Button>
                        <Button
                          type="button"
                          onClick={() => {
                            setProfileForm(studentProfile);
                            setIsEditingProfile(false);
                          }}
                          variant="outline"
                        >
                          Annuler
                        </Button>
                      </div>
                    </form>
                  )}
                </div>
              )}

              {(view === 'matches' || view === 'settings') && view === 'matches' && (
                <div className="space-y-4">
                  {matches.length === 0 ? (
                    <div className="text-center py-12">
                      <MessageCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-600">Aucun match pour le moment</p>
                      <p className="text-sm text-gray-500 mt-2">Les bailleurs que vous avez likés pourront vous matcher !</p>
                    </div>
                  ) : (
                    matches.map((match) => (
                      <div
                        key={match.id}
                        className="bg-white rounded-2xl p-6 shadow-md border border-gray-200 hover:shadow-lg transition-shadow"
                      >
                        <div className="flex gap-6">
                          {/* Photo de l'annonce */}
                          <div className="w-32 h-32 rounded-xl overflow-hidden flex-shrink-0">
                            {match.listing?.photos && match.listing.photos[0]?.url ? (
                              <img
                                src={match.listing.photos[0].url}
                                alt={match.listing.title}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                                <Home className="w-12 h-12 text-gray-400" />
                              </div>
                            )}
                          </div>

                          <div className="flex-1">
                            <div className="flex justify-between items-start mb-3">
                              <div>
                                <h3 className="text-xl font-bold text-[#212220]" style={{ fontFamily: 'Outfit' }}>
                                  {match.listing?.title || 'Annonce'}
                                </h3>
                                <p className="text-sm text-gray-600">
                                  {match.listing?.city} • {match.listing?.price}€/mois
                                </p>
                              </div>
                              <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-semibold">
                                Match ! 💚
                              </span>
                            </div>

                            <div className="mb-4">
                              <p className="text-sm text-gray-700 line-clamp-2">
                                {match.listing?.description}
                              </p>
                            </div>

                            {/* Info bailleur */}
                            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                              <div className="w-10 h-10 rounded-full overflow-hidden bg-[#212220] flex items-center justify-center flex-shrink-0">
                                {match.landlord?.photo ? (
                                  <img src={match.landlord.photo} alt={match.landlord.name} className="w-full h-full object-cover" />
                                ) : (
                                  <span className="text-[#fec629] font-bold">
                                    {match.landlord?.name?.charAt(0).toUpperCase() || 'B'}
                                  </span>
                                )}
                              </div>
                              <div className="flex-1">
                                <p className="text-sm font-semibold text-gray-900">
                                  Bailleur: {match.landlord?.name || 'Non renseigné'}
                                </p>
                                <p className="text-xs text-gray-500">
                                  Match créé le {new Date(match.created_at).toLocaleDateString('fr-FR')}
                                </p>
                              </div>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => navigate(`/listing/${match.listing_id}`)}
                                className="rounded-full"
                              >
                                Voir l'annonce
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}

              {view === 'notifications' && (
                <div className="space-y-4">
                  {unreadCount > 0 && (
                    <div className="flex justify-end">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleMarkAllAsRead}
                        className="rounded-full"
                      >
                        Tout marquer comme lu
                      </Button>
                    </div>
                  )}
                  
                  {notifications.length === 0 ? (
                    <div className="text-center py-20">
                      <Bell className="w-24 h-24 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-500">Aucune notification</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {notifications.map((notification) => (
                        <div
                          key={notification.id}
                          className={`rounded-xl p-6 border-2 transition-all ${
                            notification.is_read
                              ? 'bg-white border-gray-200'
                              : 'bg-[#fef9e7] border-[#fec629]'
                          }`}
                        >
                          <div className="flex gap-4 items-start">
                            <div className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${
                              notification.type === 'match_created'
                                ? 'bg-green-100'
                                : 'bg-red-100'
                            }`}>
                              {notification.type === 'match_created' ? (
                                <MessageCircle className="w-6 h-6 text-green-600" />
                              ) : (
                                <X className="w-6 h-6 text-red-600" />
                              )}
                            </div>
                            
                            <div className="flex-1">
                              <h3 className="font-bold text-lg mb-2">{notification.title}</h3>
                              <p className="text-gray-700 mb-3">{notification.message}</p>
                              <div className="flex items-center gap-3 text-sm text-gray-500">
                                <span>{new Date(notification.created_at).toLocaleDateString('fr-FR', { 
                                  day: 'numeric', 
                                  month: 'long', 
                                  year: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}</span>
                                {!notification.is_read && (
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleMarkAsRead(notification.id)}
                                    className="rounded-full ml-auto"
                                  >
                                    Marquer comme lu
                                  </Button>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
              
              {view === 'messages' && (
                <div className="space-y-4">
                  {matches.length === 0 ? (
                    <div className="text-center py-12">
                      <MessageCircle className="w-24 h-24 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-600 text-lg">Aucun match pour le moment</p>
                      <p className="text-sm text-gray-500 mt-2">Vos conversations apparaîtront ici une fois que vous aurez matché</p>
                    </div>
                  ) : selectedMatch ? (
                    <>
                      {/* Vue profil du bailleur */}
                      {viewingProfile ? (
                        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
                          <button
                            onClick={() => setViewingProfile(null)}
                            className="flex items-center gap-2 text-gray-500 hover:text-[#212220] transition-colors mb-4"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                            </svg>
                            Retour à la conversation
                          </button>
                          
                          <div className="flex flex-col items-center mb-6">
                            <div className="w-24 h-24 rounded-full overflow-hidden bg-gray-200 mb-4">
                              {viewingProfile.photo ? (
                                <img src={viewingProfile.photo} alt={viewingProfile.name} className="w-full h-full object-cover" />
                              ) : (
                                <div className="w-full h-full bg-[#212220] text-[#fec629] font-bold flex items-center justify-center text-3xl">
                                  {viewingProfile.name?.charAt(0).toUpperCase()}
                                </div>
                              )}
                            </div>
                            <h2 className="text-2xl font-bold text-[#212220]">{viewingProfile.name}</h2>
                            <p className="text-gray-600">{viewingProfile.email}</p>
                          </div>
                          
                          <div className="space-y-3">
                            <div className="bg-gray-50 rounded-xl p-4">
                              <h3 className="font-semibold text-[#212220] mb-2">Type de compte</h3>
                              <p className="text-gray-600">Bailleur</p>
                            </div>
                            {viewingProfile.telephone && (
                              <div className="bg-gray-50 rounded-xl p-4">
                                <h3 className="font-semibold text-[#212220] mb-2">Téléphone</h3>
                                <p className="text-gray-600">{viewingProfile.telephone}</p>
                              </div>
                            )}
                          </div>
                        </div>
                      ) : viewingListing ? (
                        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 max-h-[600px] overflow-y-auto">
                          <button
                            onClick={() => setViewingListing(null)}
                            className="flex items-center gap-2 text-gray-500 hover:text-[#212220] transition-colors mb-4"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                            </svg>
                            Retour à la conversation
                          </button>
                          
                          {viewingListing.photos && viewingListing.photos.length > 0 && (
                            <img 
                              src={viewingListing.photos[0].url} 
                              alt={viewingListing.title}
                              className="w-full h-64 object-cover rounded-xl mb-4"
                            />
                          )}
                          
                          <h2 className="text-2xl font-bold text-[#212220] mb-2">{viewingListing.title}</h2>
                          <p className="text-xl text-[#fec629] font-bold mb-4">{viewingListing.price}€/mois</p>
                          
                          <div className="space-y-3">
                            <div className="bg-gray-50 rounded-xl p-4">
                              <h3 className="font-semibold text-[#212220] mb-2">Description</h3>
                              <p className="text-gray-600">{viewingListing.description}</p>
                            </div>
                            
                            <div className="bg-gray-50 rounded-xl p-4">
                              <h3 className="font-semibold text-[#212220] mb-2">Adresse</h3>
                              <p className="text-gray-600">{viewingListing.address}</p>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-3">
                              <div className="bg-gray-50 rounded-xl p-4">
                                <h3 className="font-semibold text-[#212220] mb-1 text-sm">Surface</h3>
                                <p className="text-gray-600">{viewingListing.size}m²</p>
                              </div>
                              <div className="bg-gray-50 rounded-xl p-4">
                                <h3 className="font-semibold text-[#212220] mb-1 text-sm">Meublé</h3>
                                <p className="text-gray-600">{viewingListing.furnished ? 'Oui' : 'Non'}</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="flex flex-col h-[600px] bg-white rounded-2xl shadow-lg border border-gray-200">
                          {/* En-tête conversation - style Instagram */}
                          <div className="flex items-center gap-3 p-4 border-b border-gray-200">
                            <button
                              onClick={() => setSelectedMatch(null)}
                              className="text-gray-500 hover:text-[#212220] transition-colors"
                            >
                              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                              </svg>
                            </button>
                            
                            {/* Photo + Nom de la personne - CLIQUABLES */}
                            <div className="flex items-center gap-3 flex-1 min-w-0">
                              <button
                                onClick={() => setViewingProfile(selectedMatch.landlord)}
                                className="flex items-center gap-3 hover:opacity-80 transition-opacity bg-transparent"
                              >
                                <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0">
                                  {selectedMatch.landlord?.photo ? (
                                    <img src={selectedMatch.landlord.photo} alt={selectedMatch.landlord.name} className="w-full h-full object-cover" />
                                  ) : (
                                    <div className="w-full h-full bg-[#212220] text-[#fec629] font-bold flex items-center justify-center text-sm">
                                      {selectedMatch.landlord?.name?.charAt(0).toUpperCase() || 'B'}
                                    </div>
                                  )}
                                </div>
                                
                                <div className="text-left">
                                  <h3 className="font-semibold text-[#212220] text-sm truncate">{selectedMatch.landlord?.name || 'Bailleur'}</h3>
                                </div>
                              </button>
                              
                              <button
                                onClick={() => setViewingListing(selectedMatch.listing)}
                                className="text-xs text-gray-500 truncate hover:text-[#fec629] transition-colors text-left flex-1 min-w-0 bg-transparent"
                              >
                                {selectedMatch.listing.title}
                              </button>
                            </div>
                          </div>

                      {/* Messages - anciens en haut, nouveaux en bas */}
                      <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
                        {messages.length === 0 ? (
                          <div className="text-center py-8 text-gray-500">
                            <MessageCircle className="w-16 h-16 text-gray-300 mx-auto mb-2" />
                            <p className="text-sm">Aucun message - Soyez le premier à écrire !</p>
                          </div>
                        ) : (
                          messages.map((msg) => {
                            const isCurrentUser = msg.sender_id === user?.id || msg.sender_id === user?.user_id;
                            return (
                              <div
                                key={msg.id}
                                className={`flex gap-2 ${isCurrentUser ? 'flex-row-reverse' : 'flex-row'}`}
                              >
                                {/* Photo de profil */}
                                <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0">
                                  {isCurrentUser ? (
                                    user?.photo ? (
                                      <img src={user.photo} alt="Vous" className="w-full h-full object-cover" />
                                    ) : (
                                      <div className="w-full h-full bg-[#fec629] text-[#212220] font-bold flex items-center justify-center text-xs">
                                        {user?.name?.charAt(0).toUpperCase() || 'M'}
                                      </div>
                                    )
                                  ) : (
                                    selectedMatch.landlord?.photo ? (
                                      <img src={selectedMatch.landlord.photo} alt={selectedMatch.landlord.name} className="w-full h-full object-cover" />
                                    ) : (
                                      <div className="w-full h-full bg-[#212220] text-[#fec629] font-bold flex items-center justify-center text-xs">
                                        {selectedMatch.landlord?.name?.charAt(0).toUpperCase() || 'B'}
                                      </div>
                                    )
                                  )}
                                </div>
                                
                                {/* Bulle de message */}
                                <div className={`flex flex-col ${isCurrentUser ? 'items-end' : 'items-start'} max-w-[70%]`}>
                                  <div
                                    className={`px-4 py-2 rounded-2xl ${
                                      isCurrentUser
                                        ? 'bg-[#fec629] text-[#212220] rounded-tr-sm'
                                        : 'bg-white text-[#212220] border border-gray-200 rounded-tl-sm'
                                    }`}
                                  >
                                    <p className="text-sm leading-relaxed">{msg.content}</p>
                                  </div>
                                  <p className="text-xs text-gray-500 mt-1 px-2">
                                    {new Date(msg.created_at).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                                  </p>
                                </div>
                              </div>
                            );
                          })
                        )}
                      </div>

                      {/* Formulaire d'envoi */}
                      <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-200 bg-white flex gap-2">
                        <input
                          type="text"
                          value={messageText}
                          onChange={(e) => setMessageText(e.target.value)}
                          placeholder="Écrivez un message..."
                          className="flex-1 px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-[#fec629] focus:border-transparent"
                        />
                        <button
                          type="submit"
                          disabled={!messageText.trim()}
                          className="bg-[#fec629] hover:bg-[#e5b525] disabled:opacity-50 disabled:cursor-not-allowed text-[#212220] p-3 rounded-full transition-all transform hover:scale-105 active:scale-95"
                        >
                          <Send className="w-5 h-5" />
                        </button>
                      </form>
                    </div>
                    )}
                  </>
                  ) : (
                    <div className="space-y-2">
                      {matches.map((match) => (
                        <button
                          key={match.id}
                          onClick={() => selectMatch(match)}
                          className="w-full p-4 bg-gray-50 hover:bg-[#fec629]/10 rounded-xl text-left transition-colors border border-gray-200 hover:border-[#fec629]"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-full flex items-center justify-center overflow-hidden">
                              {match.landlord?.photo ? (
                                <img src={match.landlord.photo} alt={match.landlord.name} className="w-full h-full object-cover" />
                              ) : (
                                <div className="w-full h-full bg-[#212220] text-[#fec629] font-bold flex items-center justify-center">
                                  {match.landlord?.name?.charAt(0).toUpperCase() || 'B'}
                                </div>
                              )}
                            </div>
                            <div className="flex-1">
                              <h4 className="font-semibold text-[#212220]">{match.listing.title}</h4>
                              <p className="text-sm text-gray-600">Avec {match.landlord?.name || 'Bailleur'}</p>
                            </div>
                            <MessageCircle className="w-5 h-5 text-gray-400" />
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {view === 'settings' && (
                <p className="text-gray-600">Section en développement... 🚧</p>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}