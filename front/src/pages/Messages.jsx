
import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { getMatchMessages, sendMessage, getCurrentUser, getMatchVisits, getMatch } from '@/lib/api';
import { toast } from 'sonner';
import { ArrowLeft, Send, CalendarPlus } from 'lucide-react';
import { VisitModal } from '@/components/visits/VisitModal';
import { VisitBubble } from '@/components/visits/VisitBubble';

export default function Messages() {
  const { matchId } = useParams();
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [user, setUser] = useState(null);
  const [match, setMatch] = useState(null);
  const [showVisitModal, setShowVisitModal] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    loadData();
    // Poll for new messages every 10 seconds? Or just relying on manual refresh/interaction for now as per MVP.
  }, [matchId]);

  useEffect(() => {
    // Scroll to bottom when messages change
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const loadData = async () => {
    try {
      const userResponse = await getCurrentUser();
      const userData = userResponse.data;
      setUser(userData);

      const [messagesResponse, visitsResponse, matchResponse] = await Promise.all([
        getMatchMessages(matchId),
        getMatchVisits(matchId),
        getMatch(matchId).catch(err => { console.log('Match fetch error', err); return null; })
      ]);

      if (matchResponse) setMatch(matchResponse.data);

      // Merge and sort
      const msgs = messagesResponse.data.map(m => ({ ...m, type: 'message' }));
      const visits = visitsResponse.data.map(v => ({ ...v, type: 'visit', created_at: v.created_at || v.visit_date })); // Fallback if created_at missing using visit_date

      const combined = [...msgs, ...visits].sort((a, b) =>
        new Date(a.created_at) - new Date(b.created_at)
      );

      setMessages(combined);
    } catch (error) {
      console.error('Error loading data:', error);
      // toast.error('Erreur de chargement'); // Optional: don't annoy user if it's just a transient network thing
    }
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    try {
      const message = {
        message_id: `msg_${Date.now()}`, // Optimistic ID
        match_id: matchId,
        sender_id: user.user_id,
        content: newMessage,
        created_at: new Date().toISOString(),
        read: false,
        type: 'message'
      };

      await sendMessage({
        match_id: parseInt(matchId),
        content: newMessage
      });

      // In a real app we'd wait for response to get real ID, but here we optimistically append or reload
      await loadData(); // Reload to get true server state including ID
      setNewMessage('');
    } catch (error) {
      console.error(error);
      toast.error('Erreur d\'envoi');
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="border-b border-border/50 p-4 flex justify-between items-center bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(-1)}
            className="rounded-full"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="font-semibold text-lg">Conversation</h1>
        </div>

        {/* Only show "Plan Visit" if user is a landlord? Or maybe both can propose? 
            Usually Landlords propose, or Students request. 
            The requirement says "Proposer visite" generic. Let's allow both or check role if needed.
            Start with allowing both for collaboration.
        */}
        <Button
          variant="outline"
          size="sm"
          className="gap-2 rounded-full border-primary/20 hover:bg-primary/5 text-primary"
          onClick={() => setShowVisitModal(true)}
        >
          <CalendarPlus className="w-4 h-4" />
          <span className="hidden sm:inline">Planifier visite</span>
        </Button>
      </header>

      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 space-y-4 max-w-4xl mx-auto w-full scroll-smooth"
      >
        {messages.length === 0 ? (
          <div className="text-center py-20 text-muted-foreground flex flex-col items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
              <Send className="w-8 h-8 opacity-20" />
            </div>
            <p>Aucun message. Commencez la conversation ou proposez une visite !</p>
          </div>
        ) : (
          messages.map((item) => {
            const isMe = item.sender_id === user?.user_id || item.proposer_id === user?.user_id;

            if (item.type === 'visit') {
              return (
                <div key={`visit_${item.id}`} className={`flex justify-center py-4`}>
                  <VisitBubble visit={item} user={user} onUpdate={loadData} />
                </div>
              );
            }

            return (
              <div
                key={item.message_id || `msg_${item.id}`}
                className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[85%] sm:max-w-[70%] rounded-2xl p-4 shadow-sm ${isMe
                    ? 'bg-primary text-primary-foreground rounded-br-none'
                    : 'bg-card border border-border rounded-bl-none'
                    }`}
                >
                  <p className="whitespace-pre-wrap break-words">{item.content}</p>
                  <div className={`text-[10px] mt-1 text-right ${isMe ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>
                    {new Date(item.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      <form onSubmit={handleSend} className="border-t border-border/50 p-4 max-w-4xl mx-auto w-full bg-card/50 backdrop-blur-sm">
        <div className="flex gap-2">
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Écrivez votre message..."
            className="flex-1 h-12 rounded-full border-border/50 focus-visible:ring-primary/20"
          />
          <Button
            type="submit"
            size="icon"
            className="h-12 w-12 rounded-full shrink-0 shadow-lg shadow-primary/20"
            disabled={!newMessage.trim()}
          >
            <Send className="w-5 h-5" />
          </Button>
        </div>
      </form>

      {user && (
        <VisitModal
          open={showVisitModal}
          onOpenChange={setShowVisitModal}
          matchId={matchId}
          studentId={user.role === 'student' ? user.user_id : match?.student_id}
          listingAddress={match?.listing?.address}
          user={user}
          // Temporary fix: we'll handle `visitor_id` logic inside Modal or assume simplified flow where backend infers from match_id + current_user
          onVisitCreated={loadData}
        />
      )}
    </div>
  );
}
