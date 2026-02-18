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
  Check,
  ChevronRight,
  Layers,
  Menu,
  X
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// Images pour les cartes animées
const listingImages = [
  {
    url: "https://i.pinimg.com/1200x/67/ad/84/67ad840202ec4057ec853022bf12bcca.jpg",
    title: "Studio moderne en centre-ville",
    price: "450€/mois",
    location: "Paris 11ème"
  },
  {
    url: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?crop=entropy&cs=srgb&fm=jpg&q=85",
    title: "T2 lumineux avec balcon",
    price: "520€/mois",
    location: "Lyon 3ème"
  },
  {
    url: "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?crop=entropy&cs=srgb&fm=jpg&q=85",
    title: "Chambre cosy en colocation",
    price: "380€/mois",
    location: "Toulouse Centre"
  },
  {
    url: "https://i.pinimg.com/1200x/1f/80/e7/1f80e7961ea527f3d9f92e0807ac0ed6.jpg",
    title: "Appart spacieux avec cuisine",
    price: "580€/mois",
    location: "Bordeaux"
  }
];

// Composants d'animation
const AnimatedCardStack = ({ images }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(0);

  useState(() => {
    const interval = setInterval(() => {
      setDirection(Math.random() > 0.5 ? 1 : -1);
      setCurrentIndex((prev) => (prev + 1) % images.length);
    }, 3500);

    return () => clearInterval(interval);
  }, [images.length]);

  return (
    <div className="relative w-full h-full flex items-center justify-center px-2 py-2">
      <AnimatePresence mode="popLayout">
        {images.map((image, index) => {
        const isActive = index === currentIndex;
        const offset = (index - currentIndex + images.length) % images.length;

        if (offset > 2) return null;

        return (
          <motion.div
            key={index}
            className="absolute w-72 h-[420px] rounded-3xl overflow-hidden shadow-xl border border-gray-200"
            initial={{ 
              x: direction > 0 ? 400 : -400,
              opacity: 0,
              scale: 0.8,
              rotateZ: direction > 0 ? 15 : -15
            }}
            animate={{
              x: offset * 8,
              y: offset * -4,
              opacity: isActive ? 1 : 0.4 - offset * 0.2,
              scale: 1 - offset * 0.05,
              zIndex: 10 - offset,
              rotateZ: 0,
            }}
            exit={{
              x: direction > 0 ? -400 : 400,
              opacity: 0,
              scale: 0.8,
              rotateZ: direction > 0 ? -15 : 15
            }}
            transition={{
              type: "spring",
              stiffness: 300,
              damping: 30,
            }}
          >
            <img
              src={image.url}
              alt={image.title}
              className="w-full h-full object-cover"
            />

            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"></div>

            <div className="absolute bottom-0 left-0 right-0 p-5 text-white">
              <h3 className="font-semibold text-xl mb-1">{image.title}</h3>
              <p className="text-sm text-gray-200 mb-2">{image.location}</p>
              <p className="text-primary font-bold text-xl">{image.price}</p>
            </div>

            {isActive && (
              <>
                <motion.div 
                  className="absolute top-4 right-4 bg-primary/90 backdrop-blur-sm rounded-full px-3 py-1.5 flex items-center gap-1.5"
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: "spring", delay: 0.2 }}
                >
                  <motion.div 
                    className="w-2 h-2 bg-white rounded-full"
                    animate={{ scale: [1, 1.5, 1] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  />
                  <span className="text-white font-semibold text-sm">92% Match</span>
                </motion.div>

                {/* Swipe Indicators */}
                <motion.div
                  className="absolute bottom-20 left-6 bg-red-500/90 backdrop-blur-sm rounded-full p-3"
                  animate={{
                    x: [-10, -20, -10],
                    opacity: [0.5, 1, 0.5],
                    scale: [0.9, 1.1, 0.9]
                  }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <X className="w-5 h-5 text-white" />
                </motion.div>

                <motion.div
                  className="absolute bottom-20 right-6 bg-primary/90 backdrop-blur-sm rounded-full p-3"
                  animate={{
                    x: [10, 20, 10],
                    opacity: [0.5, 1, 0.5],
                    scale: [0.9, 1.1, 0.9]
                  }}
                  transition={{ duration: 2, repeat: Infinity, delay: 1 }}
                >
                  <Heart className="w-5 h-5 text-white fill-white" />
                </motion.div>
              </>
            )}
          </motion.div>
        );
      })}
      </AnimatePresence>

      <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-2 z-20">
        {images.map((_, index) => (
          <motion.div
            key={index}
            className="rounded-full h-2"
            animate={{
              width: index === currentIndex ? 24 : 8,
              backgroundColor: index === currentIndex ? '#fec629' : '#d1d5db',
            }}
            transition={{ duration: 0.3 }}
          />
        ))}
      </div>
    </div>
  );
};

const MagneticConnectionLines = () => (
  <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 1 }}>
    {[...Array(3)].map((_, i) => (
      <motion.circle
        key={i}
        cx="50%"
        cy="50%"
        r={100 + i * 50}
        fill="none"
        stroke="rgba(254, 198, 41, 0.15)"
        strokeWidth="1"
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: i * 0.2, duration: 1 }}
      />
    ))}
  </svg>
);

