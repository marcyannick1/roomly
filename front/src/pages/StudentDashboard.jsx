import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { getCurrentUser, getStudentFeed, likeListing, getStudentMatches } from '@/lib/api';
import { toast } from 'sonner';
import { Home, Heart, X, LogOut, User, MessageCircle } from 'lucide-react';
import { motion, useMotionValue, useTransform } from 'framer-motion';

export default function StudentDashboard() {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState(location.state?.user || null);
  const [listings, setListings] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [matches, setMatches] = useState([]);
  const [view, setView] = useState('feed'); // 'feed' or 'matches'

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      if (!user) {
        const response = await getCurrentUser();
        setUser(response.data);
      }
      
      const feedResponse = await getStudentFeed(user?.user_id || location.state?.user?.user_id);
      setListings(feedResponse.data);

      const matchesResponse = await getStudentMatches(user?.user_id || location.state?.user?.user_id);
      setMatches(matchesResponse.data);
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const handleLike = async () => {
    const listing = listings[currentIndex];
    try {
      await likeListing(user.user_id, listing.listing_id);
      toast.success('Logement liké !');
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
              variant={view === 'feed' ? 'default' : 'ghost'}
              onClick={() => setView('feed')}
              data-testid="view-feed-btn"
              className="rounded-full"
            >
              <Home className="w-4 h-4 mr-2" />
              Découvrir
            </Button>
            <Button
              variant={view === 'matches' ? 'default' : 'ghost'}
              onClick={() => setView('matches')}
              data-testid="view-matches-btn"
              className="rounded-full"
            >
              <MessageCircle className="w-4 h-4 mr-2" />
              Matchs ({matches.length})
            </Button>
            <Button
              variant="ghost"
              onClick={() => navigate('/student/profile')}
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
      <div className="max-w-lg mx-auto px-4 py-8">
        {view === 'feed' && (
          <>
            {currentListing ? (
              <div data-testid="swipe-card" className="relative">
                {/* Card */}
                <div className="bg-card rounded-3xl overflow-hidden shadow-2xl border border-border/50">
                  {/* Image */}
                  <div className="aspect-[3/4] bg-muted relative">
                    {currentListing.photos?.[0] ? (
                      <img
                        src={currentListing.photos[0]}
                        alt={currentListing.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Home className="w-24 h-24 text-muted-foreground" />
                      </div>
                    )}
                    
                    {/* Compatibility Score Badge */}
                    <div className="absolute top-4 right-4 bg-primary text-primary-foreground px-4 py-2 rounded-full font-bold text-lg">
                      {currentListing.compatibility_score}% compatible
                    </div>
                  </div>

                  {/* Info */}
                  <div className="p-6">
                    <h2 className="text-2xl font-bold text-foreground mb-2" style={{ fontFamily: 'Outfit' }}>
                      {currentListing.title}
                    </h2>
                    <p className="text-lg text-primary font-semibold mb-2">
                      {currentListing.rent}€ + {currentListing.charges}€ charges
                    </p>
                    <p className="text-muted-foreground mb-4">
                      {currentListing.address?.city} • {currentListing.surface}m² • {currentListing.rooms} pièce(s)
                    </p>
                    <p className="text-foreground line-clamp-3">
                      {currentListing.description}
                    </p>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-center gap-4 mt-8">
                  <Button
                    size="lg"
                    variant="outline"
                    onClick={handlePass}
                    data-testid="pass-btn"
                    className="rounded-full w-16 h-16 p-0 border-2"
                  >
                    <X className="w-8 h-8 text-destructive" />
                  </Button>
                  <Button
                    size="lg"
                    onClick={handleLike}
                    data-testid="like-btn"
                    className="rounded-full w-20 h-20 p-0 shadow-lg"
                  >
                    <Heart className="w-10 h-10" fill="currentColor" />
                  </Button>
                </div>
              </div>
            ) : (
              <div className="text-center py-20" data-testid="no-listings">
                <Home className="w-24 h-24 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-2xl font-bold text-foreground mb-2" style={{ fontFamily: 'Outfit' }}>
                  Plus de logements pour aujourd'hui
                </h3>
                <p className="text-muted-foreground">
                  Revenez demain pour découvrir de nouvelles annonces !
                </p>
              </div>
            )}
          </>
        )}

        {view === 'matches' && (
          <div className="space-y-4" data-testid="matches-list">
            <h2 className="text-3xl font-bold text-foreground mb-6" style={{ fontFamily: 'Outfit' }}>
              Vos matchs
            </h2>
            
            {matches.length === 0 ? (
              <div className="text-center py-20">
                <MessageCircle className="w-24 h-24 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-2xl font-bold text-foreground mb-2" style={{ fontFamily: 'Outfit' }}>
                  Aucun match pour le moment
                </h3>
                <p className="text-muted-foreground">
                  Continuez à liker des logements pour obtenir des matchs !
                </p>
              </div>
            ) : (
              matches.map((match) => (
                <div
                  key={match.match_id}
                  className="bg-card rounded-2xl p-6 shadow-sm border border-border/50 hover:shadow-md transition-all cursor-pointer"
                  onClick={() => navigate(`/messages/${match.match_id}`)}
                  data-testid={`match-${match.match_id}`}
                >
                  <div className="flex gap-4">
                    <div className="w-24 h-24 bg-muted rounded-xl overflow-hidden flex-shrink-0">
                      {match.listing?.photos?.[0] ? (
                        <img
                          src={match.listing.photos[0]}
                          alt={match.listing.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Home className="w-8 h-8 text-muted-foreground" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-foreground mb-1" style={{ fontFamily: 'Outfit' }}>
                        {match.listing?.title}
                      </h3>
                      <p className="text-sm text-muted-foreground mb-2">
                        {match.listing?.rent}€/mois
                      </p>
                      <Button variant="outline" size="sm" className="rounded-full">
                        Envoyer un message
                      </Button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
