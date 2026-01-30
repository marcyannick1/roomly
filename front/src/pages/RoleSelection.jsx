import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Home, Building2 } from 'lucide-react';

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
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="max-w-4xl w-full">
        <div className="text-center mb-12">
          <div className="flex justify-center mb-6">
            <img src="/logo.svg" alt="Roomly" className="w-20 h-20" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4" style={{ fontFamily: 'Outfit' }}>
            Vous êtes...
          </h1>
          <p className="text-lg text-muted-foreground">
            Sélectionnez votre profil pour personnaliser votre expérience
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Student Card */}
          <button
            onClick={() => selectRole('student')}
            data-testid="role-student-btn"
            className="group bg-card rounded-3xl p-8 border-2 border-border/50 hover:border-primary hover:shadow-xl transition-all duration-300 text-left"
          >
            <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
              <Home className="w-8 h-8 text-primary" strokeWidth={1.5} />
            </div>
            <h2 className="text-2xl font-bold text-foreground mb-3" style={{ fontFamily: 'Outfit' }}>
              Étudiant
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Je cherche un logement étudiant. Je veux découvrir des annonces et matcher avec des bailleurs.
            </p>
            <div className="flex items-center text-primary font-semibold group-hover:translate-x-2 transition-transform">
              Continuer
              <svg className="ml-2 w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </button>

          {/* Landlord Card */}
          <button
            onClick={() => selectRole('landlord')}
            data-testid="role-landlord-btn"
            className="group bg-card rounded-3xl p-8 border-2 border-border/50 hover:border-primary hover:shadow-xl transition-all duration-300 text-left"
          >
            <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
              <Building2 className="w-8 h-8 text-primary" strokeWidth={1.5} />
            </div>
            <h2 className="text-2xl font-bold text-foreground mb-3" style={{ fontFamily: 'Outfit' }}>
              Bailleur
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Je loue un ou plusieurs logements. Je veux créer des annonces et trouver des locataires.
            </p>
            <div className="flex items-center text-primary font-semibold group-hover:translate-x-2 transition-transform">
              Continuer
              <svg className="ml-2 w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}
