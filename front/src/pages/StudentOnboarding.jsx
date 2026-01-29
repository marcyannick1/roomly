import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { updateStudentProfile } from '@/lib/api';
import { toast } from 'sonner';
import { Progress } from '@/components/ui/progress';

export default function StudentOnboarding() {
  const navigate = useNavigate();
  const location = useLocation();
  const user = location.state?.user;
  
  const [step, setStep] = useState(1);
  const [profile, setProfile] = useState({
    user_id: user?.user_id,
    first_name: '',
    last_name: '',
    age: '',
    university: '',
    education_level: '',
    budget: '',
    guarantor_type: 'parents',
    guarantor_income: '',
    lifestyle: {
      smoking: 'no',
      pets: 'no',
      noise_level: 5,
    },
    preferences: {
      type: 'studio',
      furnished: true,
      amenities: []
    },
    documents: [],
    completed: false
  });

  const handleNext = () => {
    if (step < 4) setStep(step + 1);
    else handleSubmit();
  };

  const handleSubmit = async () => {
    try {
      await updateStudentProfile({ ...profile, completed: true });
      toast.success('Profil complété !');
      navigate('/student/dashboard', { state: { user } });
    } catch (error) {
      toast.error('Erreur lors de la sauvegarde');
    }
  };

  const progress = (step / 4) * 100;

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="max-w-2xl mx-auto px-4">
        <div className="mb-8">
          <Progress value={progress} className="h-2" data-testid="onboarding-progress" />
          <p className="text-sm text-muted-foreground mt-2">Étape {step} sur 4</p>
        </div>

        <div className="bg-card rounded-3xl p-8 shadow-lg border border-border/50">
          {step === 1 && (
            <div className="space-y-6" data-testid="onboarding-step-1">
              <h2 className="text-3xl font-bold text-foreground" style={{ fontFamily: 'Outfit' }}>
                Informations personnelles
              </h2>
              
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label>Prénom</Label>
                  <Input
                    data-testid="first-name-input"
                    value={profile.first_name}
                    onChange={(e) => setProfile({ ...profile, first_name: e.target.value })}
                    placeholder="Jean"
                    className="mt-2 h-12 rounded-xl"
                  />
                </div>
                <div>
                  <Label>Nom</Label>
                  <Input
                    data-testid="last-name-input"
                    value={profile.last_name}
                    onChange={(e) => setProfile({ ...profile, last_name: e.target.value })}
                    placeholder="Dupont"
                    className="mt-2 h-12 rounded-xl"
                  />
                </div>
              </div>

              <div>
                <Label>Âge</Label>
                <Input
                  data-testid="age-input"
                  type="number"
                  value={profile.age}
                  onChange={(e) => setProfile({ ...profile, age: parseInt(e.target.value) })}
                  placeholder="20"
                  className="mt-2 h-12 rounded-xl"
                />
              </div>

              <div>
                <Label>Université</Label>
                <Input
                  data-testid="university-input"
                  value={profile.university}
                  onChange={(e) => setProfile({ ...profile, university: e.target.value })}
                  placeholder="Université Paris-Saclay"
                  className="mt-2 h-12 rounded-xl"
                />
              </div>

              <div>
                <Label>Niveau d'études</Label>
                <Input
                  data-testid="education-level-input"
                  value={profile.education_level}
                  onChange={(e) => setProfile({ ...profile, education_level: e.target.value })}
                  placeholder="Master 1"
                  className="mt-2 h-12 rounded-xl"
                />
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6" data-testid="onboarding-step-2">
              <h2 className="text-3xl font-bold text-foreground" style={{ fontFamily: 'Outfit' }}>
                Budget & Solvabilité
              </h2>
              
              <div>
                <Label>Budget mensuel maximum (€)</Label>
                <Input
                  data-testid="budget-input"
                  type="number"
                  value={profile.budget}
                  onChange={(e) => setProfile({ ...profile, budget: parseInt(e.target.value) })}
                  placeholder="600"
                  className="mt-2 h-12 rounded-xl"
                />
              </div>

              <div>
                <Label>Revenus du garant (€/mois)</Label>
                <Input
                  data-testid="guarantor-income-input"
                  type="number"
                  value={profile.guarantor_income}
                  onChange={(e) => setProfile({ ...profile, guarantor_income: parseInt(e.target.value) })}
                  placeholder="2500"
                  className="mt-2 h-12 rounded-xl"
                />
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6" data-testid="onboarding-step-3">
              <h2 className="text-3xl font-bold text-foreground" style={{ fontFamily: 'Outfit' }}>
                Mode de vie
              </h2>
              
              <div>
                <Label>Fumeur ?</Label>
                <select
                  data-testid="smoking-select"
                  value={profile.lifestyle.smoking}
                  onChange={(e) => setProfile({
                    ...profile,
                    lifestyle: { ...profile.lifestyle, smoking: e.target.value }
                  })}
                  className="mt-2 w-full h-12 rounded-xl border border-input bg-background px-3"
                >
                  <option value="no">Non</option>
                  <option value="yes">Oui</option>
                </select>
              </div>

              <div>
                <Label>Animaux ?</Label>
                <select
                  data-testid="pets-select"
                  value={profile.lifestyle.pets}
                  onChange={(e) => setProfile({
                    ...profile,
                    lifestyle: { ...profile.lifestyle, pets: e.target.value }
                  })}
                  className="mt-2 w-full h-12 rounded-xl border border-input bg-background px-3"
                >
                  <option value="no">Non</option>
                  <option value="yes">Oui</option>
                </select>
              </div>

              <div>
                <Label>Niveau de bruit toléré (1-10)</Label>
                <Input
                  data-testid="noise-level-input"
                  type="number"
                  min="1"
                  max="10"
                  value={profile.lifestyle.noise_level}
                  onChange={(e) => setProfile({
                    ...profile,
                    lifestyle: { ...profile.lifestyle, noise_level: parseInt(e.target.value) }
                  })}
                  className="mt-2 h-12 rounded-xl"
                />
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-6" data-testid="onboarding-step-4">
              <h2 className="text-3xl font-bold text-foreground" style={{ fontFamily: 'Outfit' }}>
                Préférences de logement
              </h2>
              
              <div>
                <Label>Type recherché</Label>
                <select
                  data-testid="type-select"
                  value={profile.preferences.type}
                  onChange={(e) => setProfile({
                    ...profile,
                    preferences: { ...profile.preferences, type: e.target.value }
                  })}
                  className="mt-2 w-full h-12 rounded-xl border border-input bg-background px-3"
                >
                  <option value="studio">Studio</option>
                  <option value="t1">T1</option>
                  <option value="t2">T2</option>
                  <option value="colocation">Colocation</option>
                </select>
              </div>

              <div>
                <Label>Meublé ?</Label>
                <select
                  data-testid="furnished-select"
                  value={profile.preferences.furnished}
                  onChange={(e) => setProfile({
                    ...profile,
                    preferences: { ...profile.preferences, furnished: e.target.value === 'true' }
                  })}
                  className="mt-2 w-full h-12 rounded-xl border border-input bg-background px-3"
                >
                  <option value="true">Oui</option>
                  <option value="false">Non</option>
                </select>
              </div>
            </div>
          )}

          <div className="flex justify-between mt-8">
            {step > 1 && (
              <Button
                variant="outline"
                onClick={() => setStep(step - 1)}
                data-testid="onboarding-prev-btn"
                className="rounded-full px-8"
              >
                Précédent
              </Button>
            )}
            <Button
              onClick={handleNext}
              data-testid="onboarding-next-btn"
              className="rounded-full px-8 ml-auto"
            >
              {step === 4 ? 'Terminer' : 'Suivant'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
