import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { register } from "@/lib/api";
import { toast } from "sonner";
import { Home, Mail, Lock, User, ArrowRight, Eye, EyeOff, GraduationCap, Building2 } from "lucide-react";

const Register = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [step, setStep] = useState(1); // 1 = role selection, 2 = form
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    first_name: "",
    last_name: "",
    user_type: ""
  });

  const handleRoleSelect = (role) => {
    setFormData({ ...formData, user_type: role });
    setStep(2);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // fastapi-users register returns the UserRead object (no token)
      // The role field is "student" or "landlord" (not user_type)
      const payload = {
        email: formData.email,
        password: formData.password,
        role: formData.user_type, // backend field is "role"
      };

      await register(payload);

      toast.success("Compte créé! Connectez-vous pour continuer.");
      navigate("/login");
    } catch (error) {
      const detail = error.response?.data?.detail;
      const friendlyErrors = {
        REGISTER_USER_ALREADY_EXISTS: "Un compte existe déjà avec cet email. Connectez-vous!",
        REGISTER_INVALID_PASSWORD: "Mot de passe invalide. Minimum 6 caractères.",
        USER_ALREADY_EXISTS: "Un compte existe déjà avec cet email.",
      };
      toast.error(friendlyErrors[detail] || detail || "Erreur lors de l'inscription");
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
                <Home className="w-5 h-5 text-black" />
              </div>
              <span className="text-xl font-bold text-slate-900">Roomly</span>
            </Link>
            <h1 className="text-3xl font-bold text-slate-900 mb-2">
              {step === 1 ? "Qui êtes-vous?" : "Créez votre compte"}
            </h1>
            <p className="text-slate-600">
              {step === 1
                ? "Sélectionnez votre profil pour commencer"
                : `Inscription en tant que ${formData.user_type === "student" ? "étudiant" : "bailleur"}`
              }
            </p>
          </div>

          {step === 1 ? (
            <div className="grid grid-cols-2 gap-4" data-testid="role-selection">
              <button
                onClick={() => handleRoleSelect("student")}
                className="p-6 bg-white rounded-2xl border-2 border-slate-200 hover:border-primary hover:shadow-hover transition-all text-center group"
                data-testid="student-role-btn"
              >
                <div className="w-16 h-16 bg-primary-50 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:bg-primary-100 transition-colors">
                  <GraduationCap className="w-8 h-8 text-primary" />
                </div>
                <h3 className="font-semibold text-slate-900 mb-1">Étudiant</h3>
                <p className="text-sm text-slate-500">Je cherche un logement</p>
              </button>

              <button
                onClick={() => handleRoleSelect("landlord")}
                className="p-6 bg-white rounded-2xl border-2 border-slate-200 hover:border-primary hover:shadow-hover transition-all text-center group"
                data-testid="landlord-role-btn"
              >
                <div className="w-16 h-16 bg-primary-50 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:bg-primary-100 transition-colors">
                  <Building2 className="w-8 h-8 text-primary" />
                </div>
                <h3 className="font-semibold text-slate-900 mb-1">Bailleur</h3>
                <p className="text-sm text-slate-500">Je propose un logement</p>
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5" data-testid="register-form">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="text-sm text-primary hover:underline flex items-center gap-1"
                data-testid="back-to-role-btn"
              >
                ← Changer de profil
              </button>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="first_name" className="text-slate-700">Prénom</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <Input
                      id="first_name"
                      type="text"
                      placeholder="Jean"
                      value={formData.first_name}
                      onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                      className="pl-10 h-12 rounded-xl border-slate-200"
                      required
                      data-testid="first-name-input"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="last_name" className="text-slate-700">Nom</Label>
                  <Input
                    id="last_name"
                    type="text"
                    placeholder="Dupont"
                    value={formData.last_name}
                    onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                    className="h-12 rounded-xl border-slate-200"
                    required
                    data-testid="last-name-input"
                  />
                </div>
              </div>

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
                    className="pl-10 h-12 rounded-xl border-slate-200"
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
                    className="pl-10 pr-10 h-12 rounded-xl border-slate-200"
                    required
                    minLength={6}
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
                <p className="text-xs text-slate-500">Minimum 6 caractères</p>
              </div>

              <div className="flex items-start gap-2">
                <input
                  type="checkbox"
                  id="terms"
                  className="mt-1 rounded border-slate-300 text-primary focus:ring-primary"
                  required
                />
                <label htmlFor="terms" className="text-sm text-slate-600">
                  J'accepte les{" "}
                  <a href="#" className="text-primary hover:underline">conditions d'utilisation</a>
                  {" "}et la{" "}
                  <a href="#" className="text-primary hover:underline">politique de confidentialité</a>
                </label>
              </div>

              <Button
                type="submit"
                className="w-full bg-primary hover:bg-primary-hover text-black h-12 rounded-xl font-semibold shadow-lg shadow-primary/20 transition-all active:scale-95"
                disabled={loading}
                data-testid="register-submit-btn"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    Créer mon compte
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </>
                )}
              </Button>
            </form>
          )}

          <p className="text-center text-slate-600">
            Déjà un compte?{" "}
            <Link to="/login" className="text-primary font-semibold hover:underline" data-testid="login-link">
              Connectez-vous
            </Link>
          </p>
        </div>
      </div>

      {/* Right side - Visual */}
      <div className="hidden lg:block flex-1 relative">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/90 to-primary-800">
          <img
            src="https://images.unsplash.com/photo-1536376072261-38c75010e6c9?w=1200"
            alt="Paris apartment"
            className="w-full h-full object-cover mix-blend-overlay opacity-50"
          />
        </div>
        <div className="absolute inset-0 flex items-center justify-center p-12">
          <div className="text-center text-white max-w-lg">
            <h2 className="text-4xl font-bold mb-4">
              {formData.user_type === "landlord"
                ? "Publiez votre annonce en 2 minutes"
                : "Swipez vers votre nouveau chez-vous"
              }
            </h2>
            <p className="text-lg text-white/80">
              {formData.user_type === "landlord"
                ? "Trouvez des locataires étudiants qualifiés grâce à notre système de matching intelligent"
                : "Des centaines de logements vous attendent à Paris et en Île-de-France"
              }
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
