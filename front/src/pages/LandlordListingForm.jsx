import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { createListing, getCurrentUser } from '@/lib/api';
import api from '@/lib/api';
import { toast } from 'sonner';
import { ArrowLeft, ArrowRight, Home, Eye, LogOut, User, Flame, Settings, Plus, MapPin, X } from 'lucide-react';
import { motion } from 'framer-motion';

// Liste des équipements disponibles
const AMENITIES = [
  { id: 'wifi', label: 'Wifi', icon: '📶' },
  { id: 'workspace', label: 'Espace de travail dédié', icon: '💻' },
  { id: 'parking', label: 'Parking gratuit sur place', icon: '🅿️' },
  { id: 'pets', label: 'Animaux acceptés', icon: '🐾' },
  { id: 'tv', label: 'Télévision', icon: '📺' },
  { id: 'elevator', label: 'Ascenseur', icon: '🛗' },
  { id: 'washing', label: 'Lave-linge', icon: '🧺' },
  { id: 'dryer', label: 'Sèche-linge', icon: '🌡️' },
  { id: 'ac', label: 'Climatisation', icon: '❄️' },
  { id: 'kitchen', label: 'Cuisine équipée', icon: '🍳' },
  { id: 'garden', label: 'Jardin', icon: '🌿' },
  { id: 'balcony', label: 'Balcon/Terrasse', icon: '🏠' },
];

// Types de logements
const ROOM_TYPES = [
  { id: 'studio', label: 'Studio' },
  { id: 't1', label: 'T1 (1 pièce)' },
  { id: 't2', label: 'T2 (2 pièces)' },
  { id: 't3', label: 'T3 (3 pièces)' },
  { id: 'colocation', label: 'Colocation' },
];

