import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import { Home, Heart, MessageCircle, Calendar, Star, Bell, User, Settings, Flame, CheckCircle2, LogOut, Users, TrendingUp, Puzzle, Terminal } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export function DashboardNavbar({ user, onLogout }) {
  const navigate = useNavigate();
  const location = useLocation();
  const isStudent = user?.role === 'student';
  const [hoveredIndex, setHoveredIndex] = React.useState(null);

  const studentItems = [
    { id: 'feed', icon: Home, label: 'Dashboard', path: '/dashboard/feed' },
    { id: 'matches', icon: CheckCircle2, label: 'Matchs', path: '/dashboard/matches' },
    { id: 'messages', icon: MessageCircle, label: 'Messages', path: '/dashboard/messages' },
    { id: 'visits', icon: Calendar, label: 'Planning', path: '/dashboard/visits' },
  ];

  const landlordItems = [
    { id: 'listings', icon: Home, label: 'Dashboard', path: '/dashboard/listings' },
    { id: 'students', icon: TrendingUp, label: 'Intérêts', path: '/dashboard/students' },
    { id: 'matches', icon: Users, label: 'Locataires', path: '/dashboard/matches' },
    { id: 'messages', icon: MessageCircle, label: 'Messages', path: '/dashboard/messages' },
  ];

  const bottomItems = [
    { id: 'integrations', icon: Puzzle, label: 'Intégrations', path: '/dashboard/integrations' },
    { id: 'settings', icon: Settings, label: 'Paramètres', path: '/dashboard/settings' },
  ];

  const navItems = isStudent ? studentItems : landlordItems;

  const NavItem = ({ item, index }) => {
    const isActive = location.pathname === item.path;
    const isHovered = hoveredIndex === index;
    const Icon = item.icon;

    return (
      <TooltipProvider delayDuration={0}>
        <Tooltip>
          <TooltipTrigger asChild>
            <motion.button
              onClick={() => navigate(item.path)}
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
              className={`relative w-full flex items-center gap-4 px-4 py-3 rounded-2xl border-none overflow-hidden transition-all duration-300 ${
                isActive 
                  ? 'bg-gray-50' 
                  : isHovered 
                    ? 'bg-gray-50/50' 
                    : 'bg-transparent'
              }`}
              whileTap={{ scale: 0.96 }}
            >
              {isActive && (
                <motion.div
                  layoutId="activeIndicator"
                  className="absolute left-0 w-1 h-10 rounded-r-full bg-gradient-to-b from-[#fec629] to-[#fdb913]"
                  initial={false}
                  transition={{ type: "spring", stiffness: 500, damping: 35 }}
                />
              )}

              <motion.div
                className="relative flex items-center justify-center"
                animate={{
                  scale: isActive ? 1.02 : 1,
                }}
                transition={{ type: "spring", stiffness: 400, damping: 25 }}
              >
                <Icon 
                  className={`w-6 h-6 transition-all duration-300 ${
                    isActive ? "text-gray-900" : "text-gray-600 group-hover:text-gray-900"
                  }`}
                  strokeWidth={isActive ? 2.5 : 2}
                />

                {item.notifications > 0 && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-1 -right-1"
                  >
                    <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-gradient-to-r from-red-500 to-red-600 px-1.5 text-[10px] font-bold text-white shadow-md shadow-red-500/40">
                      {item.notifications > 9 ? "9+" : item.notifications}
                    </span>
                  </motion.div>
                )}
              </motion.div>

              <span className={`text-sm font-medium transition-all duration-300 ${
                isActive ? 'text-gray-900 font-semibold' : 'text-gray-700 group-hover:text-gray-900'
              }`}>
                {item.label}
              </span>
            </motion.button>
          </TooltipTrigger>
          <TooltipContent side="right" sideOffset={12} className="bg-gray-900 text-white border-0 px-3 py-2 rounded-xl shadow-xl">
            <p className="font-medium text-sm">{item.label}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  };

  return (
    <motion.nav
      initial={{ x: -100, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ type: "spring", stiffness: 100, damping: 20 }}
      className="fixed left-0 top-0 h-screen w-[17rem] bg-white/80 backdrop-blur-xl border-r border-gray-100 flex flex-col items-center py-6 z-50"
      style={{
        boxShadow: "4px 0 24px -2px rgba(0, 0, 0, 0.05), 8px 0 48px -4px rgba(16, 185, 129, 0.03)"
      }}
    >
      {/* Logo */}
      <motion.div 
        className="mb-8 flex items-center gap-2"
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.97 }}
        onClick={() => navigate(isStudent ? '/dashboard/feed' : '/dashboard/listings')}
      >
        <div className="cursor-pointer flex items-center gap-2">
          <img src="/smile.png" alt="Roomly" className="w-10 h-10" />
          <img src="/text.png" alt="Roomly" className="h-8" />
        </div>
      </motion.div>

      {/* Main navigation */}
      <div className="flex-1 w-full flex flex-col items-center space-y-1 px-2">
        {navItems.map((item, index) => (
          <NavItem key={item.id} item={item} index={index} />
        ))}
      </div>

      {/* Divider */}
      <div className="w-10 h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent my-4" />

      {/* Bottom navigation */}
      <div className="w-full flex flex-col items-center space-y-1 px-2 mb-4">
        {bottomItems.map((item, index) => (
          <NavItem key={item.id} item={item} index={navItems.length + index} />
        ))}
      </div>

      {/* User profile */}
      <TooltipProvider delayDuration={0}>
        <Tooltip>
          <TooltipTrigger asChild>
            <motion.div 
              className="relative cursor-pointer group"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <div className="p-0.5 rounded-full bg-gradient-to-br from-gray-200 to-gray-300 shadow-md">
                {user?.photo ? (
                  <img
                    src={user.photo}
                    alt={user.name}
                    className="w-11 h-11 rounded-full object-cover border-2 border-white"
                  />
                ) : (
                  <div className="w-11 h-11 bg-gradient-to-br from-gray-50 to-gray-100 rounded-full flex items-center justify-center font-bold text-gray-700 text-sm border-2 border-white">
                    {user?.name?.charAt(0).toUpperCase() || 'U'}
                  </div>
                )}
              </div>
              
              <span className="absolute bottom-0.5 right-0.5 w-3.5 h-3.5 bg-emerald-400 border-2 border-white rounded-full shadow-sm" />
            </motion.div>
          </TooltipTrigger>
          <TooltipContent side="right" sideOffset={12} className="bg-gray-900 text-white border-0 px-4 py-3 rounded-xl shadow-xl min-w-[200px]">
            <div className="text-left space-y-2">
              <div>
                <p className="font-semibold text-sm">{user?.name || 'Utilisateur'}</p>
                <p className="text-xs text-gray-400 mt-0.5">{user?.email || ''}</p>
                <p className="text-xs text-gray-300 mt-1 font-medium capitalize">{user?.role === 'student' ? 'Étudiant' : 'Propriétaire'}</p>
              </div>
              <div className="h-px bg-gray-700" />
              <motion.button
                onClick={(e) => {
                  e.stopPropagation();
                  onLogout();
                }}
                className="w-full flex items-center gap-2 px-3 py-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-all text-xs font-medium"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <LogOut className="w-3.5 h-3.5" />
                Déconnexion
              </motion.button>
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </motion.nav>
  );
}