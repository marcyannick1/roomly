import { motion } from 'framer-motion';
import { Bell, Search, Settings } from 'lucide-react';
import { useState } from 'react';

export function TopNavbar({ user }) {
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <motion.header
      className="h-16 bg-card/80 backdrop-blur-xl border-b border-border/50 shadow-sm fixed top-0 right-0 left-72 z-40 flex items-center justify-between px-6"
      initial={{ y: -64 }}
      animate={{ y: 0 }}
      transition={{ type: "spring", damping: 20 }}
    >
      {/* Search Bar */}
      <div className="flex-1 max-w-2xl">
        <motion.div
          className="relative"
          whileFocus={{ scale: 1.02 }}
        >
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Rechercher un logement, un message..."
            className="w-full h-11 pl-12 pr-4 rounded-2xl bg-background/50 border-2 border-border/50 focus:border-primary/50 outline-none transition-all text-sm font-medium text-foreground placeholder:text-muted-foreground"
          />
        </motion.div>
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-3">
        {/* Notifications */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="relative w-10 h-10 rounded-xl bg-background/50 hover:bg-background flex items-center justify-center transition-colors border border-border/50"
        >
          <Bell className="w-5 h-5 text-foreground" />
          <motion.span
            className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 500 }}
          >
            3
          </motion.span>
        </motion.button>

        {/* Settings */}
        <motion.button
          whileHover={{ scale: 1.05, rotate: 90 }}
          whileTap={{ scale: 0.95 }}
          className="w-10 h-10 rounded-xl bg-background/50 hover:bg-background flex items-center justify-center transition-all border border-border/50"
        >
          <Settings className="w-5 h-5 text-foreground" />
        </motion.button>

        {/* User Avatar */}
        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="flex items-center gap-3 pl-3 pr-4 py-2 rounded-2xl bg-gradient-to-r from-primary/10 to-yellow-500/10 border border-primary/20 cursor-pointer"
        >
          {user?.photo ? (
            <img
              src={user.photo}
              alt={user.name}
              className="w-8 h-8 rounded-full object-cover border-2 border-primary/30"
            />
          ) : (
            <div className="w-8 h-8 bg-gradient-to-br from-primary to-yellow-500 rounded-full flex items-center justify-center font-bold text-sm text-black">
              {user?.name?.charAt(0).toUpperCase() || 'U'}
            </div>
          )}
          <div className="text-left">
            <p className="text-sm font-bold text-foreground leading-none">{user?.name || 'Utilisateur'}</p>
            <p className="text-xs text-muted-foreground">{user?.role === 'student' ? 'Étudiant' : 'Propriétaire'}</p>
          </div>
        </motion.div>
      </div>
    </motion.header>
  );
}
