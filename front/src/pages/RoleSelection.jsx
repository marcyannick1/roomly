import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Home, Building2, GraduationCap, Key } from 'lucide-react';
import { motion } from 'framer-motion';

export default function RoleSelection() {
  const navigate = useNavigate();
  const location = useLocation();
  const user = location.state?.user;

  const selectRole = (role) => {
    if (role === 'student') {
      navigate('/student/onboarding', { state: { user } });
    } else {
      navigate('/landlord/onboarding', { state: { user } });
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

      <div className="relative z-10 max-w-5xl mx-auto px-4 py-16">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="flex items-center justify-center gap-3 mb-8">
            <img src="/images.png" alt="Roomly House" className="h-16 w-auto" />
            <img src="/image2.png" alt="Roomly" className="h-12 w-auto" />
          </div>
          <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-4" style={{ fontFamily: 'Outfit' }}>
            Bienvenue <span className="text-primary">{user?.name?.split(' ')[0] || ''}</span> 👋
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground">
            Quel type de compte souhaitez-vous créer ?
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Student Card */}
          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            whileHover={{ scale: 1.02, y: -5 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => selectRole('student')}
            data-testid="role-student-btn"
            className="group bg-card/80 backdrop-blur-xl rounded-3xl p-8 lg:p-10 border-2 border-border/50 hover:border-primary hover:shadow-2xl transition-all duration-300 text-left relative overflow-hidden"
          >
            {/* Gradient overlay on hover */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            
            <div className="relative z-10">
              <div className="w-20 h-20 bg-gradient-to-br from-primary/20 to-primary/10 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 shadow-lg">
                <GraduationCap className="w-10 h-10 text-primary" strokeWidth={1.5} />
              </div>
              <h2 className="text-3xl font-bold text-foreground mb-3" style={{ fontFamily: 'Outfit' }}>
                Étudiant 🎓
              </h2>
              <p className="text-muted-foreground leading-relaxed mb-6 text-base">
                Je cherche un logement pour mes études. Je veux découvrir des annonces et matcher avec des propriétaires.
              </p>
              <div className="flex items-center gap-2 text-primary font-semibold group-hover:translate-x-2 transition-transform">
                <span className="text-lg">Commencer</span>
                <motion.svg 
                  className="w-6 h-6" 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                  animate={{ x: [0, 5, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </motion.svg>
              </div>
            </div>
          </motion.button>

          {/* Landlord Card */}
          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            whileHover={{ scale: 1.02, y: -5 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => selectRole('landlord')}
            data-testid="role-landlord-btn"
            className="group bg-card/80 backdrop-blur-xl rounded-3xl p-8 lg:p-10 border-2 border-border/50 hover:border-primary hover:shadow-2xl transition-all duration-300 text-left relative overflow-hidden"
          >
            {/* Gradient overlay on hover */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            
            <div className="relative z-10">
              <div className="w-20 h-20 bg-gradient-to-br from-primary/20 to-primary/10 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 shadow-lg">
                <Building2 className="w-10 h-10 text-primary" strokeWidth={1.5} />
              </div>
              <h2 className="text-3xl font-bold text-foreground mb-3" style={{ fontFamily: 'Outfit' }}>
                Bailleur 🏢
              </h2>
              <p className="text-muted-foreground leading-relaxed mb-6 text-base">
                Je loue un ou plusieurs logements. Je veux publier des annonces et trouver des locataires fiables.
              </p>
              <div className="flex items-center gap-2 text-primary font-semibold group-hover:translate-x-2 transition-transform">
                <span className="text-lg">Commencer</span>
                <motion.svg 
                  className="w-6 h-6" 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                  animate={{ x: [0, 5, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </motion.svg>
              </div>
            </div>
          </motion.button>
        </div>
      </div>
    </div>
  );
}
