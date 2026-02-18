import { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../App";
import { toast } from "sonner";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { 
  ArrowLeft, 
  Send, 
  Calendar,
  MapPin,
  Euro,
  Phone,
  Mail,
  Loader2,
  Info
} from "lucide-react";

const ChatPage = () => {
  const navigate = useNavigate();
  const { matchId } = useParams();
  const { user, token, API } = useAuth();
  const [match, setMatch] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchMessages, 5000); // Poll for new messages
    return () => clearInterval(interval);
  }, [matchId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchData = async () => {
    try {
      const [matchRes, messagesRes] = await Promise.all([
        axios.get(`${API}/matches/${matchId}?token=${token}`),
        axios.get(`${API}/messages/${matchId}?token=${token}`)
      ]);
      setMatch(matchRes.data);
      setMessages(messagesRes.data);
    } catch (error) {
      console.error("Error fetching chat data:", error);
      if (error.response?.status === 404 || error.response?.status === 403) {
        toast.error("Cette conversation n'existe pas ou vous n'y avez pas accès");
        navigate('/matches');
      } else if (error.response?.status === 500) {
        toast.error("Erreur serveur lors du chargement de la conversation");
      } else {
        toast.error("Erreur lors du chargement de la conversation");
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async () => {
    try {
      const response = await axios.get(`${API}/messages/${matchId}?token=${token}`);
      setMessages(response.data);
    } catch (error) {
      console.error("Error fetching messages:", error);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || sending) return;

    setSending(true);
    try {
      const response = await axios.post(`${API}/messages/${matchId}?token=${token}`, {
        content: newMessage.trim()
      });
      setMessages([...messages, response.data]);
      setNewMessage("");
      inputRef.current?.focus();
    } catch (error) {
      console.error("Error sending message:", error);
      toast.error("Erreur lors de l'envoi du message");
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  const otherUser = user?.role === 'student' ? match?.landlord : match?.student;
  const property = match?.property;
  const isStudent = user?.role === 'student';

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-40 bg-white border-b border-slate-100">
        <div className="max-w-2xl mx-auto px-4 py-3">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate('/matches')}
              data-testid="back-btn"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            
            <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
              <span className="text-primary font-semibold">
                {otherUser?.first_name?.[0]}{otherUser?.last_name?.[0]}
              </span>
            </div>
            
            <div className="flex-1 min-w-0">
              <h1 className="font-semibold text-slate-900 truncate">
                {otherUser?.first_name} {otherUser?.last_name}
              </h1>
              <p className="text-xs text-slate-500 truncate">{property?.title}</p>
            </div>
            
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate(`/property/${property?.id}`)}
              data-testid="property-info-btn"
            >
              <Info className="w-5 h-5" />
            </Button>
          </div>
        </div>
        
        {/* Property Preview */}
        <div 
          className="max-w-2xl mx-auto px-4 pb-3 cursor-pointer"
          onClick={() => navigate(`/property/${property?.id}`)}
        >
          <div className="bg-slate-50 rounded-xl p-3 flex gap-3">
            <img
              src={property?.images?.[0] || "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=200"}
              alt={property?.title}
              className="w-16 h-16 rounded-lg object-cover"
            />
            <div className="flex-1 min-w-0">
              <h3 className="font-medium text-slate-900 text-sm truncate">{property?.title}</h3>
              <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
                <span className="flex items-center gap-1">
                  <MapPin className="w-3 h-3" />
                  {property?.city}
                </span>
                <span className="flex items-center gap-1">
                  <Euro className="w-3 h-3" />
                  {property?.price}/mois
                </span>
              </div>
            </div>
            {isStudent && (
              <Button
                size="sm"
                className="bg-primary text-white rounded-full text-xs"
                onClick={(e) => {
                  e.stopPropagation();
                  navigate('/calendar', { state: { matchId, propertyId: property?.id } });
                }}
                data-testid="schedule-visit-btn"
              >
                <Calendar className="w-3 h-3 mr-1" />
                Visite
              </Button>
            )}
          </div>
        </div>
      </header>

      {/* Messages */}
      <main className="flex-1 pt-40 pb-20 px-4 overflow-y-auto">
        <div className="max-w-2xl mx-auto space-y-4">
          {messages.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-slate-500">Commencez la conversation!</p>
              <p className="text-sm text-slate-400 mt-1">
                {isStudent 
                  ? "Présentez-vous et posez vos questions sur le logement"
                  : "Bienvenue! N'hésitez pas à répondre aux questions de l'étudiant"
                }
              </p>
            </div>
          ) : (
            messages.map((message, index) => (
              <MessageBubble
                key={message.id}
                message={message}
                isOwn={message.sender_id === user?.id}
                showAvatar={index === 0 || messages[index - 1]?.sender_id !== message.sender_id}
                userName={message.sender_id === user?.id ? user : otherUser}
              />
            ))
          )}
          <div ref={messagesEndRef} />
        </div>
      </main>

      {/* Input */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-100 p-4">
        <form onSubmit={handleSend} className="max-w-2xl mx-auto flex gap-2">
          <Input
            ref={inputRef}
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Écrivez votre message..."
            className="flex-1 rounded-full bg-slate-50 border-slate-200 focus:border-primary"
            disabled={sending}
            data-testid="message-input"
          />
          <Button
            type="submit"
            disabled={!newMessage.trim() || sending}
            className="bg-primary hover:bg-primary-hover text-white rounded-full w-12 h-12"
            data-testid="send-btn"
          >
            {sending ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Send className="w-5 h-5" />
            )}
          </Button>
        </form>
      </div>
    </div>
  );
};

const MessageBubble = ({ message, isOwn, showAvatar, userName }) => (
  <div className={`flex gap-2 ${isOwn ? 'flex-row-reverse' : ''}`}>
    {showAvatar && !isOwn && (
      <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0">
        <span className="text-xs font-semibold text-primary">
          {userName?.first_name?.[0]}
        </span>
      </div>
    )}
    {!showAvatar && !isOwn && <div className="w-8" />}
    
    <div
      className={`max-w-[70%] px-4 py-2.5 rounded-2xl ${
        isOwn 
          ? 'bg-primary text-white rounded-tr-sm' 
          : 'bg-white border border-slate-100 text-slate-900 rounded-tl-sm'
      }`}
      data-testid={`message-${message.id}`}
    >
      <p className="text-sm leading-relaxed">{message.content}</p>
      <p className={`text-xs mt-1 ${isOwn ? 'text-white/70' : 'text-slate-400'}`}>
        {new Date(message.created_at).toLocaleTimeString('fr-FR', { 
          hour: '2-digit', 
          minute: '2-digit' 
        })}
      </p>
    </div>
  </div>
);

export default ChatPage;
