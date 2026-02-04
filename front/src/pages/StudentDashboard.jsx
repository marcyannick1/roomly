import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { getCurrentUser, getStudentFeed, likeListing, getStudentMatches, getStudentLikedListings, unlikeListing, updateStudentProfile, getStudentProfile, getUserById, deleteProfilePhoto, uploadProfilePhoto, deleteUserAccount, getUserNotifications, getUnreadNotificationsCount, markNotificationAsRead, markAllNotificationsAsRead, getMatchMessages, sendMessage, getUserVisits, getMatchVisits } from '@/lib/api';
import { toast } from 'sonner';
import { Home, Heart, X, LogOut, User, MessageCircle, Settings, Flame, Star, Bell, Send, CheckCircle2, MapPin, Sparkles, TrendingUp, Clock, Users, Camera, Edit2, Trash2, ChevronRight, Info, Calendar } from 'lucide-react';
import { CalendarView } from '@/components/visits/CalendarView';
import { VisitModal } from '@/components/visits/VisitModal';
import { VisitBubble } from '@/components/visits/VisitBubble';
import { motion, AnimatePresence, useMotionValue, useTransform } from 'framer-motion';

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
  const [viewingProfile, setViewingProfile] = useState(null);
  const [viewingListing, setViewingListing] = useState(null);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [visits, setVisits] = useState([]);
  const [matchVisits, setMatchVisits] = useState([]);
  const [visitModalOpen, setVisitModalOpen] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadMoreListings = async () => {
    if (isLoadingMore || !hasMore) return;

    try {
      setIsLoadingMore(true);
      const userId = user?.id ?? user?.user_id;
      const nextPage = page + 1;
      const feedResponse = await getStudentFeed(userId, nextPage * 20, 20);
      const newListings = feedResponse.data || [];

      if (newListings.length < 20) {
        setHasMore(false);
      }

      if (newListings.length > 0) {
        setListings(prev => [...prev, ...newListings]);
        setPage(nextPage);
      }
    } catch (error) {
      console.error('Erreur chargement annonces:', error);
    } finally {
      setIsLoadingMore(false);
    }
  };

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

        const notificationsResponse = await getUserNotifications(userId);
        setNotifications(notificationsResponse.data || []);

        const unreadResponse = await getUnreadNotificationsCount(userId);
        setUnreadCount(unreadResponse.data?.count || 0);

        const visitsResponse = await getUserVisits(userId);
        setVisits(visitsResponse.data || []);
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

          const notificationsResponse = await getUserNotifications(userId);
          setNotifications(notificationsResponse.data || []);

          const unreadResponse = await getUnreadNotificationsCount(userId);
          setUnreadCount(unreadResponse.data?.count || 0);

          const visitsResponse = await getUserVisits(userId);
          setVisits(visitsResponse.data || []);
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
      toast.success('Logement liké ! 💚', {
        icon: '❤️',
      });
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

  const filteredListings = listings.filter(listing => {
    const listingId = listing.id || listing.listing_id;
    const hasMatch = matches.some(m => m.listing_id === listingId);
    const alreadyLiked = likedListings.some(l => l.id === listingId || l.listing_id === listingId);
    return !hasMatch && !alreadyLiked;
  });

  // Charger plus d'annonces quand on atteint la fin
  useEffect(() => {
    if (currentIndex >= filteredListings.length - 3 && hasMore && !isLoadingMore && view === 'feed') {
      loadMoreListings();
    }
  }, [currentIndex, filteredListings.length, hasMore, isLoadingMore, view]);

  const currentListing = filteredListings[currentIndex];

  const navItems = [
    { id: 'feed', icon: Flame, label: 'Découvrir', gradient: 'from-orange-400 to-red-500' },
    { id: 'matches', icon: CheckCircle2, label: 'Matchs', badge: matches.length, gradient: 'from-green-400 to-emerald-500' },
    { id: 'messages', icon: MessageCircle, label: 'Messages', gradient: 'from-blue-400 to-cyan-500' },
    { id: 'visits', icon: Calendar, label: 'Planning', gradient: 'from-teal-400 to-emerald-600', badge: visits.filter(v => v.status === 'PENDING').length },
    { id: 'liked', icon: Star, label: 'Mes likes', gradient: 'from-yellow-400 to-amber-500' },
    { id: 'notifications', icon: Bell, label: 'Notifications', badge: unreadCount, gradient: 'from-purple-400 to-pink-500' },
    { id: 'profile', icon: User, label: 'Profil', gradient: 'from-indigo-400 to-purple-500' },
    { id: 'settings', icon: Settings, label: 'Paramètres', gradient: 'from-gray-400 to-slate-500' },
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

  const selectMatch = async (match) => {
    setSelectedMatch(match);
    loadMessages(match);
    // Load visits for this match
    try {
      const response = await getMatchVisits(match.id);
      setMatchVisits(response.data || []);
    } catch (error) {
      console.error('Error loading match visits:', error);
      setMatchVisits([]);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 flex relative overflow-hidden">
      {/* Animated Background Gradients */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <motion.div
          className="absolute -top-1/2 -left-1/2 w-full h-full rounded-full opacity-20"
          style={{
            background: 'radial-gradient(circle, rgba(254, 198, 41, 0.4) 0%, transparent 70%)',
          }}
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 90, 0],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear"
          }}
        />
        <motion.div
          className="absolute -bottom-1/2 -right-1/2 w-full h-full rounded-full opacity-20"
          style={{
            background: 'radial-gradient(circle, rgba(33, 34, 32, 0.3) 0%, transparent 70%)',
          }}
          animate={{
            scale: [1.2, 1, 1.2],
            rotate: [90, 0, 90],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "linear"
          }}
        />
      </div>

      {/* Sidebar */}
      <motion.aside
        className="w-72 bg-gradient-to-br from-[#fec629] to-[#f5b519] text-[#212220] flex flex-col shadow-2xl fixed left-0 top-0 h-screen z-50 border-r border-[#212220]/10"
        initial={{ x: -300 }}
        animate={{ x: 0 }}
        transition={{ type: "spring", damping: 20 }}
      >
        {/* Logo Section */}
        <div className="p-6 border-b border-[#212220]/10">
          <motion.div
            className="flex items-center gap-3 mb-6"
            whileHover={{ scale: 1.02 }}
          >
            <div className="w-12 h-12 bg-[#212220] rounded-2xl flex items-center justify-center shadow-lg p-1 relative overflow-hidden">
              <motion.div
                className="absolute inset-0 bg-gradient-to-br from-[#fec629]/20 to-transparent"
                animate={{ rotate: 360 }}
                transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
              />
              <img
                src="/logo.svg"
                alt="Roomly Logo"
                className="w-full h-full object-contain relative z-10"
              />
            </div>
            <span className="text-2xl font-bold text-[#212220]" style={{ fontFamily: 'Outfit' }}>Roomly</span>
          </motion.div>

          {/* User Card with Hover Effect */}
          <motion.div
            className="bg-[#212220]/10 backdrop-blur-sm rounded-2xl p-4 border border-[#212220]/10 relative overflow-hidden"
            whileHover={{ scale: 1.02 }}
          >
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
              animate={{ x: [-200, 200] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
            <div className="flex items-center gap-3 relative z-10">
              <motion.div
                whileHover={{ scale: 1.1, rotate: 5 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
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
              </motion.div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-[#212220] truncate">{user?.name || 'Utilisateur'}</p>
                <p className="text-xs text-[#212220]/70 truncate">{user?.email || ''}</p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-4 px-3 overflow-y-auto">
          <div className="space-y-2">
            {navItems.map((item, index) => {
              const Icon = item.icon;
              const isActive = view === item.id;

              return (
                <motion.button
                  key={item.id}
                  onClick={() => setView(item.id)}
                  className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-xl transition-all duration-300 group relative overflow-hidden ${isActive
                      ? 'bg-[#212220] text-[#fec629] shadow-xl'
                      : 'hover:bg-[#212220]/10 text-[#212220]/70 hover:text-[#212220]'
                    }`}
                  data-testid={`nav-${item.id}`}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  whileHover={{ scale: 1.02, x: 5 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {/* Animated gradient on hover */}
                  <motion.div
                    className={`absolute inset-0 bg-gradient-to-r ${item.gradient} opacity-0 group-hover:opacity-10 transition-opacity rounded-xl`}
                  />

                  <motion.div
                    animate={isActive ? {
                      rotate: [0, -10, 10, -10, 0],
                    } : {}}
                    transition={{ duration: 0.5 }}
                  >
                    <Icon className="w-5 h-5 relative z-10" />
                  </motion.div>

                  <span className="font-medium relative z-10">{item.label}</span>

                  {item.badge !== undefined && item.badge > 0 && (
                    <motion.span
                      className="ml-auto bg-[#212220] text-[#fec629] text-xs font-bold px-2.5 py-1 rounded-full relative z-10"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      whileHover={{ scale: 1.1 }}
                    >
                      {item.badge}
                    </motion.span>
                  )}

                  {isActive && (
                    <motion.div
                      layoutId="activeNav"
                      className="absolute inset-0 bg-[#212220] rounded-xl"
                      transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                    />
                  )}
                </motion.button>
              );
            })}
          </div>
        </nav>

        {/* Logout Button */}
        <div className="p-4 border-t border-[#212220]/10">
          <motion.button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-[#212220]/10 hover:bg-[#212220]/20 text-[#212220]/70 hover:text-[#212220] transition-all duration-200 group"
            data-testid="logout-btn"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <motion.div
              animate={{ rotate: 0 }}
              whileHover={{ rotate: 180 }}
              transition={{ duration: 0.3 }}
            >
              <LogOut className="w-5 h-5" />
            </motion.div>
            <span className="font-medium">Déconnexion</span>
          </motion.button>
        </div>
      </motion.aside>

      {/* Main Content */}
      <main className="flex-1 ml-72 min-h-screen flex items-center justify-center p-8 relative z-10">
        <AnimatePresence mode="wait">
          {view === 'feed' && (
            <motion.div
              key="feed"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.3 }}
              className="w-full max-w-md flex flex-col items-center justify-center gap-8"
            >
              {currentListing ? (
                <>
                  {/* Swipeable Card */}
                  <SwipeCard
                    listing={currentListing}
                    onLike={handleLike}
                    onPass={handlePass}
                    onViewDetails={() => setView('details')}
                  />

                  {/* Action Buttons */}
                  <motion.div
                    className="flex justify-center gap-6 w-full"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                  >
                    <ActionButton
                      icon={X}
                      onClick={handlePass}
                      testId="pass-btn"
                      color="gray"
                      size="md"
                    />

                    <ActionButton
                      icon={Info}
                      onClick={() => setView('details')}
                      testId="details-btn"
                      color="blue"
                      size="md"
                    />

                    <ActionButton
                      icon={Heart}
                      onClick={handleLike}
                      testId="like-btn"
                      color="primary"
                      size="lg"
                      filled
                    />
                  </motion.div>
                </>
              ) : (
                <EmptyState
                  icon={Home}
                  title="Plus de logements"
                  description="Revenez demain pour de nouvelles annonces ! 🏠"
                />
              )}
            </motion.div>
          )}

          {/* Details View */}
          {view === 'details' && currentListing && (
            <DetailsView
              listing={currentListing}
              onBack={() => setView('feed')}
              onLike={() => {
                handleLike();
                setView('feed');
              }}
              onPass={() => {
                handlePass();
                setView('feed');
              }}
            />
          )}

          {/* Other Views */}
          {(view === 'matches' || view === 'liked' || view === 'profile' || view === 'settings' || view === 'notifications' || view === 'messages' || view === 'visits') && (
            <ContentCard view={view} title={
              view === 'matches' ? `Matchs (${matches.length})` :
                view === 'liked' ? `Mes Likes (${likedListings.length})` :
                  view === 'profile' ? 'Mon Profil' :
                    view === 'notifications' ? `Notifications (${unreadCount} non lue${unreadCount > 1 ? 's' : ''})` :
                      view === 'messages' ? 'Mes Messages' :
                        view === 'visits' ? 'Mon Planning de Visites' :
                          'Paramètres'
            }>
              {view === 'visits' && (
                <CalendarView user={user} onUpdate={loadData} />
              )}
              {view === 'liked' && (
                <LikedListingsView
                  listings={likedListings}
                  onUnlike={(listingId) => {
                    const userId = user?.id ?? user?.user_id;
                    unlikeListing(userId, listingId)
                      .then(() => {
                        toast.success('Annonce retirée des likes');
                        setLikedListings(likedListings.filter(l => l.id !== listingId));
                      })
                      .catch(() => toast.error('Erreur'));
                  }}
                />
              )}

              {view === 'profile' && studentProfile && (
                <ProfileView
                  user={user}
                  profile={studentProfile}
                  isEditing={isEditingProfile}
                  profileForm={profileForm}
                  setProfileForm={setProfileForm}
                  onEdit={() => setIsEditingProfile(true)}
                  onCancel={() => {
                    setProfileForm(studentProfile);
                    setIsEditingProfile(false);
                  }}
                  onSave={async (e) => {
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
                  }}
                  onPhotoUpload={(file) => {
                    const userId = user?.id ?? user?.user_id;
                    uploadProfilePhoto(userId, file)
                      .then(() => getUserById(userId))
                      .then(response => {
                        setUser(response.data);
                        toast.success('Photo ajoutée avec succès');
                      })
                      .catch(() => toast.error("Erreur lors de l'ajout de la photo"));
                  }}
                  onPhotoDelete={() => {
                    if (window.confirm('Êtes-vous sûr de vouloir supprimer votre photo de profil ?')) {
                      const userId = user?.id ?? user?.user_id;
                      deleteProfilePhoto(userId)
                        .then(() => getUserById(userId))
                        .then(response => {
                          setUser(response.data);
                          toast.success('Photo supprimée');
                        })
                        .catch(() => toast.error('Erreur lors de la suppression'));
                    }
                  }}
                  onDeleteAccount={() => {
                    if (window.confirm('⚠️ ATTENTION : Cette action est irréversible. Voulez-vous vraiment supprimer définitivement votre compte et toutes vos données ?')) {
                      const userId = user?.id ?? user?.user_id;
                      deleteUserAccount(userId)
                        .then(() => {
                          toast.success('Compte supprimé');
                          document.cookie = 'session_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
                          navigate('/login');
                        })
                        .catch(() => toast.error('Erreur lors de la suppression du compte'));
                    }
                  }}
                />
              )}

              {view === 'matches' && (
                <MatchesView matches={matches} navigate={navigate} />
              )}

              {view === 'notifications' && (
                <NotificationsView
                  notifications={notifications}
                  unreadCount={unreadCount}
                  onMarkAsRead={handleMarkAsRead}
                  onMarkAllAsRead={handleMarkAllAsRead}
                />
              )}

              {view === 'messages' && (
                <>
                  <VisitModal
                    open={visitModalOpen}
                    onOpenChange={setVisitModalOpen}
                    matchId={selectedMatch?.id}
                    user={user}
                    onVisitCreated={() => {
                      setVisitModalOpen(false);
                      loadData();
                      selectMatch(selectedMatch);
                    }}
                  />
                  <MessagesView
                    matches={matches}
                    selectedMatch={selectedMatch}
                    messages={messages}
                    messageText={messageText}
                    setMessageText={setMessageText}
                    user={user}
                    viewingProfile={viewingProfile}
                    viewingListing={viewingListing}
                    onSelectMatch={selectMatch}
                    onBack={() => setSelectedMatch(null)}
                    onSendMessage={handleSendMessage}
                    setViewingProfile={setViewingProfile}
                    setViewingListing={setViewingListing}
                    matchVisits={matchVisits}
                    onOpenVisitModal={() => setVisitModalOpen(true)}
                    onVisitCreated={() => {
                      loadData();
                      selectMatch(selectedMatch);
                    }}
                  />
                </>
              )}

              {view === 'settings' && (
                <div className="text-center py-12">
                  <Settings className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-600">Section en développement... 🚧</p>
                </div>
              )}
            </ContentCard>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}

// Swipeable Card Component
function SwipeCard({ listing, onLike, onPass, onViewDetails }) {
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
        const swipe = Math.abs(offset.x) * velocity.x;
        if (swipe > 10000) {
          onLike();
        } else if (swipe < -10000) {
          onPass();
        }
      }}
      initial={{ opacity: 0, scale: 0.8, y: 50 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.8, y: -50 }}
      transition={{ duration: 0.5, type: "spring" }}
      className="cursor-grab active:cursor-grabbing w-full relative"
      data-testid="swipe-card"
      whileHover={{ scale: 1.02 }}
    >
      {/* Swipe Indicators */}
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
        {/* Image with Overlay Effects */}
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

          {/* Compatibility Score with Animation */}
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

          {/* Quick Info Badge */}
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

        {/* Info Section */}
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

// Action Button Component
function ActionButton({ icon: Icon, onClick, testId, color, size = 'md', filled = false }) {
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
      data-testid={testId}
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

// Details View Component
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
        <ChevronRight className="w-5 h-5 rotate-180 group-hover:animate-pulse" />
        Retour
      </motion.button>

      <motion.div
        className="bg-white rounded-3xl overflow-hidden shadow-2xl border-2 border-gray-100"
        initial={{ scale: 0.95 }}
        animate={{ scale: 1 }}
      >
        {/* Hero Image */}
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
            className="grid grid-cols-3 gap-4 mb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            {[
              { label: 'Ville', value: listing.city || listing.address?.city || 'N/A', icon: MapPin },
              { label: 'Surface', value: `${listing.surface || 0}m²`, icon: TrendingUp },
              { label: 'Type', value: listing.room_type || 'N/A', icon: Home }
            ].map((item, i) => (
              <motion.div
                key={i}
                className="bg-gradient-to-br from-gray-50 to-white p-4 rounded-2xl text-center border border-gray-100 hover:border-[#fec629] transition-all group"
                whileHover={{ y: -5, scale: 1.05 }}
              >
                <item.icon className="w-5 h-5 mx-auto mb-2 text-gray-400 group-hover:text-[#fec629] transition-colors" />
                <p className="text-gray-600 text-xs mb-1">{item.label}</p>
                <p className="text-[#212220] font-bold capitalize">{item.value}</p>
              </motion.div>
            ))}
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

// Content Card Wrapper
function ContentCard({ view, title, children }) {
  return (
    <motion.div
      key={view}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className="w-full max-w-4xl mx-auto"
    >
      <div className="bg-white rounded-3xl p-8 shadow-xl border-2 border-gray-100 relative overflow-hidden">
        {/* Decorative gradient */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#fec629] via-[#212220] to-[#fec629]" />

        <motion.h2
          className="text-4xl font-bold text-[#212220] mb-8 flex items-center gap-3"
          style={{ fontFamily: 'Outfit' }}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          >
            <Sparkles className="w-8 h-8 text-[#fec629]" />
          </motion.div>
          {title}
        </motion.h2>
        {children}
      </div>
    </motion.div>
  );
}

// Empty State Component
function EmptyState({ icon: Icon, title, description }) {
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
          <Icon className="w-16 h-16 text-gray-400" />
        </motion.div>
        <h3 className="text-3xl font-bold text-[#212220] mb-3" style={{ fontFamily: 'Outfit' }}>
          {title}
        </h3>
        <p className="text-gray-600 text-lg">
          {description}
        </p>
      </div>
    </motion.div>
  );
}

// Liked Listings View
function LikedListingsView({ listings, onUnlike }) {
  if (listings.length === 0) {
    return <EmptyState icon={Star} title="Aucun like" description="Commencez à liker des logements pour les retrouver ici !" />;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {listings.map((listing, index) => (
        <motion.div
          key={listing.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          whileHover={{ y: -5 }}
          className="bg-white rounded-2xl overflow-hidden shadow-md border border-gray-200 hover:shadow-xl transition-all group"
        >
          <div className="aspect-[4/3] bg-gradient-to-br from-gray-100 to-gray-200 relative overflow-hidden">
            {listing.photos?.[0]?.url ? (
              <img
                src={listing.photos[0].url}
                alt={listing.title}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Home className="w-16 h-16 text-gray-300" />
              </div>
            )}
          </div>

          <div className="p-4">
            <h3 className="font-bold text-lg text-[#212220] truncate mb-2">
              {listing.title}
            </h3>
            <div className="flex items-center gap-2 mb-2">
              <span className="bg-gradient-to-r from-[#fec629] to-[#f5b519] text-[#212220] px-3 py-1 rounded-full font-bold text-sm">
                {listing.price || 0}€
              </span>
            </div>
            <p className="text-sm text-gray-600 mb-3 flex items-center gap-1">
              <MapPin className="w-4 h-4" />
              {listing.city || 'Ville inconnue'} • {listing.surface || '?'}m²
            </p>
            <motion.button
              onClick={() => onUnlike(listing.id)}
              className="w-full px-3 py-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2 group"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <X className="w-4 h-4 group-hover:rotate-90 transition-transform" />
              Retirer
            </motion.button>
          </div>
        </motion.div>
      ))}
    </div>
  );
}

// Profile View Component
function ProfileView({ user, profile, isEditing, profileForm, setProfileForm, onEdit, onCancel, onSave, onPhotoUpload, onPhotoDelete, onDeleteAccount }) {
  if (!profile) return null;

  return (
    <div className="space-y-6">
      {/* Photo Section */}
      <motion.div
        className="flex justify-center mb-6"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", duration: 0.6 }}
      >
        <div className="relative group">
          {user?.photo ? (
            <motion.img
              src={user.photo}
              alt={user.name}
              className="w-32 h-32 rounded-full object-cover border-4 border-[#fec629] shadow-xl"
              whileHover={{ scale: 1.05, rotate: 5 }}
            />
          ) : (
            <motion.div
              className="w-32 h-32 bg-gradient-to-br from-[#212220] to-[#3a3b39] rounded-full flex items-center justify-center font-bold text-6xl shadow-xl text-[#fec629]"
              whileHover={{ scale: 1.05, rotate: -5 }}
            >
              {user?.name?.charAt(0).toUpperCase() || 'U'}
            </motion.div>
          )}
          <motion.div
            className="absolute inset-0 rounded-full bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer"
            whileHover={{ scale: 1.05 }}
          >
            <Camera className="w-8 h-8 text-white" />
          </motion.div>
        </div>
      </motion.div>

      {!isEditing ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              { label: 'Type de logement', value: profile.room_type, icon: Home },
              { label: 'Budget maximum', value: `${profile.max_budget || 0}€/mois`, icon: TrendingUp },
              { label: 'Meublé', value: profile.furnished ? 'Oui' : 'Non', icon: CheckCircle2 },
              { label: 'Fumeur', value: profile.smoking ? 'Oui' : 'Non', icon: X },
              { label: 'Animaux', value: profile.pets ? 'Oui' : 'Non', icon: Heart },
              { label: 'Niveau de bruit', value: `${profile.noise_level || 5}/10`, icon: Users },
              { label: 'Université', value: profile.university || 'Non renseigné', icon: Star },
              { label: 'Niveau d\'études', value: profile.study_level || 'Non renseigné', icon: Sparkles },
            ].map((item, i) => (
              <motion.div
                key={i}
                className="bg-gradient-to-br from-gray-50 to-white rounded-xl p-4 border border-gray-100 hover:border-[#fec629] transition-all group"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                whileHover={{ y: -3, scale: 1.02 }}
              >
                <div className="flex items-center gap-2 mb-2">
                  <item.icon className="w-4 h-4 text-gray-400 group-hover:text-[#fec629] transition-colors" />
                  <h3 className="text-sm font-semibold text-gray-600">{item.label}</h3>
                </div>
                <p className="text-lg font-medium capitalize">{item.value}</p>
              </motion.div>
            ))}
          </div>

          <motion.div
            className="bg-gradient-to-br from-gray-50 to-white rounded-xl p-4 border border-gray-100"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <h3 className="text-sm font-semibold text-gray-600 mb-2 flex items-center gap-2">
              <Sparkles className="w-4 h-4" />
              Centres d'intérêt
            </h3>
            <p className="text-lg">{profile.passions || 'Non renseigné'}</p>
          </motion.div>

          <motion.div
            className="space-y-3"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <div className="flex gap-3">
              <motion.button
                onClick={onEdit}
                className="flex-1 bg-gradient-to-r from-[#fec629] to-[#f5b519] hover:shadow-xl text-[#212220] font-semibold px-6 py-3 rounded-full flex items-center justify-center gap-2"
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
              >
                <Edit2 className="w-5 h-5" />
                Modifier mon profil
              </motion.button>

              {user?.photo ? (
                <motion.button
                  onClick={onPhotoDelete}
                  className="border-2 border-red-500 text-red-500 hover:bg-red-50 font-semibold px-6 py-3 rounded-full flex items-center justify-center gap-2"
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Trash2 className="w-5 h-5" />
                  Supprimer la photo
                </motion.button>
              ) : (
                <motion.button
                  onClick={() => {
                    const input = document.createElement('input');
                    input.type = 'file';
                    input.accept = 'image/*';
                    input.onchange = (e) => {
                      const file = e.target.files[0];
                      if (file) onPhotoUpload(file);
                    };
                    input.click();
                  }}
                  className="border-2 border-[#fec629] text-[#fec629] hover:bg-[#fec629] hover:text-[#212220] font-semibold px-6 py-3 rounded-full flex items-center justify-center gap-2 transition-all"
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Camera className="w-5 h-5" />
                  Ajouter une photo
                </motion.button>
              )}
            </div>

            <motion.button
              onClick={onDeleteAccount}
              className="w-full border-2 border-red-600 text-red-600 hover:bg-red-600 hover:text-white font-semibold px-6 py-3 rounded-full transition-all flex items-center justify-center gap-2"
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
            >
              <Trash2 className="w-5 h-5" />
              Supprimer mon compte
            </motion.button>
          </motion.div>
        </>
      ) : (
        <ProfileEditForm
          profileForm={profileForm}
          setProfileForm={setProfileForm}
          onSave={onSave}
          onCancel={onCancel}
        />
      )}
    </div>
  );
}

// Profile Edit Form Component
function ProfileEditForm({ profileForm, setProfileForm, onSave, onCancel }) {
  return (
    <motion.form
      onSubmit={onSave}
      className="space-y-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Form fields... (keeping the same structure but with better styling) */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Type de logement</label>
          <select
            value={profileForm.room_type || ''}
            onChange={(e) => setProfileForm({ ...profileForm, room_type: e.target.value })}
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-[#fec629] focus:border-transparent transition-all"
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
            onChange={(e) => setProfileForm({ ...profileForm, max_budget: parseFloat(e.target.value) })}
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-[#fec629] focus:border-transparent transition-all"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Université</label>
          <input
            type="text"
            value={profileForm.university || ''}
            onChange={(e) => setProfileForm({ ...profileForm, university: e.target.value })}
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-[#fec629] focus:border-transparent transition-all"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Niveau d'études</label>
          <input
            type="text"
            value={profileForm.study_level || ''}
            onChange={(e) => setProfileForm({ ...profileForm, study_level: e.target.value })}
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-[#fec629] focus:border-transparent transition-all"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Niveau de bruit (1-10)</label>
          <input
            type="number"
            min="1"
            max="10"
            value={profileForm.noise_level || 5}
            onChange={(e) => setProfileForm({ ...profileForm, noise_level: parseInt(e.target.value) })}
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-[#fec629] focus:border-transparent transition-all"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Centres d'intérêt</label>
        <textarea
          value={profileForm.passions || ''}
          onChange={(e) => setProfileForm({ ...profileForm, passions: e.target.value })}
          rows="3"
          className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-[#fec629] focus:border-transparent transition-all"
        />
      </div>

      <div className="flex gap-4 flex-wrap">
        {[
          { key: 'furnished', label: 'Meublé' },
          { key: 'smoking', label: 'Fumeur' },
          { key: 'pets', label: 'Animaux' }
        ].map(item => (
          <label key={item.key} className="flex items-center gap-2 cursor-pointer group">
            <input
              type="checkbox"
              checked={profileForm[item.key] || false}
              onChange={(e) => setProfileForm({ ...profileForm, [item.key]: e.target.checked })}
              className="w-5 h-5 text-[#fec629] focus:ring-[#fec629] rounded transition-all"
            />
            <span className="text-sm font-medium group-hover:text-[#fec629] transition-colors">{item.label}</span>
          </label>
        ))}
      </div>

      <div className="flex gap-3 pt-4">
        <motion.button
          type="submit"
          className="flex-1 bg-gradient-to-r from-[#fec629] to-[#f5b519] hover:shadow-xl text-[#212220] font-semibold px-6 py-3 rounded-full"
          whileHover={{ scale: 1.02, y: -2 }}
          whileTap={{ scale: 0.98 }}
        >
          Enregistrer
        </motion.button>
        <motion.button
          type="button"
          onClick={onCancel}
          className="flex-1 border-2 border-gray-300 hover:border-gray-400 text-gray-700 font-semibold px-6 py-3 rounded-full"
          whileHover={{ scale: 1.02, y: -2 }}
          whileTap={{ scale: 0.98 }}
        >
          Annuler
        </motion.button>
      </div>
    </motion.form>
  );
}

// Matches View Component
function MatchesView({ matches, navigate }) {
  if (matches.length === 0) {
    return (
      <EmptyState
        icon={MessageCircle}
        title="Aucun match"
        description="Les bailleurs que vous avez likés pourront vous matcher !"
      />
    );
  }

  return (
    <div className="space-y-4">
      {matches.map((match, index) => (
        <motion.div
          key={match.id}
          className="bg-gradient-to-br from-white to-gray-50 rounded-2xl p-6 shadow-md border-2 border-gray-100 hover:border-[#fec629] hover:shadow-xl transition-all group"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.1 }}
          whileHover={{ x: 5 }}
        >
          <div className="flex gap-6">
            <div className="w-32 h-32 rounded-xl overflow-hidden flex-shrink-0 relative group-hover:scale-105 transition-transform">
              {match.listing?.photos && match.listing.photos[0]?.url ? (
                <img
                  src={match.listing.photos[0].url}
                  alt={match.listing.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
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
                  <p className="text-sm text-gray-600 flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    {match.listing?.city} • {match.listing?.price}€/mois
                  </p>
                </div>
                <motion.span
                  className="bg-gradient-to-r from-green-400 to-emerald-500 text-white px-4 py-2 rounded-full text-sm font-semibold shadow-lg flex items-center gap-1"
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ delay: index * 0.1 + 0.2 }}
                >
                  <CheckCircle2 className="w-4 h-4" />
                  Match !
                </motion.span>
              </div>

              <div className="mb-4">
                <p className="text-sm text-gray-700 line-clamp-2">
                  {match.listing?.description}
                </p>
              </div>

              <div className="flex items-center gap-3 p-3 bg-white rounded-lg border border-gray-100">
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
                  <p className="text-xs text-gray-500 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    Match créé le {new Date(match.created_at).toLocaleDateString('fr-FR')}
                  </p>
                </div>
                <motion.button
                  onClick={() => navigate(`/listing/${match.listing_id}`)}
                  className="px-4 py-2 border-2 border-[#fec629] text-[#fec629] hover:bg-[#fec629] hover:text-[#212220] rounded-full text-sm font-medium transition-all"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Voir l'annonce
                </motion.button>
              </div>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}

// Notifications View Component
function NotificationsView({ notifications, unreadCount, onMarkAsRead, onMarkAllAsRead }) {
  if (notifications.length === 0) {
    return (
      <EmptyState
        icon={Bell}
        title="Aucune notification"
        description="Vous serez notifié ici des nouveaux matchs et messages"
      />
    );
  }

  return (
    <div className="space-y-4">
      {unreadCount > 0 && (
        <div className="flex justify-end">
          <motion.button
            onClick={onMarkAllAsRead}
            className="px-4 py-2 border-2 border-[#fec629] text-[#fff] hover:bg-[#fec629] hover:text-[#212220] rounded-full text-sm font-medium transition-all"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Tout marquer comme lu
          </motion.button>
        </div>
      )}

      <div className="space-y-3">
        {notifications.map((notification, index) => (
          <motion.div
            key={notification.id}
            className={`rounded-xl p-6 border-2 transition-all ${notification.is_read
                ? 'bg-white border-gray-200'
                : 'bg-gradient-to-r from-[#fef9e7] to-white border-[#fec629] shadow-lg'
              }`}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
            whileHover={{ x: 5 }}
          >
            <div className="flex gap-4 items-start">
              <motion.div
                className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${notification.type === 'match_created'
                    ? 'bg-gradient-to-r from-green-400 to-emerald-500'
                    : 'bg-gradient-to-r from-red-400 to-pink-500'
                  }`}
                whileHover={{ scale: 1.1, rotate: 10 }}
              >
                {notification.type === 'match_created' ? (
                  <MessageCircle className="w-6 h-6 text-white" />
                ) : (
                  <X className="w-6 h-6 text-white" />
                )}
              </motion.div>

              <div className="flex-1">
                <h3 className="font-bold text-lg mb-2">{notification.title}</h3>
                <p className="text-gray-700 mb-3">{notification.message}</p>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {new Date(notification.created_at).toLocaleDateString('fr-FR', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </span>
                  {!notification.is_read && (
                    <motion.button
                      onClick={() => onMarkAsRead(notification.id)}
                      className="px-3 py-1 border-2 border-[#fec629] text-[#fff] hover:bg-[#fec629] hover:text-[#212220] rounded-full text-xs font-medium transition-all"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      Marquer comme lu
                    </motion.button>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

// Messages View Component (simplified - keeping core functionality)
function MessagesView({ matches, selectedMatch, messages, messageText, setMessageText, user, viewingProfile, viewingListing, onSelectMatch, onBack, onSendMessage, setViewingProfile, setViewingListing, matchVisits, onOpenVisitModal, onVisitCreated }) {
  if (matches.length === 0) {
    return (
      <EmptyState
        icon={MessageCircle}
        title="Aucun match"
        description="Vos conversations apparaîtront ici une fois que vous aurez matché"
      />
    );
  }

  if (viewingProfile) {
    return <LandlordProfileView profile={viewingProfile} onBack={() => setViewingProfile(null)} />;
  }

  if (viewingListing) {
    return <ListingDetailView listing={viewingListing} onBack={() => setViewingListing(null)} />;
  }

  if (selectedMatch) {
    return (
      <ConversationView
        match={selectedMatch}
        messages={messages}
        messageText={messageText}
        setMessageText={setMessageText}
        user={user}
        onBack={onBack}
        onSendMessage={onSendMessage}
        onViewProfile={() => setViewingProfile(selectedMatch.landlord)}
        onViewListing={() => setViewingListing(selectedMatch.listing)}
        matchVisits={matchVisits}
        onOpenVisitModal={onOpenVisitModal}
        onVisitCreated={onVisitCreated}
      />
    );
  }

  return (
    <div className="space-y-2">
      {matches.map((match, index) => (
        <motion.button
          key={match.id}
          onClick={() => onSelectMatch(match)}
          className="w-full p-4 bg-gradient-to-br from-gray-50 to-white hover:from-[#fec629]/10 hover:to-white rounded-xl text-left transition-all border-2 border-gray-100 hover:border-[#fec629] group"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.05 }}
          whileHover={{ x: 5 }}
        >
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full flex items-center justify-center overflow-hidden flex-shrink-0 group-hover:scale-110 transition-transform">
              {match.landlord?.photo ? (
                <img src={match.landlord.photo} alt={match.landlord.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-[#212220] to-[#3a3b39] text-[#fec629] font-bold flex items-center justify-center">
                  {match.landlord?.name?.charAt(0).toUpperCase() || 'B'}
                </div>
              )}
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-[#212220]">{match.listing.title}</h4>
              <p className="text-sm text-gray-600">Avec {match.landlord?.name || 'Bailleur'}</p>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-[#fec629] group-hover:translate-x-1 transition-all" />
          </div>
        </motion.button>
      ))}
    </div>
  );
}

// Landlord Profile View
function LandlordProfileView({ profile, onBack }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6"
    >
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-gray-500 hover:text-[#212220] transition-colors mb-4 group"
      >
        <ChevronRight className="w-5 h-5 rotate-180 group-hover:-translate-x-1 transition-transform" />
        Retour à la conversation
      </button>

      <div className="flex flex-col items-center mb-6">
        <motion.div
          className="w-24 h-24 rounded-full overflow-hidden bg-gray-200 mb-4"
          whileHover={{ scale: 1.05, rotate: 5 }}
        >
          {profile.photo ? (
            <img src={profile.photo} alt={profile.name} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-[#212220] to-[#3a3b39] text-[#fec629] font-bold flex items-center justify-center text-3xl">
              {profile.name?.charAt(0).toUpperCase()}
            </div>
          )}
        </motion.div>
        <h2 className="text-2xl font-bold text-[#212220]">{profile.name}</h2>
        <p className="text-gray-600">{profile.email}</p>
      </div>

      <div className="space-y-3">
        <div className="bg-gray-50 rounded-xl p-4">
          <h3 className="font-semibold text-[#212220] mb-2">Type de compte</h3>
          <p className="text-gray-600">Bailleur</p>
        </div>
        {profile.telephone && (
          <div className="bg-gray-50 rounded-xl p-4">
            <h3 className="font-semibold text-[#212220] mb-2">Téléphone</h3>
            <p className="text-gray-600">{profile.telephone}</p>
          </div>
        )}
      </div>
    </motion.div>
  );
}

// Listing Detail View
function ListingDetailView({ listing, onBack }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 max-h-[600px] overflow-y-auto"
    >
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-gray-500 hover:text-[#212220] transition-colors mb-4 group"
      >
        <ChevronRight className="w-5 h-5 rotate-180 group-hover:-translate-x-1 transition-transform" />
        Retour à la conversation
      </button>

      {listing.photos && listing.photos.length > 0 && (
        <motion.img
          src={listing.photos[0].url}
          alt={listing.title}
          className="w-full h-64 object-cover rounded-xl mb-4"
          whileHover={{ scale: 1.02 }}
        />
      )}

      <h2 className="text-2xl font-bold text-[#212220] mb-2">{listing.title}</h2>
      <p className="text-xl text-[#fec629] font-bold mb-4">{listing.price}€/mois</p>

      <div className="space-y-3">
        <div className="bg-gray-50 rounded-xl p-4">
          <h3 className="font-semibold text-[#212220] mb-2">Description</h3>
          <p className="text-gray-600">{listing.description}</p>
        </div>

        <div className="bg-gray-50 rounded-xl p-4">
          <h3 className="font-semibold text-[#212220] mb-2">Adresse</h3>
          <p className="text-gray-600">{listing.address}</p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="bg-gray-50 rounded-xl p-4">
            <h3 className="font-semibold text-[#212220] mb-1 text-sm">Surface</h3>
            <p className="text-gray-600">{listing.size}m²</p>
          </div>
          <div className="bg-gray-50 rounded-xl p-4">
            <h3 className="font-semibold text-[#212220] mb-1 text-sm">Meublé</h3>
            <p className="text-gray-600">{listing.furnished ? 'Oui' : 'Non'}</p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// Conversation View
function ConversationView({ match, messages, messageText, setMessageText, user, onBack, onSendMessage, onViewProfile, onViewListing, matchVisits, onOpenVisitModal, onVisitCreated }) {
  return (
    <>

      <motion.div
        className="flex flex-col h-[600px] bg-white rounded-2xl shadow-lg border border-gray-200"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
      >
        {/* Header */}
        <div className="flex items-center gap-3 p-4 border-b border-gray-200 justify-between">
          <div className="flex items-center gap-3 flex-1">
            <button
              onClick={onBack}
              className="text-gray-500 hover:text-[#212220] transition-colors"
            >
              <ChevronRight className="w-6 h-6 rotate-180" />
            </button>

            <button
              onClick={onViewProfile}
              className="flex items-center gap-3 hover:opacity-80 transition-opacity"
            >
              <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0">
                {match.landlord?.photo ? (
                  <img src={match.landlord.photo} alt={match.landlord.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-[#212220] to-[#3a3b39] text-[#fec629] font-bold flex items-center justify-center text-sm">
                    {match.landlord?.name?.charAt(0).toUpperCase() || 'B'}
                  </div>
                )}
              </div>

              <h3 className="font-semibold text-[#212220] text-sm">{match.landlord?.name || 'Bailleur'}</h3>
            </button>

            <button
              onClick={onViewListing}
              className="text-xs text-gray-500 hover:text-[#fec629] transition-colors flex-1 text-left"
            >
              {match.listing.title}
            </button>
          </div>

          {/* Visit Button */}
          <Button
            onClick={onOpenVisitModal}
            className="bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600 text-gray-900 font-semibold whitespace-nowrap"
            size="sm"
          >
            📅 Planifier
          </Button>
        </div>

        {/* Visits Section */}
        {matchVisits.length > 0 && (
          <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
            <h4 className="text-xs font-semibold text-gray-600 mb-2">Visites proposées</h4>
            <div className="space-y-2 max-h-[120px] overflow-y-auto">
              {matchVisits.map((visit) => (
                <VisitBubble
                  key={visit.id}
                  visit={visit}
                  user={user}
                  isProposer={visit.student_id === user?.id || visit.student_id === user?.user_id}
                  onUpdate={() => {
                    onVisitCreated?.();
                  }}
                />
              ))}
            </div>
          </div>
        )}

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
          {messages.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <MessageCircle className="w-16 h-16 text-gray-300 mx-auto mb-2" />
              <p className="text-sm">Aucun message - Soyez le premier à écrire !</p>
            </div>
          ) : (
            messages.map((msg, index) => {
              const isCurrentUser = msg.sender_id === user?.id || msg.sender_id === user?.user_id;
              return (
                <motion.div
                  key={msg.id}
                  className={`flex gap-2 ${isCurrentUser ? 'flex-row-reverse' : 'flex-row'}`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0">
                    {isCurrentUser ? (
                      user?.photo ? (
                        <img src={user.photo} alt="Vous" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-[#fec629] to-[#f5b519] text-[#212220] font-bold flex items-center justify-center text-xs">
                          {user?.name?.charAt(0).toUpperCase() || 'M'}
                        </div>
                      )
                    ) : (
                      match.landlord?.photo ? (
                        <img src={match.landlord.photo} alt={match.landlord.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-[#212220] to-[#3a3b39] text-[#fec629] font-bold flex items-center justify-center text-xs">
                          {match.landlord?.name?.charAt(0).toUpperCase() || 'B'}
                        </div>
                      )
                    )}
                  </div>

                  <div className={`flex flex-col ${isCurrentUser ? 'items-end' : 'items-start'} max-w-[70%]`}>
                    <motion.div
                      className={`px-4 py-2 rounded-2xl ${isCurrentUser
                          ? 'bg-gradient-to-r from-[#fec629] to-[#f5b519] text-[#212220] rounded-tr-sm'
                          : 'bg-white text-[#212220] border border-gray-200 rounded-tl-sm shadow-sm'
                        }`}
                      whileHover={{ scale: 1.02 }}
                    >
                      <p className="text-sm leading-relaxed">{msg.content}</p>
                    </motion.div>
                    <p className="text-xs text-gray-500 mt-1 px-2">
                      {new Date(msg.created_at).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </motion.div>
              );
            })
          )}
        </div>

        {/* Input */}
        <form onSubmit={onSendMessage} className="p-4 border-t border-gray-200 bg-white flex gap-2">
          <input
            type="text"
            value={messageText}
            onChange={(e) => setMessageText(e.target.value)}
            placeholder="Écrivez un message..."
            className="flex-1 px-4 py-2 border-2 border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-[#fec629] focus:border-transparent transition-all"
          />
          <motion.button
            type="submit"
            disabled={!messageText.trim()}
            className="bg-gradient-to-r from-[#fec629] to-[#f5b519] hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed text-[#212220] p-3 rounded-full transition-all"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Send className="w-5 h-5" />
          </motion.button>
        </form>
      </motion.div>
    </>
  );
}