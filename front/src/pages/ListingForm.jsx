import { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { createListing, getListing, updateListing, getCurrentUser } from '@/lib/api';
import { toast } from 'sonner';
import { ArrowLeft } from 'lucide-react';

export default function ListingForm() {
  const navigate = useNavigate();
  const { listingId } = useParams();
  const location = useLocation();
  const [user, setUser] = useState(location.state?.user || null);
  const [loading, setLoading] = useState(false);
  
  const [listing, setListing] = useState({
    listing_id: `listing_${Date.now()}`,
    landlord_id: '',
    title: '',
    address: {
      street: '',
      city: '',
      postal_code: ''
    },
    type: 'studio',
    surface: '',
    rooms: 1,
    furnished: true,
    rent: '',
    charges: '',
    deposit: '',
    available_from: '',
    photos: [],
    amenities: [],
    description: '',
    tenant_criteria: {},
    status: 'published',
    created_at: new Date().toISOString(),
    liked_by: []
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      if (!user) {
        const response = await getCurrentUser();
        setUser(response.data);
        setListing(prev => ({ ...prev, landlord_id: response.data.user_id }));
      } else {
        setListing(prev => ({ ...prev, landlord_id: user.user_id }));
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
      if (listingId) {
        await updateListing(listingId, listing);
        toast.success('Annonce mise à jour !');
      } else {
        await createListing(listing);
        toast.success('Annonce créée !');
      }
      navigate('/landlord/dashboard');
    } catch (error) {
      toast.error('Erreur lors de la sauvegarde');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
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
    </div>
  );
}
