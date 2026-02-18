import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../App";
import { Button } from "../components/ui/button";
import { 
  Home, 
  MessageCircle, 
  Calendar, 
  MapPin, 
  User,
  Heart,
  Star,
  ChevronLeft,
  ArrowLeft,
  Loader2
} from "lucide-react";

const MatchesPage = () => {
  const navigate = useNavigate();
  const { user, token, API } = useAuth();
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMatches();
  }, []);

  const fetchMatches = async () => {
    try {
      const response = await axios.get(`${API}/matches?token=${token}`);
      setMatches(response.data);
    } catch (error) {
      console.error("Error fetching matches:", error);
    } finally {
      setLoading(false);
    }
  };

  const isStudent = user?.role === 'student';

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Mes Matchs</h1>
        <p className="text-slate-600">{matches.length} conversation{matches.length > 1 ? 's' : ''}</p>
      </div>
        <div className="max-w-2xl mx-auto">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 text-primary animate-spin" />
            </div>
          ) : matches.length === 0 ? (
            <div className="text-center py-20">
              <div className="w-20 h-20 bg-primary-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <Heart className="w-10 h-10 text-primary" />
              </div>
              <h2 className="text-xl font-bold text-slate-900 mb-2">Pas encore de matchs</h2>
              <p className="text-slate-600 mb-6">
                {isStudent 
                  ? "Continuez à swiper pour trouver votre logement idéal!"
                  : "Les étudiants qui likent vos annonces apparaîtront ici"
                }
              </p>
              {isStudent && (
                <Button
                  onClick={() => navigate('/swipe')}
                  className="bg-primary hover:bg-primary-hover text-white rounded-full"
                  data-testid="swipe-cta"
                >
                  Continuer à swiper
                </Button>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              {matches.map(match => (
                <MatchCard 
                  key={match.id} 
                  match={match}
                  isStudent={isStudent}
                  onClick={() => navigate(`/chat/${match.id}`)}
                />
              ))}
            </div>
          )}
        </div>

      {/* Bottom Navigation (Student only) */}
      {isStudent && (
        <nav className="fixed bottom-0 left-0 right-0 glass border-t border-slate-100 z-40">
          <div className="max-w-md mx-auto px-6 py-3">
            <div className="flex items-center justify-around">
              <NavButton icon={Home} label="Swipe" onClick={() => navigate('/swipe')} />
              <NavButton icon={MessageCircle} label="Matchs" active />
              <NavButton icon={MapPin} label="Carte" onClick={() => navigate('/map')} />
              <NavButton icon={Calendar} label="Visites" onClick={() => navigate('/calendar')} />
            </div>
          </div>
        </nav>
      )}
    </div>
  );
};

const MatchCard = ({ match, isStudent, onClick }) => {
  const otherUser = isStudent ? match.landlord : match.student;
  const property = match.listing || match.property;
  const photos = property?.photos || property?.images || [];
  const firstPhoto = photos[0]?.url || photos[0] || "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=200";
  
  // Gérer les noms
  const otherUserName = otherUser?.first_name && otherUser?.last_name 
    ? `${otherUser.first_name} ${otherUser.last_name}`
    : otherUser?.name || "Utilisateur";
  const otherUserInitial = otherUser?.first_name?.[0] || otherUser?.name?.[0] || "U";

  return (
    <div
      onClick={onClick}
      className="bg-white rounded-2xl border border-slate-100 p-4 flex gap-4 cursor-pointer hover:shadow-hover transition-all"
      data-testid={`match-card-${match.id}`}
    >
      {/* Property Image */}
      <div className="relative">
        <img
          src={firstPhoto}
          alt={property?.title}
          className="w-20 h-20 rounded-xl object-cover"
        />
        {match.is_superlike && (
          <div className="absolute -top-1 -right-1 w-6 h-6 bg-primary rounded-full flex items-center justify-center">
            <Star className="w-3 h-3 text-white" fill="white" />
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between mb-1">
          <h3 className="font-semibold text-slate-900 truncate">{property?.title}</h3>
          <span className="text-xs text-slate-400 whitespace-nowrap ml-2">
            {new Date(match.created_at).toLocaleDateString('fr-FR')}
          </span>
        </div>
        
        <div className="flex items-center gap-1 text-sm text-slate-500 mb-2">
          <MapPin className="w-3 h-3" />
          <span>{property?.city}</span>
          <span className="mx-1">•</span>
          <span>{property?.price}€/mois</span>
        </div>

        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-primary-100 rounded-full flex items-center justify-center">
            <span className="text-xs font-semibold text-primary">
              {otherUserInitial}
            </span>
          </div>
          <span className="text-sm text-slate-600">
            {otherUserName}
          </span>
          {match.is_superlike && (
            <span className="text-xs bg-primary-50 text-primary px-2 py-0.5 rounded-full">
              Super Like
            </span>
          )}
        </div>
      </div>

      <MessageCircle className="w-5 h-5 text-primary mt-1" />
    </div>
  );
};

const NavButton = ({ icon: Icon, label, active, onClick }) => (
  <button
    onClick={onClick}
    className={`flex flex-col items-center gap-1 px-4 py-1 rounded-xl transition-colors ${
      active ? 'text-primary' : 'text-slate-400 hover:text-slate-600'
    }`}
    data-testid={`nav-${label.toLowerCase()}`}
  >
    <Icon className="w-5 h-5" />
    <span className="text-xs font-medium">{label}</span>
  </button>
);

export default MatchesPage;
