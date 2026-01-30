import { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { createListing, getListing, updateListing, getCurrentUser } from '@/lib/api';
import { toast } from 'sonner';
import { ArrowLeft, ImagePlus, X, Home, Eye, LogOut, User, Flame, Settings, Plus } from 'lucide-react';
import { motion } from 'framer-motion';

export default function ListingForm() {
  const navigate = useNavigate();
  const { listingId } = useParams();
  const location = useLocation();
  const [user, setUser] = useState(location.state?.user || null);
  const [loading, setLoading] = useState(false);
  
  const [listing, setListing] = useState({
    listing_id: `listing_${Date.now()}`,
    landlord_id: null,
    title: '',
    address: {
      street: '',
      city: '',
      postal_code: ''
    },
    type: 'studio',
    surface: 0,
    rooms: 1,
    furnished: true,
    rent: 0,
    charges: 0,
    deposit: 0,
    available_from: null,
    photos: [],
    photoFiles: [],
    amenities: [],
    description: '',
    tenant_criteria: {},
    status: 'published',
    wifi: false,
    workspace: false,
    parking: false,
    pets: false,
    tv: false,
    elevator: false,
    washing_machine: false,
    dryer: false,
    ac: false,
    kitchen: false,
    garden: false,
    balcony: false
  });

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
      if (!user) {
        const response = await getCurrentUser();
        const userData = response.data.user || response.data;
        setUser(userData);
        setListing(prev => ({ ...prev, landlord_id: userData.id }));
      } else {
        setListing(prev => ({ ...prev, landlord_id: user.id }));
      }

      if (listingId) {
        const response = await getListing(listingId);
        setListing(response.data);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Préparer les données pour l'API
      const submissionData = {
        ...listing,
        rent: listing.rent,
        type: listing.type,
        furnished: listing.furnished === true || listing.furnished === 'true',
        surface: parseInt(listing.surface) || 0,
        rooms: parseInt(listing.rooms) || 1,
        charges: parseFloat(listing.charges) || 0,
        deposit: parseFloat(listing.deposit) || 0
      };

      if (listingId) {
        // Mode édition : passer les photoFiles
        await updateListing(listingId, submissionData);
        toast.success('Annonce mise à jour !');
      } else {
        // Mode création
        await createListing(submissionData);
        toast.success('Annonce créée !');
      }
      navigate('/landlord/dashboard');
    } catch (error) {
      toast.error('Erreur lors de la sauvegarde');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const navItems = [
    { id: 'listings', icon: Home, label: 'Mes annonces', path: '/landlord/dashboard' },
    { id: 'students', icon: Eye, label: 'Intéressés', path: '/landlord/dashboard' },
    { id: 'create', icon: Plus, label: 'Créer une annonce', path: '/landlord/listing/new' },
    { id: 'profile', icon: User, label: 'Profil', path: null },
    { id: 'settings', icon: Settings, label: 'Paramètres', path: null },
  ];

  const handlePhotosChange = async (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    try {
      const base64Images = await Promise.all(
        files.map(
          (file) =>
            new Promise((resolve, reject) => {
              const reader = new FileReader();
              reader.onload = () => resolve(reader.result);
              reader.onerror = reject;
              reader.readAsDataURL(file);
            })
        )
      );

      setListing((prev) => ({
        ...prev,
        photos: [...(prev.photos || []), ...base64Images],
        photoFiles: [...(prev.photoFiles || []), ...files]
      }));
    } catch (error) {
      toast.error('Erreur lors du chargement des images');
    }
  };

  const removePhoto = (index) => {
    setListing((prev) => ({
      ...prev,
      photos: prev.photos.filter((_, i) => i !== index),
      photoFiles: prev.photoFiles.filter((_, i) => i !== index)
    }));
  };

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

          <div className="bg-black/5 rounded-2xl p-4 border border-black/10">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-[#212220] rounded-full flex items-center justify-center font-bold text-lg shadow-lg text-[#fec629]">
                {user?.name?.charAt(0).toUpperCase() || 'U'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-[#212220] truncate">{user?.name || 'Utilisateur'}</p>
                <p className="text-xs text-[#212220]/70 truncate">{user?.email || ''}</p>
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
                    if (item.path) {
                      navigate(item.path);
                    } else if (item.id === 'profile' && user?.id) {
                      navigate(`/profile/${user.id}`);
                    } else if (item.id === 'students') {
                      navigate('/landlord/dashboard');
                    } else if (item.id === 'settings') {
                      toast.info('Paramètres en cours de développement');
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
                      layoutId="activeNavListingForm"
                      className="absolute inset-0 bg-[#212220] rounded-xl -z-10"
                      transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                    />
                  )}
                </button>
              );
            })}
          </div>
        </nav>

        <div className="p-4 border-t border-black/10">
          <button
            onClick={() => {
              document.cookie = 'session_token=; path=/; max-age=0';
              navigate('/');
            }}
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
      <div className="max-w-3xl mx-auto px-4 py-8">
        <Button
          variant="ghost"
          onClick={() => navigate('/landlord/dashboard')}
          data-testid="back-to-dashboard"
          className="mb-6 rounded-full"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Retour
        </Button>

        <h1 className="text-4xl font-bold text-foreground mb-8" style={{ fontFamily: 'Outfit' }}>
          {listingId ? 'Modifier l\'annonce' : 'Créer une annonce'}
        </h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-card rounded-3xl p-8 shadow-lg border border-border/50 space-y-6">
            <div>
              <Label>Titre de l'annonce</Label>
              <Input
                data-testid="listing-title-input"
                value={listing.title}
                onChange={(e) => setListing({ ...listing, title: e.target.value })}
                placeholder="Studio lumineux proche université"
                className="mt-2 h-12 rounded-xl"
                required
              />
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label>Type de logement</Label>
                <select
                  data-testid="listing-type-select"
                  value={listing.type}
                  onChange={(e) => setListing({ ...listing, type: e.target.value })}
                  className="mt-2 w-full h-12 rounded-xl border border-input bg-background px-3"
                >
                  <option value="studio">Studio</option>
                  <option value="t1">T1</option>
                  <option value="t2">T2</option>
                  <option value="colocation">Colocation</option>
                </select>
              </div>

              <div>
                <Label>Surface (m²)</Label>
                <Input
                  data-testid="listing-surface-input"
                  type="number"
                  value={listing.surface}
                  onChange={(e) => setListing({ ...listing, surface: parseInt(e.target.value) })}
                  placeholder="25"
                  className="mt-2 h-12 rounded-xl"
                  required
                />
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <Label>Loyer (€)</Label>
                <Input
                  data-testid="listing-rent-input"
                  type="number"
                  value={listing.rent}
                  onChange={(e) => setListing({ ...listing, rent: parseInt(e.target.value) })}
                  placeholder="500"
                  className="mt-2 h-12 rounded-xl"
                  required
                />
              </div>

              <div>
                <Label>Charges (€)</Label>
                <Input
                  data-testid="listing-charges-input"
                  type="number"
                  value={listing.charges}
                  onChange={(e) => setListing({ ...listing, charges: parseInt(e.target.value) })}
                  placeholder="50"
                  className="mt-2 h-12 rounded-xl"
                  required
                />
              </div>

              <div>
                <Label>Dépôt de garantie (€)</Label>
                <Input
                  data-testid="listing-deposit-input"
                  type="number"
                  value={listing.deposit}
                  onChange={(e) => setListing({ ...listing, deposit: parseInt(e.target.value) })}
                  placeholder="500"
                  className="mt-2 h-12 rounded-xl"
                  required
                />
              </div>
            </div>

            <div>
              <Label>Ville</Label>
              <Input
                data-testid="listing-city-input"
                value={listing.address.city}
                onChange={(e) => setListing({
                  ...listing,
                  address: { ...listing.address, city: e.target.value }
                })}
                placeholder="Paris"
                className="mt-2 h-12 rounded-xl"
                required
              />
            </div>

            <div>
              <Label>Description</Label>
              <Textarea
                data-testid="listing-description-input"
                value={listing.description}
                onChange={(e) => setListing({ ...listing, description: e.target.value })}
                placeholder="Décrivez votre logement..."
                className="mt-2 rounded-xl min-h-32"
                required
              />
            </div>

            <div>
              <Label>Photos du logement</Label>
              <div className="mt-3 rounded-2xl border border-dashed border-border/60 p-6 bg-muted/30">
                <div className="flex items-center gap-3 mb-4">
                  <div className="h-10 w-10 rounded-xl bg-background flex items-center justify-center shadow-sm">
                    <ImagePlus className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">Ajoute des photos attractives</p>
                    <p className="text-xs text-muted-foreground">PNG, JPG — plusieurs images possibles</p>
                  </div>
                </div>
                <Input
                  data-testid="listing-photos-input"
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handlePhotosChange}
                  className="h-12 rounded-xl bg-background"
                />
              </div>

              {listing.photos?.length > 0 && (
                <div className="mt-4 grid grid-cols-2 md:grid-cols-3 gap-4">
                  {listing.photos.map((photo, index) => (
                    <div
                      key={`${photo}-${index}`}
                      className="relative rounded-2xl overflow-hidden border border-border/50 shadow-sm"
                    >
                      <img
                        src={photo}
                        alt={`Photo ${index + 1}`}
                        className="h-32 w-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => removePhoto(index)}
                        className="absolute top-2 right-2 rounded-full bg-background/80 backdrop-blur p-1 shadow"
                        aria-label="Supprimer la photo"
                      >
                        <X className="h-4 w-4 text-foreground" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div>
              <Label>Meublé ?</Label>
              <select
                data-testid="listing-furnished-select"
                value={listing.furnished}
                onChange={(e) => setListing({ ...listing, furnished: e.target.value === 'true' })}
                className="mt-2 w-full h-12 rounded-xl border border-input bg-background px-3"
              >
                <option value="true">Oui</option>
                <option value="false">Non</option>
              </select>
            </div>

            <Button
              type="submit"
              data-testid="listing-submit-btn"
              className="w-full h-12 rounded-full"
              disabled={loading}
            >
              {loading ? 'Sauvegarde...' : listingId ? 'Mettre à jour' : 'Créer l\'annonce'}
            </Button>
          </div>
        </form>
      </div>
      </main>
    </div>
  );
}
