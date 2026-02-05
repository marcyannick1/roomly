import { motion } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import { Home, Heart, MessageCircle, Calendar, Star, Bell, User, Settings, Flame, CheckCircle2, LogOut, Plus, Eye } from 'lucide-react';

export function DashboardNavbar({ user, onLogout }) {
  const navigate = useNavigate();
  const location = useLocation();
  const isStudent = user?.role === 'student';
  const isLandlord = user?.role === 'landlord';

  // Navigation items communes et spécifiques
  const studentItems = [
    { id: 'feed', icon: Flame, label: 'Découvrir', path: '/dashboard/feed', gradient: 'from-orange-400 to-red-500' },
    { id: 'matches', icon: CheckCircle2, label: 'Matchs', path: '/dashboard/matches', gradient: 'from-green-400 to-emerald-500' },
    { id: 'messages', icon: MessageCircle, label: 'Messages', path: '/dashboard/messages', gradient: 'from-blue-400 to-cyan-500' },
    { id: 'visits', icon: Calendar, label: 'Planning', path: '/dashboard/visits', gradient: 'from-teal-400 to-emerald-600' },
    { id: 'liked', icon: Star, label: 'Mes likes', path: '/dashboard/liked', gradient: 'from-yellow-400 to-amber-500' },
    { id: 'notifications', icon: Bell, label: 'Notifications', path: '/dashboard/notifications', gradient: 'from-purple-400 to-pink-500' },
    { id: 'profile', icon: User, label: 'Profil', path: '/dashboard/profile', gradient: 'from-indigo-400 to-purple-500' },
    { id: 'settings', icon: Settings, label: 'Paramètres', path: '/dashboard/settings', gradient: 'from-gray-400 to-slate-500' },
  ];

  const landlordItems = [
    { id: 'listings', icon: Home, label: 'Mes annonces', path: '/dashboard/listings', gradient: 'from-blue-500 to-indigo-600' },
    { id: 'students', icon: Heart, label: 'Intérêts reçus', path: '/dashboard/students', gradient: 'from-pink-500 to-rose-600' },
    { id: 'matches', icon: CheckCircle2, label: 'Matchs', path: '/dashboard/matches', gradient: 'from-green-400 to-emerald-500' },
    { id: 'messages', icon: MessageCircle, label: 'Messages', path: '/dashboard/messages', gradient: 'from-purple-500 to-pink-500' },
    { id: 'visits', icon: Calendar, label: 'Planning', path: '/dashboard/visits', gradient: 'from-teal-400 to-emerald-600' },
    { id: 'notifications', icon: Bell, label: 'Notifications', path: '/dashboard/notifications', gradient: 'from-purple-400 to-pink-500' },
    { id: 'profile', icon: User, label: 'Profil', path: '/dashboard/profile', gradient: 'from-indigo-400 to-purple-500' },
  ];

  const navItems = isStudent ? studentItems : landlordItems;

  return (
    <motion.aside
      className="w-72 bg-gradient-to-br from-[#fec629] to-[#f5b519] text-[#212220] flex flex-col shadow-2xl fixed left-0 top-0 h-screen z-50 border-r border-[#212220]/10"
      initial={{ x: -300 }}
      animate={{ x: 0 }}
      transition={{ type: "spring", damping: 20 }}
    >
      {/* Logo */}
      <div className="p-6 border-b border-[#212220]/10">
        <motion.div
          className="flex items-center gap-3 mb-6 cursor-pointer"
          whileHover={{ scale: 1.02 }}
          onClick={() => navigate('/dashboard')}
        >
          <div className="w-12 h-12 bg-[#212220] rounded-2xl flex items-center justify-center shadow-lg p-1 relative overflow-hidden">
            <motion.div
              className="absolute inset-0 bg-gradient-to-br from-[#fec629]/20 to-transparent"
              animate={{ rotate: 360 }}
              transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
            />
            <img
              src="/logo.svg"
              alt="Roomly Logo"
              className="w-full h-full object-contain relative z-10"
            />
          </div>
          <span className="text-2xl font-bold text-[#212220]" style={{ fontFamily: 'Outfit' }}>Roomly</span>
        </motion.div>

        {/* User info */}
        <motion.div
          className="bg-[#212220]/10 backdrop-blur-sm rounded-2xl p-4 border border-[#212220]/10 relative overflow-hidden"
          whileHover={{ scale: 1.02 }}
        >
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
            animate={{ x: [-200, 200] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
          <div className="flex items-center gap-3 relative z-10">
            <motion.div
              whileHover={{ scale: 1.1, rotate: 5 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              {user?.photo ? (
                <img
                  src={user.photo}
                  alt={user.name}
                  className="w-12 h-12 rounded-full object-cover shadow-lg border-2 border-[#212220]"
                />
              ) : (
                <div className="w-12 h-12 bg-[#212220] rounded-full flex items-center justify-center font-bold text-lg shadow-lg text-[#fec629]">
                  {user?.name?.charAt(0).toUpperCase() || 'U'}
                </div>
              )}
            </motion.div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-[#212220] truncate">{user?.name || 'Utilisateur'}</p>
              <p className="text-xs text-[#212220]/70 truncate">{user?.email || ''}</p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 px-3 overflow-y-auto">
        <div className="space-y-2">
          {navItems.map((item, index) => {
            const isActive = location.pathname === item.path;
            return (
              <motion.button
                key={item.id}
                onClick={() => navigate(item.path)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group relative overflow-hidden ${
                  isActive
                    ? 'bg-[#212220] text-[#fec629] shadow-lg'
                    : 'hover:bg-[#212220]/10 text-[#212220]/70 hover:text-[#212220]'
                }`}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {isActive && (
                  <motion.div
                    className={`absolute inset-0 bg-gradient-to-r ${item.gradient} opacity-20`}
                    layoutId="activeTab"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
                <item.icon className="w-5 h-5 relative z-10" />
                <span className="font-medium relative z-10">{item.label}</span>
                {item.badge > 0 && (
                  <motion.span
                    className="ml-auto bg-red-500 text-white text-xs px-2 py-0.5 rounded-full font-bold relative z-10"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 500, damping: 15 }}
                  >
                    {item.badge}
                  </motion.span>
                )}
              </motion.button>
            );
          })}
        </div>
      </nav>

      {/* Logout */}
      <div className="p-4 border-t border-[#212220]/10">
        <motion.button
          onClick={onLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-[#212220]/10 hover:bg-[#212220]/20 text-[#212220]/70 hover:text-[#212220] transition-all duration-200 group"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <motion.div
            animate={{ rotate: 0 }}
            whileHover={{ rotate: 180 }}
            transition={{ duration: 0.3 }}
          >
            <LogOut className="w-5 h-5" />
          </motion.div>
          <span className="font-medium">Déconnexion</span>
        </motion.button>
      </div>
    </motion.aside>
  );
}
