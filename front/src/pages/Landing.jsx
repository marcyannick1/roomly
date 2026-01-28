import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Home, Heart, MessageCircle, Shield, ChevronRight } from 'lucide-react';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import Autoplay from "embla-carousel-autoplay";

export default function Landing() {
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
                    className="rounded-full w-full sm:w-auto text-lg px-8 py-6 border-2 hover:bg-primary/10"
                  >
                    Je loue un logement
                    <ChevronRight className="ml-2" />
                  </Button>
                </Link>
              </div>
            </div>
            <div className="relative">
              <Carousel
                opts={{
                  loop: true,
                }}
                plugins={[
                  Autoplay({
                    delay: 4000,
                  }),
                ]}
                className="w-full"
              >
                <CarouselContent>
                  <CarouselItem>
                    <div className="aspect-square rounded-3xl overflow-hidden shadow-2xl border border-border/50">
                      <img 
                        src="https://images.unsplash.com/photo-1660182922635-713da2867c82?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjAzMzl8MHwxfHNlYXJjaHwxfHxoYXBweSUyMGRpdmVyc2UlMjB1bml2ZXJzaXR5JTIwc3R1ZGVudHMlMjBsaWZlc3R5bGV8ZW58MHx8fHwxNzY5NTk4MDMwfDA&ixlib=rb-4.1.0&q=85"
                        alt="Happy students"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </CarouselItem>
                  <CarouselItem>
                    <div className="aspect-square rounded-3xl overflow-hidden shadow-2xl border border-border/50">
                      <img 
                        src="https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?crop=entropy&cs=srgb&fm=jpg&q=85"
                        alt="Modern student apartment"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </CarouselItem>
                  <CarouselItem>
                    <div className="aspect-square rounded-3xl overflow-hidden shadow-2xl border border-border/50">
                      <img 
                        src="https://images.unsplash.com/photo-1555854877-bab0e564b8d5?crop=entropy&cs=srgb&fm=jpg&q=85"
                        alt="Cozy student room"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </CarouselItem>
                  <CarouselItem>
                    <div className="aspect-square rounded-3xl overflow-hidden shadow-2xl border border-border/50">
                      <img 
                        src="https://i.pinimg.com/1200x/1f/80/e7/1f80e7961ea527f3d9f92e0807ac0ed6.jpg"
                        alt="Students studying together"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </CarouselItem>
                </CarouselContent>
              </Carousel>
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
              <div className="text-5xl font-bold text-primary mb-2" style={{ fontFamily: 'Outfit' }}>95%</div>
              <p className="text-muted-foreground">Taux de satisfaction</p>
            </div>
            <div>
              <div className="text-5xl font-bold text-primary mb-2" style={{ fontFamily: 'Outfit' }}>2500+</div>
              <p className="text-muted-foreground">Étudiants logés</p>
            </div>
            <div>
              <div className="text-5xl font-bold text-primary mb-2" style={{ fontFamily: 'Outfit' }}>7j</div>
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