export default function LandlordListingForm() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [addressSuggestions, setAddressSuggestions] = useState([]);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    room_type: 'studio',
    price: '',
    surface: '',
    deposit: '',
    charges_included: false,
    furnished: false,
    city: '',
    address: '',
    postal_code: '',
    floor: '',
    total_floors: '',
    available_from: '',
    min_duration_months: '',
    amenities: [],
    photos: [],
    photoFiles: [],  // Fichiers originaux pour l'upload
  });

  useEffect(() => {
    console.log("✅ FORM MOUNTED");
    loadUser();
    document.body.classList.add('has-dashboard-sidebar');
    return () => {
      console.log("❌ FORM UNMOUNTED");
      document.body.classList.remove('has-dashboard-sidebar');
    };
  }, []);

  useEffect(() => {
    console.log("STEP ACTUEL =", step);
  }, [step]);

  const loadUser = async () => {
    try {
      const response = await getCurrentUser();
      setUser(response.data.user || response.data);
    } catch (error) {
      toast.error('Erreur de chargement utilisateur');
      navigate('/');
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleAmenityToggle = (amenityId) => {
    setFormData(prev => ({
      ...prev,
      amenities: prev.amenities.includes(amenityId)
        ? prev.amenities.filter(id => id !== amenityId)
        : [...prev.amenities, amenityId],
    }));
  };

  const handleAddressChange = async (value) => {
    setFormData(prev => ({ ...prev, address: value }));
    
    if (value.length > 2) {
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(value)}&format=json&limit=10&countrycodes=fr`
        );
        const data = await response.json();
        // Filtrer pour garder seulement les adresses en France
        const frenchAddresses = data.filter(suggestion => 
          suggestion.address?.country === 'France' || 
          suggestion.address?.country_code === 'fr'
        );
        setAddressSuggestions(frenchAddresses);
      } catch (error) {
        console.error('Erreur autocomplete:', error);
      }
    }
  };

  const selectAddress = (suggestion) => {
    // Extraire la ville et le code postal de manière robuste
    const city = suggestion.address?.city || 
                 suggestion.address?.town || 
                 suggestion.address?.village || 
                 suggestion.address?.municipality || '';
    const postalCode = suggestion.address?.postcode || '';
    
    // Pour le champ adresse, utiliser une version simplifiée (sans la ville et le code postal répétés)
    const addressLine = suggestion.address?.road || 
                       suggestion.address?.building || 
                       suggestion.address?.street ||
                       suggestion.display_name.split(',')[0] || '';
    
    setFormData(prev => ({
      ...prev,
      address: addressLine,
      city: city,
      postal_code: postalCode,
    }));
    setAddressSuggestions([]);
  };

  const handlePhotosChange = async (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    try {
      const base64Images = await Promise.all(
        files.map(
          file =>
            new Promise((resolve, reject) => {
              const reader = new FileReader();
              reader.onload = () => resolve(reader.result);
              reader.onerror = reject;
              reader.readAsDataURL(file);
            })
        )
      );

      setFormData(prev => ({
        ...prev,
        photos: [...(prev.photos || []), ...base64Images],
        photoFiles: [...(prev.photoFiles || []), ...files],  // Conserver les fichiers originaux
      }));
      toast.success(`${files.length} photo(s) ajoutée(s)`);
    } catch (error) {
      toast.error('Erreur lors du chargement des images');
    }
  };

  const removePhoto = (index) => {
    setFormData(prev => ({
      ...prev,
      photos: prev.photos.filter((_, i) => i !== index),
      photoFiles: (prev.photoFiles || []).filter((_, i) => i !== index),  // Supprimer aussi le fichier
    }));
  };

  const handleLogout = () => {
    document.cookie = 'session_token=; path=/; max-age=0';
    navigate('/');
  };

  const nextStep = () => {
    console.log("NEXT STEP FROM", step, "TO", step + 1);
    if (step < 4) setStep(step + 1);
  };

  const prevStep = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleFinalSubmit = async () => {
    setLoading(true);

    try {
      const formDataToSend = new FormData();
      
      // Champs obligatoires
      formDataToSend.append('title', formData.title);
      formDataToSend.append('room_type', formData.room_type);
      formDataToSend.append('price', formData.price);
      formDataToSend.append('city', formData.city);
      formDataToSend.append('owner_id', user.id);
      
      // Champs optionnels texte
      if (formData.description) formDataToSend.append('description', formData.description);
      if (formData.address) formDataToSend.append('address', formData.address);
      if (formData.postal_code) formDataToSend.append('postal_code', formData.postal_code);
      
      // Champs numériques (ne pas envoyer si vide)
      if (formData.surface) formDataToSend.append('surface', formData.surface);
      if (formData.deposit) formDataToSend.append('deposit', formData.deposit);
      if (formData.floor) formDataToSend.append('floor', formData.floor);
      if (formData.total_floors) formDataToSend.append('total_floors', formData.total_floors);
      if (formData.min_duration_months) formDataToSend.append('min_duration_months', formData.min_duration_months);
      
      // Date (ne pas envoyer si vide)
      if (formData.available_from) formDataToSend.append('available_from', formData.available_from);
      
      // Booléens (FastAPI attend 1/0 ou true/false avec FormData)
      formDataToSend.append('charges_included', formData.charges_included ? 1 : 0);
      formDataToSend.append('furnished', formData.furnished ? 1 : 0);
      
      // Équipements mappés individuellement (pas de amenities[])
      formDataToSend.append('wifi', formData.amenities.includes('wifi') ? 1 : 0);
      formDataToSend.append('workspace', formData.amenities.includes('workspace') ? 1 : 0);
      formDataToSend.append('parking', formData.amenities.includes('parking') ? 1 : 0);
      formDataToSend.append('pets', formData.amenities.includes('pets') ? 1 : 0);
      formDataToSend.append('tv', formData.amenities.includes('tv') ? 1 : 0);
      formDataToSend.append('elevator', formData.amenities.includes('elevator') ? 1 : 0);
      formDataToSend.append('washing_machine', formData.amenities.includes('washing') ? 1 : 0);
      formDataToSend.append('dryer', formData.amenities.includes('dryer') ? 1 : 0);
      formDataToSend.append('ac', formData.amenities.includes('ac') ? 1 : 0);
      formDataToSend.append('kitchen', formData.amenities.includes('kitchen') ? 1 : 0);
      formDataToSend.append('garden', formData.amenities.includes('garden') ? 1 : 0);
      formDataToSend.append('balcony', formData.amenities.includes('balcony') ? 1 : 0);
      
      // Photos
      if (formData.photoFiles && formData.photoFiles.length > 0) {
        formData.photoFiles.forEach((file) => {
          formDataToSend.append('photos', file);
        });
      }

      // Laisser Axios gérer Content-Type automatiquement
      await api.post('/listings/', formDataToSend);
      
      toast.success('Annonce créée avec succès !');
      navigate('/landlord/dashboard');
    } catch (error) {
      console.error('AXIOS ERROR:', error.response?.data);
      toast.error('Erreur lors de la création de l\'annonce');
    } finally {
      setLoading(false);
    }
  };

  const navItems = [
    { id: 'listings', icon: Home, label: 'Mes annonces', path: '/landlord/dashboard' },
    { id: 'students', icon: Eye, label: 'Intéressés', path: '/landlord/dashboard' },
    { id: 'create', icon: Plus, label: 'Créer une annonce', path: null },
    { id: 'profile', icon: User, label: 'Profil', path: null },
    { id: 'settings', icon: Settings, label: 'Paramètres', path: null },
  ];

  return (
    <div className="min-h-screen bg-white flex">
      {/* Sidebar */}
      <aside className="dashboard-sidebar w-72 bg-[#fec629] text-[#212220] flex flex-col shadow-2xl fixed left-0 top-0 h-screen z-50">
        <div className="p-6 border-b border-black/10">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-[#212220] rounded-2xl flex items-center justify-center shadow-lg p-2">
              <img src="/logo.svg" alt="Roomly" className="w-full h-full" />
            </div>
            <span className="text-2xl font-bold text-[#212220]" style={{ fontFamily: 'Outfit' }}>Roomly</span>
          </div>

          <div className="bg-black/5 rounded-2xl p-4 border border-black/10">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-[#212220] rounded-full flex items-center justify-center font-bold text-lg shadow-lg text-[#fec629]">
                {user?.name?.charAt(0).toUpperCase() || 'U'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-[#212220] truncate">{user?.name}</p>
                <p className="text-xs text-[#212220]/70 truncate">{user?.email}</p>
              </div>
            </div>
          </div>
        </div>

        <nav className="flex-1 py-4 px-3">
          <div className="space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = item.id === 'create';

              return (
                <button
                  key={item.id}
                  onClick={() => {
                    if (item.path) navigate(item.path);
                    else if (item.id === 'profile' && user?.id) navigate(`/profile/${user.id}`);
                  }}
                  className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-xl transition-all duration-200 ${
                    isActive
                      ? 'bg-[#212220] text-[#fec629] shadow-lg'
                      : 'hover:bg-black/5 text-[#212220]/70 hover:text-[#212220]'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{item.label}</span>
                </button>
              );
            })}
          </div>
        </nav>

        <div className="p-4 border-t border-black/10">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-black/5 hover:bg-black/10 text-[#212220]/70 hover:text-[#212220] transition-all"
          >
            <LogOut className="w-5 h-5" />
            <span className="font-medium">Déconnexion</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 ml-72 bg-gray-50">
        <div className="max-w-2xl mx-auto px-6 py-8">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-[#212220] mb-2" style={{ fontFamily: 'Outfit' }}>
              Créer une annonce
            </h1>
            <div className="flex gap-2">
              {[1, 2, 3, 4].map((s) => (
                <div
                  key={s}
                  className={`h-2 flex-1 rounded-full transition-all ${
                    s <= step ? 'bg-[#fec629]' : 'bg-gray-300'
                  }`}
                />
              ))}
            </div>
            <p className="text-gray-600 mt-2">Étape {step} sur 4</p>
          </div>

          <form className="space-y-6">
            {/* Étape 1: Informations de base */}
            {step === 1 && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6 bg-white p-8 rounded-3xl shadow-lg border-2 border-gray-100">
                <h2 className="text-2xl font-bold text-[#212220] mb-6" style={{ fontFamily: 'Outfit' }}>
                  📋 Informations de base
                </h2>

                <div>
                  <Label htmlFor="title">Titre de l'annonce *</Label>
                  <Input
                    id="title"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    placeholder="Ex: Studio confortable au centre"
                    required
                    className="mt-2"
                  />
                </div>

                <div>
                  <Label htmlFor="description">Description *</Label>
                  <Textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    placeholder="Décrivez votre logement en détail..."
                    required
                    rows={4}
                    className="mt-2"
                  />
                </div>

                <div>
                  <Label>Type de logement *</Label>
                  <div className="grid grid-cols-2 gap-3 mt-2">
                    {ROOM_TYPES.map((type) => (
                      <button
                        key={type.id}
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, room_type: type.id }))}
                        className={`p-3 rounded-xl font-medium transition-all ${
                          formData.room_type === type.id
                            ? 'bg-[#fec629] text-[#212220] border-2 border-[#212220]'
                            : 'bg-gray-100 text-gray-700 border-2 border-gray-200 hover:border-[#fec629]'
                        }`}
                      >
                        {type.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="surface">Surface (m²) *</Label>
                    <Input
                      id="surface"
                      name="surface"
                      type="number"
                      value={formData.surface}
                      onChange={handleInputChange}
                      placeholder="Ex: 25"
                      required
                      className="mt-2"
                    />
                  </div>
                  <div>
                    <Label htmlFor="floor">Étage</Label>
                    <Input
                      id="floor"
                      name="floor"
                      type="number"
                      value={formData.floor}
                      onChange={handleInputChange}
                      placeholder="Ex: 2"
                      className="mt-2"
                    />
                  </div>
                </div>

                <div className="flex gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      name="furnished"
                      checked={formData.furnished}
                      onChange={handleInputChange}
                      className="w-4 h-4"
                    />
                    <span>Meublé</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      name="charges_included"
                      checked={formData.charges_included}
                      onChange={handleInputChange}
                      className="w-4 h-4"
                    />
                    <span>Charges incluses</span>
                  </label>
                </div>
              </motion.div>
            )}

            {/* Étape 2: Localisation */}
            {step === 2 && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6 bg-white p-8 rounded-3xl shadow-lg border-2 border-gray-100">
                <h2 className="text-2xl font-bold text-[#212220] mb-6" style={{ fontFamily: 'Outfit' }}>
                  📍 Localisation
                </h2>

                <div>
                  <Label htmlFor="address">Adresse *</Label>
                  <div className="relative">
                    <Input
                      id="address"
                      value={formData.address}
                      onChange={(e) => handleAddressChange(e.target.value)}
                      placeholder="Tapez votre adresse..."
                      required
                      className="mt-2"
                    />
                    {addressSuggestions.length > 0 && (
                      <div className="absolute top-full left-0 right-0 bg-white border-2 border-[#fec629] rounded-lg mt-1 z-10 max-h-48 overflow-y-auto">
                        {addressSuggestions.map((suggestion, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => selectAddress(suggestion)}
                            className="w-full text-left p-3 hover:bg-gray-100 border-b last:border-b-0 flex items-start gap-2"
                          >
                            <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0 text-[#fec629]" />
                            <span className="text-sm">{suggestion.display_name}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="city">Ville *</Label>
                    <Input
                      id="city"
                      name="city"
                      value={formData.city}
                      onChange={handleInputChange}
                      placeholder="Ex: Paris"
                      required
                      className="mt-2"
                    />
                  </div>
                  <div>
                    <Label htmlFor="postal_code">Code postal *</Label>
                    <Input
                      id="postal_code"
                      name="postal_code"
                      value={formData.postal_code}
                      onChange={handleInputChange}
                      placeholder="Ex: 75001"
                      required
                      className="mt-2"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="available_from">Disponible à partir du</Label>
                  <Input
                    id="available_from"
                    name="available_from"
                    type="date"
                    value={formData.available_from}
                    onChange={handleInputChange}
                    className="mt-2"
                  />
                </div>
              </motion.div>
            )}

            {/* Étape 3: Prix & Durée */}
            {step === 3 && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6 bg-white p-8 rounded-3xl shadow-lg border-2 border-gray-100">
                <h2 className="text-2xl font-bold text-[#212220] mb-6" style={{ fontFamily: 'Outfit' }}>
                  💰 Prix & Conditions
                </h2>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="price">Loyer mensuel (€) *</Label>
                    <Input
                      id="price"
                      name="price"
                      type="number"
                      value={formData.price}
                      onChange={handleInputChange}
                      placeholder="Ex: 600"
                      required
                      className="mt-2"
                    />
                  </div>
                  <div>
                    <Label htmlFor="deposit">Dépôt de garantie (€)</Label>
                    <Input
                      id="deposit"
                      name="deposit"
                      type="number"
                      value={formData.deposit}
                      onChange={handleInputChange}
                      placeholder="Ex: 1200"
                      className="mt-2"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="min_duration_months">Durée minimale (mois)</Label>
                  <Input
                    id="min_duration_months"
                    name="min_duration_months"
                    type="number"
                    value={formData.min_duration_months}
                    onChange={handleInputChange}
                    placeholder="Ex: 12"
                    className="mt-2"
                  />
                </div>
              </motion.div>
            )}

            {/* Étape 4: Équipements & Photos */}
            {step === 4 && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6 bg-white p-8 rounded-3xl shadow-lg border-2 border-gray-100">
                <h2 className="text-2xl font-bold text-[#212220] mb-6" style={{ fontFamily: 'Outfit' }}>
                  🛋️ Équipements
                </h2>

                <div className="grid grid-cols-2 gap-3">
                  {AMENITIES.map((amenity) => (
                    <button
                      key={amenity.id}
                      type="button"
                      onClick={() => handleAmenityToggle(amenity.id)}
                      className={`p-3 rounded-xl text-left font-medium transition-all border-2 ${
                        formData.amenities.includes(amenity.id)
                          ? 'bg-[#fec629] text-[#212220] border-[#212220]'
                          : 'bg-gray-50 text-gray-700 border-gray-200 hover:border-[#fec629]'
                      }`}
                    >
                      <span className="text-xl mr-2">{amenity.icon}</span>
                      {amenity.label}
                    </button>
                  ))}
                </div>

                <div className="border-t-2 pt-6">
                  <h3 className="text-xl font-bold text-[#212220] mb-4" style={{ fontFamily: 'Outfit' }}>
                    📸 Photos
                  </h3>

                  <label className="border-2 border-dashed border-[#fec629] rounded-xl p-6 text-center cursor-pointer hover:bg-[#fec629]/5 transition-all">
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handlePhotosChange}
                      className="hidden"
                    />
                    <p className="text-[#212220] font-medium">+ Ajouter des photos</p>
                    <p className="text-sm text-gray-600">Cliquez ou glissez vos images ici</p>
                  </label>

                  {formData.photos.length > 0 && (
                    <div className="grid grid-cols-3 gap-3 mt-4">
                      {formData.photos.map((photo, idx) => (
                        <div key={idx} className="relative">
                          <img src={photo} alt={`Photo ${idx + 1}`} className="w-full h-24 object-cover rounded-lg" />
                          <button
                            type="button"
                            onClick={() => removePhoto(idx)}
                            className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {/* Navigation Buttons */}
            <div className="flex gap-4 pt-6">
              <button
                type="button"
                onClick={prevStep}
                disabled={step === 1}
                className="flex-1 flex items-center justify-center gap-2 bg-white border-2 border-gray-300 hover:border-[#212220] text-[#212220] px-6 py-3 rounded-full font-bold disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                <ArrowLeft className="w-5 h-5" />
                Précédent
              </button>

              {step < 4 ? (
                <button
                  type="button"
                  onClick={nextStep}
                  className="flex-1 flex items-center justify-center gap-2 bg-[#fec629] hover:bg-[#212220] text-[#212220] hover:text-[#fec629] px-6 py-3 rounded-full font-bold transition-all"
                >
                  Suivant
                  <ArrowRight className="w-5 h-5" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleFinalSubmit}
                  disabled={loading}
                  className="flex-1 bg-[#fec629] hover:bg-[#212220] text-[#212220] hover:text-[#fec629] px-6 py-3 rounded-full font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Création en cours...' : 'Publier l\'annonce'}
                </button>
              )}
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
