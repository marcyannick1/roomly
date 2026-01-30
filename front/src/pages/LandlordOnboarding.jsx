import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { getCurrentUser, updateLandlordProfile, uploadProfilePhoto } from '@/lib/api';
import { toast } from 'sonner';
import { Camera } from 'lucide-react';

export default function LandlordOnboarding() {
  const navigate = useNavigate();
  const location = useLocation();
  const user = location.state?.user;
  
  const [profile, setProfile] = useState({
    user_id: user?.id ?? user?.user_id,
    phone: '',
    company_name: ''
  });
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);

  useEffect(() => {
    if (profile.user_id) return;

    const loadUser = async () => {
      try {
        const { data } = await getCurrentUser();
        const id = data?.user?.id ?? data?.id;
        if (id) {
          setProfile((prev) => ({ ...prev, user_id: id }));
        }
      } catch (error) {
        console.error('Erreur chargement utilisateur:', error);
      }
    };

    loadUser();
  }, [profile.user_id]);

  const handleSubmit = async () => {
    try {
      if (!profile.user_id) {
        toast.error("Utilisateur introuvable. Veuillez vous reconnecter.");
        return;
      }
      
      // Upload photo si fournie
      if (photoFile) {
        await uploadProfilePhoto(profile.user_id, photoFile);
      }
      
      await updateLandlordProfile(profile);
      toast.success('Profil complété !');
      navigate('/landlord/dashboard', { state: { user } });
    } catch (error) {
      toast.error('Erreur lors de la sauvegarde');
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="max-w-lg w-full">
        <div className="bg-card rounded-3xl p-8 shadow-lg border border-border/50">
          <h2 className="text-3xl font-bold text-foreground mb-6" style={{ fontFamily: 'Outfit' }}>
            Complétez votre profil bailleur
          </h2>
          
          <div className="space-y-6">
            {/* Photo de profil */}
            <div className="flex flex-col items-center space-y-4">
              <div className="relative">
                <div className="w-32 h-32 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden border-4 border-[#fec629]">
                  {photoPreview ? (
                    <img src={photoPreview} alt="Preview" className="w-full h-full object-cover" />
                  ) : (
                    <Camera className="w-12 h-12 text-gray-400" />
                  )}
                </div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      setPhotoFile(file);
                      setPhotoPreview(URL.createObjectURL(file));
                    }
                  }}
                  className="hidden"
                  id="photo-upload"
                />
                <label
                  htmlFor="photo-upload"
                  className="absolute bottom-0 right-0 bg-[#fec629] rounded-full p-2 cursor-pointer hover:bg-[#e5b525] transition-colors"
                >
                  <Camera className="w-5 h-5 text-[#212220]" />
                </label>
              </div>
              <p className="text-sm text-muted-foreground">Photo de profil (optionnelle)</p>
            </div>
            <div>
              <Label>Téléphone</Label>
              <Input
                data-testid="phone-input"
                type="tel"
                value={profile.phone}
                onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                placeholder="06 12 34 56 78"
                className="mt-2 h-12 rounded-xl"
              />
            </div>

            <div>
              <Label>Nom de l'entreprise (optionnel)</Label>
              <Input
                data-testid="company-name-input"
                value={profile.company_name}
                onChange={(e) => setProfile({ ...profile, company_name: e.target.value })}
                placeholder="Immobilier XYZ"
                className="mt-2 h-12 rounded-xl"
              />
            </div>

            <Button
              onClick={handleSubmit}
              data-testid="landlord-onboarding-submit"
              className="w-full h-12 rounded-full"
            >
              Commencer
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
