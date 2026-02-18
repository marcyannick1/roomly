import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import { useAuth } from "../App";
import { Button } from "../components/ui/button";
import { 
  ArrowLeft, 
  Home, 
  MessageCircle, 
  MapPin, 
  Calendar,
  Euro,
  Maximize2,
  Filter,
  X,
  Loader2
} from "lucide-react";
import "leaflet/dist/leaflet.css";

// Fix for default marker icon
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});

// Custom marker icon
const createCustomIcon = (price) => {
  return L.divIcon({
    className: 'custom-marker',
    html: `
      <div style="
        background: #7C3AED;
        color: white;
        padding: 4px 8px;
        border-radius: 20px;
        font-size: 12px;
        font-weight: 600;
        white-space: nowrap;
        box-shadow: 0 2px 8px rgba(124,58,237,0.4);
      ">
        ${price}€
      </div>
    `,
    iconSize: [60, 30],
    iconAnchor: [30, 15],
  });
};

const MapPage = () => {
  const navigate = useNavigate();
  const { user, token, API } = useAuth();
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [filters, setFilters] = useState({
    priceMin: "",
    priceMax: "",
    city: ""
  });
  const [showFilters, setShowFilters] = useState(false);

  // Paris center coordinates
  const parisCenter = [48.8566, 2.3522];

  useEffect(() => {
    fetchProperties();
  }, []);

  const fetchProperties = async () => {
    try {
      let url = `${API}/properties?limit=100`;
      if (filters.priceMin) url += `&price_min=${filters.priceMin}`;
      if (filters.priceMax) url += `&price_max=${filters.priceMax}`;
      if (filters.city) url += `&city=${filters.city}`;
      
      const response = await axios.get(url);
      setProperties(response.data);
    } catch (error) {
      console.error("Error fetching properties:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleApplyFilters = () => {
    setLoading(true);
    fetchProperties();
    setShowFilters(false);
  };

  const isStudent = user?.role === 'student';

  return (
    <div className="min-h-screen bg-slate-50 p-8 relative">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Carte des annonces</h1>
          <p className="text-slate-600">{properties.length} logements à Paris & IDF</p>
        </div>
        
        <Button
          variant="outline"
          onClick={() => setShowFilters(!showFilters)}
          className="rounded-full"
          data-testid="filter-btn"
        >
          <Filter className="w-4 h-4 mr-2" />
          Filtres
        </Button>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <div className="fixed top-20 right-4 z-[1001] bg-white rounded-2xl shadow-floating p-4 w-72">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-slate-900">Filtres</h3>
            <Button variant="ghost" size="icon" onClick={() => setShowFilters(false)}>
              <X className="w-4 h-4" />
            </Button>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="text-sm text-slate-600 block mb-1">Budget (€/mois)</label>
              <div className="flex gap-2">
                <input
                  type="number"
                  placeholder="Min"
                  value={filters.priceMin}
                  onChange={(e) => setFilters({ ...filters, priceMin: e.target.value })}
                  className="flex-1 px-3 py-2 rounded-xl border border-slate-200 text-sm"
                  data-testid="price-min-input"
                />
                <input
                  type="number"
                  placeholder="Max"
                  value={filters.priceMax}
                  onChange={(e) => setFilters({ ...filters, priceMax: e.target.value })}
                  className="flex-1 px-3 py-2 rounded-xl border border-slate-200 text-sm"
                  data-testid="price-max-input"
                />
              </div>
            </div>
            
            <div>
              <label className="text-sm text-slate-600 block mb-1">Ville</label>
              <input
                type="text"
                placeholder="Paris 5e, Vincennes..."
                value={filters.city}
                onChange={(e) => setFilters({ ...filters, city: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm"
                data-testid="city-input"
              />
            </div>
            
            <Button 
              onClick={handleApplyFilters}
              className="w-full bg-primary text-white rounded-full"
              data-testid="apply-filters-btn"
            >
              Appliquer
            </Button>
          </div>
        </div>
      )}

      {/* Map */}
      <div className="h-[calc(100vh-12rem)]">
        {loading ? (
          <div className="h-full flex items-center justify-center">
            <Loader2 className="w-8 h-8 text-primary animate-spin" />
          </div>
        ) : (
          <MapContainer
            center={parisCenter}
            zoom={12}
            className="h-full w-full"
            style={{ zIndex: 1 }}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            
            {properties.map(property => (
              <Marker
                key={property.id}
                position={[property.latitude || 48.8566, property.longitude || 2.3522]}
                icon={createCustomIcon(property.price)}
                eventHandlers={{
                  click: () => setSelectedProperty(property),
                }}
              >
                <Popup>
                  <div className="w-48">
                    <img
                      src={property.images?.[0] || "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=200"}
                      alt={property.title}
                      className="w-full h-24 object-cover rounded-lg mb-2"
                    />
                    <h3 className="font-semibold text-sm">{property.title}</h3>
                    <p className="text-xs text-slate-500">{property.city}</p>
                    <p className="text-sm font-bold text-primary mt-1">{property.price}€/mois</p>
                    <Button
                      size="sm"
                      className="w-full mt-2 bg-primary text-white rounded-full text-xs"
                      onClick={() => navigate(`/property/${property.id}`)}
                    >
                      Voir détails
                    </Button>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        )}
      </div>

      {/* Selected Property Card */}
      {selectedProperty && (
        <div className="fixed bottom-24 left-4 right-4 z-[1000] max-w-md mx-auto">
          <div className="bg-white rounded-2xl shadow-floating p-4 flex gap-4">
            <img
              src={selectedProperty.images?.[0] || "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=200"}
              alt={selectedProperty.title}
              className="w-24 h-24 rounded-xl object-cover"
            />
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-slate-900 truncate">{selectedProperty.title}</h3>
              <div className="flex items-center gap-2 text-sm text-slate-500 mt-1">
                <MapPin className="w-3 h-3" />
                <span>{selectedProperty.city}</span>
              </div>
              <div className="flex items-center gap-3 mt-2">
                <span className="text-lg font-bold text-primary">{selectedProperty.price}€</span>
                <span className="text-sm text-slate-500">{selectedProperty.surface}m²</span>
              </div>
              <Button
                size="sm"
                className="mt-2 bg-primary text-white rounded-full text-xs"
                onClick={() => navigate(`/property/${selectedProperty.id}`)}
                data-testid="view-property-btn"
              >
                Voir détails
              </Button>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-2 right-2"
              onClick={() => setSelectedProperty(null)}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}

    </div>
  );
};

export default MapPage;
