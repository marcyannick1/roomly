import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "../components/ui/button";
import { useAuth } from "../App";
import { 
  Home, 
  Heart, 
  MessageCircle, 
  MapPin, 
  Calendar, 
  Users, 
  ArrowRight, 
  Star,
  Sparkles,
  Building2,
  GraduationCap,
  Shield,
  Zap,
  Check
} from "lucide-react";

const LandingPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [hoveredFeature, setHoveredFeature] = useState(null);

  const features = [
    {
      icon: Heart,
      title: "Swipe & Match",
      description: "Swipez à droite pour liker, à gauche pour passer. Simple comme Tinder!",
      color: "text-pink-500",
      bg: "bg-pink-50"
    },
    {
      icon: MessageCircle,
      title: "Chat Intégré",
      description: "Discutez directement avec les bailleurs après un match",
      color: "text-blue-500",
      bg: "bg-blue-50"
    },
    {
      icon: MapPin,
      title: "Carte Interactive",
      description: "Visualisez toutes les annonces sur une carte de Paris et l'Île-de-France",
      color: "text-green-500",
      bg: "bg-green-50"
    },
    {
      icon: Calendar,
      title: "Visites Planifiées",
      description: "Organisez vos visites directement depuis l'application",
      color: "text-orange-500",
      bg: "bg-orange-50"
    }
  ];

  const stats = [
    { value: "5000+", label: "Logements disponibles" },
    { value: "10K+", label: "Étudiants actifs" },
    { value: "98%", label: "Satisfaction" },
    { value: "48h", label: "Temps moyen pour matcher" }
  ];

  const handleGetStarted = () => {
    if (user) {
      navigate(user.role === "student" ? "/swipe" : "/dashboard");
    } else {
      navigate("/register");
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center gap-2" data-testid="logo">
              <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
                <Home className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-slate-900">Roomly</span>
            </Link>
            
            <div className="hidden md:flex items-center gap-8">
              <a href="#features" className="text-slate-600 hover:text-primary transition-colors">Fonctionnalités</a>
              <a href="#how-it-works" className="text-slate-600 hover:text-primary transition-colors">Comment ça marche</a>
              <a href="#pricing" className="text-slate-600 hover:text-primary transition-colors">Tarifs</a>
            </div>
            
            <div className="flex items-center gap-3">
              {user ? (
                <Button 
                  onClick={() => navigate(user.role === "student" ? "/swipe" : "/dashboard")}
                  className="bg-primary hover:bg-primary-hover text-white rounded-full px-6"
                  data-testid="dashboard-btn"
                >
                  Mon espace
                </Button>
              ) : (
                <>
                  <Link to="/login">
                    <Button variant="ghost" className="text-slate-600 hover:text-primary" data-testid="login-btn">
                      Connexion
                    </Button>
                  </Link>
                  <Link to="/register">
                    <Button className="bg-primary hover:bg-primary-hover text-white rounded-full px-6" data-testid="register-btn">
                      S'inscrire
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6 overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="inline-flex items-center gap-2 bg-primary-50 text-primary px-4 py-2 rounded-full text-sm font-medium">
                <Sparkles className="w-4 h-4" />
                Nouveau: Super Likes disponibles!
              </div>
              
              <h1 className="text-5xl lg:text-6xl font-bold text-slate-900 leading-tight">
                Swipe ton 
                <span className="text-primary block">chez-toi</span>
              </h1>
              
              <p className="text-lg text-slate-600 max-w-md leading-relaxed">
                Roomly connecte étudiants et bailleurs grâce à un système de matching intelligent. 
                Swipez, matchez, et trouvez le logement parfait en quelques clics.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <Button 
                  onClick={handleGetStarted}
                  className="bg-primary hover:bg-primary-hover text-white rounded-full px-8 py-6 text-lg font-semibold shadow-lg shadow-primary/20 transition-all active:scale-95"
                  data-testid="hero-cta-btn"
                >
                  Commencer gratuitement
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
                <Button 
                  variant="outline" 
                  className="rounded-full px-8 py-6 text-lg border-slate-200"
                  onClick={() => document.getElementById('how-it-works').scrollIntoView({ behavior: 'smooth' })}
                  data-testid="learn-more-btn"
                >
                  Comment ça marche
                </Button>
              </div>
              
              {/* Stats */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 pt-8 border-t border-slate-100">
                {stats.map((stat, index) => (
                  <div key={index} className="text-center sm:text-left">
                    <div className="text-2xl font-bold text-slate-900">{stat.value}</div>
                    <div className="text-sm text-slate-500">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Hero Image / Phone Mockup */}
            <div className="relative hidden lg:block">
              <div className="absolute -top-20 -right-20 w-72 h-72 bg-primary/10 rounded-full blur-3xl"></div>
              <div className="absolute -bottom-20 -left-20 w-72 h-72 bg-pink-500/10 rounded-full blur-3xl"></div>
              
              {/* Phone mockup */}
              <div className="relative mx-auto w-72 h-[580px] bg-slate-900 rounded-[3rem] p-3 shadow-2xl">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-slate-900 rounded-b-2xl"></div>
                <div className="w-full h-full bg-white rounded-[2.5rem] overflow-hidden">
                  {/* Card preview */}
                  <div className="p-4 h-full flex flex-col">
                    <div className="flex-1 relative rounded-2xl overflow-hidden">
                      <img 
                        src="https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=400" 
                        alt="Apartment"
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
                        <h3 className="text-white font-bold text-lg">Studio Quartier Latin</h3>
                        <p className="text-white/80 text-sm">Paris 5e • 25m² • 750€/mois</p>
                      </div>
                      {/* Like stamp */}
                      <div className="absolute top-4 left-4 bg-green-500 text-white px-3 py-1 rounded-full text-sm font-bold transform -rotate-12">
                        LIKE
                      </div>
                    </div>
                    {/* Action buttons */}
                    <div className="flex justify-center gap-6 py-4">
                      <div className="w-14 h-14 rounded-full bg-red-50 flex items-center justify-center border-2 border-red-200">
                        <span className="text-2xl">✕</span>
                      </div>
                      <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center shadow-lg shadow-primary/30">
                        <Star className="w-7 h-7 text-white" />
                      </div>
                      <div className="w-14 h-14 rounded-full bg-green-50 flex items-center justify-center border-2 border-green-200">
                        <Heart className="w-6 h-6 text-green-500" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-6 bg-slate-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 mb-4">
              Tout ce qu'il faut pour trouver votre logement
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Une expérience intuitive inspirée des meilleures applications de rencontre, 
              adaptée à la recherche de logement étudiant.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <div
                key={index}
                className={`p-6 bg-white rounded-2xl border border-slate-100 transition-all duration-300 cursor-pointer
                  ${hoveredFeature === index ? 'shadow-hover -translate-y-1' : 'shadow-card'}`}
                onMouseEnter={() => setHoveredFeature(index)}
                onMouseLeave={() => setHoveredFeature(null)}
                data-testid={`feature-card-${index}`}
              >
                <div className={`w-12 h-12 ${feature.bg} rounded-xl flex items-center justify-center mb-4`}>
                  <feature.icon className={`w-6 h-6 ${feature.color}`} />
                </div>
                <h3 className="text-lg font-semibold text-slate-900 mb-2">{feature.title}</h3>
                <p className="text-slate-600 text-sm leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 mb-4">
              Comment ça marche?
            </h2>
            <p className="text-lg text-slate-600">
              Trouvez votre logement en 3 étapes simples
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: "01",
                icon: GraduationCap,
                title: "Créez votre profil",
                description: "Inscrivez-vous en tant qu'étudiant, renseignez vos critères et préférences"
              },
              {
                step: "02",
                icon: Heart,
                title: "Swipez les annonces",
                description: "Parcourez les logements disponibles et likez ceux qui vous plaisent"
              },
              {
                step: "03",
                icon: MessageCircle,
                title: "Matchez & Discutez",
                description: "Échangez avec les bailleurs et planifiez vos visites"
              }
            ].map((item, index) => (
              <div key={index} className="relative" data-testid={`step-${index + 1}`}>
                {index < 2 && (
                  <div className="hidden md:block absolute top-16 left-full w-full h-0.5 bg-gradient-to-r from-primary/30 to-transparent -translate-x-1/2"></div>
                )}
                <div className="text-center">
                  <div className="relative inline-block mb-6">
                    <div className="w-20 h-20 bg-primary-50 rounded-2xl flex items-center justify-center">
                      <item.icon className="w-10 h-10 text-primary" />
                    </div>
                    <span className="absolute -top-2 -right-2 w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center text-sm font-bold">
                      {item.step}
                    </span>
                  </div>
                  <h3 className="text-xl font-semibold text-slate-900 mb-2">{item.title}</h3>
                  <p className="text-slate-600">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* For Landlords Section */}
      <section className="py-20 px-6 bg-slate-900">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 bg-white/10 text-white px-4 py-2 rounded-full text-sm">
                <Building2 className="w-4 h-4" />
                Pour les bailleurs
              </div>
              <h2 className="text-3xl lg:text-4xl font-bold text-white">
                Trouvez le locataire idéal pour votre bien
              </h2>
              <p className="text-slate-300 text-lg leading-relaxed">
                Publiez vos annonces gratuitement et recevez des demandes d'étudiants qualifiés. 
                Gérez vos biens et vos rendez-vous depuis un tableau de bord intuitif.
              </p>
              
              <ul className="space-y-4">
                {[
                  "Publication d'annonces illimitées",
                  "Tableau de bord avec statistiques",
                  "Gestion des visites simplifiée",
                  "Notifications en temps réel"
                ].map((item, index) => (
                  <li key={index} className="flex items-center gap-3 text-white">
                    <div className="w-5 h-5 bg-primary rounded-full flex items-center justify-center">
                      <Check className="w-3 h-3 text-white" />
                    </div>
                    {item}
                  </li>
                ))}
              </ul>
              
              <Button 
                onClick={() => navigate('/register')}
                className="bg-white text-slate-900 hover:bg-slate-100 rounded-full px-8 py-6 text-lg font-semibold"
                data-testid="landlord-cta-btn"
              >
                Publier une annonce
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </div>
            
            <div className="relative">
              <div className="bg-white rounded-2xl p-6 shadow-2xl">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-slate-900">Mes statistiques</h3>
                  <span className="text-sm text-slate-500">Ce mois</span>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { value: "1,245", label: "Vues", change: "+12%" },
                    { value: "89", label: "Likes", change: "+8%" },
                    { value: "34", label: "Matchs", change: "+15%" },
                    { value: "12", label: "Visites", change: "+22%" }
                  ].map((stat, index) => (
                    <div key={index} className="bg-slate-50 rounded-xl p-4">
                      <div className="text-2xl font-bold text-slate-900">{stat.value}</div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-slate-500">{stat.label}</span>
                        <span className="text-xs text-green-500 font-medium">{stat.change}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 mb-4">
            Prêt à trouver votre chez-vous?
          </h2>
          <p className="text-lg text-slate-600 mb-8">
            Rejoignez les milliers d'étudiants qui ont trouvé leur logement grâce à Roomly
          </p>
          <Button 
            onClick={handleGetStarted}
            className="bg-primary hover:bg-primary-hover text-white rounded-full px-10 py-6 text-lg font-semibold shadow-lg shadow-primary/20 transition-all active:scale-95"
            data-testid="final-cta-btn"
          >
            Commencer maintenant
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-slate-100">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
                <Home className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-slate-900">Roomly</span>
            </div>
            
            <p className="text-slate-500 text-sm">
              © 2024 Roomly. Tous droits réservés. Fait avec ❤️ à Paris
            </p>
            
            <div className="flex items-center gap-6">
              <a href="#" className="text-slate-500 hover:text-primary text-sm">Mentions légales</a>
              <a href="#" className="text-slate-500 hover:text-primary text-sm">Confidentialité</a>
              <a href="#" className="text-slate-500 hover:text-primary text-sm">Contact</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
