import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { updateLandlordProfile } from '@/lib/api';
import { toast } from 'sonner';

export default function LandlordOnboarding() {
  const navigate = useNavigate();
  const location = useLocation();
  const user = location.state?.user;
  
  const [profile, setProfile] = useState({
    user_id: user?.user_id,
    phone: '',
    company_name: ''
  });

  const handleSubmit = async () => {
    try {
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
