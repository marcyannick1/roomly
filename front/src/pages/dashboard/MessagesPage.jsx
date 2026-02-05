import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, Send, ArrowLeft, Home } from 'lucide-react';
import { getConversations, getMessages, sendMessage, getCurrentUser } from '@/lib/api';
import { toast } from 'sonner';
import { EmptyState } from '@/components/dashboard/EmptyState';
import { VisitModal } from '@/components/visits/VisitModal';

export default function MessagesPage() {
  const [user, setUser] = useState(null);
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [showVisitModal, setShowVisitModal] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (selectedConversation) {
        const matchId = selectedConversation.match_id ?? selectedConversation.id;
        if (!matchId) return;
        loadMessages(matchId);
        const interval = setInterval(() => {
          loadMessages(matchId);
      }, 3000);
      return () => clearInterval(interval);
    }
  }, [selectedConversation]);

  const loadData = async () => {
    try {
      setLoading(true);
      const userResponse = await getCurrentUser();
      const currentUser = userResponse.data?.user || userResponse.data;
      setUser(currentUser);

      const userId = currentUser?.id ?? currentUser?.user_id;
      const role = currentUser?.role || currentUser?.user_type || (currentUser?.is_landlord ? 'landlord' : 'student');
      const convResponse = await getConversations(userId, role);
      setConversations(convResponse.data || []);
    } catch (error) {
      console.error('Erreur chargement conversations:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadMessages = async (matchId) => {
    if (!matchId) return;
    try {
      const response = await getMessages(matchId);
      setMessages(response.data || []);
    } catch (error) {
      console.error('Erreur chargement messages:', error);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedConversation) return;

    try {
      setSending(true);
      const userId = user?.id ?? user?.user_id;
      const matchId = selectedConversation.match_id ?? selectedConversation.id;
      if (!matchId) return;
      await sendMessage(matchId, userId, newMessage);
      setNewMessage('');
      await loadMessages(matchId);
    } catch (error) {
      console.error('Erreur envoi message:', error);
      toast.error('Erreur lors de l\'envoi');
    } finally {
      setSending(false);
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

  if (!selectedConversation) {
    return (
      <div className="h-full flex">
        <ConversationsList
          conversations={conversations}
          onSelect={setSelectedConversation}
        />
      </div>
    );
  }

  const otherUser = selectedConversation.landlord || selectedConversation.student || {};
  const otherUserName = otherUser.name || [otherUser.first_name, otherUser.last_name].filter(Boolean).join(' ');
  const otherUserInitials = (otherUserName || 'U')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map(part => part[0])
    .join('')
    .toUpperCase();
  const listing = selectedConversation.listing || {};

  return (
    <div className="h-full flex gap-6">
        <ConversationsList
          conversations={conversations}
          selectedId={selectedConversation.match_id ?? selectedConversation.id}
          onSelect={setSelectedConversation}
        />

      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        className="flex-1 flex flex-col bg-white rounded-3xl shadow-xl border-2 border-gray-100 overflow-hidden"
      >
        {/* Header */}
        <div className="p-6 border-b-2 border-gray-100 flex items-center gap-4">
          <button
            onClick={() => setSelectedConversation(null)}
            className="lg:hidden w-10 h-10 flex items-center justify-center hover:bg-gray-100 rounded-full"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>

            <div className="relative w-12 h-12 rounded-full bg-gradient-to-br from-[#fec629] to-[#f5b519] flex items-center justify-center flex-shrink-0 overflow-hidden">
              {otherUser.photo ? (
                <img
                  src={otherUser.photo}
                  alt={otherUserName || 'Utilisateur'}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-[#212220] font-bold text-lg">
                  {otherUserInitials}
                </span>
              )}
            </div>

          <div className="flex-1 min-w-0">
              <h3 className="font-bold text-[#212220] text-lg truncate" style={{ fontFamily: 'Outfit' }}>
                {otherUserName || 'Utilisateur'}
              </h3>
            <p className="text-gray-600 text-sm truncate">
              {listing.title || 'Logement'}
            </p>
          </div>

          <button
            onClick={() => setShowVisitModal(true)}
            className="px-4 py-2 bg-gradient-to-r from-[#fec629] to-[#f5b519] text-[#212220] rounded-full font-semibold hover:shadow-lg transition-all"
          >
            Planifier visite
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          <AnimatePresence>
            {messages.map((message, index) => {
              const isOwn = message.sender_id === (user?.id ?? user?.user_id);
              return (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[70%] px-4 py-3 rounded-2xl ${
                      isOwn
                        ? 'bg-gradient-to-r from-[#fec629] to-[#f5b519] text-[#212220]'
                        : 'bg-gray-100 text-gray-900'
                    }`}
                  >
                    <p className="text-sm leading-relaxed break-words">
                      {message.content}
                    </p>
                    <p
                      className={`text-xs mt-1 ${
                        isOwn ? 'text-[#212220]/70' : 'text-gray-500'
                      }`}
                    >
                      {new Date(message.created_at).toLocaleTimeString('fr-FR', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>

        {/* Input */}
        <form onSubmit={handleSendMessage} className="p-6 border-t-2 border-gray-100">
          <div className="flex gap-3">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Écrivez votre message..."
              className="flex-1 px-6 py-3 bg-gray-50 border-2 border-gray-200 rounded-full focus:outline-none focus:border-[#fec629] transition-colors"
              disabled={sending}
            />
            <motion.button
              type="submit"
              disabled={sending || !newMessage.trim()}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="w-12 h-12 bg-gradient-to-r from-[#fec629] to-[#f5b519] rounded-full flex items-center justify-center hover:shadow-lg transition-all disabled:opacity-50"
            >
              <Send className="w-5 h-5 text-[#212220]" />
            </motion.button>
          </div>
        </form>
      </motion.div>

      <VisitModal
        open={showVisitModal}
        onOpenChange={setShowVisitModal}
        matchId={selectedConversation.match_id ?? selectedConversation.id}
        user={user}
        onVisitCreated={() => {
          toast.success('Visite proposée !');
        }}
      />
    </div>
  );
}

function ConversationsList({ conversations, selectedId, onSelect }) {
  if (!conversations || conversations.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <EmptyState
          icon={MessageCircle}
          title="Aucune conversation"
          description="Commencez à matcher pour discuter !"
        />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className="w-full lg:w-96 flex-shrink-0 bg-white rounded-3xl shadow-xl border-2 border-gray-100 overflow-hidden"
    >
      <div className="p-6 border-b-2 border-gray-100">
        <h2 className="text-2xl font-bold text-[#212220]" style={{ fontFamily: 'Outfit' }}>
          Messages
        </h2>
      </div>

      <div className="overflow-y-auto max-h-[calc(100vh-200px)]">
        {conversations.map((conv, index) => {
          const otherUser = conv.landlord || conv.student || {};
          const otherUserName = otherUser.name || [otherUser.first_name, otherUser.last_name].filter(Boolean).join(' ');
          const otherUserInitials = (otherUserName || 'U')
            .split(' ')
            .filter(Boolean)
            .slice(0, 2)
            .map(part => part[0])
            .join('')
            .toUpperCase();
          const listing = conv.listing || {};
          const convMatchId = conv.match_id ?? conv.id;
          const isSelected = convMatchId === selectedId;

          return (
            <motion.div
              key={convMatchId}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              onClick={() => onSelect({ ...conv, match_id: convMatchId })}
              className={`p-4 border-b border-gray-100 cursor-pointer transition-all ${
                isSelected
                  ? 'bg-gradient-to-r from-[#fec629]/10 to-[#f5b519]/10 border-l-4 border-l-[#fec629]'
                  : 'hover:bg-gray-50'
              }`}
            >
              <div className="flex gap-3">
                <div className="relative w-12 h-12 rounded-full bg-gradient-to-br from-[#fec629] to-[#f5b519] flex items-center justify-center flex-shrink-0 overflow-hidden">
                  {otherUser.photo ? (
                    <img
                      src={otherUser.photo}
                      alt={otherUserName || 'Utilisateur'}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-[#212220] font-bold">
                      {otherUserInitials}
                    </span>
                  )}
                  {conv.unread_count > 0 && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-white text-xs font-bold"
                    >
                      {conv.unread_count}
                    </motion.div>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-[#212220] truncate">
                    {otherUserName || 'Utilisateur'}
                  </h3>
                  <p className="text-sm text-gray-600 truncate">
                    {listing.title || 'Logement'}
                  </p>
                  {conv.last_message && (
                    <p className="text-xs text-gray-500 truncate mt-1">
                      {conv.last_message}
                    </p>
                  )}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}
