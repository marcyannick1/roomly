import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getCurrentUser, getStudentProfile, getLandlordProfile } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Mail, User, Phone, MapPin, GraduationCap, Home, DollarSign, CheckCircle, XCircle, Volume2, Heart, Building2, Calendar, Eye, LogOut, Flame, Settings, Plus, MessageCircle, Star } from 'lucide-react';
import { motion } from 'framer-motion';

export default function UserProfile() {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [userId]);

  useEffect(() => {
    document.body.classList.add('has-dashboard-sidebar');
    return () => {
      document.body.classList.remove('has-dashboard-sidebar');
    };
  }, []);

  const loadData = async () => {
    try {
      setError(null);
      setLoading(true);

      // Load current authenticated user (JWT-based, no ID needed)
      const currentUserResponse = await getCurrentUser();
      const currentUserData = currentUserResponse.data;
      setCurrentUser(currentUserData);
      setUser(currentUserData); // Profile page always shows own profile

      // Load profile based on role
      if (currentUserData.role === 'student') {
        try {
          const profileResponse = await getStudentProfile();
          setProfile(profileResponse.data);
        } catch (err) {
          console.log('No student profile found yet');
        }
      } else {
        try {
          const profileResponse = await getLandlordProfile();
          setProfile(profileResponse.data);
        } catch (err) {
          console.log('No landlord profile found yet');
        }
      }
    } catch (err) {
      console.error('Error loading profile:', err);
      setError("Utilisateur introuvable");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    // Clear access_token cookie
    document.cookie = 'access_token=; path=/; max-age=0';
    navigate('/');
  };

  // Navigation items based on user type
  const navItems = currentUser?.role === 'student'
    ? [
      { id: 'feed', icon: Flame, label: 'Découvrir', path: '/student/dashboard' },
      { id: 'matches', icon: MessageCircle, label: 'Matchs', path: '/student/dashboard' },
      { id: 'liked', icon: Star, label: 'Mes likes', path: '/student/dashboard' },
      { id: 'profile', icon: User, label: 'Profil', path: `/profile/${currentUser?.id}` },
      { id: 'settings', icon: Settings, label: 'Paramètres', path: null },
    ]
    : [
      { id: 'listings', icon: Home, label: 'Mes annonces', path: '/landlord/dashboard' },
      { id: 'students', icon: Eye, label: 'Intéressés', path: '/landlord/dashboard' },
      { id: 'create', icon: Plus, label: 'Créer une annonce', path: '/landlord/listing/new' },
      { id: 'profile', icon: User, label: 'Profil', path: `/profile/${currentUser?.id}` },
      { id: 'settings', icon: Settings, label: 'Paramètres', path: null },
    ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#fec629]"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex">
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
              const isActive = item.id === 'profile';

              return (
                <button
                  key={item.id}
                  onClick={() => {
                    if (item.path) {
                      navigate(item.path);
                    } else if (item.id === 'settings') {
                      // Settings en cours
                    }
                  }}
                  className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-xl transition-all duration-200 group relative ${isActive
                    ? 'bg-[#212220] text-[#fec629] shadow-lg'
                    : 'hover:bg-black/5 text-[#212220]/70 hover:text-[#212220]'
                    }`}
                >
                  <Icon className={`w-5 h-5 ${isActive ? 'text-[#fec629]' : 'text-[#212220]/70'}`} />
                  <span className="font-medium">{item.label}</span>

                  {isActive && (
                    <motion.div
                      layoutId="activeNavProfile"
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
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-black/5 hover:bg-black/10 text-[#212220]/70 hover:text-[#212220] transition-all duration-200"
          >
            <LogOut className="w-5 h-5" />
            <span className="font-medium">Déconnexion</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 ml-72 bg-white">
        <div className="max-w-5xl mx-auto px-6 py-8">
          {error ? (
            <div className="bg-white rounded-3xl p-12 shadow-lg border-2 border-gray-100 text-center">
              <h1 className="text-3xl font-bold text-[#212220] mb-3" style={{ fontFamily: 'Outfit' }}>
                {error}
              </h1>
              <p className="text-gray-600 mb-6">Le profil demandé n'existe pas.</p>
              <Button onClick={() => navigate(currentUser?.role === 'student' ? '/student/dashboard' : '/landlord/dashboard')} className="bg-[#fec629] hover:bg-[#212220] text-[#212220] hover:text-[#fec629] rounded-full">
                Retour au dashboard
              </Button>
            </div>
          ) : (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
              {/* Header */}
              <div className="bg-white rounded-3xl p-8 shadow-lg border-2 border-gray-100">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-6">
                    <div className="w-24 h-24 bg-[#fec629] rounded-2xl flex items-center justify-center font-bold text-4xl text-[#212220] shadow-xl">
                      {user?.name?.charAt(0).toUpperCase() || 'U'}
                    </div>
                    <div>
                      <h1 className="text-4xl font-bold text-[#212220] mb-2" style={{ fontFamily: 'Outfit' }}>
                        {user?.name}
                      </h1>
                      <div className="flex items-center gap-3">
                        <span className="bg-[#fec629] text-[#212220] px-4 py-1.5 rounded-full text-sm font-bold">
                          {user?.role === "landlord" ? '🏠 Bailleur' : '🎓 Étudiant'}
                        </span>
                        {user?.created_at && (
                          <span className="text-gray-600">Membre depuis {new Date(user.created_at).toLocaleDateString('fr-FR')}</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Informations générales */}
              <div className="bg-white rounded-3xl p-8 shadow-lg border-2 border-gray-100">
                <h2 className="text-2xl font-bold text-[#212220] mb-6" style={{ fontFamily: 'Outfit' }}>
                  📋 Informations générales
                </h2>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="bg-gray-50 rounded-2xl p-4">
                    <div className="flex items-center gap-2 text-gray-600 text-sm mb-1">
                      <Mail className="w-4 h-4" />
                      Email
                    </div>
                    <p className="font-semibold text-[#212220]">{user?.email}</p>
                  </div>
                  {user?.telephone && (
                    <div className="bg-gray-50 rounded-2xl p-4">
                      <div className="flex items-center gap-2 text-gray-600 text-sm mb-1">
                        <Phone className="w-4 h-4" />
                        Téléphone
                      </div>
                      <p className="font-semibold text-[#212220]">{user?.telephone}</p>
                    </div>
                  )}
                  <div className="bg-gray-50 rounded-2xl p-4">
                    <div className="flex items-center gap-2 text-gray-600 text-sm mb-1">
                      <User className="w-4 h-4" />
                      Type de compte
                    </div>
                    <p className="font-semibold text-[#212220]">
                      {user?.role === "landlord" ? 'Bailleur' : 'Étudiant'}
                    </p>
                  </div>
                  <div className="bg-gray-50 rounded-2xl p-4">
                    <div className="flex items-center gap-2 text-gray-600 text-sm mb-1">
                      <Calendar className="w-4 h-4" />
                      Identifiant
                    </div>
                    <p className="font-semibold text-[#212220]">#{user?.id}</p>
                  </div>
                </div>
              </div>

              {/* Student Profile */}
              {!user?.role === "landlord" && profile && (
                <>
                  <div className="bg-white rounded-3xl p-8 shadow-lg border-2 border-gray-100">
                    <h2 className="text-2xl font-bold text-[#212220] mb-6" style={{ fontFamily: 'Outfit' }}>
                      🏠 Préférences de logement
                    </h2>
                    <div className="grid md:grid-cols-3 gap-4">
                      <div className="bg-gray-50 rounded-2xl p-4">
                        <div className="flex items-center gap-2 text-gray-600 text-sm mb-1">
                          <Home className="w-4 h-4" />
                          Type de logement
                        </div>
                        <p className="font-semibold text-[#212220]">{profile.room_type || 'Non spécifié'}</p>
                      </div>
                      <div className="bg-gray-50 rounded-2xl p-4">
                        <div className="flex items-center gap-2 text-gray-600 text-sm mb-1">
                          <DollarSign className="w-4 h-4" />
                          Budget maximum
                        </div>
                        <p className="font-semibold text-[#212220]">{profile.max_budget}€/mois</p>
                      </div>
                      <div className="bg-gray-50 rounded-2xl p-4">
                        <div className="flex items-center gap-2 text-gray-600 text-sm mb-1">
                          <CheckCircle className="w-4 h-4" />
                          Meublé
                        </div>
                        <p className="font-semibold text-[#212220]">{profile.furnished ? 'Oui' : 'Non'}</p>
                      </div>
                      <div className="bg-gray-50 rounded-2xl p-4">
                        <div className="flex items-center gap-2 text-gray-600 text-sm mb-1">
                          {profile.smoking ? <CheckCircle className="w-4 h-4 text-green-600" /> : <XCircle className="w-4 h-4 text-red-600" />}
                          Fumeur
                        </div>
                        <p className="font-semibold text-[#212220]">{profile.smoking ? 'Oui' : 'Non'}</p>
                      </div>
                      <div className="bg-gray-50 rounded-2xl p-4">
                        <div className="flex items-center gap-2 text-gray-600 text-sm mb-1">
                          {profile.pets ? <CheckCircle className="w-4 h-4 text-green-600" /> : <XCircle className="w-4 h-4 text-red-600" />}
                          Animaux
                        </div>
                        <p className="font-semibold text-[#212220]">{profile.pets ? 'Oui' : 'Non'}</p>
                      </div>
                      <div className="bg-gray-50 rounded-2xl p-4">
                        <div className="flex items-center gap-2 text-gray-600 text-sm mb-1">
                          <Volume2 className="w-4 h-4" />
                          Niveau sonore
                        </div>
                        <p className="font-semibold text-[#212220]">{profile.noise_level}/10</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-3xl p-8 shadow-lg border-2 border-gray-100">
                    <h2 className="text-2xl font-bold text-[#212220] mb-6" style={{ fontFamily: 'Outfit' }}>
                      🎓 Informations académiques
                    </h2>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="bg-gray-50 rounded-2xl p-4">
                        <div className="flex items-center gap-2 text-gray-600 text-sm mb-1">
                          <GraduationCap className="w-4 h-4" />
                          Université
                        </div>
                        <p className="font-semibold text-[#212220]">{profile.university || 'Non renseigné'}</p>
                      </div>
                      <div className="bg-gray-50 rounded-2xl p-4">
                        <div className="flex items-center gap-2 text-gray-600 text-sm mb-1">
                          <Building2 className="w-4 h-4" />
                          Niveau d'études
                        </div>
                        <p className="font-semibold text-[#212220]">{profile.study_level || 'Non renseigné'}</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-3xl p-8 shadow-lg border-2 border-gray-100">
                    <h2 className="text-2xl font-bold text-[#212220] mb-6" style={{ fontFamily: 'Outfit' }}>
                      💰 Informations financières
                    </h2>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="bg-gray-50 rounded-2xl p-4">
                        <div className="flex items-center gap-2 text-gray-600 text-sm mb-1">
                          <DollarSign className="w-4 h-4" />
                          Revenus du garant
                        </div>
                        <p className="font-semibold text-[#212220]">{profile.guarantor_income}€/mois</p>
                      </div>
                    </div>
                  </div>

                  {profile.passions && (
                    <div className="bg-white rounded-3xl p-8 shadow-lg border-2 border-gray-100">
                      <h2 className="text-2xl font-bold text-[#212220] mb-6" style={{ fontFamily: 'Outfit' }}>
                        💚 Centres d'intérêt
                      </h2>
                      <div className="bg-gray-50 rounded-2xl p-4">
                        <p className="text-[#212220] leading-relaxed">{profile.passions}</p>
                      </div>
                    </div>
                  )}
                </>
              )}

              {/* Landlord Profile */}
              {user?.role === 'landlord' && profile && (
                <div className="bg-white rounded-3xl p-8 shadow-lg border-2 border-gray-100">
                  <h2 className="text-2xl font-bold text-[#212220] mb-6" style={{ fontFamily: 'Outfit' }}>
                    🏘️ Informations bailleur
                  </h2>
                  <div className="grid md:grid-cols-2 gap-4">
                    {profile.telephone && (
                      <div className="bg-gray-50 rounded-2xl p-4">
                        <div className="flex items-center gap-2 text-gray-600 text-sm mb-1">
                          <Phone className="w-4 h-4" />
                          Téléphone professionnel
                        </div>
                        <p className="font-semibold text-[#212220]">{profile.telephone}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </div>
      </main>
    </div>
  );
}
