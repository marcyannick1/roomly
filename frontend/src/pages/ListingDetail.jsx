import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { getListing, getUserById, getCurrentUser } from '@/lib/api';
import { Button } from '@/components/ui/button';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious
} from '@/components/ui/carousel';
import { ArrowLeft, MapPin, Home, User, CheckCircle, Share2, Maximize2, X, Flame, LogOut, Eye, Settings, Plus, Heart, MessageCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

export default function ListingDetail() {
  const { listingId } = useParams();
  const navigate = useNavigate();
  const [listing, setListing] = useState(null);
  const [landlord, setLandlord] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [error, setError] = useState(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);

  // Navigation adaptée selon le type d'utilisateur
  const navItems = useMemo(() => {
    if (!currentUser) return [];
    
    if (currentUser.is_landlord) {
      return [
        { id: 'listings', icon: Home, label: 'Mes annonces', path: '/landlord/dashboard' },
        { id: 'students', icon: Eye, label: 'Intéressés', path: '/landlord/dashboard' },
        { id: 'create', icon: Plus, label: 'Créer une annonce', path: '/landlord/listing/new' },
        { id: 'profile', icon: User, label: 'Profil', path: null },
        { id: 'settings', icon: Settings, label: 'Paramètres', path: null },
      ];
    } else {
      // Navigation étudiant
      return [
        { id: 'feed', icon: Flame, label: 'Découvrir', path: '/student/dashboard' },
        { id: 'liked', icon: Heart, label: 'Likés', path: '/student/dashboard' },
        { id: 'matches', icon: MessageCircle, label: 'Matchs', path: '/student/dashboard' },
        { id: 'profile', icon: User, label: 'Profil', path: null },
        { id: 'settings', icon: Settings, label: 'Paramètres', path: null },
      ];
    }
  }, [currentUser]);

  // useMemo DOIT être avant tout return conditionnel
  const amenities = useMemo(() => {
    if (!listing) return [];
    const items = [];
    if (listing.wifi) items.push('📶 WiFi');
    if (listing.workspace) items.push('💻 Espace de travail');
    if (listing.parking) items.push('🅿️ Parking');
    if (listing.pets) items.push('🐾 Animaux acceptés');
    if (listing.tv) items.push('📺 Télévision');
    if (listing.elevator) items.push('🛗 Ascenseur');
    if (listing.washing_machine) items.push('🧺 Lave-linge');
    if (listing.dryer) items.push('🌡️ Sèche-linge');
    if (listing.ac) items.push('❄️ Climatisation');
    if (listing.kitchen) items.push('🍳 Cuisine équipée');
    if (listing.garden) items.push('🌿 Jardin');
    if (listing.balcony) items.push('🏠 Balcon/Terrasse');
    return items;
  }, [listing]);
  
  const photos = listing?.photos?.map(p => p.url) || [];

  useEffect(() => {
    // ⛔ STOP si pas d'ID
    if (!listingId) {
      console.warn("Listing ID undefined, skipping API call");
      setError("ID d'annonce manquant");
      return;
    }

    const loadData = async () => {
      try {
        setError(null);
        
        // Charger l'utilisateur courant
        const userResponse = await getCurrentUser();
        const userData = userResponse.data?.user || userResponse.data;
        setCurrentUser(userData);
        
        const listingResponse = await getListing(listingId);
        setListing(listingResponse.data);

        if (listingResponse.data?.owner_id) {
          try {
            const landlordResponse = await getUserById(listingResponse.data.owner_id);
            setLandlord(landlordResponse.data);
          } catch (userError) {
            console.error('Error loading landlord:', userError);
            setLandlord(null);
          }
        }
      } catch (error) {
        console.error('Error loading listing:', error);
        setError("Annonce introuvable");
      }
    };

    loadData();
  }, [listingId]);

  useEffect(() => {
    document.body.classList.add('has-dashboard-sidebar');
    return () => {
      document.body.classList.remove('has-dashboard-sidebar');
    };
  }, []);

  if (!listing && !error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-3xl mx-auto px-4 py-12 text-center">
          <h1 className="text-3xl font-bold text-foreground mb-3" style={{ fontFamily: 'Outfit' }}>
            {error}
          </h1>
          <p className="text-muted-foreground mb-6">L'annonce demandée n'existe pas ou n'est plus disponible.</p>
          <Link to="/landlord/dashboard">
            <Button className="rounded-full">Retour au dashboard</Button>
          </Link>
        </div>
      </div>
    );
  }

  const handleShare = async () => {
    const shareData = {
      title: listing.title,
      text: `Découvre cette annonce sur Roomly : ${listing.title}`,
      url: window.location.href
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        // ignore user cancel
      }
    } else if (navigator.clipboard) {
      await navigator.clipboard.writeText(window.location.href);
    }
  };

  const nextImage = () => {
    if (!photos.length) return;
    setActiveIndex((prev) => (prev + 1) % photos.length);
  };

  const prevImage = () => {
    if (!photos.length) return;
    setActiveIndex((prev) => (prev - 1 + photos.length) % photos.length);
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <aside className="dashboard-sidebar w-72 bg-[#fec629] text-[#212220] flex flex-col shadow-2xl fixed left-0 top-0 h-screen z-50">
        <div className="p-6 border-b border-black/10">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-[#212220] rounded-2xl flex items-center justify-center shadow-lg p-2">
              <img src="/logo.svg" alt="Roomly" className="w-full h-full" />
            </div>
            <span className="text-2xl font-bold text-[#212220]" style={{ fontFamily: 'Outfit' }}>Roomly</span>
          </div>

          <div className="bg-black/5 rounded-2xl p-4 border border-black/10">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-[#212220] rounded-full flex items-center justify-center font-bold text-lg shadow-lg text-[#fec629]">
                {currentUser?.name?.charAt(0).toUpperCase() || 'U'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-[#212220] truncate">{currentUser?.name || 'Utilisateur'}</p>
                <p className="text-xs text-[#212220]/70 truncate">{currentUser?.email || ''}</p>
              </div>
            </div>
          </div>
        </div>

        <nav className="flex-1 py-4 px-3">
          <div className="space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = false;

              return (
                <button
                  key={item.id}
                  onClick={() => {
                    if (item.path) {
                      navigate(item.path);
                    } else if (item.id === 'profile' && currentUser?.id) {
                      navigate(`/profile/${currentUser.id}`);
                    } else if (item.id === 'settings') {
                      // Settings en cours de développement
                    } else if (item.id === 'students') {
                      navigate('/landlord/dashboard');
                    }
                  }}
                  className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-xl transition-all duration-200 group relative ${
                    isActive
                      ? 'bg-[#212220] text-[#fec629] shadow-lg'
                      : 'hover:bg-black/5 text-[#212220]/70 hover:text-[#212220]'
                  }`}
                  data-testid={`nav-${item.id}`}
                >
                  <Icon className={`w-5 h-5 ${isActive ? 'text-[#fec629]' : 'text-[#212220]/70'}`} />
                  <span className="font-medium">{item.label}</span>

                  {isActive && (
                    <motion.div
                      layoutId="activeNavListingDetail"
                      className="absolute inset-0 bg-[#212220] rounded-xl -z-10"
                      transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                    />
                  )}
                </button>
              );
            })}
          </div>
        </nav>

        <div className="p-4 border-t border-black/10">
          <button
            onClick={() => {
              document.cookie = 'session_token=; path=/; max-age=0';
              window.location.href = '/';
            }}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-black/5 hover:bg-black/10 text-[#212220]/70 hover:text-[#212220] transition-all duration-200"
            data-testid="logout-btn"
          >
            <LogOut className="w-5 h-5" />
            <span className="font-medium">Déconnexion</span>
          </button>
        </div>
      </aside>

      <main className="flex-1 ml-72">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <Button 
          variant="ghost" 
          className="mb-6 rounded-full"
          onClick={() => navigate(currentUser?.is_landlord ? '/landlord/dashboard' : '/student/dashboard')}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Retour
        </Button>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-card rounded-3xl border border-border/50 shadow-lg overflow-hidden">
              {photos.length ? (
                <div className="relative">
                  <Carousel className="w-full">
                    <CarouselContent>
                      {photos.map((photo, index) => (
                        <CarouselItem key={`${photo}-${index}`}>
                          <div className="aspect-video bg-muted">
                            <img
                              src={photo}
                              alt={`Photo ${index + 1}`}
                              className="h-full w-full object-cover cursor-zoom-in"
                              onClick={() => {
                                setActiveIndex(index);
                                setIsFullscreen(true);
                              }}
                            />
                          </div>
                        </CarouselItem>
                      ))}
                    </CarouselContent>
                    <CarouselPrevious className="left-3" />
                    <CarouselNext className="right-3" />
                  </Carousel>
                  <button
                    type="button"
                    onClick={() => {
                      setActiveIndex(0);
                      setIsFullscreen(true);
                    }}
                    className="absolute top-4 right-4 rounded-full bg-background/80 backdrop-blur px-3 py-2 text-xs font-semibold shadow"
                  >
                    <Maximize2 className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <div className="aspect-video bg-muted flex items-center justify-center">
                  <Home className="h-16 w-16 text-muted-foreground" />
                </div>
              )}
            </div>

            <div className="bg-card rounded-3xl border border-border/50 shadow-lg p-6">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <h1 className="text-3xl font-bold text-foreground" style={{ fontFamily: 'Outfit' }}>
                    {listing.title}
                  </h1>
                  <div className="flex items-center text-muted-foreground mt-2">
                    <MapPin className="h-4 w-4 mr-2" />
                    {listing.address || listing.city || 'Adresse non renseignée'}
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-primary">{listing.price}€/mois</p>
                  <p className="text-sm text-muted-foreground">
                    {listing.surface}m² • {listing.room_type}
                  </p>
                </div>
              </div>

              <div className="mt-5 flex flex-wrap items-center gap-3">
                <Button variant="outline" className="rounded-full" onClick={handleShare}>
                  <Share2 className="h-4 w-4 mr-2" />
                  Partager
                </Button>
                {landlord?.user_type === 'landlord' && (
                  <span className="inline-flex items-center gap-2 rounded-full bg-primary/10 text-primary px-3 py-1 text-xs font-semibold">
                    <CheckCircle className="h-4 w-4" />
                    Bailleur vérifié
                  </span>
                )}
              </div>

              <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="rounded-2xl bg-muted/40 p-4 text-center">
                  <p className="text-sm text-muted-foreground">Type</p>
                  <p className="font-semibold text-foreground capitalize">{listing.room_type}</p>
                </div>
                <div className="rounded-2xl bg-muted/40 p-4 text-center">
                  <p className="text-sm text-muted-foreground">Meublé</p>
                  <p className="font-semibold text-foreground">{listing.furnished ? 'Oui' : 'Non'}</p>
                </div>
                <div className="rounded-2xl bg-muted/40 p-4 text-center">
                  <p className="text-sm text-muted-foreground">Charges</p>
                  <p className="font-semibold text-foreground">{listing.charges_included ? 'Incluses' : 'Non incluses'}</p>
                </div>
                <div className="rounded-2xl bg-muted/40 p-4 text-center">
                  <p className="text-sm text-muted-foreground">Caution</p>
                  <p className="font-semibold text-foreground">{listing.deposit}€</p>
                </div>
              </div>

              <div className="mt-6">
                <h2 className="text-lg font-semibold text-foreground mb-2">Description</h2>
                <p className="text-muted-foreground leading-relaxed">
                  {listing.description || 'Aucune description fournie.'}
                </p>
              </div>

              <div className="mt-6">
                <h2 className="text-lg font-semibold text-foreground mb-3">Équipements</h2>
                {amenities.length ? (
                  <div className="flex flex-wrap gap-2">
                    {amenities.map((item, index) => (
                      <span
                        key={`${item}-${index}`}
                        className="rounded-full bg-muted/40 px-3 py-1 text-xs font-medium text-foreground"
                      >
                        {item}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">Aucun équipement renseigné.</p>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-card rounded-3xl border border-border/50 shadow-lg p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="h-12 w-12 rounded-2xl bg-muted/40 flex items-center justify-center">
                  <User className="h-5 w-5 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Bailleur</p>
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-foreground">
                      {landlord?.name || 'Propriétaire'}
                    </p>
                    {landlord?.user_type === 'landlord' && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 text-primary px-2 py-0.5 text-xs font-semibold">
                        <CheckCircle className="h-3 w-3" />
                        Vérifié
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <div className="space-y-2 text-sm text-muted-foreground">
                <p>Email: {landlord?.email || 'Non communiqué'}</p>
                <p>Téléphone: {landlord?.telephone || 'Non communiqué'}</p>
                <p>Statut: {landlord?.user_type === 'landlord' ? 'Bailleur vérifié' : 'Bailleur'}</p>
              </div>
              <div className="mt-5 grid gap-2">
                <Button className="w-full rounded-full">Contacter le bailleur</Button>
                {landlord?.id && (
                  <Link to={`/profile/${landlord.id}`}>
                    <Button variant="outline" className="w-full rounded-full">Voir le profil</Button>
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>

        {isFullscreen && photos.length > 0 && (
          <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center">
            <button
              type="button"
              onClick={() => setIsFullscreen(false)}
              className="absolute top-6 right-6 rounded-full bg-white/10 p-2 text-white"
              aria-label="Fermer"
            >
              <X className="h-5 w-5" />
            </button>

            <button
              type="button"
              onClick={prevImage}
              className="absolute left-6 top-1/2 -translate-y-1/2 rounded-full bg-white/10 p-2 text-white"
              aria-label="Précédent"
            >
              <CarouselPrevious className="static h-5 w-5" />
            </button>

            <div className="max-w-5xl w-full px-6">
              <div className="aspect-video bg-black">
                <img
                  src={photos[activeIndex]}
                  alt={`Photo ${activeIndex + 1}`}
                  className="h-full w-full object-contain"
                />
              </div>
              <div className="mt-4 grid grid-cols-6 gap-2">
                {photos.map((photo, index) => (
                  <button
                    key={`${photo}-${index}`}
                    type="button"
                    onClick={() => setActiveIndex(index)}
                    className={`rounded-xl overflow-hidden border ${
                      index === activeIndex ? 'border-primary' : 'border-white/20'
                    }`}
                  >
                    <img src={photo} alt={`Miniature ${index + 1}`} className="h-16 w-full object-cover" />
                  </button>
                ))}
              </div>
            </div>

            <button
              type="button"
              onClick={nextImage}
              className="absolute right-6 top-1/2 -translate-y-1/2 rounded-full bg-white/10 p-2 text-white"
              aria-label="Suivant"
            >
              <CarouselNext className="static h-5 w-5" />
            </button>
          </div>
        )}
      </div>
      </main>
    </div>
  );
}
