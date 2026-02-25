import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../App";
import { toast } from "sonner";
import { Button } from "../components/ui/button";
import { Calendar as CalendarComponent } from "../components/ui/calendar";
import { mockMatches, mockCalendarEvents } from "../mockData";
import { 
  ArrowLeft, 
  Home, 
  MessageCircle, 
  MapPin, 
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Plus,
  Loader2
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";

const CalendarPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const [visits, setVisits] = useState(mockCalendarEvents);
  const [matches, setMatches] = useState(mockMatches);
  const [loading, setLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showNewVisit, setShowNewVisit] = useState(false);
  const [newVisit, setNewVisit] = useState({
    match_id: location.state?.matchId || "",
    property_id: location.state?.propertyId || "",
    scheduled_date: "",
    scheduled_time: "",
    notes: ""
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = () => {
    // Use mock data
    setVisits(mockCalendarEvents);
    setMatches(mockMatches);
    setLoading(false);
  };

  const handleCreateVisit = () => {
    if (!newVisit.match_id || !newVisit.scheduled_date || !newVisit.scheduled_time) {
      toast.error("Veuillez remplir tous les champs obligatoires");
      return;
    }

    // Add the new visit to the list
    const newEvent = {
      id: (visits.length + 1).toString(),
      title: `Visite ${newVisit.property_id}`,
      date: newVisit.scheduled_date,
      time: newVisit.scheduled_time,
      propertyId: newVisit.property_id,
      studentName: "Nouveau visiteur",
      notes: newVisit.notes
    };

    setVisits([...visits, newEvent]);
    toast.success("Visite créée!");
    setShowNewVisit(false);
    setNewVisit({
      match_id: "",
      property_id: "",
      scheduled_date: "",
      scheduled_time: "",
      notes: ""
    });
  };

  const handleUpdateStatus = (visitId, status) => {
    setVisits(visits.map(v => 
      v.id === visitId ? { ...v, status } : v
    ));
    toast.success(status === 'confirmed' ? "Visite confirmée!" : "Visite annulée");
  };

  const isStudent = user?.role === 'student';
  
  // Get visits for selected date
  const selectedDateStr = selectedDate.toISOString().split('T')[0];
  const visitsForDate = visits.filter(v => v.scheduled_date === selectedDateStr);

  // Get dates with visits
  const datesWithVisits = visits.map(v => new Date(v.scheduled_date));

  const timeSlots = [
    "09:00", "10:00", "11:00", "12:00", "14:00", "15:00", "16:00", "17:00", "18:00"
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-40 glass border-b border-slate-100">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate(isStudent ? '/swipe' : '/dashboard')}
              data-testid="back-btn"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="font-bold text-slate-900">Mes Visites</h1>
              <p className="text-xs text-slate-500">{visits.length} visite{visits.length > 1 ? 's' : ''} planifiée{visits.length > 1 ? 's' : ''}</p>
            </div>
          </div>
          
          {isStudent && matches.length > 0 && (
            <Dialog open={showNewVisit} onOpenChange={setShowNewVisit}>
              <DialogTrigger asChild>
                <Button className="bg-primary text-white rounded-full" data-testid="new-visit-btn">
                  <Plus className="w-4 h-4 mr-2" />
                  Planifier une visite
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Planifier une visite</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div>
                    <label className="text-sm font-medium text-slate-700 block mb-2">Logement</label>
                    <Select
                      value={newVisit.match_id}
                      onValueChange={(value) => setNewVisit({ ...newVisit, match_id: value })}
                    >
                      <SelectTrigger data-testid="match-select">
                        <SelectValue placeholder="Sélectionner un logement" />
                      </SelectTrigger>
                      <SelectContent>
                        {matches.map(match => (
                          <SelectItem key={match.id} value={match.id}>
                            {match.property?.title}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-slate-700 block mb-2">Date</label>
                    <input
                      type="date"
                      value={newVisit.scheduled_date}
                      onChange={(e) => setNewVisit({ ...newVisit, scheduled_date: e.target.value })}
                      min={new Date().toISOString().split('T')[0]}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200"
                      data-testid="date-input"
                    />
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-slate-700 block mb-2">Heure</label>
                    <Select
                      value={newVisit.scheduled_time}
                      onValueChange={(value) => setNewVisit({ ...newVisit, scheduled_time: value })}
                    >
                      <SelectTrigger data-testid="time-select">
                        <SelectValue placeholder="Sélectionner une heure" />
                      </SelectTrigger>
                      <SelectContent>
                        {timeSlots.map(time => (
                          <SelectItem key={time} value={time}>{time}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-slate-700 block mb-2">Notes (optionnel)</label>
                    <textarea
                      value={newVisit.notes}
                      onChange={(e) => setNewVisit({ ...newVisit, notes: e.target.value })}
                      placeholder="Questions, demandes particulières..."
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 h-20 resize-none"
                      data-testid="notes-input"
                    />
                  </div>
                  
                  <Button
                    onClick={handleCreateVisit}
                    className="w-full bg-primary text-white rounded-full"
                    data-testid="submit-visit-btn"
                  >
                    Envoyer la demande
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="pt-20 pb-24 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="grid md:grid-cols-2 gap-6">
            {/* Calendar */}
            <div className="bg-white rounded-2xl border border-slate-100 p-4">
              <CalendarComponent
                mode="single"
                selected={selectedDate}
                onSelect={(date) => date && setSelectedDate(date)}
                className="rounded-xl"
                modifiers={{
                  hasVisit: datesWithVisits
                }}
                modifiersStyles={{
                  hasVisit: {
                    backgroundColor: '#fff6e0',
                    color: '#ffc433',
                    fontWeight: 600
                  }
                }}
              />
            </div>

            {/* Visits List */}
            <div className="bg-white rounded-2xl border border-slate-100 p-4">
              <h2 className="font-semibold text-slate-900 mb-4">
                {selectedDate.toLocaleDateString('fr-FR', { 
                  weekday: 'long', 
                  day: 'numeric', 
                  month: 'long' 
                })}
              </h2>
              
              {visitsForDate.length === 0 ? (
                <div className="text-center py-8">
                  <Calendar className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                  <p className="text-slate-500">Aucune visite ce jour</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {visitsForDate.map(visit => (
                    <VisitCard
                      key={visit.id}
                      visit={visit}
                      isStudent={isStudent}
                      onConfirm={() => handleUpdateStatus(visit.id, 'confirmed')}
                      onCancel={() => handleUpdateStatus(visit.id, 'cancelled')}
                      onClick={() => navigate(`/property/${visit.property_id}`)}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* All Upcoming Visits */}
          <div className="mt-6 bg-white rounded-2xl border border-slate-100 p-6">
            <h2 className="font-semibold text-slate-900 mb-4">Toutes les visites</h2>
            
            {visits.length === 0 ? (
              <div className="text-center py-8">
                <Calendar className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <p className="text-slate-500">Aucune visite planifiée</p>
                {isStudent && matches.length > 0 && (
                  <Button
                    onClick={() => setShowNewVisit(true)}
                    className="mt-4 bg-primary text-white rounded-full"
                  >
                    Planifier une visite
                  </Button>
                )}
              </div>
            ) : (
              <div className="space-y-3">
                {visits.map(visit => (
                  <VisitCard
                    key={visit.id}
                    visit={visit}
                    isStudent={isStudent}
                    showDate
                    onConfirm={() => handleUpdateStatus(visit.id, 'confirmed')}
                    onCancel={() => handleUpdateStatus(visit.id, 'cancelled')}
                    onClick={() => navigate(`/property/${visit.property_id}`)}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Bottom Navigation (Student only) */}
      {isStudent && (
        <nav className="fixed bottom-0 left-0 right-0 glass border-t border-slate-100 z-40">
          <div className="max-w-md mx-auto px-6 py-3">
            <div className="flex items-center justify-around">
              <NavButton icon={Home} label="Swipe" onClick={() => navigate('/swipe')} />
              <NavButton icon={MessageCircle} label="Matchs" onClick={() => navigate('/matches')} />
              <NavButton icon={MapPin} label="Carte" onClick={() => navigate('/map')} />
              <NavButton icon={Calendar} label="Visites" active />
            </div>
          </div>
        </nav>
      )}
    </div>
  );
};

const VisitCard = ({ visit, isStudent, showDate, onConfirm, onCancel, onClick }) => {
  const statusConfig = {
    pending: { icon: AlertCircle, color: 'text-yellow-500', bg: 'bg-yellow-50', label: 'En attente' },
    confirmed: { icon: CheckCircle, color: 'text-green-500', bg: 'bg-green-50', label: 'Confirmée' },
    cancelled: { icon: XCircle, color: 'text-red-500', bg: 'bg-red-50', label: 'Annulée' },
    completed: { icon: CheckCircle, color: 'text-slate-500', bg: 'bg-slate-50', label: 'Terminée' }
  };
  
  const status = statusConfig[visit.status] || statusConfig.pending;
  const StatusIcon = status.icon;
  const otherUser = isStudent ? visit.landlord : visit.student;

  return (
    <div 
      className="p-4 rounded-xl border border-slate-100 hover:shadow-card transition-all cursor-pointer"
      onClick={onClick}
      data-testid={`visit-card-${visit.id}`}
    >
      <div className="flex items-start gap-4">
        <img
          src={visit.property?.images?.[0] || "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=200"}
          alt={visit.property?.title}
          className="w-16 h-16 rounded-xl object-cover"
        />
        
        <div className="flex-1 min-w-0">
          <h3 className="font-medium text-slate-900 truncate">{visit.property?.title}</h3>
          
          <div className="flex items-center gap-3 text-sm text-slate-500 mt-1">
            {showDate && (
              <span className="flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                {new Date(visit.scheduled_date).toLocaleDateString('fr-FR')}
              </span>
            )}
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {visit.scheduled_time}
            </span>
          </div>
          
          <div className="flex items-center gap-2 mt-2">
            <div className="w-6 h-6 bg-primary-100 rounded-full flex items-center justify-center">
              <span className="text-xs font-semibold text-primary">
                {otherUser?.first_name?.[0]}
              </span>
            </div>
            <span className="text-sm text-slate-600">
              {otherUser?.first_name} {otherUser?.last_name}
            </span>
          </div>
        </div>
        
        <div className="flex flex-col items-end gap-2">
          <span className={`flex items-center gap-1 text-xs px-2 py-1 rounded-full ${status.bg} ${status.color}`}>
            <StatusIcon className="w-3 h-3" />
            {status.label}
          </span>
          
          {!isStudent && visit.status === 'pending' && (
            <div className="flex gap-2" onClick={e => e.stopPropagation()}>
              <Button
                size="sm"
                variant="outline"
                className="h-7 text-xs rounded-full text-red-500 border-red-200 hover:bg-red-50"
                onClick={onCancel}
                data-testid="cancel-visit-btn"
              >
                Refuser
              </Button>
              <Button
                size="sm"
                className="h-7 text-xs rounded-full bg-green-500 hover:bg-green-600 text-white"
                onClick={onConfirm}
                data-testid="confirm-visit-btn"
              >
                Accepter
              </Button>
            </div>
          )}
        </div>
      </div>
      
      {visit.notes && (
        <p className="text-sm text-slate-500 mt-3 pl-20">{visit.notes}</p>
      )}
    </div>
  );
};

const NavButton = ({ icon: Icon, label, active, onClick }) => (
  <button
    onClick={onClick}
    className={`flex flex-col items-center gap-1 px-4 py-1 rounded-xl transition-colors ${
      active ? 'text-primary' : 'text-slate-400 hover:text-slate-600'
    }`}
    data-testid={`nav-${label.toLowerCase()}`}
  >
    <Icon className="w-5 h-5" />
    <span className="text-xs font-medium">{label}</span>
  </button>
);

export default CalendarPage;
