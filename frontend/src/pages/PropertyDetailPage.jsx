import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../App";
import { toast } from "sonner";
import { Button } from "../components/ui/button";
import { 
  ArrowLeft, 
  Heart, 
  Star,
  MapPin,
  Euro,
  Maximize2,
  Home,
  Bed,
  Wifi,
  Car,
  Waves,
  Utensils,
  Wind,
  Shield,
  Check,
  Calendar,
  MessageCircle,
  Share,
  ChevronLeft,
  ChevronRight,
  Loader2,
  X
} from "lucide-react";

const PropertyDetailPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { user, token, API } = useAuth();
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showFullscreen, setShowFullscreen] = useState(false);
  const [swiping, setSwiping] = useState(false);

  useEffect(() => {
    fetchProperty();
  }, [id]);

  const fetchProperty = async () => {
    try {
      const response = await axios.get(`${API}/properties/${id}`);
      setProperty(response.data);
    } catch (error) {
      console.error("Error fetching property:", error);
      toast.error("Erreur lors du chargement de l'annonce");
    } finally {
      setLoading(false);
    }
  };

  const handleSwipe = async (action) => {
    if (swiping || !user || user.role !== 'student') return;
    
    setSwiping(true);
    try {
      const response = await axios.post(`${API}/swipes?token=${token}`, {
        property_id: property.id,
        action: action
      });

      if (response.data.match) {
        toast.success("C'est un match! 🎉");
        navigate('/matches');
      } else {
        toast.success(action === 'like' ? "Annonce likée!" : action === 'superlike' ? "Super Like envoyé!" : "");
        navigate('/swipe');
      }
    } catch (error) {
      if (error.response?.data?.detail?.includes("déjà swipé")) {
        toast.info("Vous avez déjà swipé cette annonce");
      } else {
        toast.error("Erreur lors du swipe");
      }
    } finally {
      setSwiping(false);
    }
  };

  const amenityIcons = {
    wifi: { icon: Wifi, label: "WiFi" },
    parking: { icon: Car, label: "Parking" },
    washing_machine: { icon: Waves, label: "Lave-linge" },
    dishwasher: { icon: Utensils, label: "Lave-vaisselle" },
    balcony: { icon: Wind, label: "Balcon" },
    terrace: { icon: Wind, label: "Terrasse" },
    elevator: { icon: Shield, label: "Ascenseur" },
    interphone: { icon: Shield, label: "Interphone" },
    double_vitrage: { icon: Shield, label: "Double vitrage" },
    garden: { icon: Wind, label: "Jardin" },
    cellar: { icon: Home, label: "Cave" },
    bike_storage: { icon: Car, label: "Local vélo" },
    gym: { icon: Shield, label: "Salle de sport" },
    concierge: { icon: Shield, label: "Concierge" },
    laundry_room: { icon: Waves, label: "Buanderie" },
    mezzanine: { icon: Home, label: "Mezzanine" },
    exposed_beams: { icon: Home, label: "Poutres apparentes" },
    view: { icon: MapPin, label: "Vue dégagée" }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  if (!property) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <h2 className="text-xl font-bold text-slate-900 mb-2">Annonce non trouvée</h2>
          <Button onClick={() => navigate(-1)} className="bg-primary text-white rounded-full">
            Retour
          </Button>
        </div>
      </div>
    );
  }

  const isStudent = user?.role === 'student';

  return (
    <div className="min-h-screen bg-white">
      {/* Image Gallery */}
      <div className="relative h-80 md:h-96">
        <img
          src={property.images?.[currentImageIndex] || "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=1200"}
          alt={property.title}
          className="w-full h-full object-cover cursor-pointer"
          onClick={() => setShowFullscreen(true)}
        />
        
        {/* Navigation */}
        <div className="absolute top-4 left-4 right-4 flex items-center justify-between">
          <Button
            variant="ghost"
            size="icon"
            className="bg-white/90 hover:bg-white rounded-full shadow-md"
            onClick={() => navigate(-1)}
            data-testid="back-btn"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="bg-white/90 hover:bg-white rounded-full shadow-md"
              data-testid="share-btn"
            >
              <Share className="w-5 h-5" />
            </Button>
          </div>
        </div>
        
        {/* Image navigation */}
        {property.images?.length > 1 && (
          <>
            <button
              onClick={() => setCurrentImageIndex(prev => prev === 0 ? property.images.length - 1 : prev - 1)}
              className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 hover:bg-white rounded-full flex items-center justify-center shadow-md"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={() => setCurrentImageIndex(prev => (prev + 1) % property.images.length)}
              className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 hover:bg-white rounded-full flex items-center justify-center shadow-md"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
            
            {/* Image dots */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
              {property.images.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentImageIndex(idx)}
                  className={`w-2 h-2 rounded-full transition-all ${
                    idx === currentImageIndex ? 'bg-white w-6' : 'bg-white/50'
                  }`}
                />
              ))}
            </div>
          </>
        )}
        
        {/* Badges */}
        <div className="absolute bottom-4 left-4 flex gap-2">
          <span className="bg-primary text-white px-3 py-1.5 rounded-full text-sm font-medium">
            {property.property_type === "studio" ? "Studio" : 
             property.property_type === "apartment" ? "Appartement" :
             property.property_type === "room" ? "Chambre" : "Colocation"}
          </span>
          {property.furnished && (
            <span className="bg-white/90 text-slate-900 px-3 py-1.5 rounded-full text-sm font-medium">
              Meublé
            </span>
          )}
          {property.colocation && (
            <span className="bg-white/90 text-slate-900 px-3 py-1.5 rounded-full text-sm font-medium">
              Colocation
            </span>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-6 pb-32">
        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 mb-2">{property.title}</h1>
            <div className="flex items-center gap-2 text-slate-500">
              <MapPin className="w-4 h-4" />
              <span>{property.address}, {property.city} {property.postal_code}</span>
            </div>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold text-primary">{property.price}€</div>
            <div className="text-sm text-slate-500">par mois</div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-4 gap-4 mb-8">
          <div className="bg-slate-50 rounded-xl p-4 text-center">
            <Maximize2 className="w-5 h-5 text-primary mx-auto mb-2" />
            <div className="font-bold text-slate-900">{property.surface} m²</div>
            <div className="text-xs text-slate-500">Surface</div>
          </div>
          <div className="bg-slate-50 rounded-xl p-4 text-center">
            <Home className="w-5 h-5 text-primary mx-auto mb-2" />
            <div className="font-bold text-slate-900">{property.rooms}</div>
            <div className="text-xs text-slate-500">Pièce{property.rooms > 1 ? 's' : ''}</div>
          </div>
          <div className="bg-slate-50 rounded-xl p-4 text-center">
            <Bed className="w-5 h-5 text-primary mx-auto mb-2" />
            <div className="font-bold text-slate-900">{property.bedrooms}</div>
            <div className="text-xs text-slate-500">Chambre{property.bedrooms > 1 ? 's' : ''}</div>
          </div>
          <div className="bg-slate-50 rounded-xl p-4 text-center">
            <Calendar className="w-5 h-5 text-primary mx-auto mb-2" />
            <div className="font-bold text-slate-900 text-sm">
              {new Date(property.available_from).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
            </div>
            <div className="text-xs text-slate-500">Disponible</div>
          </div>
        </div>

        {/* Description */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-slate-900 mb-3">Description</h2>
          <p className="text-slate-600 leading-relaxed">{property.description}</p>
        </div>

        {/* Amenities */}
        {property.amenities?.length > 0 && (
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-slate-900 mb-3">Équipements</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {property.amenities.map((amenity, idx) => {
                const amenityInfo = amenityIcons[amenity] || { icon: Check, label: amenity };
                const Icon = amenityInfo.icon;
                return (
                  <div key={idx} className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                    <Icon className="w-5 h-5 text-primary" />
                    <span className="text-slate-700">{amenityInfo.label}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Landlord */}
        {property.landlord && (
          <div className="mb-8 p-4 bg-slate-50 rounded-2xl">
            <h2 className="text-lg font-semibold text-slate-900 mb-3">Propriétaire</h2>
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-primary-100 rounded-full flex items-center justify-center">
                {property.landlord.profile_image ? (
                  <img src={property.landlord.profile_image} alt="" className="w-full h-full rounded-full object-cover" />
                ) : (
                  <span className="text-xl font-semibold text-primary">
                    {property.landlord.first_name?.[0]}{property.landlord.last_name?.[0]}
                  </span>
                )}
              </div>
              <div>
                <p className="font-semibold text-slate-900">
                  {property.landlord.first_name} {property.landlord.last_name}
                </p>
                {property.landlord.company_name && (
                  <p className="text-sm text-slate-500">{property.landlord.company_name}</p>
                )}
                {property.landlord.is_agency && (
                  <span className="text-xs bg-primary-100 text-primary px-2 py-0.5 rounded-full">
                    Agence
                  </span>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Fixed Bottom Actions */}
      {isStudent && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-100 p-4">
          <div className="max-w-4xl mx-auto flex items-center gap-4">
            <Button
              onClick={() => handleSwipe("dislike")}
              disabled={swiping}
              variant="outline"
              className="h-12 px-6 rounded-full border-2 border-red-200 text-red-500 hover:bg-red-50"
              data-testid="dislike-btn"
            >
              <X className="w-5 h-5 mr-2" />
              Passer
            </Button>
            
            <Button
              onClick={() => handleSwipe("superlike")}
              disabled={swiping}
              className="h-12 px-6 rounded-full bg-primary-100 text-primary hover:bg-primary-200"
              data-testid="superlike-btn"
            >
              <Star className="w-5 h-5 mr-2" />
              Super Like
            </Button>
            
            <Button
              onClick={() => handleSwipe("like")}
              disabled={swiping}
              className="flex-1 h-12 rounded-full bg-primary hover:bg-primary-hover text-white"
              data-testid="like-btn"
            >
              {swiping ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <Heart className="w-5 h-5 mr-2" />
                  J'aime ce logement
                </>
              )}
            </Button>
          </div>
        </div>
      )}

      {/* Fullscreen Gallery */}
      {showFullscreen && (
        <div className="fixed inset-0 z-50 bg-black flex items-center justify-center">
          <button
            onClick={() => setShowFullscreen(false)}
            className="absolute top-4 right-4 w-10 h-10 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white"
          >
            <X className="w-6 h-6" />
          </button>
          
          <img
            src={property.images?.[currentImageIndex] || "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=1200"}
            alt={property.title}
            className="max-w-full max-h-full object-contain"
          />
          
          {property.images?.length > 1 && (
            <>
              <button
                onClick={() => setCurrentImageIndex(prev => prev === 0 ? property.images.length - 1 : prev - 1)}
                className="absolute left-4 w-12 h-12 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              <button
                onClick={() => setCurrentImageIndex(prev => (prev + 1) % property.images.length)}
                className="absolute right-4 w-12 h-12 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default PropertyDetailPage;
