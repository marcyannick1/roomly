import { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { getCurrentUser, getLandlordListings, getInterestedStudents, createMatch } from '@/lib/api';
import { toast } from 'sonner';
import { Home, Plus, LogOut, User, Eye } from 'lucide-react';

export default function LandlordDashboard() {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState(location.state?.user || null);
  const [listings, setListings] = useState([]);
  const [view, setView] = useState('listings'); // 'listings' or 'students'
  const [selectedListing, setSelectedListing] = useState(null);
  const [interestedStudents, setInterestedStudents] = useState([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      let currentUser = user;
      if (!currentUser) {
        const response = await getCurrentUser();
        currentUser = response.data.user || response.data;
        setUser(currentUser);
      }

      const landlordId = currentUser?.id || location.state?.user?.id;
      if (landlordId) {
        const listingsResponse = await getLandlordListings(landlordId);
        setListings(listingsResponse.data);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const viewInterestedStudents = async (listing) => {
    try {
      setSelectedListing(listing);
      const response = await getInterestedStudents(listing.listing_id);
      setInterestedStudents(response.data);
      setView('students');
    } catch (error) {
      toast.error('Erreur de chargement');
    }
  };

  const handleMatch = async (student) => {
    try {
      await createMatch(user.user_id, student.user.user_id, selectedListing.listing_id);
      toast.success('Match créé !');
      loadData();
    } catch (error) {
      toast.error('Erreur');
    }
  };

  const handleLogout = () => {
    document.cookie = 'session_token=; path=/; max-age=0';
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/50 backdrop-blur-xl bg-background/80 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <img src="/logo.svg" alt="Roomly" className="w-10 h-10" />
            <span className="text-2xl font-bold text-foreground" style={{ fontFamily: 'Outfit' }}>Roomly</span>
          </div>
          
          <div className="flex gap-2">
            <Button
              variant={view === 'listings' ? 'default' : 'ghost'}
              onClick={() => setView('listings')}
              data-testid="view-listings-btn"
              className="rounded-full"
            >
              <Home className="w-4 h-4 mr-2" />
              Mes annonces
            </Button>
            <Button
              variant="ghost"
              onClick={() => user?.id && navigate(`/profile/${user.id}`)}
              data-testid="profile-btn"
              className="rounded-full"
            >
              <User className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              onClick={handleLogout}
              data-testid="logout-btn"
              className="rounded-full"
            >
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
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
                    key={listing.listing_id}
                    className="bg-card rounded-2xl overflow-hidden shadow-sm border border-border/50 hover:shadow-md transition-all"
                    data-testid={`listing-${listing.listing_id}`}
                  >
                    <div className="h-64 bg-muted relative">
                      {listing.photos?.[0] ? (
                        <img
                          src={listing.photos[0]}
                          alt={listing.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Home className="w-16 h-16 text-muted-foreground" />
                        </div>
                      )}

                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

                      {listing.liked_by?.length > 0 && (
                        <div className="absolute top-3 right-3 bg-primary text-primary-foreground px-3 py-1 rounded-full text-sm font-semibold shadow">
                          {listing.liked_by.length} like{listing.liked_by.length > 1 ? 's' : ''}
                        </div>
                      )}

                      <div className="absolute inset-x-0 bottom-0 p-4 text-white">
                        <h3 className="text-lg font-semibold" style={{ fontFamily: 'Outfit' }}>
                          {listing.title}
                        </h3>
                        <div className="flex items-center justify-between text-sm opacity-90">
                          <span>{listing.surface}m² • {listing.rooms} pièce(s)</span>
                          <span className="text-lg font-bold">{listing.rent}€</span>
                        </div>
                      </div>
                    </div>

                    <div className="p-4">
                      <div className="flex items-center justify-between text-sm text-muted-foreground mb-3">
                        <span className="capitalize">{listing.type}</span>
                        <span>{listing.furnished ? 'Meublé' : 'Non meublé'}</span>
                      </div>
                      
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => viewInterestedStudents(listing)}
                          data-testid={`view-students-${listing.listing_id}`}
                          className="flex-1 rounded-full"
                        >
                          <Eye className="w-4 h-4 mr-2" />
                          Voir les profils ({listing.liked_by?.length || 0})
                        </Button>
                        <Button
                          variant="default"
                          size="sm"
                          onClick={() => navigate(`/listing/${listing.listing_id}`)}
                          data-testid={`listing-details-${listing.listing_id}`}
                          className="flex-1 rounded-full"
                        >
                          Détails
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

            {interestedStudents.length === 0 ? (
              <div className="text-center py-20">
                <User className="w-24 h-24 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">
                  Aucun étudiant n'a encore liké cette annonce
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {interestedStudents.map((student) => (
                  <div
                    key={student.user.user_id}
                    className="bg-card rounded-2xl p-6 shadow-sm border border-border/50 hover:shadow-md transition-all"
                    data-testid={`student-${student.user.user_id}`}
                  >
                    <div className="flex gap-6">
                      <div className="w-24 h-24 bg-muted rounded-full overflow-hidden flex-shrink-0">
                        {student.user.picture ? (
                          <img
                            src={student.user.picture}
                            alt={student.user.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <User className="w-12 h-12 text-muted-foreground" />
                          </div>
                        )}
                      </div>

                      <div className="flex-1">
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <h3 className="text-xl font-bold text-foreground" style={{ fontFamily: 'Outfit' }}>
                              {student.profile.first_name} {student.profile.last_name}
                            </h3>
                            <p className="text-sm text-muted-foreground">
                              {student.profile.age} ans • {student.profile.university}
                            </p>
                          </div>
                          <div className="bg-primary text-primary-foreground px-4 py-2 rounded-full font-bold">
                            {student.profile.compatibility_score}%
                          </div>
                        </div>

                        <div className="mb-4 space-y-2 text-sm">
                          <p className="text-foreground">
                            <span className="font-semibold">Budget:</span> {student.profile.budget}€/mois
                          </p>
                          <p className="text-foreground">
                            <span className="font-semibold">Niveau:</span> {student.profile.education_level}
                          </p>
                        </div>

                        <Button
                          onClick={() => handleMatch(student)}
                          data-testid={`match-${student.user.user_id}`}
                          className="rounded-full"
                        >
                          Créer un match
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
