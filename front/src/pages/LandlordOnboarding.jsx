import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { getCurrentUser, updateLandlordProfile, uploadProfilePhoto } from '@/lib/api';
import { toast } from 'sonner';
import { Camera, Building2, Phone, Sparkles, Home, ShieldCheck } from 'lucide-react';
import { motion } from 'framer-motion';

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
      
      // Recharger l'utilisateur pour avoir les dernières données
      const { data } = await getCurrentUser();
      const updatedUser = data?.user || data;
      navigate('/dashboard', { state: { user: updatedUser } });
    } catch (error) {
      toast.error('Erreur lors de la sauvegarde');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 relative overflow-hidden">
      {/* Floating Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute w-96 h-96 rounded-full"
          style={{ 
            background: 'radial-gradient(circle, rgba(254, 198, 41, 0.15) 0%, transparent 70%)',
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
            background: 'radial-gradient(circle, rgba(78, 205, 196, 0.12) 0%, transparent 70%)',
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

      <div className="relative z-10 max-w-6xl mx-auto px-4 py-12">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          
          {/* Left Side - Branding & Info */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="hidden lg:block"
          >
            <div className="flex items-center gap-3 mb-8">
              <img src="/images.png" alt="Roomly House" className="h-16 w-auto" />
              <img src="/image2.png" alt="Roomly" className="h-12 w-auto" />
            </div>
            
            <h1 className="text-5xl font-bold text-foreground mb-6" style={{ fontFamily: 'Outfit' }}>
              Complétez
              <br />
              votre <span className="text-primary">profil</span> bailleur
            </h1>
            
            <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
              Finalisez votre inscription et commencez à publier vos annonces.
            </p>

            {/* Feature Pills */}
            <div className="space-y-4">
              {[
                { icon: Home, text: "Gérez vos annonces facilement" },
                { icon: Sparkles, text: "Trouvez des locataires fiables" },
                { icon: ShieldCheck, text: "Profil vérifié et sécurisé" }
              ].map((feature, index) => {
                const Icon = feature.icon;
                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: 0.3 + index * 0.1 }}
                    className="flex items-center gap-3 bg-card/50 backdrop-blur-sm rounded-2xl px-6 py-4 border border-border/50"
                  >
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                      <Icon className="w-5 h-5 text-primary" />
                    </div>
                    <span className="text-foreground font-medium">{feature.text}</span>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>

          {/* Right Side - Form */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            {/* Mobile Logo */}
            <div className="lg:hidden flex items-center justify-center gap-3 mb-8">
              <img src="/images.png" alt="Roomly House" className="h-12 w-auto" />
              <img src="/image2.png" alt="Roomly" className="h-9 w-auto" />
            </div>

            <div className="bg-card/80 backdrop-blur-xl rounded-3xl p-8 lg:p-10 shadow-2xl border border-border/50">
              <div className="text-center mb-8 lg:hidden">
                <h2 className="text-3xl font-bold text-foreground mb-3" style={{ fontFamily: 'Outfit' }}>
                  Profil bailleur 🏢
                </h2>
                <p className="text-muted-foreground">Dernière étape avant de commencer</p>
              </div>

              <div className="space-y-6">
                {/* Photo de profil */}
                <div className="flex flex-col items-center space-y-4">
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    className="relative"
                  >
                    <div className="w-32 h-32 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center overflow-hidden border-4 border-primary/30 shadow-lg">
                      {photoPreview ? (
                        <img src={photoPreview} alt="Preview" className="w-full h-full object-cover" />
                      ) : (
                        <Camera className="w-12 h-12 text-primary/60" />
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
                      className="absolute bottom-0 right-0 bg-primary rounded-full p-3 cursor-pointer hover:scale-110 transition-transform shadow-lg"
                    >
                      <Camera className="w-5 h-5 text-primary-foreground" />
                    </label>
                  </motion.div>
                  <p className="text-sm text-muted-foreground">Photo de profil (optionnelle)</p>
                </div>

                <div>
                  <Label className="text-sm font-medium mb-2 block">Téléphone</Label>
                  <div className="relative">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <Input
                      data-testid="phone-input"
                      type="tel"
                      value={profile.phone}
                      onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                      placeholder="06 12 34 56 78"
                      className="pl-12 h-14 rounded-2xl border-2 focus:border-primary transition-colors text-base"
                    />
                  </div>
                </div>

                <div>
                  <Label className="text-sm font-medium mb-2 block">Nom de l'entreprise</Label>
                  <div className="relative">
                    <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <Input
                      data-testid="company-name-input"
                      value={profile.company_name}
                      onChange={(e) => setProfile({ ...profile, company_name: e.target.value })}
                      placeholder="Immobilier XYZ (optionnel)"
                      className="pl-12 h-14 rounded-2xl border-2 focus:border-primary transition-colors text-base"
                    />
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">Si vous gérez plusieurs biens</p>
                </div>

                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Button
                    onClick={handleSubmit}
                    data-testid="landlord-onboarding-submit"
                    className="w-full h-14 rounded-2xl text-base font-semibold shadow-lg hover:shadow-xl transition-all mt-6"
                  >
                    🚀 Commencer l'aventure
                  </Button>
                </motion.div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
