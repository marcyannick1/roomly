import { useState, useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { DashboardNavbar } from './DashboardNavbar';
import { TopNavbar } from './TopNavbar';
import { motion } from 'framer-motion';
import { getCurrentUser } from '@/lib/api';

export function DashboardLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const response = await getCurrentUser();
      const currentUser = response.data?.user || response.data;
      const role = currentUser?.role || currentUser?.user_type || (currentUser?.is_landlord ? 'landlord' : 'student');
      setUser({ ...currentUser, role });

      // Redirection intelligente selon le rôle
      if (location.pathname === '/dashboard' || location.pathname === '/dashboard/') {
        if (role === 'landlord') {
          navigate('/dashboard/listings', { replace: true });
        } else {
          navigate('/dashboard/feed', { replace: true });
        }
      }
    } catch (error) {
      console.error('Erreur chargement utilisateur:', error);
      navigate('/login');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    navigate('/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          className="w-16 h-16 border-4 border-[#fec629] border-t-transparent rounded-full"
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 flex relative overflow-hidden">
      {/* Background decoration */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <motion.div
          className="absolute -top-1/2 -left-1/2 w-full h-full rounded-full opacity-20"
          style={{
            background: 'radial-gradient(circle, rgba(254, 198, 41, 0.4) 0%, transparent 70%)',
          }}
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 90, 0],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear"
          }}
        />
        <motion.div
          className="absolute -bottom-1/2 -right-1/2 w-full h-full rounded-full opacity-20"
          style={{
            background: 'radial-gradient(circle, rgba(33, 34, 32, 0.3) 0%, transparent 70%)',
          }}
          animate={{
            scale: [1.2, 1, 1.2],
            rotate: [90, 0, 90],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "linear"
          }}
        />
      </div>

      {/* Navbar */}
      <DashboardNavbar user={user} onLogout={handleLogout} />

      {/* Top Navbar */}
      <TopNavbar user={user} />

      {/* Main content */}
      <main className="flex-1 ml-72 mt-16 min-h-screen p-8 relative z-10">
        <Outlet />
      </main>
    </div>
  );
}

export default DashboardLayout;
