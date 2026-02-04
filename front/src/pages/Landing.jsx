import { Link } from 'react-router-dom';
import React from 'react';
import { Button } from '@/components/ui/button';
import { Home, Heart, MessageCircle, Shield, ChevronRight, X, Zap, User, Menu, Layers, Sparkles, ArrowRight, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Landing() {
  const [activeFeature, setActiveFeature] = React.useState(0);
  
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
    },
  ];

  const features = [
    {
      icon: Heart,
      title: "Likez les logements",
      description: "Parcourez les annonces comme sur Tinder. Swipez à droite sur les logements qui vous plaisent.",
      color: "#ff6b6b"
    },
    {
      icon: Sparkles,
      title: "Matchez avec les bailleurs",
      description: "Les bailleurs voient votre profil et peuvent matcher en retour. Score de compatibilité inclus.",
      color: "#fec629"
    },
    {
      icon: MessageCircle,
      title: "Échangez directement",
      description: "Une fois le match créé, discutez directement et organisez votre visite.",
      color: "#4ecdc4"
    }
  ];

  React.useEffect(() => {
    const interval = setInterval(() => {
      setActiveFeature((prev) => (prev + 1) % features.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      {/* Floating Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute w-96 h-96 rounded-full"
          style={{ 
            background: 'radial-gradient(circle, rgba(254, 198, 41, 0.15) 0%, transparent 70%)',
            top: '10%',
            right: '10%'
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
            bottom: '20%',
            left: '5%'
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

      {/* Header */}
      <motion.header 
        className="border-b border-border/50 backdrop-blur-xl bg-background/80 sticky top-0 z-50"
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <motion.div 
            className="flex items-center gap-3"
            whileHover={{ scale: 1.05 }}
          >
            <img src="/logo.svg" alt="Roomly" className="w-10 h-10" />
            <span className="text-2xl font-bold text-foreground" style={{ fontFamily: 'Outfit' }}>Roomly</span>
          </motion.div>
          <div className="flex gap-3">
            <Link to="/login">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button variant="outline" data-testid="header-login-btn" className="rounded-full">
                  Connexion
                </Button>
              </motion.div>
            </Link>
            <Link to="/register">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button data-testid="header-register-btn" className="rounded-full">
                  Inscription
                </Button>
              </motion.div>
            </Link>
          </div>
        </div>
      </motion.header>

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

      {/* Interactive Features Section */}
      <section className="py-20 bg-gradient-to-b from-secondary/30 to-transparent">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 
              className="text-4xl md:text-5xl font-semibold text-center text-foreground mb-4"
              style={{ fontFamily: 'Outfit' }}
            >
              Comment ça marche ?
            </h2>
            <p className="text-center text-muted-foreground mb-16 text-lg max-w-2xl mx-auto">
              Un matching intelligent en trois étapes simples
            </p>
          </motion.div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              const isActive = activeFeature === index;
              
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.2 }}
                  onMouseEnter={() => setActiveFeature(index)}
                  className="relative"
                >
                  <motion.div
                    className="bg-card rounded-2xl p-8 shadow-sm hover:shadow-xl transition-all duration-300 border border-border/50 h-full relative overflow-hidden cursor-pointer"
                    animate={{
                      scale: isActive ? 1.05 : 1,
                      borderColor: isActive ? feature.color : 'rgba(0,0,0,0.1)'
                    }}
                    transition={{ duration: 0.3 }}
                  >
                    {/* Animated Background Glow */}
                    <AnimatePresence>
                      {isActive && (
                        <motion.div
                          className="absolute inset-0 opacity-10"
                          style={{ backgroundColor: feature.color }}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 0.1 }}
                          exit={{ opacity: 0 }}
                        />
                      )}
                    </AnimatePresence>

                    {/* Number Badge */}
                    <motion.div
                      className="absolute top-4 right-4 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary"
                      animate={{
                        scale: isActive ? 1.2 : 1,
                        backgroundColor: isActive ? feature.color + '20' : 'rgba(254, 198, 41, 0.1)'
                      }}
                    >
                      {index + 1}
                    </motion.div>

                    <motion.div 
                      className="w-14 h-14 rounded-2xl flex items-center justify-center mb-6 relative"
                      style={{ backgroundColor: feature.color + '20' }}
                      animate={{
                        scale: isActive ? 1.1 : 1,
                        rotate: isActive ? 360 : 0
                      }}
                      transition={{ duration: 0.6 }}
                    >
                      <Icon 
                        className="w-7 h-7" 
                        style={{ color: feature.color }}
                        strokeWidth={1.5} 
                      />
                    </motion.div>

                    <h3 
                      className="text-2xl font-semibold text-foreground mb-3" 
                      style={{ fontFamily: 'Outfit' }}
                    >
                      {feature.title}
                    </h3>
                    <p className="text-muted-foreground leading-relaxed">
                      {feature.description}
                    </p>

                    {/* Animated Arrow */}
                    {index < features.length - 1 && (
                      <motion.div
                        className="hidden md:block absolute -right-4 top-1/2 -translate-y-1/2 z-20"
                        animate={{
                          x: isActive ? [0, 5, 0] : 0,
                          opacity: isActive ? 1 : 0.3
                        }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                      >
                        <ArrowRight className="w-8 h-8 text-primary" />
                      </motion.div>
                    )}
                  </motion.div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Animated Stats Section */}
      <section className="py-20 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8 text-center">
            {[
              { value: 95, suffix: '%', label: 'Taux de satisfaction' },
              { value: 2500, suffix: '+', label: 'Étudiants logés' },
              { value: 7, suffix: 'j', label: 'Temps moyen de matching' }
            ].map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.5 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <CountUpNumber value={stat.value} suffix={stat.suffix} />
                <p className="text-muted-foreground mt-2">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials with Animation */}
      <TestimonialsSection />

      {/* CTA Section with Particles */}
      <section className="py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-accent/10"></div>
        <FloatingParticles />
        
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
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
              <motion.div
                whileHover={{ scale: 1.05, y: -5 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button 
                  size="lg" 
                  data-testid="cta-register-btn"
                  className="rounded-full text-lg px-12 py-6 shadow-lg hover:shadow-2xl group"
                >
                  Commencer gratuitement
                  <motion.div
                    className="ml-2"
                    animate={{ x: [0, 5, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  >
                    <ChevronRight />
                  </motion.div>
                </Button>
              </motion.div>
            </Link>
          </motion.div>
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

// Animated Card Stack Component
function AnimatedCardStack({ images }) {
  const [currentIndex, setCurrentIndex] = React.useState(0);
  const [direction, setDirection] = React.useState(0);

  React.useEffect(() => {
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
            className="rounded-full"
            animate={{
              width: index === currentIndex ? 24 : 8,
              backgroundColor: index === currentIndex ? '#fec629' : '#d1d5db',
            }}
            className="h-2"
            transition={{ duration: 0.3 }}
          />
        ))}
      </div>
    </div>
  );
}

// Magnetic Connection Lines Component
function MagneticConnectionLines() {
  return (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
      {[...Array(6)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute"
          style={{
            width: 2,
            height: 100,
            background: 'linear-gradient(to bottom, transparent, #fec629, transparent)',
            transformOrigin: 'top center',
          }}
          animate={{
            rotate: i * 60,
            scale: [1, 1.2, 1],
            opacity: [0.2, 0.5, 0.2],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            delay: i * 0.5,
          }}
        />
      ))}
    </div>
  );
}

// Floating Match Badges Component
function FloatingMatchBadges() {
  const badges = [
    { text: "Match!", icon: Heart, color: "#ff6b6b", position: { top: "15%", right: "-10%" } },
    { text: "+92%", icon: Zap, color: "#fec629", position: { bottom: "20%", left: "-15%" } },
    { text: "Nouveau", icon: Sparkles, color: "#4ecdc4", position: { top: "50%", right: "-12%" } },
  ];

  return (
    <>
      {badges.map((badge, index) => {
        const Icon = badge.icon;
        return (
          <motion.div
            key={index}
            className="absolute z-0 bg-white rounded-full px-4 py-2 shadow-lg flex items-center gap-2 border-2"
            style={{ 
              ...badge.position,
              borderColor: badge.color 
            }}
            animate={{
              y: [0, -10, 0],
              rotate: [-5, 5, -5],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              delay: index * 0.5,
            }}
            initial={{ opacity: 0, scale: 0 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
          >
            <Icon className="w-4 h-4" style={{ color: badge.color }} />
            <span className="font-bold text-sm" style={{ color: badge.color }}>{badge.text}</span>
          </motion.div>
        );
      })}
    </>
  );
}

// Count Up Number Component
function CountUpNumber({ value, suffix }) {
  const [count, setCount] = React.useState(0);
  const ref = React.useRef(null);
  const [hasAnimated, setHasAnimated] = React.useState(false);

  React.useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated) {
          setHasAnimated(true);
          let start = 0;
          const end = value;
          const duration = 2000;
          const increment = end / (duration / 16);

          const timer = setInterval(() => {
            start += increment;
            if (start >= end) {
              setCount(end);
              clearInterval(timer);
            } else {
              setCount(Math.floor(start));
            }
          }, 16);

          return () => clearInterval(timer);
        }
      },
      { threshold: 0.5 }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, [value, hasAnimated]);

  return (
    <div ref={ref} className="text-5xl font-bold" style={{ fontFamily: 'Outfit', color: '#fec629' }}>
      {count}{suffix}
    </div>
  );
}

// Testimonials Section Component
function TestimonialsSection() {
  const testimonials = [
    {
      text: "J'ai trouvé mon appart en 3 jours ! Le système de matching est vraiment bien fait.",
      author: "Marie L.",
      role: "Étudiante en médecine",
      avatar: "https://i.pravatar.cc/100?img=1"
    },
    {
      text: "Interface intuitive et résultats rapides. Exactement ce qu'il me fallait !",
      author: "Thomas B.",
      role: "Étudiant en commerce",
      avatar: "https://i.pravatar.cc/100?img=2"
    },
    {
      text: "Le score de compatibilité m'a aidé à choisir le bon logement du premier coup.",
      author: "Sarah K.",
      role: "Étudiante en droit",
      avatar: "https://i.pravatar.cc/100?img=3"
    },
  ];

  return (
    <section className="py-20 bg-gradient-to-b from-transparent to-secondary/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.h2 
          className="text-4xl font-semibold text-center text-foreground mb-12"
          style={{ fontFamily: 'Outfit' }}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          Ce qu'en disent nos utilisateurs
        </motion.h2>

        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              whileHover={{ y: -5, transition: { duration: 0.2 } }}
            >
              <div className="bg-card rounded-2xl p-6 shadow-sm hover:shadow-lg transition-all border border-border/50 h-full">
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <motion.svg
                      key={i}
                      className="w-5 h-5 fill-primary"
                      viewBox="0 0 20 20"
                      initial={{ opacity: 0, scale: 0 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.5 + i * 0.05 }}
                    >
                      <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z"/>
                    </motion.svg>
                  ))}
                </div>
                <p className="text-muted-foreground mb-6 italic">"{testimonial.text}"</p>
                <div className="flex items-center gap-3">
                  <img 
                    src={testimonial.avatar} 
                    alt={testimonial.author}
                    className="w-12 h-12 rounded-full"
                  />
                  <div>
                    <p className="font-semibold text-foreground">{testimonial.author}</p>
                    <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// Floating Particles Component
function FloatingParticles() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {[...Array(20)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-2 h-2 bg-primary/30 rounded-full"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
          }}
          animate={{
            y: [0, -30, 0],
            x: [0, Math.random() * 20 - 10, 0],
            opacity: [0.2, 0.8, 0.2],
          }}
          transition={{
            duration: 3 + Math.random() * 2,
            repeat: Infinity,
            delay: Math.random() * 2,
          }}
        />
      ))}
    </div>
  );
}