import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, CheckCircle2, Heart, Calendar, X, Trash2 } from 'lucide-react';
import { getNotifications, markNotificationAsRead, deleteNotification, getCurrentUser } from '@/lib/api';
import { EmptyState } from '@/components/dashboard/EmptyState';
import { ContentCard } from '@/components/dashboard/ContentCard';

export default function NotificationsPage() {
  const [user, setUser] = useState(null);
  const [notifications, setNotifications] = useState([]);
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
      const response = await getNotifications(userId);
      setNotifications(response.data || []);
    } catch (error) {
      console.error('Erreur chargement notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (notifId) => {
    try {
      await markNotificationAsRead(notifId);
      setNotifications(prev =>
        prev.map(n => n.id === notifId ? { ...n, is_read: true } : n)
      );
    } catch (error) {
      console.error('Erreur marquage notification:', error);
    }
  };

  const handleDelete = async (notifId) => {
    try {
      await deleteNotification(notifId);
      setNotifications(prev => prev.filter(n => n.id !== notifId));
    } catch (error) {
      console.error('Erreur suppression notification:', error);
    }
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

  if (!notifications || notifications.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <EmptyState
          icon={Bell}
          title="Aucune notification"
          description="Vous êtes à jour !"
        />
      </div>
    );
  }

  const unreadNotifs = notifications.filter(n => !n.is_read);
  const readNotifs = notifications.filter(n => n.is_read);

  return (
    <div className="space-y-6">
      {unreadNotifs.length > 0 && (
        <ContentCard title="Non lues" count={unreadNotifs.length}>
          <div className="space-y-3">
            <AnimatePresence mode="popLayout">
              {unreadNotifs.map((notif, index) => (
                <NotificationCard
                  key={notif.id}
                  notification={notif}
                  index={index}
                  onMarkAsRead={handleMarkAsRead}
                  onDelete={handleDelete}
                />
              ))}
            </AnimatePresence>
          </div>
        </ContentCard>
      )}

      {readNotifs.length > 0 && (
        <ContentCard title="Lues" count={readNotifs.length}>
          <div className="space-y-3">
            <AnimatePresence mode="popLayout">
              {readNotifs.map((notif, index) => (
                <NotificationCard
                  key={notif.id}
                  notification={notif}
                  index={index}
                  onMarkAsRead={handleMarkAsRead}
                  onDelete={handleDelete}
                />
              ))}
            </AnimatePresence>
          </div>
        </ContentCard>
      )}
    </div>
  );
}

function NotificationCard({ notification, index, onMarkAsRead, onDelete }) {
  const typeConfig = {
    match_created: {
      icon: CheckCircle2,
      color: 'text-green-600',
      bg: 'bg-green-50',
      border: 'border-green-200'
    },
    listing_liked: {
      icon: Heart,
      color: 'text-pink-600',
      bg: 'bg-pink-50',
      border: 'border-pink-200'
    },
    visit_proposed: {
      icon: Calendar,
      color: 'text-blue-600',
      bg: 'bg-blue-50',
      border: 'border-blue-200'
    },
    visit_accepted: {
      icon: CheckCircle2,
      color: 'text-green-600',
      bg: 'bg-green-50',
      border: 'border-green-200'
    },
    visit_declined: {
      icon: X,
      color: 'text-red-600',
      bg: 'bg-red-50',
      border: 'border-red-200'
    },
    match_rejected: {
      icon: X,
      color: 'text-gray-600',
      bg: 'bg-gray-50',
      border: 'border-gray-200'
    }
  };

  const config = typeConfig[notification.type] || typeConfig.match_created;
  const Icon = config.icon;

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      transition={{ delay: index * 0.05 }}
      className={`${config.bg} ${config.border} border-2 rounded-2xl p-4 ${
        notification.is_read ? 'opacity-60' : ''
      } transition-all group hover:shadow-lg`}
    >
      <div className="flex items-start gap-4">
        <div className={`w-12 h-12 ${config.bg} rounded-full flex items-center justify-center flex-shrink-0`}>
          <Icon className={`w-6 h-6 ${config.color}`} />
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-gray-900 font-medium mb-1">
            {notification.message}
          </p>
          <p className="text-sm text-gray-600">
            {new Date(notification.created_at).toLocaleDateString('fr-FR', {
              day: 'numeric',
              month: 'long',
              hour: '2-digit',
              minute: '2-digit'
            })}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {!notification.is_read && (
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => onMarkAsRead(notification.id)}
              className="w-8 h-8 bg-white rounded-full flex items-center justify-center hover:bg-[#fec629] transition-colors group/btn"
              title="Marquer comme lu"
            >
              <CheckCircle2 className="w-4 h-4 text-gray-600 group-hover/btn:text-[#212220]" />
            </motion.button>
          )}

          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => onDelete(notification.id)}
            className="w-8 h-8 bg-white rounded-full flex items-center justify-center hover:bg-red-500 transition-colors group/btn"
            title="Supprimer"
          >
            <Trash2 className="w-4 h-4 text-gray-600 group-hover/btn:text-white" />
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}
