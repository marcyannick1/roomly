import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../App";
import { toast } from "sonner";
import { Button } from "../components/ui/button";
import { 
  Home, 
  Plus, 
  Eye, 
  Heart, 
  MessageCircle, 
  Calendar, 
  MapPin, 
  Euro,
  Users,
  TrendingUp,
  Settings,
  LogOut,
  Bell,
  Building2,
  MoreVertical,
  Edit,
  Trash2,
  ToggleLeft,
  ToggleRight,
  ChevronRight,
  Loader2
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../components/ui/dropdown-menu";

const LandlordDashboard = () => {
  const navigate = useNavigate();
  const { user, token, logout, API } = useAuth();
  const [stats, setStats] = useState(null);
  const [properties, setProperties] = useState([]);
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState(0);

  useEffect(() => {
    if (!token || token === 'undefined') {
      setLoading(false);
      navigate('/login');
      return;
    }
    fetchData();
  }, [token, navigate]);

  const fetchData = async () => {
    if (!token || token === 'undefined') {
      setLoading(false);
      return;
    }
    try {
      // Récupérer les données essentielles
      const propertiesRes = await axios.get(`${API}/properties/landlord/my?token=${token}`);
      // Trier par ID décroissant (plus récentes en premier)
      const sortedProperties = propertiesRes.data.sort((a, b) => b.id - a.id);
      setProperties(sortedProperties);
      
      // Récupérer matches et notifs (peuvent échouer sans bloquer)
      try {
        const matchesRes = await axios.get(`${API}/matches?token=${token}`);
        setMatches(matchesRes.data);
      } catch (e) {
        console.warn("Matches endpoint failed:", e);
        setMatches([]);
      }
      
      try {
        const notifsRes = await axios.get(`${API}/notifications/unread-count?token=${token}`);
        setNotifications(notifsRes.data.count);
      } catch (e) {
        console.warn("Notifications endpoint failed:", e);
        setNotifications(0);
      }
      
      // Calculer les stats à partir des propriétés
      const activeCount = propertiesRes.data.filter(p => p.is_active !== false).length;
      
      // Calculer le total des likes à partir des propriétés
      const totalLikes = propertiesRes.data.reduce((sum, property) => {
        return sum + (property.likes_count || 0);
      }, 0);
      
      // Calculer le total des matches
      const totalMatches = matches.length;
      
      setStats({
        total_properties: propertiesRes.data.length,
        active_properties: activeCount,
        total_views: 0,
        total_likes: totalLikes,
        total_matches: totalMatches
      });
      
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Erreur lors du chargement des données");
    } finally {
      setLoading(false);
    }
  };

  const handleToggleProperty = async (propertyId, isActive) => {
    try {
      await axios.put(`${API}/properties/${propertyId}?token=${token}`, {
        is_active: !isActive
      });
      setProperties(properties.map(p => 
        p.id === propertyId ? { ...p, is_active: !isActive } : p
      ));
      toast.success(isActive ? "Annonce désactivée" : "Annonce activée");
    } catch (error) {
      toast.error("Erreur lors de la mise à jour");
    }
  };

  const handleDeleteProperty = async (propertyId) => {
    if (!window.confirm("Êtes-vous sûr de vouloir supprimer cette annonce?")) return;
    
    try {
      await axios.delete(`${API}/properties/${propertyId}?token=${token}`);
      setProperties(properties.filter(p => p.id !== propertyId));
      toast.success("Annonce supprimée");
    } catch (error) {
      toast.error("Erreur lors de la suppression");
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Bienvenue, {user?.first_name}!</h1>
            <p className="text-slate-600">Gérez vos annonces et vos locataires</p>
          </div>
          
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="icon"
              className="relative"
              onClick={() => navigate('/matches')}
              data-testid="notifications-btn"
            >
              <Bell className="w-5 h-5" />
              {notifications > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                  {notifications}
                </span>
              )}
            </Button>
            <Button
              onClick={() => navigate('/add-property')}
              className="bg-primary hover:bg-primary-hover text-white rounded-full"
              data-testid="add-property-btn"
            >
              <Plus className="w-4 h-4 mr-2" />
              Ajouter une annonce
            </Button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-4 gap-6 mb-8">
          <StatCard
            icon={Building2}
            label="Annonces actives"
            value={stats?.active_properties || 0}
            total={stats?.total_properties || 0}
            color="primary"
          />
          <StatCard
            icon={Eye}
            label="Vues totales"
            value={stats?.total_views || 0}
            change="+12%"
            color="blue"
          />
          <StatCard
            icon={Heart}
            label="Likes reçus"
            value={stats?.total_likes || 0}
            change="+8%"
            color="pink"
          />
          <StatCard
            icon={Users}
            label="Matchs"
            value={stats?.total_matches || 0}
            change="+15%"
            color="green"
          />
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-3 gap-6">
          {/* Properties List */}
          <div className="col-span-2 bg-white rounded-2xl border border-slate-100 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-slate-900">Mes annonces ({properties.length})</h2>
              <Button variant="ghost" size="sm" onClick={() => navigate('/add-property')}>
                Ajouter <Plus className="w-4 h-4 ml-1" />
              </Button>
            </div>
            
            {properties.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Building2 className="w-8 h-8 text-slate-400" />
                </div>
                <h3 className="font-medium text-slate-900 mb-2">Aucune annonce</h3>
                <p className="text-slate-500 text-sm mb-4">Publiez votre première annonce pour commencer</p>
                <Button onClick={() => navigate('/add-property')} className="bg-primary text-white rounded-full">
                  <Plus className="w-4 h-4 mr-2" />
                  Créer une annonce
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {properties.map(property => (
                  <PropertyRow 
                    key={property.id} 
                    property={property}
                    onEdit={() => navigate(`/edit-property/${property.id}`)}
                    onToggle={() => handleToggleProperty(property.id, property.is_active)}
                    onDelete={() => handleDeleteProperty(property.id)}
                    onView={() => navigate(`/property/${property.id}`)}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Recent Matches */}
          <div className="bg-white rounded-2xl border border-slate-100 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-slate-900">Derniers matchs</h2>
              <Button variant="ghost" size="sm" onClick={() => navigate('/matches')}>
                Voir tout
              </Button>
            </div>
            
            {matches.length === 0 ? (
              <div className="text-center py-8">
                <Heart className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <p className="text-slate-500 text-sm">Pas encore de matchs</p>
              </div>
            ) : (
              <div className="space-y-4">
                {matches.slice(0, 5).map(match => (
                  <MatchRow 
                    key={match.id} 
                    match={match}
                    onClick={() => navigate(`/chat/${match.id}`)}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
    </div>
  );
};

// Sidebar Navigation Item
const NavItem = ({ icon: Icon, label, active, badge, onClick }) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl mb-1 transition-colors ${
      active 
        ? 'bg-primary text-white' 
        : 'text-slate-600 hover:bg-slate-50'
    }`}
    data-testid={`nav-${label.toLowerCase().replace(/\s/g, '-')}`}
  >
    <Icon className="w-5 h-5" />
    <span className="font-medium flex-1 text-left">{label}</span>
    {badge > 0 && (
      <span className={`text-xs px-2 py-0.5 rounded-full ${
        active ? 'bg-white/20 text-white' : 'bg-primary-100 text-primary'
      }`}>
        {badge}
      </span>
    )}
  </button>
);

// Stat Card Component
const StatCard = ({ icon: Icon, label, value, total, change, color }) => {
  const colorClasses = {
    primary: 'bg-primary-50 text-primary',
    blue: 'bg-blue-50 text-blue-500',
    pink: 'bg-pink-50 text-pink-500',
    green: 'bg-green-50 text-green-500',
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-5 card-hover" data-testid={`stat-${label.toLowerCase().replace(/\s/g, '-')}`}>
      <div className={`w-10 h-10 ${colorClasses[color]} rounded-xl flex items-center justify-center mb-3`}>
        <Icon className="w-5 h-5" />
      </div>
      <div className="text-2xl font-bold text-slate-900 mb-1">
        {value}
        {total && <span className="text-sm font-normal text-slate-400">/{total}</span>}
      </div>
      <div className="flex items-center justify-between">
        <span className="text-sm text-slate-500">{label}</span>
        {change && (
          <span className="text-xs text-green-500 font-medium flex items-center gap-1">
            <TrendingUp className="w-3 h-3" />
            {change}
          </span>
        )}
      </div>
    </div>
  );
};

// Property Row Component
const PropertyRow = ({ property, onEdit, onToggle, onDelete, onView }) => (
  <div 
    className="flex items-center gap-4 p-3 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer"
    onClick={onView}
    data-testid={`property-row-${property.id}`}
  >
    <img
      src={property.images?.[0] || "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=200"}
      alt={property.title}
      className="w-16 h-16 rounded-xl object-cover"
    />
    <div className="flex-1 min-w-0">
      <h3 className="font-medium text-slate-900 truncate">{property.title}</h3>
      <div className="flex items-center gap-3 text-sm text-slate-500">
        <span className="flex items-center gap-1">
          <MapPin className="w-3 h-3" />
          {property.city}
        </span>
        <span className="flex items-center gap-1">
          <Euro className="w-3 h-3" />
          {property.price}/mois
        </span>
      </div>
    </div>
    <div className="flex items-center gap-3">
      <div className="text-right">
        <div className="flex items-center gap-2 text-sm">
          <Eye className="w-4 h-4 text-slate-400" />
          <span className="text-slate-600">{property.views_count || 0}</span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <Heart className="w-4 h-4 text-slate-400" />
          <span className="text-slate-600">{property.likes_count || 0}</span>
        </div>
      </div>
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
        property.is_active 
          ? 'bg-green-100 text-green-700' 
          : 'bg-slate-100 text-slate-500'
      }`}>
        {property.is_active ? 'Active' : 'Inactive'}
      </span>
      <DropdownMenu>
        <DropdownMenuTrigger asChild onClick={e => e.stopPropagation()}>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <MoreVertical className="w-4 h-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onEdit(); }}>
            <Edit className="w-4 h-4 mr-2" />
            Modifier
          </DropdownMenuItem>
          <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onToggle(); }}>
            {property.is_active ? (
              <>
                <ToggleLeft className="w-4 h-4 mr-2" />
                Désactiver
              </>
            ) : (
              <>
                <ToggleRight className="w-4 h-4 mr-2" />
                Activer
              </>
            )}
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem 
            className="text-red-600"
            onClick={(e) => { e.stopPropagation(); onDelete(); }}
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Supprimer
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  </div>
);

// Match Row Component
const MatchRow = ({ match, onClick }) => (
  <div 
    className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 cursor-pointer transition-colors"
    onClick={onClick}
    data-testid={`match-row-${match.id}`}
  >
    <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
      <span className="text-primary font-semibold text-sm">
        {match.student?.first_name?.[0]}{match.student?.last_name?.[0]}
      </span>
    </div>
    <div className="flex-1 min-w-0">
      <p className="font-medium text-slate-900 truncate">
        {match.student?.first_name} {match.student?.last_name}
      </p>
      <p className="text-xs text-slate-500 truncate">{match.property?.title}</p>
    </div>
    {match.is_superlike && (
      <span className="text-xs bg-primary-100 text-primary px-2 py-1 rounded-full">
        ⭐ Super Like
      </span>
    )}
    <ChevronRight className="w-4 h-4 text-slate-400" />
  </div>
);

export default LandlordDashboard;
