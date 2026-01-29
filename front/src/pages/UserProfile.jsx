import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { getUserById } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Mail, User } from 'lucide-react';

export default function UserProfile() {
  const { userId } = useParams();
  const [user, setUser] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadUser = async () => {
      try {
        setError(null);
        const response = await getUserById(userId);
        setUser(response.data.user || response.data);
      } catch (err) {
        setError("Utilisateur introuvable");
      }
    };

    loadUser();
  }, [userId]);

  if (!user && !error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 py-10">
        <Link to="/landlord/dashboard">
          <Button variant="ghost" className="mb-6 rounded-full">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Retour
          </Button>
        </Link>

        {error ? (
          <div className="bg-card border border-border/50 rounded-3xl p-8 shadow-lg text-center">
            <h1 className="text-2xl font-bold text-foreground mb-2" style={{ fontFamily: 'Outfit' }}>
              {error}
            </h1>
            <p className="text-muted-foreground">Le profil demandé n'existe pas.</p>
          </div>
        ) : (
          <div className="bg-card border border-border/50 rounded-3xl p-8 shadow-lg">
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 rounded-2xl bg-muted/40 flex items-center justify-center">
                <User className="h-6 w-6 text-muted-foreground" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-foreground" style={{ fontFamily: 'Outfit' }}>
                  {user.name}
                </h1>
                <p className="text-muted-foreground">{user.user_type === 'landlord' ? 'Bailleur' : 'Étudiant'}</p>
              </div>
            </div>

            <div className="mt-6 grid md:grid-cols-2 gap-4">
              <div className="rounded-2xl bg-muted/40 p-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Mail className="h-4 w-4" />
                  Email
                </div>
                <p className="mt-1 font-medium text-foreground">{user.email}</p>
              </div>
              <div className="rounded-2xl bg-muted/40 p-4">
                <div className="text-sm text-muted-foreground">Statut</div>
                <p className="mt-1 font-medium text-foreground">
                  {user.user_type === 'landlord' ? 'Bailleur vérifié' : 'Membre'}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
