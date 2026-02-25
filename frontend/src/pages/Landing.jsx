import { Link } from 'react-router-dom';
import React from 'react';
import { Button } from '@/components/ui/button';
import { Home, Heart, MessageCircle, Shield, ChevronRight, X, Zap, User, Menu, Layers } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Landing() {
  const listingImages = [
    {
      url: "https://i.pinimg.com/1200x/67/ad/84/67ad840202ec4057ec853022bf12bcca.jpg",
      title: "Studio moderne en centre-ville",
      price: "450€/mois"
    },
    {
      url: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?crop=entropy&cs=srgb&fm=jpg&q=85",
      title: "T2 lumineux avec balcon",
      price: "520€/mois"
    },
    {
      url: "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?crop=entropy&cs=srgb&fm=jpg&q=85",
      title: "Chambre cosy en colocation",
      price: "380€/mois"
    },
    {
      url: "https://i.pinimg.com/1200x/1f/80/e7/1f80e7961ea527f3d9f92e0807ac0ed6.jpg",
      title: "Appart spacieux avec cuisine",
      price: "580€/mois"
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/50 backdrop-blur-xl bg-background/80 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <img src="/logo.svg" alt="Roomly" className="w-10 h-10" />
            <span className="text-2xl font-bold text-foreground" style={{ fontFamily: 'Outfit' }}>Roomly</span>
          </div>
          <div className="flex gap-3">
            <Link to="/login">
              <Button variant="outline" data-testid="header-login-btn" className="rounded-full">
                Connexion
              </Button>
            </Link>
            <Link to="/register">
              <Button data-testid="header-register-btn" className="rounded-full">
                Inscription
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h1 
                className="text-5xl md:text-6xl font-bold text-foreground mb-6 leading-tight"
                style={{ fontFamily: 'Outfit' }}
              >
                Trouvez votre logement étudiant idéal
              </h1>
              <p className="text-lg md:text-xl text-muted-foreground mb-8 leading-relaxed">
                Roomly connecte étudiants et bailleurs grâce à un système de matching intelligent. 
                Swipez, matchez, et trouvez le logement parfait en quelques clics.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link to="/register">
                  <Button 
                    size="lg" 
                    data-testid="hero-student-btn"
                    className="rounded-full w-full sm:w-auto text-lg px-8 py-6 shadow-lg hover:shadow-xl hover:-translate-y-0.5"
                  >
                    <Home className="mr-2" />
                    Je cherche un logement
                  </Button>
                </Link>
                <Link to="/register">
                  <Button 
                    size="lg" 
                    variant="outline"
                    data-testid="hero-landlord-btn"
                    className="rounded-full w-full sm:w-auto text-lg px-8 py-6 hover:-translate-y-0.5"
                  >
                    Je loue un logement
                    <ChevronRight className="ml-2" />
                  </Button>
                </Link>
              </div>
            </div>
            <div className="relative">
              {/* Ripple Circles Background */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <motion.div
                  className="absolute w-[600px] h-[600px] border-2 rounded-full"
                  style={{ borderColor: '#fec629' }}
                  animate={{ scale: [1, 1.3], opacity: [0.4, 0] }}
                  transition={{ duration: 4, repeat: Infinity }}
                />
                <motion.div
                  className="absolute w-[500px] h-[500px] border-2 rounded-full"
                  style={{ borderColor: '#fec629' }}
                  animate={{ scale: [1, 1.25], opacity: [0.5, 0] }}
                  transition={{ duration: 3.5, repeat: Infinity, delay: 0.2 }}
                />
                <motion.div
                  className="absolute w-[400px] h-[400px] border-2 rounded-full"
                  style={{ borderColor: '#fec629' }}
                  animate={{ scale: [1, 1.2], opacity: [0.6, 0] }}
                  transition={{ duration: 3, repeat: Infinity, delay: 0.4 }}
                />
                <motion.div
                  className="absolute w-[300px] h-[300px] border-2 rounded-full"
                  style={{ borderColor: '#fec629' }}
                  animate={{ scale: [1, 1.15], opacity: [0.7, 0] }}
                  transition={{ duration: 2.5, repeat: Infinity, delay: 0.6 }}
                />
                <motion.div
                  className="absolute w-[200px] h-[200px] border-2 rounded-full"
                  style={{ borderColor: '#fec629' }}
                  animate={{ scale: [1, 1.1], opacity: [0.8, 0] }}
                  transition={{ duration: 2, repeat: Infinity, delay: 0.8 }}
                />
              </div>

              {/* Phone Frame */}
              <div className="w-80 h-[600px] bg-black rounded-[3rem] shadow-2xl overflow-hidden border-8 border-black/50 relative mx-auto">
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
                      <img src="/logo.svg" alt="Roomly" className="w-6 h-6" />
                      <span className="font-bold text-lg text-gray-800" style={{ fontFamily: 'Outfit' }}>Roomly</span>
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
                  <motion.div
                    className="flex-1 flex items-center justify-center relative overflow-hidden"
                    initial={{ opacity: 1 }}
                    animate={{ opacity: 1 }}
                  >
                    <AnimatedCardStack images={listingImages} />
                  </motion.div>

                  {/* Bottom Navigation Bar */}
                  <div className="bg-white border-t border-gray-200 px-4 py-3 flex justify-around items-center">
                    <button className="p-2 hover:bg-gray-100 rounded-full transition bg-transparent">
                      <Layers className="w-6 h-6 text-gray-600" />
                    </button>
                    <button className="p-2 hover:bg-gray-100 rounded-full transition relative bg-transparent">
                      <Heart className="w-6 h-6 text-gray-600" />
                      <div className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></div>
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

              {/* Decorative blurs */}
              <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-primary/20 rounded-full blur-3xl"></div>
              <div className="absolute -top-6 -left-6 w-32 h-32 bg-accent/20 rounded-full blur-3xl"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-secondary/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 
            className="text-4xl md:text-5xl font-semibold text-center text-foreground mb-4"
            style={{ fontFamily: 'Outfit' }}
          >
            Comment ça marche ?
          </h2>
          <p className="text-center text-muted-foreground mb-16 text-lg max-w-2xl mx-auto">
            Un matching intelligent en trois étapes simples
          </p>
          
          <div className="grid md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="bg-card rounded-2xl p-8 shadow-sm hover:shadow-md transition-all duration-300 border border-border/50">
              <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center mb-6">
                <Heart className="w-7 h-7 text-primary" strokeWidth={1.5} />
              </div>
              <h3 className="text-2xl font-semibold text-foreground mb-3" style={{ fontFamily: 'Outfit' }}>
                Likez les logements
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                Parcourez les annonces comme sur Tinder. Swipez à droite sur les logements qui vous plaisent.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-card rounded-2xl p-8 shadow-sm hover:shadow-md transition-all duration-300 border border-border/50">
              <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center mb-6">
                <Shield className="w-7 h-7 text-primary" strokeWidth={1.5} />
              </div>
              <h3 className="text-2xl font-semibold text-foreground mb-3" style={{ fontFamily: 'Outfit' }}>
                Matchez avec les bailleurs
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                Les bailleurs voient votre profil et peuvent matcher en retour. Score de compatibilité inclus.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-card rounded-2xl p-8 shadow-sm hover:shadow-md transition-all duration-300 border border-border/50">
              <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center mb-6">
                <MessageCircle className="w-7 h-7 text-primary" strokeWidth={1.5} />
              </div>
              <h3 className="text-2xl font-semibold text-foreground mb-3" style={{ fontFamily: 'Outfit' }}>
                Échangez directement
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                Une fois le match créé, discutez directement et organisez votre visite.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-5xl font-bold mb-2" style={{ fontFamily: 'Outfit', color: '#fec629' }}>95%</div>
              <p className="text-muted-foreground">Taux de satisfaction</p>
            </div>
            <div>
              <div className="text-5xl font-bold mb-2" style={{ fontFamily: 'Outfit', color: '#fec629' }}>2500+</div>
              <p className="text-muted-foreground">Étudiants logés</p>
            </div>
            <div>
              <div className="text-5xl font-bold mb-2" style={{ fontFamily: 'Outfit', color: '#fec629' }}>7j</div>
              <p className="text-muted-foreground">Temps moyen de matching</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary/5">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 
            className="text-4xl md:text-5xl font-semibold text-foreground mb-6"
            style={{ fontFamily: 'Outfit' }}
          >
            Prêt à trouver votre futur chez-vous ?
          </h2>
          <p className="text-lg text-muted-foreground mb-8">
            Rejoignez des milliers d'étudiants qui ont trouvé leur logement idéal sur Roomly
          </p>
          <Link to="/register">
            <Button 
              size="lg" 
              data-testid="cta-register-btn"
              className="rounded-full text-lg px-12 py-6 shadow-lg hover:shadow-xl hover:-translate-y-0.5"
            >
              Commencer gratuitement
              <ChevronRight className="ml-2" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-muted-foreground">
          <p>&copy; 2025 Roomly. Tous droits réservés.</p>
        </div>
      </footer>
    </div>
  );
}

// Composant pour l'animation des cartes
function AnimatedCardStack({ images }) {
  const [currentIndex, setCurrentIndex] = React.useState(0);

  React.useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % images.length);
    }, 3500); // Change card all 3.5 seconds

    return () => clearInterval(interval);
  }, [images.length]);

  return (
    <div className="relative w-full h-full flex items-center justify-center px-2 py-2">
      {/* Card Stack - All cards stacked */}
      {images.map((image, index) => {
        const isActive = index === currentIndex;
        const isPrev = index === (currentIndex - 1 + images.length) % images.length;

        return (
          <motion.div
            key={index}
            className="absolute w-72 h-[420px] rounded-3xl overflow-hidden shadow-xl border border-gray-200"
            initial={{ x: 0, opacity: isActive ? 1 : 0.3, scale: isActive ? 1 : 0.95, y: 0 }}
            animate={{
              x: isActive ? 0 : isPrev ? -450 : 450,
              opacity: isActive ? 1 : 0,
              scale: isActive ? 1 : 0.9,
              zIndex: isActive ? 10 : 0,
              rotateZ: isActive ? 0 : isPrev ? -8 : 8,
            }}
            exit={{
              x: isPrev ? -450 : 450,
              opacity: 0,
              scale: 0.9,
            }}
            transition={{
              type: "spring",
              stiffness: 80,
              damping: 18,
              duration: 0.7,
            }}
          >
            {/* Image */}
            <img
              src={image.url}
              alt={image.title}
              className="w-full h-full object-cover"
            />

            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"></div>

            {/* Card Info */}
            <div className="absolute bottom-0 left-0 right-0 p-5 text-white">
              <h3 className="font-semibold text-xl mb-1">{image.title}</h3>
              <p className="text-primary font-bold text-xl">{image.price}</p>
            </div>

            {/* Score de compatibilité */}
            {isActive && (
              <div className="absolute top-4 right-4 bg-primary/90 backdrop-blur-sm rounded-full px-3 py-1 flex items-center gap-1">
                <div className="w-2 h-2 bg-white rounded-full"></div>
                <span className="text-white font-semibold text-sm">92% Compatible</span>
              </div>
            )}

            {/* Action Icons on Swipe */}
            {isActive && (
              <>
                {/* Swipe Left Animation (Pass) */}
                <motion.div
                  className="absolute bottom-4 left-4"
                  animate={{
                    opacity: [0, 1, 0],
                    x: [0, -15, -30],
                  }}
                  transition={{
                    duration: 2.5,
                    delay: 0.5,
                    repeat: Infinity,
                  }}
                >
                  <motion.div
                    className="bg-red-500 rounded-full p-3 shadow-lg"
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 0.6, delay: 1 }}
                  >
                    <X className="w-6 h-6 text-white" />
                  </motion.div>
                </motion.div>

                {/* Swipe Right Animation (Like) */}
                <motion.div
                  className="absolute bottom-4 right-4"
                  animate={{
                    opacity: [0, 1, 0],
                    x: [0, 15, 30],
                  }}
                  transition={{
                    duration: 2.5,
                    delay: 1.5,
                    repeat: Infinity,
                  }}
                >
                  <motion.div
                    className="bg-primary rounded-full p-3 shadow-lg"
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 0.6, delay: 2 }}
                  >
                    <Heart className="w-6 h-6 text-white fill-white" />
                  </motion.div>
                </motion.div>
              </>
            )}
          </motion.div>
        );
      })}

      {/* Bottom indicator dots */}
      <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2">
        {images.map((_, index) => (
          <motion.div
            key={index}
            className={`w-2 h-2 rounded-full ${
              index === currentIndex ? "bg-primary" : "bg-gray-300"
            }`}
            animate={{
              scale: index === currentIndex ? 1.2 : 1,
            }}
            transition={{ duration: 0.3 }}
          />
        ))}
      </div>
    </div>
  );
}
