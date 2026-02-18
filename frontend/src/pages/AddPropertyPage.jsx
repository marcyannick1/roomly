import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../App";
import { toast } from "sonner";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
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
  const { user, token, API } = useAuth();
  const [loading, setLoading] = useState(false);
  const [fetchingProperty, setFetchingProperty] = useState(!!id);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    price: "",
    surface: "",
    address: "",
    city: "",
    postal_code: "",
    latitude: 48.8566,
    longitude: 2.3522,
    room_type: "studio",
    furnished: true,
    charges_included: false,
    deposit: "",
    floor: "",
    total_floors: "",
    available_from: new Date().toISOString().split('T')[0],
    min_duration_months: "",
    wifi: false,
    washing_machine: false,
    kitchen: false,
    parking: false,
    elevator: false,
    workspace: false,
    pets: false,
    tv: false,
    dryer: false,
    ac: false,
    garden: false,
    balcony: false
  });

  useEffect(() => {
    if (id) {
      fetchProperty();
    }
  }, [id]);

  const fetchProperty = async () => {
    try {
      const response = await axios.get(`${API}/properties/${id}`);
      const prop = response.data;
      setFormData({
        ...prop,
        rooms: String(prop.rooms),
        bedrooms: String(prop.bedrooms),
        price: String(prop.price),
        surface: String(prop.surface)
      });
    } catch (error) {
      console.error("Error fetching property:", error);
      toast.error("Erreur lors du chargement de l'annonce");
    } finally {
      setFetchingProperty(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.title || !formData.price || !formData.city) {
      toast.error("Veuillez remplir tous les champs obligatoires");
      return;
    }

    setLoading(true);

    try {
      const payload = {
        title: formData.title,
        description: formData.description || "",
        price: parseFloat(formData.price),
        surface: parseFloat(formData.surface),
        city: formData.city,
        address: formData.address || "",
        postal_code: formData.postal_code || "",
        latitude: formData.latitude,
        longitude: formData.longitude,
        room_type: formData.room_type,
        furnished: formData.furnished || false,
        charges_included: formData.charges_included || false,
        deposit: formData.deposit ? parseFloat(formData.deposit) : null,
        floor: formData.floor ? parseInt(formData.floor) : null,
        total_floors: formData.total_floors ? parseInt(formData.total_floors) : null,
        available_from: formData.available_from || null,
        min_duration_months: formData.min_duration_months ? parseInt(formData.min_duration_months) : null,
        wifi: formData.wifi || false,
        washing_machine: formData.washing_machine || false,
        kitchen: formData.kitchen || false,
        parking: formData.parking || false,
        elevator: formData.elevator || false,
        workspace: formData.workspace || false,
        pets: formData.pets || false,
        tv: formData.tv || false,
        dryer: formData.dryer || false,
        ac: formData.ac || false,
        garden: formData.garden || false,
        balcony: formData.balcony || false,
        owner_id: user.id
      };

      console.log("Sending payload:", payload);

      if (id) {
        await axios.put(`${API}/properties/${id}?token=${token}`, payload);
        toast.success("Annonce mise à jour!");
      } else {
        await axios.post(`${API}/properties/json?token=${token}`, payload);
        toast.success("Annonce créée!");
      }
      
      navigate('/dashboard');
    } catch (error) {
      console.error("Error saving property:", error);
      console.error("Error details:", error.response?.data);
      
      // Formater le message d'erreur pour les détails de validation
      let errorMessage = "Erreur lors de l'enregistrement";
      if (error.response?.data?.detail) {
        const detail = error.response.data.detail;
        if (Array.isArray(detail)) {
          errorMessage = detail.map(d => `${d.loc?.join('.')}: ${d.msg}`).join(", ");
        } else if (typeof detail === 'string') {
          errorMessage = detail;
        }
      }
      
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const addImage = () => {
    // Images non supportées pour maintenant
  };

  const removeImage = (index) => {
    // Images non supportées pour maintenant
  };

  const toggleAmenity = (amenityKey) => {
    setFormData({
      ...formData,
      [amenityKey]: !formData[amenityKey]
    });
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
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="max-w-3xl mx-auto">
        <div className="mb-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/dashboard')}
            className="mb-2"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Retour
          </Button>
          <h1 className="text-2xl font-bold text-slate-900">
            {id ? "Modifier l'annonce" : "Nouvelle annonce"}
          </h1>
        </div>
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
                    <Label htmlFor="room_type">Type de bien</Label>
                    <Select
                      value={formData.room_type}
                      onValueChange={(value) => setFormData({ ...formData, room_type: value })}
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
                      formData[amenity.id]
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

            {/* Images - Section désactivée pour maintenant */}
            {/* <div className="bg-white rounded-2xl border border-slate-100 p-6">
              <h3 className="font-semibold text-slate-900 mb-4">Photos</h3>
              ...
            </div> */}

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
    </div>
  );
};

export default AddPropertyPage;