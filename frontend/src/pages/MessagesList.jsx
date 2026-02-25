import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { getCurrentUser, getStudentMatches, getLandlordMatches } from '@/lib/api';
import { Heart, MessageCircle, ArrowLeft, MapPin, Star, Loader2 } from 'lucide-react';

export default function MessagesList() {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [matches, setMatches] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const userRes = await getCurrentUser();
            const currentUser = userRes.data.user || userRes.data;
            setUser(currentUser);

            const isStudent = currentUser.role === 'student';
            const matchRes = isStudent
                ? await getStudentMatches()
                : await getLandlordMatches();
            setMatches(matchRes.data || []);
        } catch (error) {
            console.error('Error loading matches:', error);
        } finally {
            setLoading(false);
        }
    };

    const isStudent = user?.role === 'student';

    const getListingImage = (match) => {
        const photos = match?.listing?.photos || match?.listing?.images || [];
        return photos[0]?.url || photos[0] || 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=200';
    };

    return (
        <div className="min-h-screen bg-slate-50">
            {/* Header */}
            <header className="fixed top-0 left-0 right-0 z-40 glass border-b border-slate-100">
                <div className="max-w-2xl mx-auto px-4 py-3 flex items-center gap-4">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => navigate(isStudent ? '/student/dashboard' : '/landlord/dashboard')}
                        data-testid="back-btn"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </Button>
                    <div>
                        <h1 className="font-bold text-slate-900">Mes Messages</h1>
                        <p className="text-xs text-slate-500">{matches.length} conversation{matches.length > 1 ? 's' : ''}</p>
                    </div>
                </div>
            </header>

            {/* Content */}
            <main className="pt-20 pb-24 px-4">
                <div className="max-w-2xl mx-auto">
                    {loading ? (
                        <div className="flex items-center justify-center py-20">
                            <Loader2 className="w-8 h-8 text-primary animate-spin" />
                        </div>
                    ) : matches.length === 0 ? (
                        <div className="text-center py-20">
                            <div className="w-20 h-20 bg-primary-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Heart className="w-10 h-10 text-primary" />
                            </div>
                            <h2 className="text-xl font-bold text-slate-900 mb-2">Pas encore de matchs</h2>
                            <p className="text-slate-600 mb-6">
                                {isStudent
                                    ? "Continuez à swiper pour trouver votre logement idéal!"
                                    : "Les étudiants qui likent vos annonces apparaîtront ici"
                                }
                            </p>
                            {isStudent && (
                                <Button
                                    onClick={() => navigate('/student/dashboard')}
                                    className="bg-primary hover:bg-primary-hover text-black rounded-full"
                                    data-testid="swipe-cta"
                                >
                                    Continuer à swiper
                                </Button>
                            )}
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {matches.map(match => (
                                <div
                                    key={match.id}
                                    onClick={() => navigate(`/messages/${match.id}`)}
                                    className="bg-white rounded-2xl border border-slate-100 p-4 flex gap-4 cursor-pointer hover:shadow-hover transition-all"
                                    data-testid={`match-card-${match.id}`}
                                >
                                    {/* Property Image */}
                                    <div className="relative">
                                        <img
                                            src={getListingImage(match)}
                                            alt={match.listing?.title}
                                            className="w-20 h-20 rounded-xl object-cover"
                                        />
                                        {match.is_superlike && (
                                            <div className="absolute -top-1 -right-1 w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                                                <Star className="w-3 h-3 text-black" fill="black" />
                                            </div>
                                        )}
                                    </div>

                                    {/* Content */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-start justify-between mb-1">
                                            <h3 className="font-semibold text-slate-900 truncate">{match.listing?.title}</h3>
                                            <span className="text-xs text-slate-400 whitespace-nowrap ml-2">
                                                {match.created_at ? new Date(match.created_at).toLocaleDateString('fr-FR') : ''}
                                            </span>
                                        </div>

                                        <div className="flex items-center gap-1 text-sm text-slate-500 mb-2">
                                            <MapPin className="w-3 h-3" />
                                            <span>{match.listing?.city}</span>
                                            {match.listing?.price && (
                                                <>
                                                    <span className="mx-1">•</span>
                                                    <span>{match.listing.price}€/mois</span>
                                                </>
                                            )}
                                        </div>

                                        <div className="flex items-center gap-2">
                                            <div className="w-6 h-6 bg-primary-100 rounded-full flex items-center justify-center">
                                                <span className="text-xs font-semibold text-primary">
                                                    {isStudent
                                                        ? match.landlord?.first_name?.[0] || match.landlord?.name?.[0]
                                                        : match.student?.first_name?.[0] || match.student?.name?.[0]
                                                    }
                                                </span>
                                            </div>
                                            <span className="text-sm text-slate-600">
                                                {isStudent
                                                    ? `${match.landlord?.first_name || ''} ${match.landlord?.last_name || match.landlord?.name || ''}`
                                                    : `${match.student?.first_name || ''} ${match.student?.last_name || match.student?.name || ''}`
                                                }
                                            </span>
                                            {match.is_superlike && (
                                                <span className="text-xs bg-primary-50 text-primary px-2 py-0.5 rounded-full">
                                                    Super Like
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    <MessageCircle className="w-5 h-5 text-primary mt-1 flex-shrink-0" />
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
