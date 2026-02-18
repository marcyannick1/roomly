import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { useAuth } from "../App";
import { toast } from "sonner";
import { Home, Mail, Lock, ArrowRight, Eye, EyeOff } from "lucide-react";

const LoginPage = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: ""
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const user = await login(formData.email, formData.password);
      if (user && user.first_name) {
        toast.success(`Bienvenue ${user.first_name}!`);
        navigate(user.role === "student" ? "/swipe" : "/dashboard");
      } else {
        throw new Error("Données utilisateur invalides");
      }
    } catch (error) {
      console.error("Login error:", error);
      toast.error(error.response?.data?.detail || "Email ou mot de passe incorrect");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Left side - Form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center">
            <Link to="/" className="inline-flex items-center gap-2 mb-8">
              <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
                <Home className="w-5 h-5 text-white" />
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
                  data-testid="email-input"
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
                  data-testid="password-input"
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

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" className="rounded border-slate-300 text-primary focus:ring-primary" />
                <span className="text-sm text-slate-600">Se souvenir de moi</span>
              </label>
              <a href="#" className="text-sm text-primary hover:underline">Mot de passe oublié?</a>
            </div>

            <Button
              type="submit"
              className="w-full bg-primary hover:bg-primary-hover text-white h-12 rounded-xl font-semibold shadow-lg shadow-primary/20 transition-all active:scale-95"
              disabled={loading}
              data-testid="login-submit-btn"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  Se connecter
                  <ArrowRight className="w-5 h-5 ml-2" />
                </>
              )}
            </Button>
          </form>

          <p className="text-center text-slate-600">
            Pas encore de compte?{" "}
            <Link to="/register" className="text-primary font-semibold hover:underline" data-testid="register-link">
              Inscrivez-vous
            </Link>
          </p>

          {/* Demo credentials */}
          <div className="mt-8 p-4 bg-primary-50 rounded-xl border border-primary-100">
            <p className="text-sm font-medium text-primary-800 mb-2">Comptes de démo:</p>
            <div className="space-y-1 text-xs text-primary-700">
              <p><strong>Étudiant:</strong> lucas.bernard@etudiant.fr / password123</p>
              <p><strong>Bailleur:</strong> pierre.dupont@immo.fr / password123</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right side - Image */}
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

export default LoginPage;
