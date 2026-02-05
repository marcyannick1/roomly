import { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { getCurrentUser, getLandlordListings, getInterestedStudents, createMatch, deleteListing, getUserById, getLandlordProfile, updateLandlordProfile, uploadProfilePhoto, deleteProfilePhoto, deleteUserAccount, getLandlordReceivedLikes, getLandlordMatches, deleteMatch, rejectStudentLike, getMatchMessages, sendMessage, getUserVisits, getUserNotifications, getUnreadNotificationsCount, markNotificationAsRead, markAllNotificationsAsRead, getMatchVisits } from '@/lib/api';
import { toast } from 'sonner';
import { Home, Plus, LogOut, User, Eye, Flame, Settings, Pencil, Trash2, Heart, CheckCircle2, XCircle, MessageCircle, X, Send, Sparkles, TrendingUp, Calendar, Bell, Clock } from 'lucide-react';
import { CalendarView } from '@/components/visits/CalendarView';
import { VisitModal } from '@/components/visits/VisitModal';
import { VisitBubble } from '@/components/visits/VisitBubble';
import { motion, AnimatePresence } from 'framer-motion';
import MatchAnimation from '@/components/MatchAnimation';

export default function LandlordDashboard() {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState(location.state?.user || null);
  const [listings, setListings] = useState([]);
  const [view, setView] = useState('listings');
  const [selectedListing, setSelectedListing] = useState(null);
  const [interestedStudents, setInterestedStudents] = useState([]);
  const [allReceivedLikes, setAllReceivedLikes] = useState([]);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [listingToDelete, setListingToDelete] = useState(null);
  const [landlordProfile, setLandlordProfile] = useState(null);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileForm, setProfileForm] = useState({});
  const [showMatchAnimation, setShowMatchAnimation] = useState(false);
  const [allMatches, setAllMatches] = useState([]);
  const [selectedMatch, setSelectedMatch] = useState(null);
  const [messages, setMessages] = useState([]);
  const [messageText, setMessageText] = useState('');
  const [viewingProfile, setViewingProfile] = useState(null);
  const [viewingListing, setViewingListing] = useState(null);
  const [visits, setVisits] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [matchVisits, setMatchVisits] = useState([]);
  const [visitModalOpen, setVisitModalOpen] = useState(false);

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
        currentUser = response.data.user || response.data;
      }

      const userId = currentUser?.id || currentUser?.user_id;
      if (userId) {
        try {
          const userResponse = await getUserById(userId);
          const updatedUser = userResponse.data;
          setUser(updatedUser);
          currentUser = updatedUser;
        } catch (error) {
          console.error('Erreur lors du rechargement utilisateur:', error);
        }
      }

      console.log('Current user in LandlordDashboard:', currentUser);

      const landlordId = currentUser?.id || location.state?.user?.id;
      if (landlordId) {
        const listingsResponse = await getLandlordListings(landlordId);
        setListings(listingsResponse.data);

        try {
          const likesResponse = await getLandlordReceivedLikes(landlordId);
          setAllReceivedLikes(likesResponse.data);
        } catch (error) {
          console.log('Erreur chargement des likes:', error);
        }

        try {
          const matchesResponse = await getLandlordMatches(landlordId);
          setAllMatches(matchesResponse.data);
        } catch (error) {
          console.log('Erreur chargement des matches:', error);
        }

        try {
          const profileResponse = await getLandlordProfile(landlordId);
          const profile = profileResponse.data;
          setLandlordProfile(profile);
          setProfileForm({
            ...profile,
            name: currentUser.name,
            email: currentUser.email
          });
        } catch (error) {
          console.log('No landlord profile found');
        }

        try {
          const visitsResponse = await getUserVisits(landlordId);
          setVisits(visitsResponse.data || []);
        } catch (error) {
          console.log('Erreur chargement des visites:', error);
        }

        try {
          const notificationsResponse = await getUserNotifications(landlordId);
          setNotifications(notificationsResponse.data || []);
          const unreadResponse = await getUnreadNotificationsCount(landlordId);
          setUnreadCount(unreadResponse.data?.count || 0);
        } catch (error) {
          console.log('Erreur chargement des notifications:', error);
        }
      }
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const handleMarkAsRead = async (notificationId) => {
    try {
      await markNotificationAsRead(notificationId);
      const userId = user?.id || user?.user_id;
      if (userId) {
        const notificationsResponse = await getUserNotifications(userId);
        setNotifications(notificationsResponse.data || []);
        const unreadResponse = await getUnreadNotificationsCount(userId);
        setUnreadCount(unreadResponse.data?.count || 0);
      }
    } catch (error) {
      toast.error('Erreur lors de la mise à jour de la notification');
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      const userId = user?.id || user?.user_id;
      if (!userId) return;
      await markAllNotificationsAsRead(userId);
      const notificationsResponse = await getUserNotifications(userId);
      setNotifications(notificationsResponse.data || []);
      setUnreadCount(0);
      toast.success('Toutes les notifications ont été marquées comme lues');
    } catch (error) {
      toast.error('Erreur lors de la mise à jour des notifications');
    }
  };

  const viewInterestedStudents = (listing) => {
    setSelectedListing(listing);
    setView('students');
  };

  const handleDeleteClick = (listing) => {
    setListingToDelete(listing);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    try {
      await deleteListing(listingToDelete.id);
      toast.success('Annonce supprimée');
      setDeleteDialogOpen(false);
      setListingToDelete(null);
      loadData();
    } catch (error) {
      toast.error('Erreur lors de la suppression');
    }
  };

  const handleMatch = async ({ student, listing }) => {
    try {
      await createMatch(landlordProfile.id, student.id, listing.id);
      setShowMatchAnimation(true);
      setSelectedListing(listing);
      toast.success('Match créé avec succès ! 💚');
      setTimeout(() => {
        setShowMatchAnimation(false);
        loadData();
        viewInterestedStudents(listing);
      }, 3000);
    } catch (error) {
      console.error('Erreur match:', error);
      if (error.response?.status === 409) {
        toast.info('Ce match existe déjà');
        loadData();
      } else if (error.response?.status === 400) {
        toast.error("L'étudiant n'a pas liké cette annonce");
      } else if (error.response?.status === 403) {
        toast.error("Cette annonce ne vous appartient pas");
      } else {
        toast.error('Erreur lors de la création du match');
      }
    }
  };

  const handleRejectMatch = async (matchId, listingId) => {
    try {
      await deleteMatch(matchId);
      toast.success('Match refusé');
      loadData();
      const listing = listings.find(l => l.id === listingId);
      if (listing && view === 'students') {
        viewInterestedStudents(listing);
      }
    } catch (error) {
      console.error('Erreur lors du refus du match:', error);
      toast.error('Erreur lors du refus du match');
    }
  };

  const handleRejectLike = async (userIdOfStudent, listingId) => {
    try {
      const landlordId = landlordProfile?.id;
      await rejectStudentLike(landlordId, userIdOfStudent, listingId);
      toast.success('Like refusé - Notification envoyée à l\'étudiant');
      loadData();
      const listing = listings.find(l => l.id === listingId);
      if (listing && view === 'students') {
        viewInterestedStudents(listing);
      }
    } catch (error) {
      console.error('Erreur lors du refus du like:', error);
      toast.error('Erreur lors du refus du like');
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

  const loadMatchVisits = async (matchId) => {
    try {
      const response = await getMatchVisits(matchId);
      setMatchVisits(response.data || []);
    } catch (error) {
      console.error('Erreur lors du chargement des visites:', error);
    }
  };

  const selectMatch = (match) => {
    setSelectedMatch(match);
    loadMessages(match);
    loadMatchVisits(match.id);
  };

  const handleLogout = () => {
    document.cookie = 'session_token=; path=/; max-age=0';
    navigate('/');
  };

  const navItems = [
    { id: 'listings', icon: Home, label: 'Mes annonces', path: '/landlord/dashboard' },
    { id: 'interested', icon: Flame, label: 'Intéressés', path: null },
    { id: 'matches', icon: CheckCircle2, label: 'Matchs', path: null },
    { id: 'messages', icon: MessageCircle, label: 'Messages', path: null },
    { id: 'visits', icon: Calendar, label: 'Planning', path: null },
    { id: 'notifications', icon: Bell, label: 'Notifications', path: null, badge: unreadCount },
    { id: 'create', icon: Plus, label: 'Créer une annonce', path: '/landlord/listing/new' },
    { id: 'profile', icon: User, label: 'Profil', path: null },
    { id: 'settings', icon: Settings, label: 'Paramètres', path: null },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 flex">
      {/* Sidebar avec couleurs originales jaune/noir */}
      <aside className="dashboard-sidebar w-72 bg-[#fec629] text-[#212220] flex flex-col shadow-2xl fixed left-0 top-0 h-screen z-50 border-r border-black/10">
        {/* Logo & User Profile */}
        <div className="p-6 border-b border-black/10">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-3 mb-6"
          >
            <div className="w-12 h-12 bg-[#212220] rounded-2xl flex items-center justify-center shadow-lg p-2 relative overflow-hidden">
              <img src="/logo.svg" alt="Roomly" className="w-full h-full relative z-10" />
            </div>
            <span className="text-2xl font-bold text-[#212220]" style={{ fontFamily: 'Outfit' }}>
              Roomly
            </span>
          </motion.div>

          {/* User Profile Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            className="bg-black/5 rounded-2xl p-4 border border-black/10 relative overflow-hidden group hover:shadow-lg transition-all duration-300"
          >
            <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="flex items-center gap-3 relative z-10">
              {user?.photo ? (
                <div className="relative">
                  <img
                    src={user.photo}
                    alt={user.name}
                    className="w-12 h-12 rounded-full object-cover shadow-lg border-2 border-[#212220]"
                  />
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-[#fec629] shadow-sm" />
                </div>
              ) : (
                <div className="w-12 h-12 bg-[#212220] rounded-full flex items-center justify-center font-bold text-lg shadow-lg text-[#fec629] relative">
                  {user?.name?.charAt(0).toUpperCase() || 'U'}
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-[#fec629] shadow-sm" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-[#212220] truncate">{user?.name || 'Utilisateur'}</p>
                <p className="text-xs text-[#212220]/70 truncate">{user?.email || ''}</p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Navigation Items avec animations */}
        <nav className="flex-1 py-4 px-3 overflow-y-auto">
          <div className="space-y-2">
            {navItems.map((item, index) => {
              const Icon = item.icon;
              const isActive = view === item.id;

              return (
                <motion.button
                  key={item.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  onClick={() => {
                    if (item.id === 'listings') {
                      setView('listings');
                    } else if (item.id === 'create') {
                      navigate('/landlord/listing/new');
                    } else if (item.id === 'interested') {
                      setView('interested');
                    } else if (item.id === 'matches') {
                      setView('matches');
                    } else if (item.id === 'messages') {
                      setView('messages');
                    } else if (item.id === 'visits') {
                      setView('visits');
                    } else if (item.id === 'notifications') {
                      setView('notifications');
                    } else if (item.id === 'profile') {
                      setView('profile');
                    } else if (item.id === 'settings') {
                      toast.error('Paramètres en cours de développement');
                    }
                  }}
                  className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-xl transition-all duration-300 group relative ${isActive
                      ? 'bg-[#212220] text-[#fec629] shadow-lg scale-105'
                      : 'hover:bg-black/5 text-[#212220]/70 hover:text-[#212220]'
                    }`}
                  data-testid={`nav-${item.id}`}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Icon className={`w-5 h-5 ${isActive ? 'text-[#fec629]' : 'text-[#212220]/70'} transition-colors duration-300`} />
                  <span className="font-medium">{item.label}</span>
                  {item.badge > 0 && (
                    <span className={`ml-auto text-xs px-2 py-0.5 rounded-full font-semibold ${isActive ? 'bg-[#fec629] text-[#212220]' : 'bg-[#212220] text-[#fec629]'}`}>
                      {item.badge}
                    </span>
                  )}

                  {isActive && (
                    <motion.div
                      layoutId="activeNavLandlord"
                      className="absolute inset-0 bg-[#212220] rounded-xl -z-10"
                      transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                    />
                  )}

                  {/* Effet de brillance au survol */}
                  <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-5" />
                </motion.button>
              );
            })}
          </div>
        </nav>

        {/* Logout Button */}
        <div className="p-4 border-t border-black/10">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-black/5 hover:bg-black/10 text-[#212220]/70 hover:text-[#212220] transition-all duration-300 group"
            data-testid="logout-btn"
          >
            <LogOut className="w-5 h-5 group-hover:rotate-12 transition-transform duration-300" />
            <span className="font-medium">Déconnexion</span>
          </motion.button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 ml-72">
        <div className="max-w-7xl mx-auto px-6 py-8">
          {view === 'listings' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="flex justify-between items-center mb-8">
                <div>
                  <h2 className="text-4xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent mb-2" style={{ fontFamily: 'Outfit' }}>
                    Mes annonces
                  </h2>
                  <p className="text-slate-500">Gérez vos propriétés et suivez vos performances</p>
                </div>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button
                    onClick={() => navigate('/landlord/listing/new')}
                    data-testid="create-listing-btn"
                    className="rounded-full bg-[#fec629] hover:bg-[#e5b525] text-[#212220] shadow-lg px-6 py-6 font-semibold"
                  >
                    <Plus className="w-5 h-5 mr-2" />
                    Créer une annonce
                  </Button>
                </motion.div>
              </div>

              {listings.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center py-20 bg-white/50 backdrop-blur-sm rounded-3xl border border-slate-200/50"
                  data-testid="no-listings"
                >
                  <div className="relative inline-block mb-6">
                    <Home className="w-24 h-24 text-slate-300" />
                    <motion.div
                      animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
                      transition={{ repeat: Infinity, duration: 2 }}
                      className="absolute inset-0 w-24 h-24 bg-blue-500/20 rounded-full blur-xl"
                    />
                  </div>
                  <h3 className="text-2xl font-bold text-slate-800 mb-2" style={{ fontFamily: 'Outfit' }}>
                    Aucune annonce
                  </h3>
                  <p className="text-slate-500 mb-6">
                    Créez votre première annonce pour commencer
                  </p>
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button
                      onClick={() => navigate('/landlord/listing/new')}
                      data-testid="create-first-listing-btn"
                      className="rounded-full bg-[#fec629] hover:bg-[#e5b525] text-[#212220] shadow-lg px-8 font-semibold"
                    >
                      <Sparkles className="w-5 h-5 mr-2" />
                      Créer une annonce
                    </Button>
                  </motion.div>
                </motion.div>
              ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {listings.map((listing, index) => (
                    <motion.div
                      key={listing.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      whileHover={{ y: -8, transition: { duration: 0.3 } }}
                      className="bg-white rounded-3xl overflow-hidden shadow-lg border border-slate-200/50 hover:shadow-2xl hover:shadow-blue-500/10 transition-all duration-300 group"
                      data-testid={`listing-${listing.id}`}
                    >
                      <div className="h-64 bg-slate-100 relative overflow-hidden">
                        {listing.photos && listing.photos.length > 0 && listing.photos[0]?.url ? (
                          <img
                            src={listing.photos[0].url}
                            alt={listing.title}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200">
                            <Home className="w-16 h-16 text-slate-300" />
                          </div>
                        )}

                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

                        <div className="absolute top-3 right-3 flex gap-2">
                          {listing.liked_by?.length > 0 && (
                            <motion.div
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              className="bg-gradient-to-r from-pink-500 to-red-500 text-white px-3 py-1.5 rounded-full text-sm font-semibold shadow-lg backdrop-blur-sm flex items-center gap-1"
                            >
                              <Heart className="w-3 h-3 fill-current" />
                              {listing.liked_by.length}
                            </motion.div>
                          )}
                          {allMatches.filter(match => match.listing_id === listing.id).length > 0 && (
                            <motion.div
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              transition={{ delay: 0.1 }}
                              className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-3 py-1.5 rounded-full text-sm font-semibold shadow-lg backdrop-blur-sm flex items-center gap-1"
                            >
                              <CheckCircle2 className="w-3 h-3" />
                              {allMatches.filter(match => match.listing_id === listing.id).length}
                            </motion.div>
                          )}
                        </div>

                        <div className="absolute inset-x-0 bottom-0 p-5 text-white">
                          <h3 className="text-xl font-semibold mb-1" style={{ fontFamily: 'Outfit' }}>
                            {listing.title}
                          </h3>
                          <div className="flex items-center justify-between text-sm opacity-90">
                            <span className="flex items-center gap-2">
                              <TrendingUp className="w-4 h-4" />
                              {listing.surface}m² • {listing.room_type}
                            </span>
                            <span className="text-xl font-bold bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">
                              {listing.price}€
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="p-5 space-y-3">
                        <div className="flex items-center justify-between text-sm text-slate-500">
                          <span className="capitalize">{listing.room_type}</span>
                          <span className="flex items-center gap-1">
                            {listing.furnished ? (
                              <>
                                <CheckCircle2 className="w-4 h-4 text-green-500" />
                                Meublé
                              </>
                            ) : (
                              'Non meublé'
                            )}
                          </span>
                        </div>

                        <div className="flex gap-2">
                          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="flex-1">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => viewInterestedStudents(listing)}
                              data-testid={`view-students-${listing.id}`}
                              className="w-full rounded-full border-blue-200 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-300 transition-all"
                            >
                              <Eye className="w-4 h-4 mr-2" />
                              Intéressés ({allReceivedLikes.filter(like => like.listing_id === listing.id).length})
                            </Button>
                          </motion.div>
                          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="flex-1">
                            <Button
                              size="sm"
                              onClick={() => navigate(`/listing/${listing.id}`)}
                              data-testid={`listing-details-${listing.id}`}
                              className="w-full rounded-full bg-[#fec629] hover:bg-[#e5b525] text-[#212220] shadow-md font-semibold"
                            >
                              Détails
                            </Button>
                          </motion.div>
                        </div>

                        <div className="flex gap-2">
                          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="flex-1">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => navigate(`/landlord/listing/edit/${listing.id}`)}
                              className="w-full rounded-full border-slate-200 hover:bg-slate-50 transition-all"
                            >
                              <Pencil className="w-4 h-4 mr-2" />
                              Modifier
                            </Button>
                          </motion.div>
                          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="flex-1">
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => handleDeleteClick(listing)}
                              className="w-full rounded-full bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 shadow-md"
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              Supprimer
                            </Button>
                          </motion.div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {view === 'students' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Button
                variant="ghost"
                onClick={() => setView('listings')}
                data-testid="back-to-listings"
                className="mb-6 rounded-full hover:bg-slate-100"
              >
                ← Retour aux annonces
              </Button>

              <h2 className="text-3xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent mb-6" style={{ fontFamily: 'Outfit' }}>
                Étudiants intéressés par : {selectedListing?.title}
              </h2>

              {(() => {
                const filteredLikes = allReceivedLikes
                  .filter(like => like.listing_id === selectedListing?.id)
                  .filter(like => {
                    const isMatched = allMatches.some(match =>
                      match.student_id === like.student_id &&
                      match.listing_id === like.listing_id
                    );
                    return !isMatched;
                  });

                return filteredLikes.length === 0 ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center py-20 bg-white/50 backdrop-blur-sm rounded-3xl border border-slate-200/50"
                  >
                    <User className="w-24 h-24 text-slate-300 mx-auto mb-4" />
                    <p className="text-slate-500">
                      Aucun étudiant n'a encore liké cette annonce ou tous les likes ont été matchés
                    </p>
                  </motion.div>
                ) : (
                  <div className="space-y-4">
                    {filteredLikes.map((like, index) => (
                      <motion.div
                        key={like.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        whileHover={{ scale: 1.02 }}
                        className="bg-white rounded-2xl p-5 hover:shadow-xl hover:shadow-blue-500/10 transition-all duration-300 border border-slate-200/50"
                      >
                        <div className="flex gap-4 items-center">
                          <div className="relative">
                            <div className="w-16 h-16 bg-slate-100 rounded-full overflow-hidden flex-shrink-0">
                              {like.student.photo ? (
                                <img
                                  src={like.student.photo}
                                  alt={like.student.name}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-600 to-purple-600 text-white font-bold text-xl">
                                  {like.student.name?.charAt(0).toUpperCase() || 'U'}
                                </div>
                              )}
                            </div>
                            <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-gradient-to-r from-pink-500 to-red-500 rounded-full flex items-center justify-center border-2 border-white shadow-sm">
                              <Heart className="w-3 h-3 text-white fill-current" />
                            </div>
                          </div>

                          <div className="flex-1">
                            <h4 className="font-semibold text-slate-800">
                              {like.student.name}
                            </h4>
                            <p className="text-sm text-slate-500">
                              {like.student.university || 'Université non renseignée'}
                            </p>
                          </div>

                          <div className="flex gap-2">
                            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => navigate(`/profile/${like.student.user_id}`)}
                                className="rounded-full border-slate-200 hover:bg-slate-50"
                              >
                                <User className="w-4 h-4 mr-2" />
                                Voir profil
                              </Button>
                            </motion.div>

                            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                              <Button
                                size="sm"
                                onClick={() => handleRejectLike(like.student.user_id, like.listing_id)}
                                className="rounded-full bg-red-600 hover:bg-red-700 text-white shadow-md"
                              >
                                <X className="w-4 h-4 mr-2" />
                                Refuser
                              </Button>
                            </motion.div>

                            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                              <Button
                                size="sm"
                                onClick={() => handleMatch({ student: like.student, listing: selectedListing })}
                                className="rounded-full bg-green-600 hover:bg-green-700 text-white shadow-md"
                              >
                                <CheckCircle2 className="w-4 h-4 mr-2" />
                                Matcher
                              </Button>
                            </motion.div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                );
              })()}
            </motion.div>
          )}

          {/* Vue Matches */}
          {view === 'matches' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <h2 className="text-4xl font-bold mb-2 flex items-center gap-3" style={{ fontFamily: 'Outfit' }}>
                <div className="p-3 bg-gradient-to-br from-green-500 to-emerald-500 rounded-2xl">
                  <CheckCircle2 className="w-8 h-8 text-white" />
                </div>
                <span className="bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
                  Mes Matchs
                </span>
              </h2>
              <p className="text-slate-500 mb-8">Vos connexions réussies avec les étudiants</p>

              {allMatches.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center py-20 bg-white/50 backdrop-blur-sm rounded-3xl border border-slate-200/50"
                >
                  <CheckCircle2 className="w-24 h-24 text-slate-300 mx-auto mb-4" />
                  <p className="text-slate-500 text-lg">
                    Aucun match pour le moment
                  </p>
                  <p className="text-sm text-slate-400 mt-2">
                    Vos matchs apparaîtront ici
                  </p>
                </motion.div>
              ) : (
                <div className="space-y-8">
                  {Object.entries(
                    allMatches.reduce((acc, match) => {
                      const listingId = match.listing.id;
                      if (!acc[listingId]) {
                        acc[listingId] = {
                          listing: match.listing,
                          matches: []
                        };
                      }
                      acc[listingId].matches.push(match);
                      return acc;
                    }, {})
                  ).map(([listingId, data], groupIndex) => (
                    <motion.div
                      key={listingId}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: groupIndex * 0.1 }}
                      className="bg-white rounded-3xl shadow-lg p-6 border border-slate-200/50 hover:shadow-2xl hover:shadow-green-500/10 transition-all duration-300"
                    >
                      <div className="flex items-start gap-4 mb-6 pb-4 border-b border-slate-200/50">
                        <div className="w-24 h-24 bg-slate-100 rounded-2xl overflow-hidden flex-shrink-0">
                          {data.listing.photos && data.listing.photos.length > 0 ? (
                            <img
                              src={data.listing.photos[0].url}
                              alt={data.listing.title}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-600 to-purple-600 text-white">
                              <Home className="w-10 h-10" />
                            </div>
                          )}
                        </div>

                        <div className="flex-1">
                          <h3 className="text-xl font-bold text-slate-800 mb-2">
                            {data.listing.title}
                          </h3>
                          <p className="text-slate-500 text-sm mb-3">
                            {data.listing.city} • {data.listing.price}€/mois
                          </p>
                          <span className="inline-flex items-center gap-2 bg-gradient-to-r from-green-50 to-emerald-50 text-green-700 px-4 py-2 rounded-full text-sm font-medium border border-green-200/50">
                            <CheckCircle2 className="w-4 h-4" />
                            {data.matches.length} match{data.matches.length > 1 ? 's' : ''}
                          </span>
                        </div>
                      </div>

                      <div className="space-y-3">
                        {data.matches.map((match, matchIndex) => (
                          <motion.div
                            key={match.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: matchIndex * 0.05 }}
                            whileHover={{ scale: 1.01 }}
                            className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-4 hover:from-green-100 hover:to-emerald-100 transition-all duration-300 border border-green-200/50"
                          >
                            <div className="flex gap-4 items-center">
                              <div className="relative">
                                <div className="w-16 h-16 bg-slate-100 rounded-full overflow-hidden flex-shrink-0">
                                  {match.student?.photo ? (
                                    <img
                                      src={match.student.photo}
                                      alt={match.student.name}
                                      className="w-full h-full object-cover"
                                    />
                                  ) : (
                                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-600 to-purple-600 text-white font-bold text-xl">
                                      {match.student?.name?.charAt(0).toUpperCase() || 'E'}
                                    </div>
                                  )}
                                </div>
                                <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center border-2 border-white shadow-sm">
                                  <CheckCircle2 className="w-3 h-3 text-white" />
                                </div>
                              </div>

                              <div className="flex-1">
                                <h4 className="font-semibold text-slate-800">
                                  {match.student?.name || 'Étudiant'}
                                </h4>
                                <p className="text-sm text-slate-500">
                                  {match.student?.university || 'Université non renseignée'}
                                </p>
                                <p className="text-xs text-slate-400 mt-1">
                                  Matché le {new Date(match.created_at).toLocaleDateString('fr-FR')}
                                </p>
                              </div>

                              <div className="flex items-center gap-2">
                                <div className="flex items-center gap-2 bg-white/60 backdrop-blur-sm border border-green-200 rounded-full px-4 py-2">
                                  <CheckCircle2 className="w-4 h-4 text-green-600" />
                                  <span className="text-sm font-medium text-green-700">
                                    Matché 💚
                                  </span>
                                </div>

                                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => navigate(`/profile/${match.student?.user_id}`)}
                                    className="rounded-full border-slate-200 hover:bg-white"
                                  >
                                    <User className="w-4 h-4 mr-2" />
                                    Voir profil
                                  </Button>
                                </motion.div>
                              </div>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {/* Vue globale des intéressés */}
          {view === 'interested' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <h2 className="text-4xl font-bold mb-2 flex items-center gap-3" style={{ fontFamily: 'Outfit' }}>
                <div className="p-3 bg-gradient-to-br from-pink-500 to-red-500 rounded-2xl">
                  <Heart className="w-8 h-8 text-white" />
                </div>
                <span className="bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
                  Étudiants intéressés
                </span>
              </h2>
              <p className="text-slate-500 mb-8">Les étudiants qui ont aimé vos annonces</p>

              {allReceivedLikes.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center py-20 bg-white/50 backdrop-blur-sm rounded-3xl border border-slate-200/50"
                >
                  <Heart className="w-24 h-24 text-slate-300 mx-auto mb-4" />
                  <p className="text-slate-500 text-lg">
                    Aucun étudiant n'a encore liké vos annonces
                  </p>
                  <p className="text-sm text-slate-400 mt-2">
                    Les étudiants intéressés apparaîtront ici
                  </p>
                </motion.div>
              ) : (
                <div className="space-y-8">
                  {Object.entries(
                    allReceivedLikes.reduce((acc, like) => {
                      const listingId = like.listing.id;
                      if (!acc[listingId]) {
                        acc[listingId] = {
                          listing: like.listing,
                          likes: []
                        };
                      }
                      acc[listingId].likes.push(like);
                      return acc;
                    }, {})
                  ).map(([listingId, data], groupIndex) => (
                    <motion.div
                      key={listingId}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: groupIndex * 0.1 }}
                      className="bg-white rounded-3xl p-6 shadow-lg border border-slate-200/50 hover:shadow-2xl hover:shadow-pink-500/10 transition-all duration-300"
                    >
                      <div className="flex gap-4 items-start mb-6 pb-4 border-b border-slate-200/50">
                        <div className="w-24 h-24 rounded-2xl overflow-hidden bg-slate-100 flex-shrink-0">
                          {data.listing.photos && data.listing.photos[0]?.url ? (
                            <img
                              src={data.listing.photos[0].url}
                              alt={data.listing.title}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Home className="w-8 h-8 text-slate-300" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1">
                          <h3 className="text-xl font-bold text-slate-800 mb-2" style={{ fontFamily: 'Outfit' }}>
                            {data.listing.title}
                          </h3>
                          <div className="flex items-center gap-4 text-sm text-slate-500 mb-3">
                            <span>{data.listing.city}</span>
                            <span>•</span>
                            <span className="font-bold text-blue-600">{data.listing.price}€/mois</span>
                            <span>•</span>
                            <span className="flex items-center gap-1">
                              <Heart className="w-4 h-4 text-pink-500 fill-pink-500" />
                              {data.likes.length} intéressé{data.likes.length > 1 ? 's' : ''}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-3">
                        {data.likes.map((like, likeIndex) => (
                          <motion.div
                            key={like.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: likeIndex * 0.05 }}
                            whileHover={{ scale: 1.01 }}
                            className="bg-gradient-to-r from-pink-50 to-red-50 rounded-2xl p-4 hover:from-pink-100 hover:to-red-100 transition-all duration-300 border border-pink-200/50"
                          >
                            <div className="flex gap-4 items-center">
                              <div className="relative">
                                <div className="w-16 h-16 bg-slate-100 rounded-full overflow-hidden flex-shrink-0">
                                  {like.student.photo ? (
                                    <img
                                      src={like.student.photo}
                                      alt={like.student.name}
                                      className="w-full h-full object-cover"
                                    />
                                  ) : (
                                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-600 to-purple-600 text-white font-bold text-xl">
                                      {like.student.name?.charAt(0).toUpperCase() || 'U'}
                                    </div>
                                  )}
                                </div>
                                <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-gradient-to-r from-pink-500 to-red-500 rounded-full flex items-center justify-center border-2 border-white shadow-sm">
                                  <Heart className="w-3 h-3 text-white fill-current" />
                                </div>
                              </div>

                              <div className="flex-1">
                                <h4 className="font-semibold text-slate-800">
                                  {like.student.name}
                                </h4>
                                <p className="text-sm text-slate-500">
                                  {like.student.university || 'Université non renseignée'}
                                </p>
                              </div>

                              <div className="flex gap-2">
                                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => navigate(`/profile/${like.student.user_id}`)}
                                    className="rounded-full border-slate-200 hover:bg-white"
                                  >
                                    <User className="w-4 h-4 mr-2" />
                                    Voir profil
                                  </Button>
                                </motion.div>

                                {like.match && like.match.exists ? (
                                  <div className="flex items-center gap-2 bg-white/60 backdrop-blur-sm border border-green-200 rounded-full px-4 py-2">
                                    <div className="flex -space-x-2">
                                      <div className="w-8 h-8 bg-slate-100 rounded-full overflow-hidden border-2 border-white flex-shrink-0">
                                        {like.student.photo ? (
                                          <img
                                            src={like.student.photo}
                                            alt={like.student.name}
                                            className="w-full h-full object-cover"
                                          />
                                        ) : (
                                          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-600 to-purple-600 text-white font-bold text-xs">
                                            {like.student.name?.charAt(0).toUpperCase() || 'E'}
                                          </div>
                                        )}
                                      </div>
                                      <div className="w-8 h-8 bg-slate-100 rounded-full overflow-hidden border-2 border-white flex-shrink-0">
                                        {like.match.landlord?.photo ? (
                                          <img
                                            src={like.match.landlord.photo}
                                            alt={like.match.landlord.name}
                                            className="w-full h-full object-cover"
                                          />
                                        ) : (
                                          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-600 to-purple-600 text-white font-bold text-xs">
                                            {like.match.landlord?.name?.charAt(0).toUpperCase() || 'B'}
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                    <span className="text-sm font-medium text-green-700">
                                      Matché 💚
                                    </span>
                                  </div>
                                ) : (
                                  <>
                                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                      <Button
                                        size="sm"
                                        onClick={() => handleRejectLike(like.student.user_id, like.listing_id)}
                                        className="rounded-full bg-red-600 hover:bg-red-700 text-white shadow-md"
                                      >
                                        <X className="w-4 h-4 mr-2" />
                                        Refuser
                                      </Button>
                                    </motion.div>

                                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                      <Button
                                        size="sm"
                                        onClick={() => handleMatch({ student: like.student, listing: data.listing })}
                                        className="rounded-full bg-green-600 hover:bg-green-700 text-white shadow-md"
                                      >
                                        <CheckCircle2 className="w-4 h-4 mr-2" />
                                        Matcher
                                      </Button>
                                    </motion.div>
                                  </>
                                )}
                              </div>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {view === 'messages' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <h2 className="text-4xl font-bold mb-2 flex items-center gap-3" style={{ fontFamily: 'Outfit' }}>
                <div className="p-3 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl">
                  <MessageCircle className="w-8 h-8 text-white" />
                </div>
                <span className="bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
                  Mes Messages
                </span>
              </h2>
              <p className="text-slate-500 mb-8">Discutez avec vos matchs</p>

              {allMatches.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center py-20 bg-white/50 backdrop-blur-sm rounded-3xl border border-slate-200/50"
                >
                  <MessageCircle className="w-24 h-24 text-slate-300 mx-auto mb-4" />
                  <p className="text-slate-500 text-lg">
                    Aucun match pour le moment
                  </p>
                  <p className="text-sm text-slate-400 mt-2">
                    Vos conversations apparaîtront ici une fois que vous aurez matché
                  </p>
                </motion.div>
              ) : selectedMatch ? (
                <>
                  {viewingProfile ? (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="bg-white rounded-3xl shadow-xl border border-slate-200/50 p-6"
                    >
                      <button
                        onClick={() => setViewingProfile(null)}
                        className="flex items-center gap-2 text-slate-500 hover:text-slate-800 transition-colors mb-4"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                        Retour à la conversation
                      </button>

                      <div className="flex flex-col items-center mb-6">
                        <div className="w-24 h-24 rounded-full overflow-hidden bg-slate-100 mb-4 border-4 border-blue-200">
                          {viewingProfile.photo ? (
                            <img src={viewingProfile.photo} alt={viewingProfile.name} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full bg-gradient-to-br from-blue-600 to-purple-600 text-white font-bold flex items-center justify-center text-3xl">
                              {viewingProfile.name?.charAt(0).toUpperCase()}
                            </div>
                          )}
                        </div>
                        <h2 className="text-2xl font-bold text-slate-800">{viewingProfile.name}</h2>
                        <p className="text-slate-500">{viewingProfile.email}</p>
                      </div>

                      <div className="space-y-3">
                        <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-4 border border-blue-200/50">
                          <h3 className="font-semibold text-slate-800 mb-2">Type de compte</h3>
                          <p className="text-slate-600">Étudiant</p>
                        </div>
                        {viewingProfile.telephone && (
                          <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-4 border border-blue-200/50">
                            <h3 className="font-semibold text-slate-800 mb-2">Téléphone</h3>
                            <p className="text-slate-600">{viewingProfile.telephone}</p>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  ) : viewingListing ? (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="bg-white rounded-3xl shadow-xl border border-slate-200/50 p-6 max-h-[600px] overflow-y-auto"
                    >
                      <button
                        onClick={() => setViewingListing(null)}
                        className="flex items-center gap-2 text-slate-500 hover:text-slate-800 transition-colors mb-4"
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
                          className="w-full h-64 object-cover rounded-2xl mb-4"
                        />
                      )}

                      <h2 className="text-2xl font-bold text-slate-800 mb-2">{viewingListing.title}</h2>
                      <p className="text-xl text-blue-600 font-bold mb-4">{viewingListing.price}€/mois</p>

                      <div className="space-y-3">
                        <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-4 border border-blue-200/50">
                          <h3 className="font-semibold text-slate-800 mb-2">Description</h3>
                          <p className="text-slate-600">{viewingListing.description}</p>
                        </div>

                        <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-4 border border-blue-200/50">
                          <h3 className="font-semibold text-slate-800 mb-2">Adresse</h3>
                          <p className="text-slate-600">{viewingListing.address}</p>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-4 border border-blue-200/50">
                            <h3 className="font-semibold text-slate-800 mb-1 text-sm">Surface</h3>
                            <p className="text-slate-600">{viewingListing.size}m²</p>
                          </div>
                          <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-4 border border-blue-200/50">
                            <h3 className="font-semibold text-slate-800 mb-1 text-sm">Meublé</h3>
                            <p className="text-slate-600">{viewingListing.furnished ? 'Oui' : 'Non'}</p>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ) : (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="bg-white rounded-3xl shadow-xl border border-slate-200/50 flex flex-col h-[600px] overflow-hidden"
                    >
                      {/* En-tête conversation - style moderne */}
                      <div className="flex items-center gap-3 p-4 border-b border-slate-200/50 bg-gradient-to-r from-blue-50 to-purple-50">
                        <button
                          onClick={() => setSelectedMatch(null)}
                          className="text-slate-500 hover:text-slate-800 transition-colors"
                        >
                          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                          </svg>
                        </button>

                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <button
                            onClick={() => setViewingProfile(selectedMatch.student)}
                            className="flex items-center gap-3 hover:opacity-80 transition-opacity bg-transparent"
                          >
                            <div className="relative">
                              <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0">
                                {selectedMatch.student?.photo ? (
                                  <img src={selectedMatch.student.photo} alt={selectedMatch.student.name} className="w-full h-full object-cover" />
                                ) : (
                                  <div className="w-full h-full bg-gradient-to-br from-blue-600 to-purple-600 text-white font-bold flex items-center justify-center text-sm">
                                    {selectedMatch.student?.name?.charAt(0).toUpperCase() || 'E'}
                                  </div>
                                )}
                              </div>
                              <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-white" />
                            </div>

                            <div className="text-left">
                              <h3 className="font-semibold text-slate-800 text-sm truncate">{selectedMatch.student?.name || 'Étudiant'}</h3>
                            </div>
                          </button>

                          <button
                            onClick={() => setViewingListing(selectedMatch.listing)}
                            className="text-xs text-slate-500 truncate hover:text-blue-600 transition-colors text-left flex-1 min-w-0 bg-transparent"
                          >
                            {selectedMatch.listing.title}
                          </button>
                        </div>

                        {/* Visit Button */}
                        <Button
                          onClick={() => setVisitModalOpen(true)}
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
                                isProposer={visit.proposed_by === user?.id || visit.proposed_by === user?.user_id}
                                onUpdate={() => {
                                  loadMatchVisits(selectedMatch.id);
                                  loadData();
                                }}
                              />
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Messages */}
                      <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gradient-to-br from-slate-50 to-white">
                        {messages.length === 0 ? (
                          <div className="text-center py-8 text-slate-500">
                            <MessageCircle className="w-16 h-16 text-slate-300 mx-auto mb-2" />
                            <p className="text-sm">Aucun message - Soyez le premier à écrire !</p>
                          </div>
                        ) : (
                          messages.map((msg, index) => {
                            const isCurrentUser = msg.sender_id === user?.id || msg.sender_id === user?.user_id;
                            return (
                              <motion.div
                                key={msg.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.05 }}
                                className={`flex gap-2 ${isCurrentUser ? 'flex-row-reverse' : 'flex-row'}`}
                              >
                                <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0">
                                  {isCurrentUser ? (
                                    user?.photo ? (
                                      <img src={user.photo} alt="Vous" className="w-full h-full object-cover" />
                                    ) : (
                                      <div className="w-full h-full bg-gradient-to-br from-blue-600 to-purple-600 text-white font-bold flex items-center justify-center text-xs">
                                        {user?.name?.charAt(0).toUpperCase() || 'M'}
                                      </div>
                                    )
                                  ) : (
                                    selectedMatch.student?.photo ? (
                                      <img src={selectedMatch.student.photo} alt={selectedMatch.student.name} className="w-full h-full object-cover" />
                                    ) : (
                                      <div className="w-full h-full bg-gradient-to-br from-blue-600 to-purple-600 text-white font-bold flex items-center justify-center text-xs">
                                        {selectedMatch.student?.name?.charAt(0).toUpperCase() || 'E'}
                                      </div>
                                    )
                                  )}
                                </div>

                                <div className={`flex flex-col ${isCurrentUser ? 'items-end' : 'items-start'} max-w-[70%]`}>
                                  <div
                                    className={`px-4 py-2 rounded-2xl ${isCurrentUser
                                        ? 'bg-[#fec629] text-[#212220] rounded-tr-sm shadow-md'
                                        : 'bg-white text-slate-800 border border-slate-200/50 rounded-tl-sm shadow-sm'
                                      }`}
                                  >
                                    <p className="text-sm leading-relaxed">{msg.content}</p>
                                  </div>
                                  <p className="text-xs text-slate-400 mt-1 px-2">
                                    {new Date(msg.created_at).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                                  </p>
                                </div>
                              </motion.div>
                            );
                          })
                        )}
                      </div>

                      {/* Formulaire d'envoi */}
                      <form onSubmit={handleSendMessage} className="p-4 border-t border-slate-200/50 bg-white flex gap-2">
                        <input
                          type="text"
                          value={messageText}
                          onChange={(e) => setMessageText(e.target.value)}
                          placeholder="Écrivez un message..."
                          className="flex-1 px-4 py-3 border border-slate-200 rounded-full focus:outline-none focus:ring-2 focus:ring-[#fec629] focus:border-transparent transition-all"
                        />
                        <motion.button
                          type="submit"
                          disabled={!messageText.trim()}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className="bg-[#fec629] hover:bg-[#e5b525] disabled:opacity-50 disabled:cursor-not-allowed text-[#212220] p-3 rounded-full transition-all shadow-lg"
                        >
                          <Send className="w-5 h-5" />
                        </motion.button>
                      </form>
                    </motion.div>
                  )}
                </>
              ) : (
                <div className="space-y-2">
                  {allMatches.map((match, index) => (
                    <motion.button
                      key={match.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      whileHover={{ scale: 1.02 }}
                      onClick={() => selectMatch(match)}
                      className="w-full p-4 bg-white hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 rounded-2xl text-left transition-all border border-slate-200/50 hover:border-blue-300 hover:shadow-lg"
                    >
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          <div className="w-12 h-12 rounded-full flex items-center justify-center overflow-hidden">
                            {match.student?.photo ? (
                              <img src={match.student.photo} alt={match.student.name} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full bg-gradient-to-br from-blue-600 to-purple-600 text-white font-bold flex items-center justify-center">
                                {match.student?.name?.charAt(0).toUpperCase() || 'E'}
                              </div>
                            )}
                          </div>
                          <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-green-500 rounded-full border-2 border-white shadow-sm" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold text-slate-800">{match.listing.title}</h4>
                          <p className="text-sm text-slate-500">Avec {match.student?.name || 'Étudiant'}</p>
                        </div>
                        <MessageCircle className="w-5 h-5 text-slate-400" />
                      </div>
                    </motion.button>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {view === 'profile' && landlordProfile && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="flex justify-center mb-6"
              >
                <div className="relative">
                  {user?.photo ? (
                    <img
                      src={user.photo}
                      alt={user.name}
                      className="w-32 h-32 rounded-full object-cover border-4 border-blue-200 shadow-2xl ring-4 ring-blue-500/20"
                    />
                  ) : (
                    <div className="w-32 h-32 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center font-bold text-6xl shadow-2xl text-white ring-4 ring-blue-500/20">
                      {user?.name?.charAt(0).toUpperCase() || 'U'}
                    </div>
                  )}
                  <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-green-500 rounded-full border-4 border-white shadow-lg flex items-center justify-center">
                    <CheckCircle2 className="w-5 h-5 text-white" />
                  </div>
                </div>
              </motion.div>

              {!isEditingProfile ? (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-5 border border-blue-200/50"
                    >
                      <h3 className="text-sm font-semibold text-slate-600 mb-2">Nom</h3>
                      <p className="text-lg text-slate-800 font-medium">{user?.name || 'Non renseigné'}</p>
                    </motion.div>
                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-5 border border-blue-200/50"
                    >
                      <h3 className="text-sm font-semibold text-slate-600 mb-2">Email</h3>
                      <p className="text-lg text-slate-800 font-medium">{user?.email || 'Non renseigné'}</p>
                    </motion.div>
                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-5 border border-blue-200/50"
                    >
                      <h3 className="text-sm font-semibold text-slate-600 mb-2">Téléphone</h3>
                      <p className="text-lg text-slate-800 font-medium">{landlordProfile.phone || 'Non renseigné'}</p>
                    </motion.div>
                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-5 border border-blue-200/50"
                    >
                      <h3 className="text-sm font-semibold text-slate-600 mb-2">Entreprise</h3>
                      <p className="text-lg text-slate-800 font-medium">{landlordProfile.company_name || 'Non renseigné'}</p>
                    </motion.div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex gap-3">
                      <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="flex-1">
                        <Button
                          onClick={() => {
                            setProfileForm({
                              ...landlordProfile,
                              name: user?.name || '',
                              email: user?.email || ''
                            });
                            setIsEditingProfile(true);
                          }}
                          className="w-full bg-[#fec629] hover:bg-[#e5b525] text-[#212220] font-semibold rounded-full shadow-lg"
                        >
                          <Pencil className="w-4 h-4 mr-2" />
                          Modifier mon profil
                        </Button>
                      </motion.div>
                      {user?.photo ? (
                        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
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
                            className="border-red-300 text-red-600 hover:bg-red-50 font-semibold rounded-full"
                          >
                            Supprimer la photo
                          </Button>
                        </motion.div>
                      ) : (
                        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
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
                            className="border-blue-300 text-blue-600 hover:bg-blue-50 font-semibold rounded-full"
                          >
                            Ajouter une photo
                          </Button>
                        </motion.div>
                      )}
                    </div>
                    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                      <Button
                        onClick={async () => {
                          if (window.confirm('⚠️ ATTENTION : Cette action est irréversible. Voulez-vous vraiment supprimer définitivement votre compte et toutes vos données ?')) {
                            try {
                              const userId = user?.id ?? user?.user_id;
                              await deleteUserAccount(userId);
                              toast.success('Compte supprimé');
                              document.cookie = 'session_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
                              navigate('/login');
                            } catch (error) {
                              console.error(error);
                              toast.error('Erreur lors de la suppression du compte');
                            }
                          }
                        }}
                        variant="outline"
                        className="w-full border-red-300 text-red-600 hover:bg-red-50 hover:border-red-400 font-semibold rounded-full"
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Supprimer mon compte
                      </Button>
                    </motion.div>
                  </div>
                </>
              ) : (
                <form onSubmit={async (e) => {
                  e.preventDefault();
                  try {
                    await updateLandlordProfile(profileForm);
                    setLandlordProfile(profileForm);

                    if (profileForm.name !== user.name || profileForm.email !== user.email) {
                      const userId = user?.id ?? user?.user_id;
                      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000'}/users/${userId}`, {
                        method: 'PATCH',
                        headers: {
                          'Content-Type': 'application/json',
                          'Authorization': `Bearer ${document.cookie.split('session_token=')[1]?.split(';')[0]}`
                        },
                        body: JSON.stringify({
                          name: profileForm.name,
                          email: profileForm.email
                        })
                      });
                      if (response.ok) {
                        const userResponse = await getUserById(userId);
                        setUser(userResponse.data);
                      }
                    }

                    setIsEditingProfile(false);
                    toast.success('Profil mis à jour');
                  } catch (error) {
                    toast.error('Erreur lors de la mise à jour');
                  }
                }} className="space-y-4">
                  <div>
                    <Label htmlFor="name" className="text-slate-700 font-medium">Nom complet</Label>
                    <Input
                      id="name"
                      type="text"
                      value={profileForm.name || ''}
                      onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                      className="mt-2 h-12 rounded-2xl border-slate-200 focus:border-[#fec629] focus:ring-[#fec629]"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="email" className="text-slate-700 font-medium">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={profileForm.email || ''}
                      onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                      className="mt-2 h-12 rounded-2xl border-slate-200 focus:border-[#fec629] focus:ring-[#fec629]"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone" className="text-slate-700 font-medium">Téléphone</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={profileForm.phone || ''}
                      onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                      className="mt-2 h-12 rounded-2xl border-slate-200 focus:border-[#fec629] focus:ring-[#fec629]"
                    />
                  </div>
                  <div>
                    <Label htmlFor="company_name" className="text-slate-700 font-medium">Nom de l'entreprise</Label>
                    <Input
                      id="company_name"
                      value={profileForm.company_name || ''}
                      onChange={(e) => setProfileForm({ ...profileForm, company_name: e.target.value })}
                      className="mt-2 h-12 rounded-2xl border-slate-200 focus:border-[#fec629] focus:ring-[#fec629]"
                    />
                  </div>
                  <div className="flex gap-3 pt-4">
                    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="flex-1">
                      <Button type="submit" className="w-full bg-[#fec629] hover:bg-[#e5b525] text-[#212220] font-semibold rounded-full shadow-lg">
                        <CheckCircle2 className="w-4 h-4 mr-2" />
                        Enregistrer
                      </Button>
                    </motion.div>
                    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                      <Button
                        type="button"
                        onClick={() => {
                          setIsEditingProfile(false);
                          setProfileForm({
                            ...landlordProfile,
                            name: user?.name || '',
                            email: user?.email || ''
                          });
                        }}
                        variant="outline"
                        className="rounded-full border-slate-200 hover:bg-slate-50"
                      >
                        Annuler
                      </Button>
                    </motion.div>
                  </div>
                </form>
              )}
            </motion.div>
          )}

          {view === 'visits' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="h-[calc(100vh-8rem)] overflow-y-auto"
            >
              <div className="bg-white rounded-3xl p-8 shadow-lg border border-slate-200/50">
                <h2 className="text-4xl font-bold mb-8 flex items-center gap-3" style={{ fontFamily: 'Outfit' }}>
                  <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-2xl">
                    <Calendar className="w-8 h-8 text-white" />
                  </div>
                  <span className="bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
                    Mon Planning
                  </span>
                </h2>
                <CalendarView user={user} onUpdate={loadData} />
              </div>
            </motion.div>
          )}

          {view === 'notifications' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="h-[calc(100vh-8rem)] overflow-y-auto"
            >
              <div className="bg-white rounded-3xl p-8 shadow-lg border border-slate-200/50">
                <h2 className="text-4xl font-bold mb-8 flex items-center gap-3" style={{ fontFamily: 'Outfit' }}>
                  <div className="p-3 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl">
                    <Bell className="w-8 h-8 text-white" />
                  </div>
                  <span className="bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
                    Notifications {unreadCount > 0 ? `(${unreadCount})` : ''}
                  </span>
                </h2>

                <NotificationsView
                  notifications={notifications}
                  unreadCount={unreadCount}
                  onMarkAsRead={handleMarkAsRead}
                  onMarkAllAsRead={handleMarkAllAsRead}
                />
              </div>
            </motion.div>
          )}

        </div>

        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent className="rounded-3xl bg-white shadow-2xl border-0 max-w-md">
            <div className="flex flex-col gap-6 py-6">
              <div className="flex flex-col gap-3">
                <AlertDialogHeader>
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-red-500 to-pink-500 flex items-center justify-center">
                      <Trash2 className="w-6 h-6 text-white" />
                    </div>
                    <AlertDialogTitle className="text-2xl font-bold text-slate-800">Supprimer l'annonce ?</AlertDialogTitle>
                  </div>
                  <AlertDialogDescription className="text-base text-slate-600 leading-relaxed mt-4">
                    Êtes-vous certain de vouloir supprimer l'annonce <span className="font-bold text-slate-800">"{listingToDelete?.title}"</span> ?
                    <span className="block mt-2 text-red-600 font-medium">Cette action est irréversible et supprimera aussi toutes les photos associées.</span>
                  </AlertDialogDescription>
                </AlertDialogHeader>
              </div>

              <div className="flex gap-3 justify-end pt-4 border-t border-slate-200">
                <AlertDialogCancel className="rounded-full px-6 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-medium transition-colors">
                  Annuler
                </AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleConfirmDelete}
                  className="rounded-full px-6 py-2.5 bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white font-medium transition-colors shadow-lg"
                >
                  <Trash2 className="w-4 h-4 mr-2 inline" />
                  Supprimer
                </AlertDialogAction>
              </div>
            </div>
          </AlertDialogContent>
        </AlertDialog>

        <MatchAnimation
          show={showMatchAnimation}
          onComplete={() => setShowMatchAnimation(false)}
        />

        <VisitModal
          open={visitModalOpen}
          onOpenChange={setVisitModalOpen}
          matchId={selectedMatch?.id}
          user={user}
          onVisitCreated={() => {
            setVisitModalOpen(false);
            loadMatchVisits(selectedMatch?.id);
            loadData();
          }}
        />
      </main>
    </div>
  );
}