const FloatingMatchBadges = () => (
  <>
    <motion.div
      className="absolute -left-12 top-20 bg-white rounded-2xl shadow-lg p-3"
      animate={{ y: [0, -10, 0] }}
      transition={{ duration: 3, repeat: Infinity }}
    >
      <Heart className="w-6 h-6 text-pink-500" />
    </motion.div>
    <motion.div
      className="absolute -right-8 top-32 bg-white rounded-2xl shadow-lg p-3"
      animate={{ y: [0, 10, 0] }}
      transition={{ duration: 2.5, repeat: Infinity, delay: 0.5 }}
    >
      <MessageCircle className="w-6 h-6 text-blue-500" />
    </motion.div>
  </>
);

const LandingPage = () => {
  const navigate = useNavigate();
  const authContext = useAuth();
  const user = authContext?.user;
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
            <Link to="/" className="flex items-center gap-3" data-testid="logo">
              <img src="/image.png" alt="Roomly" className="h-16 w-auto" />
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
      <section className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="inline-flex items-center gap-2 bg-primary/10 px-4 py-2 rounded-full mb-6"
              >
                <Sparkles className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium text-primary">Matching intelligent alimenté par IA</span>
              </motion.div>
              
              <h1 
                className="text-5xl md:text-6xl font-bold text-foreground mb-6 leading-tight"
                style={{ fontFamily: 'Outfit' }}
              >
                Trouvez votre logement étudiant{' '}
                <span className="relative inline-block">
                  <span className="relative z-10 text-primary">idéal</span>
                  <motion.span
                    className="absolute bottom-2 left-0 w-full h-3 bg-primary/20 -z-0"
                    initial={{ width: 0 }}
                    animate={{ width: '100%' }}
                    transition={{ duration: 0.8, delay: 1 }}
                  />
                </span>
              </h1>
              
              <p className="text-lg md:text-xl text-muted-foreground mb-8 leading-relaxed">
                Roomly connecte étudiants et bailleurs grâce à un système de matching intelligent. 
                Swipez, matchez, et trouvez le logement parfait en quelques clics.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <Link to="/register">
                  <motion.div 
                    whileHover={{ scale: 1.05, y: -2 }} 
                    whileTap={{ scale: 0.98 }}
                  >
                    <Button 
                      size="lg" 
                      data-testid="hero-student-btn"
                      className="rounded-full w-full sm:w-auto text-lg px-8 py-6 shadow-lg hover:shadow-xl group"
                    >
                      <Home className="mr-2 group-hover:scale-110 transition-transform" />
                      Je cherche un logement
                    </Button>
                  </motion.div>
                </Link>
                <Link to="/register">
                  <motion.div 
                    whileHover={{ scale: 1.05, y: -2 }} 
                    whileTap={{ scale: 0.98 }}
                  >
                    <Button 
                      size="lg" 
                      variant="outline"
                      data-testid="hero-landlord-btn"
                      className="rounded-full w-full sm:w-auto text-lg px-8 py-6 group"
                    >
                      Je loue un logement
                      <ChevronRight className="ml-2 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </motion.div>
                </Link>
              </div>

              {/* Trust indicators */}
              <motion.div 
                className="mt-12 flex items-center gap-8"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.2 }}
              >
                <div className="flex -space-x-3">
                  {[1, 2, 3, 4].map((i) => (
                    <motion.img
                      key={i}
                      src={`https://i.pravatar.cc/100?img=${i}`}
                      alt="User"
                      className="w-10 h-10 rounded-full border-2 border-background"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 1.3 + i * 0.1 }}
                    />
                  ))}
                </div>
                <div>
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, scale: 0 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 1.4 + i * 0.05 }}
                      >
                        <svg className="w-4 h-4 fill-primary" viewBox="0 0 20 20">
                          <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z"/>
                        </svg>
                      </motion.div>
                    ))}
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">2500+ étudiants satisfaits</p>
                </div>
              </motion.div>
            </motion.div>

            {/* Phone Mockup with Advanced Animations */}
            <motion.div 
              className="relative"
              initial={{ opacity: 0, scale: 0.8, rotateY: -20 }}
              animate={{ opacity: 1, scale: 1, rotateY: 0 }}
              transition={{ duration: 1, delay: 0.4 }}
            >
              {/* Magnetic Connection Lines Animation */}
              <MagneticConnectionLines />

              {/* Phone Frame */}
              <div className="w-80 h-[600px] bg-black rounded-[3rem] shadow-2xl overflow-hidden border-8 border-black/50 relative mx-auto z-10">
                {/* Notch */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-40 h-7 bg-black rounded-b-3xl z-10"></div>

                {/* Screen Content */}
                <div className="w-full h-full bg-white pt-0 overflow-hidden relative flex flex-col">
                  {/* Status Bar */}
                  <div className="bg-white px-6 pt-2 pb-2 border-b border-gray-200 flex justify-between items-center text-xs text-gray-600 h-8">
                    <span>9:41</span>
                    <div className="flex gap-1 items-center">
                      <div className="w-1 h-2 bg-gray-600"></div>
                      <div className="w-1.5 h-2 bg-gray-600"></div>
                      <div className="w-2 h-2 bg-gray-600"></div>
                    </div>
                  </div>

                  {/* App Header */}
                  <div className="bg-white px-4 py-3 border-b border-gray-100 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <img src="/image.png" alt="Roomly" className="h-14 w-auto" />
                    </div>
                    <div className="flex gap-2">
                      <img 
                        src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?crop=entropy&cs=srgb&fm=jpg&q=80&w=100" 
                        alt="Profile" 
                        className="w-8 h-8 bg-gray-200 rounded-full object-cover"
                      />
                    </div>
                  </div>

                  {/* Main Content - Cards */}
                  <div className="flex-1 flex items-center justify-center relative overflow-hidden">
                    <AnimatedCardStack images={listingImages} />
                  </div>

                  {/* Bottom Navigation Bar */}
                  <div className="bg-white border-t border-gray-200 px-4 py-3 flex justify-around items-center">
                    <button className="p-2 hover:bg-gray-100 rounded-full transition bg-transparent">
                      <Layers className="w-6 h-6 text-gray-600" />
                    </button>
                    <button className="p-2 hover:bg-gray-100 rounded-full transition relative bg-transparent">
                      <Heart className="w-6 h-6 text-gray-600" />
                      <motion.div 
                        className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"
                        animate={{ scale: [1, 1.3, 1] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                      />
                    </button>
                    <button className="p-2 hover:bg-gray-100 rounded-full transition bg-transparent">
                      <MessageCircle className="w-6 h-6 text-gray-600" />
                    </button>
                    <button className="p-2 hover:bg-gray-100 rounded-full transition bg-transparent">
                      <Menu className="w-6 h-6 text-gray-600" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Floating Elements */}
              <FloatingMatchBadges />
            </motion.div>
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
