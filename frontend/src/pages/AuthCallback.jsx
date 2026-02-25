import { useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { getCurrentUser } from '@/lib/api';
import { toast } from 'sonner';

export default function AuthCallback() {
  const navigate = useNavigate();
  const location = useLocation();
  const hasProcessed = useRef(false);

  useEffect(() => {
    if (hasProcessed.current) return;
    hasProcessed.current = true;

    const processSession = async () => {
      try {
        // Extract access_token from URL fragment (e.g. #access_token=xxx)
        const hash = location.hash.substring(1);
        const params = new URLSearchParams(hash);
        const accessToken = params.get('access_token') || params.get('session_id');

        if (!accessToken) {
          toast.error('Session invalide');
          navigate('/login');
          return;
        }

        // Store token in cookie
        document.cookie = `access_token=${accessToken}; path=/; max-age=3600; samesite=lax`;

        // Fetch user to determine role
        const response = await getCurrentUser();
        const user = response.data;

        if (user.role === 'student') {
          navigate('/student/dashboard', { state: { user }, replace: true });
        } else {
          navigate('/landlord/dashboard', { state: { user }, replace: true });
        }
      } catch (error) {
        console.error('Auth callback error:', error);
        toast.error("Erreur d'authentification");
        navigate('/login');
      }
    };

    processSession();
  }, [location.hash, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-foreground">Connexion en cours...</p>
      </div>
    </div>
  );
}
