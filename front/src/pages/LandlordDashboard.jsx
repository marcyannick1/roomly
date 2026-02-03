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
import { getCurrentUser, getLandlordListings, getInterestedStudents, createMatch, deleteListing, getUserById, getLandlordProfile, updateLandlordProfile, uploadProfilePhoto, deleteProfilePhoto, deleteUserAccount, getLandlordReceivedLikes, getLandlordMatches, deleteMatch, rejectStudentLike, getMatchMessages, sendMessage } from '@/lib/api';
import { toast } from 'sonner';
import { Home, Plus, LogOut, User, Eye, Flame, Settings, Pencil, Trash2, Heart, CheckCircle2, XCircle, MessageCircle, X, Send } from 'lucide-react';
import { motion } from 'framer-motion';
import MatchAnimation from '@/components/MatchAnimation';

export default function LandlordDashboard() {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState(location.state?.user || null);
  const [listings, setListings] = useState([]);
  const [view, setView] = useState('listings'); // 'listings', 'students', 'interested' or 'profile'
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
  const [viewingProfile, setViewingProfile] = useState(null); // Pour afficher le profil de l'étudiant
  const [viewingListing, setViewingListing] = useState(null); // Pour afficher les détails du logement

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
      
      // Toujours recharger les données utilisateur pour avoir la photo à jour
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
        
        // Charger tous les likes reçus
        try {
          const likesResponse = await getLandlordReceivedLikes(landlordId);
          setAllReceivedLikes(likesResponse.data);
        } catch (error) {
          console.log('Erreur chargement des likes:', error);
        }
        
        // Charger tous les matches
        try {
          const matchesResponse = await getLandlordMatches(landlordId);
          setAllMatches(matchesResponse.data);
        } catch (error) {
          console.log('Erreur chargement des matches:', error);
        }
        
        // Charger le profil bailleur
        try {
          const profileResponse = await getLandlordProfile(landlordId);
          const profile = profileResponse.data;
          setLandlordProfile(profile);
          // Initialiser le formulaire avec les données utilisateur et profil
          setProfileForm({
            ...profile,
            name: currentUser.name,
            email: currentUser.email
          });
        } catch (error) {
          console.log('No landlord profile found');
        }
      }
    } catch (error) {
      console.error('Error loading data:', error);
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
      // Recharger après 3 secondes (après l'animation)
      setTimeout(() => {
        setShowMatchAnimation(false);
        loadData();
        viewInterestedStudents(listing); // Recharger la liste des intéressés
      }, 3000);
    } catch (error) {
      console.error('Erreur match:', error);
      // Gérer les différents types d'erreurs
      if (error.response?.status === 409) {
        // Le match existe déjà, afficher le message mais recharger les données pour afficher le badge
        toast.info('Ce match existe déjà');
        loadData(); // Recharger pour afficher le badge
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
      // Recharger la liste des intéressés pour le listing
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
      const landlordId = landlordProfile?.id; // L'ID du landlord dans la table landlords
      await rejectStudentLike(landlordId, userIdOfStudent, listingId);
      toast.success('Like refusé - Notification envoyée à l\'étudiant');
      loadData();
      // Recharger la liste des intéressés pour le listing
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

  const selectMatch = (match) => {
    setSelectedMatch(match);
    loadMessages(match);
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
    { id: 'create', icon: Plus, label: 'Créer une annonce', path: '/landlord/listing/new' },
    { id: 'profile', icon: User, label: 'Profil', path: null },
    { id: 'settings', icon: Settings, label: 'Paramètres', path: null },
  ];

  return (
    <div className="min-h-screen bg-white flex">
      {/* Sidebar */}
      <aside className="dashboard-sidebar w-72 bg-[#fec629] text-[#212220] flex flex-col shadow-2xl fixed left-0 top-0 h-screen z-50">
        {/* Logo & User Profile */}
        <div className="p-6 border-b border-black/10">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-[#212220] rounded-2xl flex items-center justify-center shadow-lg p-2">
              <img src="/logo.svg" alt="Roomly" className="w-full h-full" />
            </div>
            <span className="text-2xl font-bold text-[#212220]" style={{ fontFamily: 'Outfit' }}>Roomly</span>
          </div>

          {/* User Profile Card */}
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
                    } else if (item.id === 'interested') {
                      setView('interested');
                    } else if (item.id === 'matches') {
                      setView('matches');
                    } else if (item.id === 'messages') {
                      setView('messages');
                    } else if (item.id === 'profile') {
                      setView('profile');
                    } else if (item.id === 'settings') {
                      toast.error('Paramètres en cours de développement');
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

                  {isActive && (
                    <motion.div
                      layoutId="activeNavLandlord"
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
      <div className="max-w-7xl mx-auto px-6 py-8">
        {view === 'listings' && (
          <>
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-3xl font-bold text-foreground" style={{ fontFamily: 'Outfit' }}>
                Mes annonces
              </h2>
              <Button
                onClick={() => navigate('/landlord/listing/new')}
                data-testid="create-listing-btn"
                className="rounded-full"
              >
                <Plus className="w-4 h-4 mr-2" />
                Créer une annonce
              </Button>
            </div>

            {listings.length === 0 ? (
              <div className="text-center py-20" data-testid="no-listings">
                <Home className="w-24 h-24 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-2xl font-bold text-foreground mb-2" style={{ fontFamily: 'Outfit' }}>
                  Aucune annonce
                </h3>
                <p className="text-muted-foreground mb-6">
                  Créez votre première annonce pour commencer
                </p>
                <Button
                  onClick={() => navigate('/landlord/listing/new')}
                  data-testid="create-first-listing-btn"
                  className="rounded-full"
                >
                  Créer une annonce
                </Button>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {listings.map((listing) => (
                  <div
                    key={listing.id}
                    className="bg-card rounded-2xl overflow-hidden shadow-sm border border-border/50 hover:shadow-md transition-all"
                    data-testid={`listing-${listing.id}`}
                  >
                    <div className="h-64 bg-muted relative">
                      {listing.photos && listing.photos.length > 0 && listing.photos[0]?.url ? (
                        <img
                          src={listing.photos[0].url}
                          alt={listing.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Home className="w-16 h-16 text-muted-foreground" />
                        </div>
                      )}

                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

                      <div className="absolute top-3 right-3 flex gap-2">
                        {listing.liked_by?.length > 0 && (
                          <div className="bg-primary text-primary-foreground px-3 py-1 rounded-full text-sm font-semibold shadow">
                            {listing.liked_by.length} like{listing.liked_by.length > 1 ? 's' : ''}
                          </div>
                        )}
                        {allMatches.filter(match => match.listing_id === listing.id).length > 0 && (
                          <div className="bg-green-500 text-white px-3 py-1 rounded-full text-sm font-semibold shadow flex items-center gap-1">
                            <MessageCircle className="w-3 h-3" />
                            {allMatches.filter(match => match.listing_id === listing.id).length} match{allMatches.filter(match => match.listing_id === listing.id).length > 1 ? 's' : ''}
                          </div>
                        )}
                      </div>

                      <div className="absolute inset-x-0 bottom-0 p-4 text-white">
                        <h3 className="text-lg font-semibold" style={{ fontFamily: 'Outfit' }}>
                          {listing.title}
                        </h3>
                        <div className="flex items-center justify-between text-sm opacity-90">
                          <span>{listing.surface}m² • {listing.room_type}</span>
                          <span className="text-lg font-bold">{listing.price}€</span>
                        </div>
                      </div>
                    </div>

                    <div className="p-4">
                      <div className="flex items-center justify-between text-sm text-muted-foreground mb-3">
                        <span className="capitalize">{listing.room_type}</span>
                        <span>{listing.furnished ? 'Meublé' : 'Non meublé'}</span>
                      </div>
                      
                      <div className="flex gap-2 mb-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => viewInterestedStudents(listing)}
                          data-testid={`view-students-${listing.id}`}
                          className="flex-1 rounded-full"
                        >
                          <Eye className="w-4 h-4 mr-2" />
                          Intéressés ({allReceivedLikes.filter(like => like.listing_id === listing.id).length})
                        </Button>
                        <Button
                          variant="default"
                          size="sm"
                          onClick={() => navigate(`/listing/${listing.id}`)}
                          data-testid={`listing-details-${listing.id}`}
                          className="flex-1 rounded-full"
                        >
                          Détails
                        </Button>
                      </div>
                      
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => navigate(`/landlord/listing/edit/${listing.id}`)}
                          className="flex-1 rounded-full"
                        >
                          <Pencil className="w-4 h-4 mr-2" />
                          Modifier
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDeleteClick(listing)}
                          className="flex-1 rounded-full"
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Supprimer
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {view === 'students' && (
          <>
            <Button
              variant="ghost"
              onClick={() => setView('listings')}
              data-testid="back-to-listings"
              className="mb-6 rounded-full"
            >
              ← Retour aux annonces
            </Button>

            <h2 className="text-3xl font-bold text-foreground mb-6" style={{ fontFamily: 'Outfit' }}>
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
                <div className="text-center py-20">
                  <User className="w-24 h-24 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">
                    Aucun étudiant n'a encore liké cette annonce ou tous les likes ont été matchés
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredLikes.map((like) => (
                  <div
                    key={like.id}
                    className="bg-gray-50 rounded-xl p-4 hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex gap-4 items-center">
                      <div className="w-16 h-16 bg-muted rounded-full overflow-hidden flex-shrink-0">
                        {like.student.photo ? (
                          <img
                            src={like.student.photo}
                            alt={like.student.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-[#212220] text-[#fec629] font-bold text-xl">
                            {like.student.name?.charAt(0).toUpperCase() || 'U'}
                          </div>
                        )}
                      </div>

                      <div className="flex-1">
                        <h4 className="font-semibold text-foreground">
                          {like.student.name}
                        </h4>
                        <p className="text-sm text-muted-foreground">
                          {like.student.university || 'Université non renseignée'}
                        </p>
                      </div>

                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            navigate(`/profile/${like.student.user_id}`);
                          }}
                          className="rounded-full"
                        >
                          <User className="w-4 h-4 mr-2" />
                          Voir profil
                        </Button>
                        
                        <Button
                          size="sm"
                          onClick={() => {
                            handleRejectLike(like.student.user_id, like.listing_id);
                          }}
                          className="rounded-full bg-red-600 hover:bg-red-700 text-white"
                        >
                          <X className="w-4 h-4 mr-2" />
                          Refuser
                        </Button>
                        
                        <Button
                          size="sm"
                          onClick={() => {
                            handleMatch({
                              student: like.student,
                              listing: selectedListing
                            });
                          }}
                          className="rounded-full bg-green-600 hover:bg-green-700"
                        >
                          <CheckCircle2 className="w-4 h-4 mr-2" />
                          Matcher
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              );
            })()}
          </>
        )}

        {/* Vue Matches */}
        {view === 'matches' && (
          <>
            <h2 className="text-3xl font-bold text-foreground mb-6 flex items-center gap-3" style={{ fontFamily: 'Outfit' }}>
              <MessageCircle className="w-8 h-8 text-green-600" />
              Mes Matchs
            </h2>

            {allMatches.length === 0 ? (
              <div className="text-center py-20">
                <MessageCircle className="w-24 h-24 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground text-lg">
                  Aucun match pour le moment
                </p>
                <p className="text-sm text-muted-foreground mt-2">
                  Vos matchs apparaîtront ici
                </p>
              </div>
            ) : (
              <div className="space-y-8">
                {/* Grouper les matches par annonce */}
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
                ).map(([listingId, data]) => (
                  <div key={listingId} className="bg-white rounded-2xl shadow-md p-6 border border-black/5">
                    {/* En-tête de l'annonce */}
                    <div className="flex items-start gap-4 mb-6 pb-4 border-b border-black/10">
                      <div className="w-24 h-24 bg-muted rounded-xl overflow-hidden flex-shrink-0">
                        {data.listing.photos && data.listing.photos.length > 0 ? (
                          <img
                            src={data.listing.photos[0].url}
                            alt={data.listing.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-[#212220] text-[#fec629]">
                            <Home className="w-10 h-10" />
                          </div>
                        )}
                      </div>

                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-foreground mb-2">
                          {data.listing.title}
                        </h3>
                        <p className="text-muted-foreground text-sm mb-2">
                          {data.listing.city} • {data.listing.price}€/mois
                        </p>
                        <span className="inline-flex items-center gap-2 bg-green-50 text-green-700 px-3 py-1 rounded-full text-sm font-medium">
                          <MessageCircle className="w-4 h-4" />
                          {data.matches.length} match{data.matches.length > 1 ? 's' : ''}
                        </span>
                      </div>
                    </div>

                    {/* Liste des étudiants matchés */}
                    <div className="space-y-4">
                      {data.matches.map((match) => (
                        <div
                          key={match.id}
                          className="bg-gray-50 rounded-xl p-4 hover:bg-gray-100 transition-colors"
                        >
                          <div className="flex gap-4 items-center">
                            <div className="w-16 h-16 bg-muted rounded-full overflow-hidden flex-shrink-0">
                              {match.student?.photo ? (
                                <img
                                  src={match.student.photo}
                                  alt={match.student.name}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center bg-[#212220] text-[#fec629] font-bold text-xl">
                                  {match.student?.name?.charAt(0).toUpperCase() || 'E'}
                                </div>
                              )}
                            </div>

                            <div className="flex-1">
                              <h4 className="font-semibold text-foreground">
                                {match.student?.name || 'Étudiant'}
                              </h4>
                              <p className="text-sm text-muted-foreground">
                                {match.student?.university || 'Université non renseignée'}
                              </p>
                              <p className="text-xs text-muted-foreground mt-1">
                                Matché le {new Date(match.created_at).toLocaleDateString('fr-FR')}
                              </p>
                            </div>

                            <div className="flex items-center gap-2">
                              {/* Badge Match */}
                              <div className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-full px-4 py-2">
                                <CheckCircle2 className="w-4 h-4 text-green-600" />
                                <span className="text-sm font-medium text-green-700">
                                  Matché 💚
                                </span>
                              </div>
                              
                              {/* Bouton voir profil */}
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  navigate(`/profile/${match.student?.user_id}`);
                                }}
                                className="rounded-full"
                              >
                                <User className="w-4 h-4 mr-2" />
                                Voir profil
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* Vue globale des intéressés */}
        {view === 'interested' && (
          <>
            <h2 className="text-3xl font-bold text-foreground mb-6 flex items-center gap-3" style={{ fontFamily: 'Outfit' }}>
              <Heart className="w-8 h-8 text-red-500" />
              Étudiants intéressés
            </h2>

            {allReceivedLikes.length === 0 ? (
              <div className="text-center py-20">
                <Heart className="w-24 h-24 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground text-lg">
                  Aucun étudiant n'a encore liké vos annonces
                </p>
                <p className="text-sm text-muted-foreground mt-2">
                  Les étudiants intéressés apparaîtront ici
                </p>
              </div>
            ) : (
              <div className="space-y-8">
                {/* Grouper les likes par annonce */}
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
                ).map(([listingId, data]) => (
                  <div key={listingId} className="bg-card rounded-2xl p-6 shadow-sm border border-border/50">
                    {/* En-tête de l'annonce */}
                    <div className="flex gap-4 items-start mb-6 pb-4 border-b">
                      <div className="w-24 h-24 rounded-xl overflow-hidden bg-muted flex-shrink-0">
                        {data.listing.photos && data.listing.photos[0]?.url ? (
                          <img
                            src={data.listing.photos[0].url}
                            alt={data.listing.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Home className="w-8 h-8 text-muted-foreground" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-foreground mb-2" style={{ fontFamily: 'Outfit' }}>
                          {data.listing.title}
                        </h3>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span>{data.listing.city}</span>
                          <span>•</span>
                          <span className="font-bold text-primary">{data.listing.price}€/mois</span>
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            <Heart className="w-4 h-4 text-red-500 fill-red-500" />
                            {data.likes.length} intéressé{data.likes.length > 1 ? 's' : ''}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Liste des étudiants intéressés */}
                    <div className="space-y-4">
                      {data.likes.map((like) => (
                        <div
                          key={like.id}
                          className="bg-gray-50 rounded-xl p-4 hover:bg-gray-100 transition-colors"
                        >
                          <div className="flex gap-4 items-center">
                            <div className="w-16 h-16 bg-muted rounded-full overflow-hidden flex-shrink-0">
                              {like.student.photo ? (
                                <img
                                  src={like.student.photo}
                                  alt={like.student.name}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center bg-[#212220] text-[#fec629] font-bold text-xl">
                                  {like.student.name?.charAt(0).toUpperCase() || 'U'}
                                </div>
                              )}
                            </div>

                            <div className="flex-1">
                              <h4 className="font-semibold text-foreground">
                                {like.student.name}
                              </h4>
                              <p className="text-sm text-muted-foreground">
                                {like.student.university || 'Université non renseignée'}
                              </p>
                            </div>

                            <div className="flex gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  // Voir le profil de l'étudiant
                                  navigate(`/profile/${like.student.user_id}`);
                                }}
                                className="rounded-full"
                              >
                                <User className="w-4 h-4 mr-2" />
                                Voir profil
                              </Button>
                              
                              {like.match && like.match.exists ? (
                                // Badge "Matché" avec les deux photos
                                <div className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-full px-4 py-2">
                                  <div className="flex -space-x-2">
                                    {/* Photo étudiant */}
                                    <div className="w-8 h-8 bg-muted rounded-full overflow-hidden border-2 border-white flex-shrink-0">
                                      {like.student.photo ? (
                                        <img
                                          src={like.student.photo}
                                          alt={like.student.name}
                                          className="w-full h-full object-cover"
                                        />
                                      ) : (
                                        <div className="w-full h-full flex items-center justify-center bg-[#212220] text-[#fec629] font-bold text-xs">
                                          {like.student.name?.charAt(0).toUpperCase() || 'E'}
                                        </div>
                                      )}
                                    </div>
                                    {/* Photo bailleur */}
                                    <div className="w-8 h-8 bg-muted rounded-full overflow-hidden border-2 border-white flex-shrink-0">
                                      {like.match.landlord?.photo ? (
                                        <img
                                          src={like.match.landlord.photo}
                                          alt={like.match.landlord.name}
                                          className="w-full h-full object-cover"
                                        />
                                      ) : (
                                        <div className="w-full h-full flex items-center justify-center bg-[#212220] text-[#fec629] font-bold text-xs">
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
                                // Boutons "Refuser" et "Matcher"
                                <>
                                  <Button
                                    size="sm"
                                    onClick={() => {
                                      handleRejectLike(like.student.user_id, like.listing_id);
                                    }}
                                    className="rounded-full bg-red-600 hover:bg-red-700 text-white"
                                  >
                                    <X className="w-4 h-4 mr-2" />
                                    Refuser
                                  </Button>
                                  
                                  <Button
                                    size="sm"
                                    onClick={() => {
                                      // Créer le match
                                      handleMatch({
                                        student: like.student,
                                        listing: data.listing
                                      });
                                    }}
                                    className="rounded-full bg-green-600 hover:bg-green-700"
                                  >
                                    <CheckCircle2 className="w-4 h-4 mr-2" />
                                    Matcher
                                  </Button>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {view === 'messages' && (
          <>
            <h2 className="text-3xl font-bold text-foreground mb-6 flex items-center gap-3" style={{ fontFamily: 'Outfit' }}>
              <MessageCircle className="w-8 h-8 text-blue-600" />
              Mes Messages
            </h2>

            {allMatches.length === 0 ? (
              <div className="text-center py-20">
                <MessageCircle className="w-24 h-24 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground text-lg">
                  Aucun match pour le moment
                </p>
                <p className="text-sm text-muted-foreground mt-2">
                  Vos conversations apparaîtront ici une fois que vous aurez matché
                </p>
              </div>
            ) : selectedMatch ? (
              <>
                {/* Vue profil de l'étudiant */}
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
                        <p className="text-gray-600">Étudiant</p>
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
                  <div className="bg-white rounded-2xl shadow-lg border border-gray-200 flex flex-col h-[600px]">
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
                          onClick={() => setViewingProfile(selectedMatch.student)}
                          className="flex items-center gap-3 hover:opacity-80 transition-opacity bg-transparent"
                        >
                          <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0">
                            {selectedMatch.student?.photo ? (
                              <img src={selectedMatch.student.photo} alt={selectedMatch.student.name} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full bg-[#212220] text-[#fec629] font-bold flex items-center justify-center text-sm">
                                {selectedMatch.student?.name?.charAt(0).toUpperCase() || 'E'}
                              </div>
                            )}
                          </div>
                          
                          <div className="text-left">
                            <h3 className="font-semibold text-[#212220] text-sm truncate">{selectedMatch.student?.name || 'Étudiant'}</h3>
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
                              selectedMatch.student?.photo ? (
                                <img src={selectedMatch.student.photo} alt={selectedMatch.student.name} className="w-full h-full object-cover" />
                              ) : (
                                <div className="w-full h-full bg-[#212220] text-[#fec629] font-bold flex items-center justify-center text-xs">
                                  {selectedMatch.student?.name?.charAt(0).toUpperCase() || 'E'}
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
                {allMatches.map((match) => (
                  <button
                    key={match.id}
                    onClick={() => selectMatch(match)}
                    className="w-full p-4 bg-gray-50 hover:bg-[#fec629]/10 rounded-xl text-left transition-colors border border-gray-200 hover:border-[#fec629]"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full flex items-center justify-center overflow-hidden">
                        {match.student?.photo ? (
                          <img src={match.student.photo} alt={match.student.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full bg-[#212220] text-[#fec629] font-bold flex items-center justify-center">
                            {match.student?.name?.charAt(0).toUpperCase() || 'E'}
                          </div>
                        )}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-[#212220]">{match.listing.title}</h4>
                        <p className="text-sm text-gray-600">Avec {match.student?.name || 'Étudiant'}</p>
                      </div>
                      <MessageCircle className="w-5 h-5 text-gray-400" />
                    </div>
                  </button>
                ))}
              </div>
            )}
          </>
        )}

        {view === 'profile' && landlordProfile && (
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
                    <h3 className="text-sm font-semibold text-gray-600 mb-2">Nom</h3>
                    <p className="text-lg">{user?.name || 'Non renseigné'}</p>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-4">
                    <h3 className="text-sm font-semibold text-gray-600 mb-2">Email</h3>
                    <p className="text-lg">{user?.email || 'Non renseigné'}</p>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-4">
                    <h3 className="text-sm font-semibold text-gray-600 mb-2">Téléphone</h3>
                    <p className="text-lg">{landlordProfile.phone || 'Non renseigné'}</p>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-4">
                    <h3 className="text-sm font-semibold text-gray-600 mb-2">Entreprise</h3>
                    <p className="text-lg">{landlordProfile.company_name || 'Non renseigné'}</p>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex gap-3">
                    <Button
                      onClick={() => {
                        // Initialiser le formulaire avec les données actuelles
                        setProfileForm({
                          ...landlordProfile,
                          name: user?.name || '',
                          email: user?.email || ''
                        });
                        setIsEditingProfile(true);
                      }}
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
                  // Mettre à jour le profil landlord
                  await updateLandlordProfile(profileForm);
                  setLandlordProfile(profileForm);
                  
                  // Mettre à jour les infos utilisateur (nom, email)
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
              }} className="space-y-6">
                <div>
                  <Label htmlFor="name">Nom complet</Label>
                  <Input
                    id="name"
                    type="text"
                    value={profileForm.name || ''}
                    onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                    className="mt-2 h-12 rounded-xl"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={profileForm.email || ''}
                    onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                    className="mt-2 h-12 rounded-xl"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="phone">Téléphone</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={profileForm.phone || ''}
                    onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                    className="mt-2 h-12 rounded-xl"
                  />
                </div>
                <div>
                  <Label htmlFor="company_name">Nom de l'entreprise</Label>
                  <Input
                    id="company_name"
                    value={profileForm.company_name || ''}
                    onChange={(e) => setProfileForm({ ...profileForm, company_name: e.target.value })}
                    className="mt-2 h-12 rounded-xl"
                  />
                </div>
                <div className="flex gap-3">
                  <Button type="submit" className="flex-1 bg-[#fec629] hover:bg-[#e5b525] text-[#212220] font-semibold">
                    Enregistrer
                  </Button>
                  <Button
                    type="button"
                    onClick={() => {
                      setIsEditingProfile(false);
                      // Réinitialiser le formulaire avec les données actuelles
                      setProfileForm({
                        ...landlordProfile,
                        name: user?.name || '',
                        email: user?.email || ''
                      });
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
      </div>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="rounded-3xl bg-white shadow-2xl border-0 max-w-md">
          <div className="flex flex-col gap-6 py-6">
            <div className="flex flex-col gap-3">
              <AlertDialogHeader>
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-12 h-12 rounded-2xl bg-red-100 flex items-center justify-center">
                    <Trash2 className="w-6 h-6 text-red-600" />
                  </div>
                  <AlertDialogTitle className="text-2xl font-bold text-[#212220]">Supprimer l'annonce ?</AlertDialogTitle>
                </div>
                <AlertDialogDescription className="text-base text-[#212220]/70 leading-relaxed mt-4">
                  Êtes-vous certain de vouloir supprimer l'annonce <span className="font-bold text-[#212220]">"{listingToDelete?.title}"</span> ? 
                  <span className="block mt-2 text-red-600 font-medium">Cette action est irréversible et supprimera aussi toutes les photos associées.</span>
                </AlertDialogDescription>
              </AlertDialogHeader>
            </div>

            <div className="flex gap-3 justify-end pt-4 border-t border-gray-200">
              <AlertDialogCancel className="rounded-full px-6 py-2.5 bg-gray-100 hover:bg-gray-200 text-[#212220] font-medium transition-colors">
                Annuler
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={handleConfirmDelete}
                className="rounded-full px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white font-medium transition-colors shadow-md"
              >
                <Trash2 className="w-4 h-4 mr-2 inline" />
                Supprimer
              </AlertDialogAction>
            </div>
          </div>
        </AlertDialogContent>
      </AlertDialog>

      {/* Animation de match */}
      <MatchAnimation
        show={showMatchAnimation}
        onComplete={() => setShowMatchAnimation(false)}
      />
      </main>
    </div>
  );
}
