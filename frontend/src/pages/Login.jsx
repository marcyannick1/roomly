import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { login } from '@/lib/api';
import { toast } from 'sonner';
import { Mail, Lock, ArrowLeft } from 'lucide-react';

export default function Login() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await login(formData);
      const { user, session_token } = response.data;
      
      // Store session token
      document.cookie = `session_token=${session_token}; path=/; max-age=${7 * 24 * 60 * 60}; secure; samesite=none`;
      
      toast.success('Connexion réussie !');
      
      // Redirect based on user type
      if (user.user_type === 'student') {
        navigate('/student/dashboard', { state: { user } });
      } else {
        navigate('/landlord/dashboard', { state: { user } });
      }
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Erreur de connexion');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    // REMINDER: DO NOT HARDCODE THE URL, OR ADD ANY FALLBACKS OR REDIRECT URLS, THIS BREAKS THE AUTH
    const redirectUrl = window.location.origin + '/student/dashboard';
    window.location.href = `https://auth.emergentagent.com/?redirect=${encodeURIComponent(redirectUrl)}`;
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <Link to="/">
          <Button variant="ghost" data-testid="back-to-home" className="mb-8">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Retour
          </Button>
        </Link>
      </div>

      <div className="max-w-md mx-auto px-4">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <img src="/logo.svg" alt="Roomly" className="w-16 h-16" />
          </div>
          <h1 className="text-4xl font-bold text-foreground mb-2" style={{ fontFamily: 'Outfit' }}>
            Bon retour !
          </h1>
          <p className="text-muted-foreground">Connectez-vous à votre compte Roomly</p>
        </div>

        <div className="bg-card rounded-3xl p-8 shadow-lg border border-border/50">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <Label htmlFor="email" className="text-sm font-medium mb-2 block">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  data-testid="login-email-input"
                  placeholder="votre.email@exemple.fr"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="pl-10 h-12 rounded-xl"
                  required
                />
              </div>
            </div>

            <div>
              <Label htmlFor="password" className="text-sm font-medium mb-2 block">Mot de passe</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  data-testid="login-password-input"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="pl-10 h-12 rounded-xl"
                  required
                />
              </div>
            </div>

            <Button
              type="submit"
              data-testid="login-submit-btn"
              className="w-full h-12 rounded-full text-base font-semibold"
              disabled={loading}
            >
              {loading ? 'Connexion...' : 'Se connecter'}
            </Button>
          </form>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-card text-muted-foreground">ou</span>
            </div>
          </div>

          <Button
            type="button"
            variant="outline"
            data-testid="google-login-btn"
            onClick={handleGoogleLogin}
            className="w-full h-12 rounded-full text-base font-semibold border-2"
          >
            <svg className="mr-2 h-5 w-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Continuer avec Google
          </Button>

          <p className="text-center text-sm text-muted-foreground mt-6">
            Pas encore de compte ?{' '}
            <Link to="/register" className="text-primary font-medium hover:underline">
              S'inscrire
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
