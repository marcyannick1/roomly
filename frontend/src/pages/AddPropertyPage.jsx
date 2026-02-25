import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../App";
import { toast } from "sonner";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { mockProperties } from "../mockData";
import { 
  ArrowLeft, 
  Plus,
  X,
  MapPin,
  Euro,
  Maximize2,
  Home,
  Bed,
  Calendar,
  Image,
  Save,
  Loader2
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import { Switch } from "../components/ui/switch";

const AddPropertyPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [fetchingProperty, setFetchingProperty] = useState(!!id);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    price: "",
    surface: "",
    rooms: "1",
    bedrooms: "0",
    address: "",
    city: "",
    postal_code: "",
    latitude: 48.8566,
    longitude: 2.3522,
    property_type: "studio",
    furnished: true,
    colocation: false,
    available_from: new Date().toISOString().split('T')[0],
    images: [],
    amenities: []
  });

  const [newImageUrl, setNewImageUrl] = useState("");

  useEffect(() => {
    if (id) {
      fetchProperty();
    }
  }, [id]);

  const fetchProperty = () => {
    // Use mock data
    const prop = mockProperties.find(p => p.id === id);
    if (prop) {
      setFormData({
        ...prop,
        rooms: String(prop.bedrooms),
        bedrooms: String(prop.bedrooms),
        price: String(prop.price),
        surface: String(prop.area)
      });
    }
    setFetchingProperty(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!formData.title || !formData.price || !formData.city) {
      toast.error("Veuillez remplir tous les champs obligatoires");
      return;
    }

    setLoading(true);

    setTimeout(() => {
      // Simulate save
      toast.success(id ? "Annonce mise à jour!" : "Annonce créée!");
      navigate('/dashboard');
      setLoading(false);
    }, 500);
  };

  const addImage = () => {
    if (newImageUrl && !formData.images.includes(newImageUrl)) {
      setFormData({ ...formData, images: [...formData.images, newImageUrl] });
      setNewImageUrl("");
    }
  };

  const removeImage = (index) => {
    setFormData({
      ...formData,
      images: formData.images.filter((_, i) => i !== index)
    });
  };

  const toggleAmenity = (amenity) => {
    if (formData.amenities.includes(amenity)) {
      setFormData({
        ...formData,
        amenities: formData.amenities.filter(a => a !== amenity)
      });
    } else {
      setFormData({
        ...formData,
        amenities: [...formData.amenities, amenity]
      });
    }
  };

  const amenitiesList = [
    { id: "wifi", label: "WiFi" },
    { id: "parking", label: "Parking" },
    { id: "washing_machine", label: "Lave-linge" },
    { id: "dishwasher", label: "Lave-vaisselle" },
    { id: "balcony", label: "Balcon" },
    { id: "terrace", label: "Terrasse" },
    { id: "elevator", label: "Ascenseur" },
    { id: "interphone", label: "Interphone" },
    { id: "double_vitrage", label: "Double vitrage" },
    { id: "garden", label: "Jardin" },
    { id: "cellar", label: "Cave" },
    { id: "bike_storage", label: "Local vélo" }
  ];

  if (fetchingProperty) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="fixed top-0 left-0 right-0 z-40 glass border-b border-slate-100">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/dashboard')}
            data-testid="back-btn"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="font-bold text-slate-900">
            {id ? "Modifier l'annonce" : "Nouvelle annonce"}
          </h1>
        </div>
      </header>

      <main className="pt-20 pb-8 px-4">
        <div className="max-w-3xl mx-auto">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Info */}
            <div className="bg-white rounded-2xl border border-slate-100 p-6">
              <h3 className="font-semibold text-slate-900 mb-4">Informations générales</h3>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Titre de l'annonce *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="rounded-xl"
                    placeholder="Studio lumineux Quartier Latin"
                    required
                    data-testid="title-input"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 h-32 resize-none focus:border-primary focus:ring-1 focus:ring-primary"
                    placeholder="Décrivez votre logement..."
                    data-testid="description-input"
                  />
                </div>
                
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="property_type">Type de bien</Label>
                    <Select
                      value={formData.property_type}
                      onValueChange={(value) => setFormData({ ...formData, property_type: value })}
                    >
                      <SelectTrigger className="rounded-xl" data-testid="property-type-select">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="studio">Studio</SelectItem>
                        <SelectItem value="apartment">Appartement</SelectItem>
                        <SelectItem value="room">Chambre</SelectItem>
                        <SelectItem value="colocation">Colocation</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="price">Loyer mensuel (€) *</Label>
                    <div className="relative">
                      <Euro className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <Input
                        id="price"
                        type="number"
                        value={formData.price}
                        onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                        className="pl-10 rounded-xl"
                        placeholder="750"
                        required
                        data-testid="price-input"
                      />
                    </div>
                  </div>
                </div>
                
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="surface">Surface (m²)</Label>
                    <div className="relative">
                      <Maximize2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <Input
                        id="surface"
                        type="number"
                        value={formData.surface}
                        onChange={(e) => setFormData({ ...formData, surface: e.target.value })}
                        className="pl-10 rounded-xl"
                        placeholder="25"
                        data-testid="surface-input"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="rooms">Pièces</Label>
                    <Select
                      value={formData.rooms}
                      onValueChange={(value) => setFormData({ ...formData, rooms: value })}
                    >
                      <SelectTrigger className="rounded-xl" data-testid="rooms-select">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {[1,2,3,4,5,6].map(n => (
                          <SelectItem key={n} value={String(n)}>{n} pièce{n > 1 ? 's' : ''}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="bedrooms">Chambres</Label>
                    <Select
                      value={formData.bedrooms}
                      onValueChange={(value) => setFormData({ ...formData, bedrooms: value })}
                    >
                      <SelectTrigger className="rounded-xl" data-testid="bedrooms-select">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {[0,1,2,3,4,5].map(n => (
                          <SelectItem key={n} value={String(n)}>{n} chambre{n > 1 ? 's' : ''}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </div>

            {/* Location */}
            <div className="bg-white rounded-2xl border border-slate-100 p-6">
              <h3 className="font-semibold text-slate-900 mb-4">Localisation</h3>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="address">Adresse</Label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <Input
                      id="address"
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      className="pl-10 rounded-xl"
                      placeholder="15 Rue de la Harpe"
                      data-testid="address-input"
                    />
                  </div>
                </div>
                
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="city">Ville *</Label>
                    <Input
                      id="city"
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      className="rounded-xl"
                      placeholder="Paris 5e"
                      required
                      data-testid="city-input"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="postal_code">Code postal</Label>
                    <Input
                      id="postal_code"
                      value={formData.postal_code}
                      onChange={(e) => setFormData({ ...formData, postal_code: e.target.value })}
                      className="rounded-xl"
                      placeholder="75005"
                      data-testid="postal-code-input"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Options */}
            <div className="bg-white rounded-2xl border border-slate-100 p-6">
              <h3 className="font-semibold text-slate-900 mb-4">Options</h3>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                  <div>
                    <p className="font-medium text-slate-900">Meublé</p>
                    <p className="text-sm text-slate-500">Le logement est-il meublé?</p>
                  </div>
                  <Switch
                    checked={formData.furnished}
                    onCheckedChange={(checked) => setFormData({ ...formData, furnished: checked })}
                    data-testid="furnished-switch"
                  />
                </div>
                
                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                  <div>
                    <p className="font-medium text-slate-900">Colocation</p>
                    <p className="text-sm text-slate-500">Proposez-vous une colocation?</p>
                  </div>
                  <Switch
                    checked={formData.colocation}
                    onCheckedChange={(checked) => setFormData({ ...formData, colocation: checked })}
                    data-testid="colocation-switch"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="available_from">Disponible à partir du</Label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <Input
                      id="available_from"
                      type="date"
                      value={formData.available_from}
                      onChange={(e) => setFormData({ ...formData, available_from: e.target.value })}
                      className="pl-10 rounded-xl"
                      data-testid="available-from-input"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Amenities */}
            <div className="bg-white rounded-2xl border border-slate-100 p-6">
              <h3 className="font-semibold text-slate-900 mb-4">Équipements</h3>
              
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {amenitiesList.map(amenity => (
                  <button
                    key={amenity.id}
                    type="button"
                    onClick={() => toggleAmenity(amenity.id)}
                    className={`p-3 rounded-xl border-2 text-sm font-medium transition-all ${
                      formData.amenities.includes(amenity.id)
                        ? 'border-primary bg-primary-50 text-primary'
                        : 'border-slate-200 text-slate-600 hover:border-slate-300'
                    }`}
                    data-testid={`amenity-${amenity.id}`}
                  >
                    {amenity.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Images */}
            <div className="bg-white rounded-2xl border border-slate-100 p-6">
              <h3 className="font-semibold text-slate-900 mb-4">Photos</h3>
              
              <div className="space-y-4">
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Image className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <Input
                      value={newImageUrl}
                      onChange={(e) => setNewImageUrl(e.target.value)}
                      className="pl-10 rounded-xl"
                      placeholder="URL de l'image (https://...)"
                      data-testid="image-url-input"
                    />
                  </div>
                  <Button
                    type="button"
                    onClick={addImage}
                    className="bg-primary text-white rounded-xl"
                    data-testid="add-image-btn"
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
                
                {formData.images.length > 0 && (
                  <div className="grid grid-cols-3 gap-3">
                    {formData.images.map((url, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={url}
                          alt={`Image ${index + 1}`}
                          className="w-full h-24 object-cover rounded-xl"
                        />
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="absolute top-1 right-1 w-6 h-6 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                          data-testid={`remove-image-${index}`}
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Submit */}
            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-primary hover:bg-primary-hover text-white h-12 rounded-xl font-semibold"
              data-testid="submit-property-btn"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  {id ? "Mettre à jour" : "Publier l'annonce"}
                </>
              )}
            </Button>
          </form>
        </div>
      </main>
    </div>
  );
};

export default AddPropertyPage;
