import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../App";
import { Button } from "./ui/button";
import { 
  Home, 
  User, 
  Bell, 
  Heart, 
  Map, 
  Calendar,
  LogOut,
  Plus,
  LayoutDashboard,
  MessageCircle,
  Settings,
  Building2
} from "lucide-react";
import { useState, useEffect } from "react";

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const [notifications, setNotifications] = useState(0);

  // Pages où la navbar ne doit pas s'afficher
  const hideNavbarPaths = ['/', '/login', '/register'];
  
  if (hideNavbarPaths.includes(location.pathname)) {
    return null;
  }

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Pour les étudiants sur /swipe, afficher une navbar simple horizontale
  if (user?.role === 'student' && location.pathname === '/swipe') {
    return (
      <nav className="fixed top-0 left-0 right-0 bg-white border-b border-slate-100 z-40 h-16">
        <div className="max-w-full h-full px-8 flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/swipe')}>
            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
              <Home className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-slate-900">Roomly</span>
          </div>
          <div className="flex items-center gap-4">
            <button onClick={() => navigate('/matches')} className="text-slate-600 hover:text-primary transition">
              <Heart className="w-6 h-6" />
            </button>
            <button onClick={() => navigate('/messages')} className="text-slate-600 hover:text-primary transition">
              <MessageCircle className="w-6 h-6" />
            </button>
            <button onClick={() => navigate('/profile')} className="text-slate-600 hover:text-primary transition">
              <User className="w-6 h-6" />
            </button>
            <button onClick={handleLogout} className="text-slate-600 hover:text-red-500 transition">
              <LogOut className="w-6 h-6" />
            </button>
          </div>
        </div>
      </nav>
    );
  }

  return (
    <>
      {/* Sidebar verticale - SEULEMENT pour les bailleurs */}
      {user?.role !== 'student' && (
      <aside className="fixed left-0 top-0 bottom-0 w-64 bg-white border-r border-slate-100 flex flex-col z-40">
        <div className="p-6">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate(user?.role === 'student' ? '/swipe' : '/dashboard')}>
            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
              <Home className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-slate-900">Roomly</span>
          </div>
        </div>
        
        <nav className="flex-1 px-4">
          {user?.role === 'student' ? (
            <>
              <NavItem 
                icon={Home} 
                label="Découvrir" 
                active={location.pathname === '/swipe'}
                onClick={() => navigate('/swipe')}
              />
              <NavItem 
                icon={Heart} 
                label="Matches" 
                active={location.pathname === '/matches'}
                onClick={() => navigate('/matches')}
              />
              <NavItem 
                icon={MessageCircle} 
                label="Messages" 
                active={location.pathname.startsWith('/chat')}
                onClick={() => navigate('/matches')}
              />
              <NavItem 
                icon={Map} 
                label="Carte" 
                active={location.pathname === '/map'}
                onClick={() => navigate('/map')}
              />
              <NavItem 
                icon={Calendar} 
                label="Visites" 
                active={location.pathname === '/calendar'}
                onClick={() => navigate('/calendar')}
              />
              <NavItem 
                icon={Settings} 
                label="Paramètres" 
                active={location.pathname === '/profile'}
                onClick={() => navigate('/profile')}
              />
            </>
          ) : (
            <>
              <NavItem 
                icon={Building2} 
                label="Tableau de bord" 
                active={location.pathname === '/dashboard'}
                onClick={() => navigate('/dashboard')}
              />
              <NavItem 
                icon={Plus} 
                label="Ajouter une annonce" 
                active={location.pathname === '/add-property'}
                onClick={() => navigate('/add-property')}
              />
              <NavItem 
                icon={MessageCircle} 
                label="Messages" 
                active={location.pathname === '/matches'}
                onClick={() => navigate('/matches')}
              />
              <NavItem 
                icon={Calendar} 
                label="Visites" 
                active={location.pathname === '/calendar'}
                onClick={() => navigate('/calendar')}
              />
              <NavItem 
                icon={Map} 
                label="Carte" 
                active={location.pathname === '/map'}
                onClick={() => navigate('/map')}
              />
              <NavItem 
                icon={Settings} 
                label="Paramètres" 
                active={location.pathname === '/profile'}
                onClick={() => navigate('/profile')}
              />
            </>
          )}
        </nav>
        
        <div className="p-4 border-t border-slate-100">
          <div className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 cursor-pointer" onClick={() => navigate('/profile')}>
            <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
              <span className="text-primary font-semibold">
                {user?.first_name?.[0]}{user?.last_name?.[0]}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-slate-900 truncate">{user?.first_name} {user?.last_name}</p>
              <p className="text-xs text-slate-500 truncate">{user?.email}</p>
            </div>
          </div>
          <Button 
            variant="ghost" 
            className="w-full justify-start text-slate-600 mt-2"
            onClick={handleLogout}
          >
            <LogOut className="w-4 h-4 mr-2" />
            Déconnexion
          </Button>
        </div>
      </aside>
      )}
    </>
  );
};

// Composant NavItem
const NavItem = ({ icon: Icon, label, active, badge, onClick }) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl mb-1 transition-colors ${
      active 
        ? 'bg-primary text-white' 
        : 'text-slate-600 hover:bg-slate-50'
    }`}
  >
    <Icon className="w-5 h-5" />
    <span className="font-medium">{label}</span>
    {badge > 0 && (
      <span className="ml-auto bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
        {badge}
      </span>
    )}
  </button>
);

export default Navbar;
