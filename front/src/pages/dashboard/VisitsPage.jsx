import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, Clock, MapPin, Phone, User } from 'lucide-react';
import { getStudentVisits, getCurrentUser } from '@/lib/api';
import { EmptyState } from '@/components/dashboard/EmptyState';
import { ContentCard } from '@/components/dashboard/ContentCard';
import { VisitBubble } from '@/components/visits/VisitBubble';

export default function VisitsPage() {
  const [user, setUser] = useState(null);
  const [visits, setVisits] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const userResponse = await getCurrentUser();
      const currentUser = userResponse.data?.user || userResponse.data;
      setUser(currentUser);

      const userId = currentUser?.id ?? currentUser?.user_id;
      const visitsResponse = await getStudentVisits(userId);
      setVisits(visitsResponse.data || []);
    } catch (error) {
      console.error('Erreur chargement visites:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleVisitAction = () => {
    loadData();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          className="w-16 h-16 border-4 border-[#fec629] border-t-transparent rounded-full"
        />
      </div>
    );
  }

  const pendingVisits = visits.filter(v => v.status === 'pending');
  const acceptedVisits = visits.filter(v => v.status === 'accepted');
  const declinedVisits = visits.filter(v => v.status === 'declined');

  if (!visits || visits.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <EmptyState
          icon={Calendar}
          title="Aucune visite"
          description="Planifiez des visites depuis vos conversations !"
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {pendingVisits.length > 0 && (
        <ContentCard title="Visites en attente" count={pendingVisits.length}>
          <div className="grid gap-4">
            <AnimatePresence mode="popLayout">
              {pendingVisits.map((visit, index) => (
                <VisitBubble
                  key={visit.id}
                  visit={visit}
                  isProposer={visit.proposed_by === user?.id}
                  onVisitUpdate={handleVisitAction}
                />
              ))}
            </AnimatePresence>
          </div>
        </ContentCard>
      )}

      {acceptedVisits.length > 0 && (
        <ContentCard title="Visites confirmées" count={acceptedVisits.length}>
          <div className="grid gap-4">
            <AnimatePresence mode="popLayout">
              {acceptedVisits.map((visit, index) => (
                <VisitCard key={visit.id} visit={visit} index={index} status="accepted" />
              ))}
            </AnimatePresence>
          </div>
        </ContentCard>
      )}

      {declinedVisits.length > 0 && (
        <ContentCard title="Visites refusées" count={declinedVisits.length}>
          <div className="grid gap-4">
            <AnimatePresence mode="popLayout">
              {declinedVisits.map((visit, index) => (
                <VisitCard key={visit.id} visit={visit} index={index} status="declined" />
              ))}
            </AnimatePresence>
          </div>
        </ContentCard>
      )}
    </div>
  );
}

function VisitCard({ visit, index, status }) {
  const statusConfig = {
    accepted: {
      bg: 'bg-green-50',
      border: 'border-green-200',
      badge: 'bg-green-500',
      badgeText: 'Confirmée'
    },
    declined: {
      bg: 'bg-red-50',
      border: 'border-red-200',
      badge: 'bg-red-500',
      badgeText: 'Refusée'
    }
  };

  const config = statusConfig[status];
  const listing = visit.listing || {};
  const landlord = visit.landlord || {};

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ delay: index * 0.1 }}
      className={`${config.bg} ${config.border} border-2 rounded-2xl p-6 shadow-lg`}
    >
      <div className="flex items-start gap-4">
        <div className="flex-1 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold text-[#212220]" style={{ fontFamily: 'Outfit' }}>
              {listing.title || 'Logement'}
            </h3>
            <span className={`${config.badge} text-white px-3 py-1 rounded-full text-sm font-semibold`}>
              {config.badgeText}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="flex items-center gap-2 text-gray-700">
              <Calendar className="w-4 h-4 text-[#fec629]" />
              <span className="font-medium">
                {new Date(visit.visit_date).toLocaleDateString('fr-FR', {
                  weekday: 'long',
                  day: 'numeric',
                  month: 'long'
                })}
              </span>
            </div>

            <div className="flex items-center gap-2 text-gray-700">
              <Clock className="w-4 h-4 text-[#fec629]" />
              <span className="font-medium">
                {new Date(visit.visit_date).toLocaleTimeString('fr-FR', {
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </span>
            </div>

            {listing.address && (
              <div className="flex items-center gap-2 text-gray-700 col-span-2">
                <MapPin className="w-4 h-4 text-[#fec629]" />
                <span className="font-medium truncate">
                  {listing.address}
                </span>
              </div>
            )}

            {landlord.phone && (
              <div className="flex items-center gap-2 text-gray-700 col-span-2">
                <Phone className="w-4 h-4 text-[#fec629]" />
                <span className="font-medium">
                  {landlord.phone}
                </span>
              </div>
            )}

            {landlord.first_name && (
              <div className="flex items-center gap-2 text-gray-700 col-span-2">
                <User className="w-4 h-4 text-[#fec629]" />
                <span className="font-medium">
                  {landlord.first_name} {landlord.last_name || ''}
                </span>
              </div>
            )}
          </div>

          {visit.notes && (
            <div className="mt-3 p-3 bg-white/50 rounded-lg">
              <p className="text-sm text-gray-700 italic">
                "{visit.notes}"
              </p>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
