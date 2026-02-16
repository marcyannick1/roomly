import { useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { googleCallback } from '@/lib/api';
import { toast } from 'sonner';

export default function AuthCallback() {
  const navigate = useNavigate();
  const location = useLocation();
  const hasProcessed = useRef(false);

  useEffect(() => {
    // Prevent double processing in StrictMode
    if (hasProcessed.current) return;
    hasProcessed.current = true;

    const processSession = async () => {
      try {
        // Extract session_id from URL fragment
        const hash = location.hash.substring(1);
        const params = new URLSearchParams(hash);
        const sessionId = params.get('session_id');

        if (!sessionId) {
          toast.error('Session invalide');
          navigate('/login');
          return;
        }

        // Exchange session_id for user data
        const response = await googleCallback(sessionId);
        const { user, session_token } = response.data;

        // Store session token in cookie (backend will handle this)
        document.cookie = `session_token=${session_token}; path=/; max-age=${7 * 24 * 60 * 60}; secure; samesite=none`;

        // Redirect based on user type and profile completion
        if (user.user_type === 'student') {
          // Check if profile is complete
          navigate('/student/dashboard', { state: { user }, replace: true });
        } else {
          navigate('/landlord/dashboard', { state: { user }, replace: true });
        }
      } catch (error) {
        console.error('Auth callback error:', error);
        toast.error('Erreur d\'authentification');
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
