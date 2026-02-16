import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { getMatchMessages, sendMessage, getCurrentUser } from '@/lib/api';
import { toast } from 'sonner';
import { ArrowLeft, Send } from 'lucide-react';

export default function Messages() {
  const { matchId } = useParams();
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [user, setUser] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const userResponse = await getCurrentUser();
      setUser(userResponse.data);

      const messagesResponse = await getMatchMessages(matchId);
      setMessages(messagesResponse.data);
    } catch (error) {
      console.error('Error loading messages:', error);
    }
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    try {
      const message = {
        message_id: `msg_${Date.now()}`,
        match_id: matchId,
        sender_id: user.user_id,
        content: newMessage,
        created_at: new Date().toISOString(),
        read: false
      };

      await sendMessage(message);
      setMessages([...messages, message]);
      setNewMessage('');
    } catch (error) {
      toast.error('Erreur d\'envoi');
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="border-b border-border/50 p-4">
        <Button
          variant="ghost"
          onClick={() => navigate(-1)}
          data-testid="back-btn"
          className="rounded-full"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Retour
        </Button>
      </header>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 max-w-4xl mx-auto w-full">
        {messages.length === 0 ? (
          <div className="text-center py-20 text-muted-foreground">
            Aucun message. Commencez la conversation !
          </div>
        ) : (
          messages.map((msg) => (
            <div
              key={msg.message_id}
              className={`flex ${msg.sender_id === user?.user_id ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-md rounded-2xl p-4 ${
                  msg.sender_id === user?.user_id
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-card border border-border'
                }`}
              >
                {msg.content}
              </div>
            </div>
          ))
        )}
      </div>

      <form onSubmit={handleSend} className="border-t border-border/50 p-4 max-w-4xl mx-auto w-full">
        <div className="flex gap-2">
          <Input
            data-testid="message-input"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Écrivez votre message..."
            className="flex-1 h-12 rounded-full"
          />
          <Button
            type="submit"
            data-testid="send-message-btn"
            className="rounded-full px-6"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </form>
    </div>
  );
}
