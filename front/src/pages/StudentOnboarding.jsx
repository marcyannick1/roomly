import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { getCurrentUser, updateStudentProfile, uploadProfilePhoto } from '@/lib/api';
import { toast } from 'sonner';
import { Progress } from '@/components/ui/progress';
import { Camera, User, GraduationCap, Wallet, Home, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

export default function StudentOnboarding() {
  const navigate = useNavigate();
  const location = useLocation();
  const user = location.state?.user;
  
  const [step, setStep] = useState(1);
  const [profile, setProfile] = useState({
    user_id: user?.id ?? user?.user_id,
    first_name: user?.name?.split(' ')[0] || '',
    last_name: user?.name?.split(' ').slice(1).join(' ') || '',
    birthdate: '',
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
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);

  // Calculer l'âge à partir de la date de naissance
  const calculateAge = (birthdate) => {
    if (!birthdate) return '';
    const today = new Date();
    const birth = new Date(birthdate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  };

  useEffect(() => {
    if (profile.user_id) return;

    const loadUser = async () => {
      try {
        const { data } = await getCurrentUser();
        const id = data?.user?.id;
        if (id) {
          setProfile((prev) => ({ ...prev, user_id: id }));
        }
      } catch (error) {
        console.error('Erreur chargement utilisateur:', error);
      }
    };

    loadUser();
  }, [profile.user_id]);

  const handleNext = () => {
    if (step < 4) setStep(step + 1);
    else handleSubmit();
  };

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

      // Transformer les données au format API attendu
      const studentData = {
        user_id: profile.user_id,
        room_type: profile.preferences?.type || 'studio',
        furnished: profile.preferences?.furnished || false,
        smoking: profile.lifestyle?.smoking === 'yes',
        pets: profile.lifestyle?.pets === 'yes',
        noise_level: profile.lifestyle?.noise_level || 5,
        max_budget: parseFloat(profile.budget) || 0,
        guarantor_income: parseFloat(profile.guarantor_income) || 0,
        university: profile.university || '',
        study_level: profile.education_level || '',
        passions: '',
      };
      
      await updateStudentProfile(studentData);
      toast.success('Profil complété !');
      navigate('/dashboard', { state: { user } });
    } catch (error) {
      console.error('Erreur:', error);
      toast.error('Erreur lors de la sauvegarde');
    }
  };

  const progress = (step / 4) * 100;

  const stepTitles = [
    { icon: User, title: "Informations personnelles", subtitle: "Parlez-nous de vous" },
    { icon: Wallet, title: "Budget & Solvabilité", subtitle: "Définissez vos capacités" },
    { icon: Sparkles, title: "Mode de vie", subtitle: "Vos habitudes au quotidien" },
    { icon: Home, title: "Préférences de logement", subtitle: "Votre logement idéal" }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 relative overflow-hidden">
      {/* Floating Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute w-96 h-96 rounded-full"
          style={{ 
            background: 'radial-gradient(circle, rgba(67, 67, 54, 0.08) 0%, transparent 70%)',
            top: '-10%',
            right: '-5%'
          }}
          animate={{
            y: [0, -30, 0],
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div
          className="absolute w-96 h-96 rounded-full"
          style={{ 
            background: 'radial-gradient(circle, rgba(78, 205, 196, 0.08) 0%, transparent 70%)',
            bottom: '-10%',
            left: '-5%'
          }}
          animate={{
            y: [0, 40, 0],
            scale: [1, 1.15, 1],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      </div>

      <div className="relative z-10 max-w-3xl mx-auto px-4 py-12">
        {/* Header with Logos */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-center gap-3 mb-8"
        >
          <img src="/images.png" alt="Roomly House" className="h-12 w-auto" />
          <img src="/image2.png" alt="Roomly" className="h-9 w-auto" />
        </motion.div>

        {/* Progress Section */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mb-8"
        >
          <div className="bg-card/80 backdrop-blur-xl rounded-2xl p-6 shadow-xl border border-border/50">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                {React.createElement(stepTitles[step - 1].icon, { className: "w-7 h-7 text-primary" })}
                <div>
                  <h3 className="font-bold text-lg text-foreground">{stepTitles[step - 1].title}</h3>
                  <p className="text-sm text-muted-foreground font-medium">{stepTitles[step - 1].subtitle}</p>
                </div>
              </div>
              <span className="text-base font-bold text-foreground bg-muted px-3 py-1 rounded-full">Étape {step}/4</span>
            </div>
            <Progress value={progress} className="h-2" data-testid="onboarding-progress" />
          </div>
        </motion.div>

        {/* Main Form Card */}
        <motion.div
          key={step}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
          className="bg-card/80 backdrop-blur-xl rounded-3xl p-8 lg:p-10 shadow-2xl border border-border/50"
        >
          {step === 1 && (
            <div className="space-y-6" data-testid="onboarding-step-1">
              {/* Photo de profil */}
              <div className="flex flex-col items-center space-y-4 mb-8">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className="relative"
                >
                  <div className="w-32 h-32 rounded-full bg-gradient-to-br from-muted/50 to-muted/10 flex items-center justify-center overflow-hidden border-4 border-border shadow-lg">
                    {photoPreview ? (
                      <img src={photoPreview} alt="Preview" className="w-full h-full object-cover" />
                    ) : (
                      <Camera className="w-12 h-12 text-muted-foreground" />
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
                    className="absolute bottom-0 right-0 bg-[#434336] rounded-full p-3 cursor-pointer hover:scale-110 transition-transform shadow-lg"
                  >
                    <Camera className="w-5 h-5 text-white" />
                  </label>
                </motion.div>
                <p className="text-sm text-muted-foreground">Photo de profil (optionnelle)</p>
              </div>
              
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-base font-semibold mb-3 block text-foreground">Prénom</Label>
                  <Input
                    data-testid="first-name-input"
                    value={profile.first_name}
                    onChange={(e) => setProfile({ ...profile, first_name: e.target.value })}
                    placeholder="Jean"
                    className="h-14 rounded-2xl border-2 focus:border-foreground transition-colors text-base font-medium"
                  />
                </div>
                <div>
                  <Label className="text-base font-semibold mb-3 block text-foreground">Nom</Label>
                  <Input
                    data-testid="last-name-input"
                    value={profile.last_name}
                    onChange={(e) => setProfile({ ...profile, last_name: e.target.value })}
                    placeholder="Dupont"
                    className="h-14 rounded-2xl border-2 focus:border-foreground transition-colors text-base font-medium"
                  />
                </div>
              </div>

              <div>
                <Label className="text-base font-semibold mb-3 block text-foreground">🎂 Date de naissance</Label>
                <Input
                  data-testid="birthdate-input"
                  type="date"
                  value={profile.birthdate}
                  max={new Date().toISOString().split('T')[0]}
                  min={new Date(new Date().setFullYear(new Date().getFullYear() - 100)).toISOString().split('T')[0]}
                  onChange={(e) => {
                    const birthdate = e.target.value;
                    const age = calculateAge(birthdate);
                    setProfile({ ...profile, birthdate, age });
                  }}
                  className="h-14 rounded-2xl border-2 focus:border-foreground transition-colors text-base font-medium"
                />
                {profile.age && (
                  <motion.p
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-sm text-foreground mt-2 font-medium"
                  >
                    🎂 Vous avez {profile.age} ans
                  </motion.p>
                )}
              </div>

              <div>
                <Label className="text-base font-semibold mb-3 block text-foreground">🎓 Université</Label>
                <Input
                  data-testid="university-input"
                  value={profile.university}
                  onChange={(e) => setProfile({ ...profile, university: e.target.value })}
                  placeholder="Université Paris-Saclay"
                  className="h-14 rounded-2xl border-2 focus:border-foreground transition-colors text-base font-medium"
                />
              </div>

              <div>
                <Label className="text-base font-semibold mb-3 block text-foreground">📚 Niveau d'études</Label>
                <select
                  data-testid="education-level-input"
                  value={profile.education_level}
                  onChange={(e) => setProfile({ ...profile, education_level: e.target.value })}
                  className="w-full h-14 rounded-2xl border-2 border-input focus:border-foreground bg-background px-4 text-base transition-colors text-foreground font-medium"
                >
                  <option value="" className="text-muted-foreground">Sélectionnez votre niveau</option>
                  <option value="Bac">Bac</option>
                  <option value="Bac+1">Bac+1</option>
                  <option value="BTS">BTS (Bac+2)</option>
                  <option value="DUT/BUT">DUT/BUT (Bac+2)</option>
                  <option value="Licence 1">Licence 1 (Bac+1)</option>
                  <option value="Licence 2">Licence 2 (Bac+2)</option>
                  <option value="Licence 3">Licence 3 (Bac+3)</option>
                  <option value="Bachelor">Bachelor (Bac+3)</option>
                  <option value="Master 1">Master 1 (Bac+4)</option>
                  <option value="Master 2">Master 2 (Bac+5)</option>
                  <option value="MBA">MBA</option>
                  <option value="Doctorat">Doctorat (Bac+8)</option>
                  <option value="Autre">Autre</option>
                </select>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6" data-testid="onboarding-step-2">
              <div>
                <Label className="text-base font-semibold mb-3 block text-foreground">💰 Budget mensuel maximum</Label>
                <select
                  data-testid="budget-input"
                  value={profile.budget}
                  onChange={(e) => setProfile({ ...profile, budget: e.target.value })}
                  className="w-full h-14 rounded-2xl border-2 border-input focus:border-foreground bg-background px-4 text-base transition-colors text-foreground font-medium"
                >
                  <option value="" className="text-muted-foreground">Sélectionnez votre budget</option>
                  <option value="300-400">300€ - 400€</option>
                  <option value="400-500">400€ - 500€</option>
                  <option value="500-600">500€ - 600€</option>
                  <option value="600-700">600€ - 700€</option>
                  <option value="700-800">700€ - 800€</option>
                  <option value="800-1000">800€ - 1000€</option>
                  <option value="1000-1200">1000€ - 1200€</option>
                  <option value="1200-1500">1200€ - 1500€</option>
                  <option value="1500+">Plus de 1500€</option>
                </select>
                <p className="text-sm text-muted-foreground mt-2 font-medium">💡 Loyer charges comprises</p>
              </div>

              <div>
                <Label className="text-base font-semibold mb-3 block text-foreground">📊 Revenus du garant (net mensuel)</Label>
                <select
                  data-testid="guarantor-income-input"
                  value={profile.guarantor_income}
                  onChange={(e) => setProfile({ ...profile, guarantor_income: e.target.value })}
                  className="w-full h-14 rounded-2xl border-2 border-input focus:border-foreground bg-background px-4 text-base transition-colors text-foreground font-medium"
                >
                  <option value="" className="text-muted-foreground">Sélectionnez la tranche</option>
                  <option value="moins-1500">Moins de 1500€</option>
                  <option value="1500-2000">1500€ - 2000€</option>
                  <option value="2000-2500">2000€ - 2500€</option>
                  <option value="2500-3000">2500€ - 3000€</option>
                  <option value="3000-4000">3000€ - 4000€</option>
                  <option value="4000-5000">4000€ - 5000€</option>
                  <option value="5000+">Plus de 5000€</option>
                </select>
                <p className="text-sm text-muted-foreground mt-2 font-medium">💡 Revenus mensuels nets de votre garant (parents, tuteur...)</p>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6" data-testid="onboarding-step-3">
              <div>
                <Label className="text-base font-semibold mb-3 block text-foreground">🚭 Fumeur ?</Label>
                <select
                  data-testid="smoking-select"
                  value={profile.lifestyle.smoking}
                  onChange={(e) => setProfile({
                    ...profile,
                    lifestyle: { ...profile.lifestyle, smoking: e.target.value }
                  })}
                  className="w-full h-14 rounded-2xl border-2 border-input focus:border-foreground bg-background px-4 text-base transition-colors text-foreground font-medium"
                >
                  <option value="no">Non, je ne fume pas</option>
                  <option value="yes">Oui, je fume</option>
                </select>
              </div>

              <div>
                <Label className="text-base font-semibold mb-3 block text-foreground">🐾 Avez-vous des animaux ?</Label>
                <select
                  data-testid="pets-select"
                  value={profile.lifestyle.pets}
                  onChange={(e) => setProfile({
                    ...profile,
                    lifestyle: { ...profile.lifestyle, pets: e.target.value }
                  })}
                  className="w-full h-14 rounded-2xl border-2 border-input focus:border-foreground bg-background px-4 text-base transition-colors text-foreground font-medium"
                >
                  <option value="no">Non, pas d'animaux</option>
                  <option value="yes">Oui, j'ai un animal</option>
                </select>
              </div>

              <div>
                <Label className="text-base font-semibold mb-3 flex items-center justify-between text-foreground">
                  <span>🔊 Niveau de bruit toléré</span>
                  <span className="text-foreground font-bold text-xl">{profile.lifestyle.noise_level}/10</span>
                </Label>
                <input
                  data-testid="noise-level-input"
                  type="range"
                  min="1"
                  max="10"
                  value={profile.lifestyle.noise_level}
                  onChange={(e) => setProfile({
                    ...profile,
                    lifestyle: { ...profile.lifestyle, noise_level: parseInt(e.target.value) }
                  })}
                  className="w-full h-3 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#434336]"
                />
                <div className="flex justify-between text-sm text-foreground font-medium mt-3">
                  <span>🤫 Très calme</span>
                  <span>🎉 Ambiance festive</span>
                </div>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-6" data-testid="onboarding-step-4">
              <div>
                <Label className="text-base font-semibold mb-3 block text-foreground">🏠 Type de logement recherché</Label>
                <select
                  data-testid="type-select"
                  value={profile.preferences.type}
                  onChange={(e) => setProfile({
                    ...profile,
                    preferences: { ...profile.preferences, type: e.target.value }
                  })}
                  className="w-full h-14 rounded-2xl border-2 border-input focus:border-foreground bg-background px-4 text-base transition-colors text-foreground font-medium"
                >
                  <option value="" className="text-muted-foreground">Sélectionnez un type</option>
                  <option value="studio">Studio (tout en un)</option>
                  <option value="t1">T1 (1 pièce + cuisine séparée)</option>
                  <option value="t2">T2 (2 pièces)</option>
                  <option value="t3">T3 (3 pièces)</option>
                  <option value="colocation">Colocation</option>
                  <option value="chambre">Chambre chez l'habitant</option>
                </select>
              </div>

              <div>
                <Label className="text-base font-semibold mb-3 block text-foreground">🛋️ Préférence d'ameublement</Label>
                <select
                  data-testid="furnished-select"
                  value={profile.preferences.furnished}
                  onChange={(e) => setProfile({
                    ...profile,
                    preferences: { ...profile.preferences, furnished: e.target.value === 'true' }
                  })}
                  className="w-full h-14 rounded-2xl border-2 border-input focus:border-foreground bg-background px-4 text-base transition-colors text-foreground font-medium"
                >
                  <option value="true">Meublé (prêt à emménager)</option>
                  <option value="false">Non meublé (j'ai mes meubles)</option>
                </select>
              </div>
            </div>
          )}

          <div className="flex justify-between mt-10 pt-6 border-t border-border/50">
            {step > 1 && (
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Button
                  variant="outline"
                  onClick={() => setStep(step - 1)}
                  data-testid="onboarding-prev-btn"
                  className="h-14 rounded-2xl px-8 border-2 text-base font-bold bg-background hover:bg-muted text-foreground"
                >
                  ← Précédent
                </Button>
              </motion.div>
            )}
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="ml-auto">
              <Button
                onClick={handleNext}
                data-testid="onboarding-next-btn"
                className="h-14 rounded-2xl px-10 text-base font-bold shadow-lg hover:shadow-xl transition-all bg-[#434336] hover:bg-[#434336]/90 text-white"
              >
                {step === 4 ? '🎉 Terminer' : 'Suivant →'}
              </Button>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