function NotificationsView({ notifications, unreadCount, onMarkAsRead, onMarkAllAsRead }) {
  if (!notifications || notifications.length === 0) {
    return (
      <div className="text-center py-12">
        <Bell className="w-16 h-16 text-slate-300 mx-auto mb-4" />
        <p className="text-slate-600">Aucune notification pour le moment</p>
      </div>
    );
  }

  const getNotificationStyle = (type) => {
    switch (type) {
      case 'listing_liked':
        return {
          icon: Heart,
          gradient: 'from-pink-500 to-rose-500',
        };
      case 'visit_proposed':
        return {
          icon: Calendar,
          gradient: 'from-blue-500 to-indigo-500',
        };
      case 'visit_declined':
        return {
          icon: X,
          gradient: 'from-red-500 to-rose-500',
        };
      case 'visit_accepted':
        return {
          icon: Calendar,
          gradient: 'from-green-500 to-emerald-500',
        };
      default:
        return {
          icon: Bell,
          gradient: 'from-slate-500 to-slate-600',
        };
    }
  };

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
        {notifications.map((notification, index) => {
          const { icon: Icon, gradient } = getNotificationStyle(notification.type);
          return (
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
                  className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 bg-gradient-to-r ${gradient}`}
                  whileHover={{ scale: 1.1, rotate: 10 }}
                >
                  <Icon className="w-6 h-6 text-white" />
                </motion.div>

                <div className="flex-1">
                  <h3 className="font-bold text-lg mb-2">{notification.title}</h3>
                  <p className="text-gray-700 mb-3 whitespace-pre-line">{notification.message}</p>
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
          );
        })}
      </div>
    </div>
  );
}
