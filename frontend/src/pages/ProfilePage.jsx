import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../App";
import { toast } from "sonner";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { 
  ArrowLeft, 
  Home, 
  LogOut,
  User,
  Mail,
  Phone,
  Building2,
  GraduationCap,
  Euro,
  MapPin,
  Save,
  Loader2
} from "lucide-react";
import { Switch } from "../components/ui/switch";

const ProfilePage = () => {
  const navigate = useNavigate();
  const { user, token, logout, updateProfile, API } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    first_name: user?.first_name || "",
    last_name: user?.last_name || "",
    phone: user?.phone || "",
    bio: user?.bio || "",
    university: user?.university || "",
    budget_min: user?.budget_min || "",
    budget_max: user?.budget_max || "",
    company_name: user?.company_name || "",
    is_agency: user?.is_agency || false
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await updateProfile(formData);
      toast.success("Profil mis à jour!");
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Erreur lors de la mise à jour");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
    toast.success("Déconnexion réussie");
  };

  const isStudent = user?.role === 'student';

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Mon Profil</h1>
      </div>
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-2xl border border-slate-100 p-6 mb-6">
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 bg-primary-100 rounded-full flex items-center justify-center">
                <span className="text-2xl font-bold text-primary">
                  {user?.first_name?.[0]}{user?.last_name?.[0]}
                </span>
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-900">
                  {user?.first_name} {user?.last_name}
                </h2>
                <p className="text-slate-500">{user?.email}</p>
                <span className={`inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full mt-2 ${
                  isStudent ? 'bg-blue-50 text-blue-600' : 'bg-green-50 text-green-600'
                }`}>
                  {isStudent ? (
                    <>
                      <GraduationCap className="w-3 h-3" />
                      Étudiant
                    </>
                  ) : (
                    <>
                      <Building2 className="w-3 h-3" />
                      Bailleur
                    </>
                  )}
                </span>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="bg-white rounded-2xl border border-slate-100 p-6">
              <h3 className="font-semibold text-slate-900 mb-4">Informations personnelles</h3>
              
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="first_name">Prénom</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <Input
                      id="first_name"
                      value={formData.first_name}
                      onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                      className="pl-10 rounded-xl"
                      data-testid="first-name-input"
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="last_name">Nom</Label>
                  <Input
                    id="last_name"
                    value={formData.last_name}
                    onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                    className="rounded-xl"
                    data-testid="last-name-input"
                  />
                </div>
              </div>
              
              <div className="mt-4 space-y-2">
                <Label htmlFor="phone">Téléphone</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input
                    id="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="pl-10 rounded-xl"
                    placeholder="06 12 34 56 78"
                    data-testid="phone-input"
                  />
                </div>
              </div>
              
              <div className="mt-4 space-y-2">
                <Label htmlFor="bio">Bio</Label>
                <textarea
                  id="bio"
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 h-24 resize-none focus:border-primary focus:ring-1 focus:ring-primary"
                  placeholder="Présentez-vous en quelques mots..."
                  data-testid="bio-input"
                />
              </div>
            </div>

            {isStudent ? (
              <div className="bg-white rounded-2xl border border-slate-100 p-6">
                <h3 className="font-semibold text-slate-900 mb-4">Préférences de recherche</h3>
                
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="university">Université / École</Label>
                    <div className="relative">
                      <GraduationCap className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <Input
                        id="university"
                        value={formData.university}
                        onChange={(e) => setFormData({ ...formData, university: e.target.value })}
                        className="pl-10 rounded-xl"
                        placeholder="Sorbonne, Sciences Po..."
                        data-testid="university-input"
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="budget_min">Budget minimum (€/mois)</Label>
                      <div className="relative">
                        <Euro className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <Input
                          id="budget_min"
                          type="number"
                          value={formData.budget_min}
                          onChange={(e) => setFormData({ ...formData, budget_min: e.target.value })}
                          className="pl-10 rounded-xl"
                          placeholder="500"
                          data-testid="budget-min-input"
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="budget_max">Budget maximum (€/mois)</Label>
                      <div className="relative">
                        <Euro className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <Input
                          id="budget_max"
                          type="number"
                          value={formData.budget_max}
                          onChange={(e) => setFormData({ ...formData, budget_max: e.target.value })}
                          className="pl-10 rounded-xl"
                          placeholder="900"
                          data-testid="budget-max-input"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-slate-100 p-6">
                <h3 className="font-semibold text-slate-900 mb-4">Informations professionnelles</h3>
                
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="company_name">Nom de l'entreprise (optionnel)</Label>
                    <div className="relative">
                      <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <Input
                        id="company_name"
                        value={formData.company_name}
                        onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
                        className="pl-10 rounded-xl"
                        placeholder="Mon Agence Immo"
                        data-testid="company-name-input"
                      />
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                    <div>
                      <p className="font-medium text-slate-900">Êtes-vous une agence?</p>
                      <p className="text-sm text-slate-500">Cochez si vous représentez une agence immobilière</p>
                    </div>
                    <Switch
                      checked={formData.is_agency}
                      onCheckedChange={(checked) => setFormData({ ...formData, is_agency: checked })}
                      data-testid="is-agency-switch"
                    />
                  </div>
                </div>
              </div>
            )}

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-primary hover:bg-primary-hover text-white h-12 rounded-xl font-semibold"
              data-testid="save-profile-btn"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Enregistrer les modifications
                </>
              )}
            </Button>
          </form>
        </div>
    </div>
  );
};

export default ProfilePage;
