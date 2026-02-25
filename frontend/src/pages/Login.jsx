import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { login, getCurrentUser } from "@/lib/api";
import { toast } from "sonner";
import { Home, Mail, Lock, ArrowRight, Eye, EyeOff } from "lucide-react";

const Login = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({ email: "", password: "" });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // FastAPI-Users login needs application/x-www-form-urlencoded
      const params = new URLSearchParams();
      params.append("username", formData.email);
      params.append("password", formData.password);

      const loginRes = await login(params);
      const { access_token } = loginRes.data;

      // Store token in cookie (1 hour, matching JWTStrategy lifetime)
      document.cookie = `access_token=${access_token}; path=/; max-age=3600; samesite=lax`;

      // Fetch the actual user object
      const userRes = await getCurrentUser();
      const user = userRes.data;

      toast.success(`Bienvenue ${user.email}!`);

      // Route by role field (not user_type)
      if (user.role === "student") {
        navigate("/student/dashboard", { state: { user } });
      } else {
        navigate("/landlord/dashboard", { state: { user } });
      }
    } catch (error) {
      const detail = error.response?.data?.detail;
      const friendlyErrors = {
        LOGIN_BAD_CREDENTIALS: "Email ou mot de passe incorrect.",
        LOGIN_USER_NOT_VERIFIED: "Veuillez vérifier votre email avant de vous connecter.",
        USER_INACTIVE: "Votre compte est désactivé. Contactez le support.",
      };
      toast.error(friendlyErrors[detail] || detail || "Email ou mot de passe incorrect");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    const redirectUrl = window.location.origin + '/student/dashboard';
    window.location.href = `https://auth.emergentagent.com/?redirect=${encodeURIComponent(redirectUrl)}`;
  };

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Left side - Form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center">
            <Link to="/" className="inline-flex items-center gap-2 mb-8">
              <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
                <Home className="w-5 h-5 text-black" />
              </div>
              <span className="text-xl font-bold text-slate-900">Roomly</span>
            </Link>
            <h1 className="text-3xl font-bold text-slate-900 mb-2">Content de vous revoir!</h1>
            <p className="text-slate-600">Connectez-vous pour accéder à votre compte</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6" data-testid="login-form">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-slate-700">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <Input
                  id="email"
                  type="email"
                  placeholder="votre@email.fr"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="pl-10 h-12 rounded-xl border-slate-200 focus:border-primary focus:ring-primary"
                  required
                  data-testid="login-email-input"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-slate-700">Mot de passe</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="pl-10 pr-10 h-12 rounded-xl border-slate-200 focus:border-primary focus:ring-primary"
                  required
                  data-testid="login-password-input"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full bg-primary hover:bg-primary-hover text-black h-12 rounded-xl font-semibold shadow-lg shadow-primary/20 transition-all active:scale-95"
              disabled={loading}
              data-testid="login-submit-btn"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  Se connecter
                  <ArrowRight className="w-5 h-5 ml-2" />
                </>
              )}
            </Button>
          </form>

          {/* Google Login separator */}
          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-slate-50 text-slate-400">ou</span>
            </div>
          </div>

          <Button
            type="button"
            variant="outline"
            data-testid="google-login-btn"
            onClick={handleGoogleLogin}
            className="w-full h-12 rounded-xl border-slate-200 font-semibold"
          >
            <svg className="mr-2 h-5 w-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            Continuer avec Google
          </Button>

          <p className="text-center text-slate-600">
            Pas encore de compte?{" "}
            <Link to="/register" className="text-primary font-semibold hover:underline" data-testid="register-link">
              Inscrivez-vous
            </Link>
          </p>
        </div>
      </div>

      {/* Right side - Visual */}
      <div className="hidden lg:block flex-1 relative">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/90 to-primary-800">
          <img
            src="https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=1200"
            alt="Apartment"
            className="w-full h-full object-cover mix-blend-overlay opacity-50"
          />
        </div>
        <div className="absolute inset-0 flex items-center justify-center p-12">
          <div className="text-center text-white max-w-lg">
            <h2 className="text-4xl font-bold mb-4">Trouvez votre logement idéal</h2>
            <p className="text-lg text-white/80">
              Rejoignez des milliers d'étudiants qui ont trouvé leur chez-eux grâce à Roomly
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
