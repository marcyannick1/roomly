import { useState, useEffect } from 'react';
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, addDays, isSameMonth, isSameDay, addMonths, subMonths } from 'date-fns';
import { fr } from 'date-fns/locale';
import { ChevronLeft, ChevronRight, Calendar, Clock, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';
import { getUserVisits } from '@/lib/api';
import { VisitBubble } from './VisitBubble';

export function CalendarViewComponent({ user, onUpdate }) {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [visits, setVisits] = useState([]);
    const [selectedDate, setSelectedDate] = useState(null);
    const [loading, setLoading] = useState(false);
    const [filter, setFilter] = useState('all'); // all, upcoming, past, accepted, pending

    useEffect(() => {
        loadVisits();
    }, [user]);

    const loadVisits = async () => {
        try {
            setLoading(true);
            const userId = user?.id || user?.user_id;
            if (userId) {
                const response = await getUserVisits(userId);
                setVisits(response.data || []);
            }
        } catch (error) {
            console.error('Error loading visits:', error);
        } finally {
            setLoading(false);
        }
    };

    const getVisitsForDate = (date) => {
        return visits.filter(visit => {
            const visitDate = new Date(visit.proposed_date);
            return isSameDay(visitDate, date);
        });
    };

    const getFilteredVisits = () => {
        const now = new Date();
        return visits.filter(visit => {
            const visitDate = new Date(visit.proposed_date);
            switch (filter) {
                case 'upcoming':
                    return visitDate > now;
                case 'past':
                    return visitDate < now;
                case 'accepted':
                    return visit.status?.toLowerCase() === 'accepted';
                case 'pending':
                    return visit.status?.toLowerCase() === 'pending';
                default:
                    return true;
            }
        });
    };

    const getDaysInMonth = () => {
        const start = startOfWeek(startOfMonth(currentDate), { weekStartsOn: 1 });
        const end = endOfWeek(endOfMonth(currentDate), { weekStartsOn: 1 });
        const days = [];
        let day = start;

        while (day < end) {
            days.push(day);
            day = addDays(day, 1);
        }
        return days;
    };

    const days = getDaysInMonth();
    const weeks = [];
    for (let i = 0; i < days.length; i += 7) {
        weeks.push(days.slice(i, i + 7));
    }

    const getStatusColor = (status) => {
        switch (status?.toLowerCase()) {
            case 'accepted':
                return 'bg-green-100 text-green-800';
            case 'pending':
                return 'bg-yellow-100 text-yellow-800';
            case 'declined':
                return 'bg-red-100 text-red-800';
            case 'cancelled':
                return 'bg-gray-100 text-gray-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const handleRefresh = () => {
        loadVisits();
        if (onUpdate) onUpdate();
    };

    const filteredVisits = getFilteredVisits();
    const upcomingCount = visits.filter(v => new Date(v.proposed_date) > new Date()).length;
    const acceptedCount = visits.filter(v => v.status?.toLowerCase() === 'accepted').length;
    const pendingCount = visits.filter(v => v.status?.toLowerCase() === 'pending').length;

    return (
        <div className="space-y-6">
            {/* Stats */}
            <div className="grid grid-cols-3 gap-3">
                <motion.div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4 border-2 border-blue-200" whileHover={{ y: -2 }}>
                    <div className="text-xs text-blue-600 font-semibold uppercase">À venir</div>
                    <div className="text-3xl font-bold text-blue-900">{upcomingCount}</div>
                </motion.div>
                <motion.div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4 border-2 border-green-200" whileHover={{ y: -2 }}>
                    <div className="text-xs text-green-600 font-semibold uppercase">Confirmées</div>
                    <div className="text-3xl font-bold text-green-900">{acceptedCount}</div>
                </motion.div>
                <motion.div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-xl p-4 border-2 border-yellow-200" whileHover={{ y: -2 }}>
                    <div className="text-xs text-yellow-600 font-semibold uppercase">En attente</div>
                    <div className="text-3xl font-bold text-yellow-900">{pendingCount}</div>
                </motion.div>
            </div>

            {/* Filter Buttons */}
            <div className="flex gap-2 overflow-x-auto pb-2">
                {[
                    { id: 'all', label: 'Toutes', icon: '📋' },
                    { id: 'upcoming', label: 'À venir', icon: '📅' },
                    { id: 'past', label: 'Passées', icon: '📍' },
                    { id: 'accepted', label: 'Confirmées', icon: '✅' },
                    { id: 'pending', label: 'En attente', icon: '⏳' },
                ].map(btn => (
                    <Button
                        key={btn.id}
                        variant={filter === btn.id ? 'default' : 'outline'}
                        className={`whitespace-nowrap ${filter === btn.id ? 'bg-yellow-400 hover:bg-yellow-500 text-gray-900' : ''}`}
                        onClick={() => setFilter(btn.id)}
                    >
                        {btn.icon} {btn.label}
                    </Button>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Calendar */}
                <div className="lg:col-span-1 bg-white rounded-2xl shadow-lg border-2 border-gray-200 p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="font-bold text-gray-900 text-lg flex items-center gap-2">
                            <Calendar className="w-5 h-5 text-yellow-500" />
                            Calendrier
                        </h3>
                    </div>

                    {/* Month Navigation */}
                    <div className="flex items-center justify-between mb-4">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setCurrentDate(subMonths(currentDate, 1))}
                            className="hover:bg-yellow-50"
                        >
                            <ChevronLeft className="w-4 h-4" />
                        </Button>
                        <h4 className="font-bold text-gray-900 text-center min-w-[150px]">
                            {format(currentDate, 'MMMM yyyy', { locale: fr })}
                        </h4>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setCurrentDate(addMonths(currentDate, 1))}
                            className="hover:bg-yellow-50"
                        >
                            <ChevronRight className="w-4 h-4" />
                        </Button>
                    </div>

                    {/* Weekday Headers */}
                    <div className="grid grid-cols-7 gap-1 mb-2">
                        {['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'].map(day => (
                            <div key={day} className="text-center text-xs font-bold text-gray-600 py-2">
                                {day}
                            </div>
                        ))}
                    </div>

                    {/* Calendar Days */}
                    <div className="space-y-1">
                        {weeks.map((week, weekIdx) => (
                            <div key={weekIdx} className="grid grid-cols-7 gap-1">
                                {week.map((day, dayIdx) => {
                                    const dayVisits = getVisitsForDate(day);
                                    const isCurrentMonth = isSameMonth(day, currentDate);
                                    const isSelected = selectedDate && isSameDay(day, selectedDate);
                                    const isToday = isSameDay(day, new Date());

                                    return (
                                        <motion.button
                                            key={dayIdx}
                                            onClick={() => setSelectedDate(day)}
                                            className={`
                                                aspect-square rounded-lg text-xs font-semibold transition-all
                                                ${!isCurrentMonth ? 'text-gray-300 bg-gray-50' : 'text-gray-900'}
                                                ${isToday ? 'ring-2 ring-yellow-400 bg-yellow-100' : ''}
                                                ${isSelected ? 'bg-yellow-400 text-gray-900' : 'hover:bg-gray-100'}
                                                ${dayVisits.length > 0 ? 'border-2 border-yellow-400' : 'border border-gray-200'}
                                            `}
                                            whileHover={{ scale: 1.05 }}
                                        >
                                            <div>{format(day, 'd')}</div>
                                            {dayVisits.length > 0 && (
                                                <div className="text-xs font-bold text-yellow-600">
                                                    •{dayVisits.length}
                                                </div>
                                            )}
                                        </motion.button>
                                    );
                                })}
                            </div>
                        ))}
                    </div>

                    <Button
                        variant="outline"
                        className="w-full mt-4 hover:border-yellow-400"
                        onClick={handleRefresh}
                        disabled={loading}
                    >
                        🔄 Actualiser
                    </Button>
                </div>

                {/* Visits List */}
                <div className="lg:col-span-2 space-y-4">
                    <div className="flex items-center justify-between">
                        <h3 className="font-bold text-gray-900 text-lg">
                            {selectedDate ? format(selectedDate, 'EEEE d MMMM', { locale: fr }) : 'Visites'}
                            {filteredVisits.length > 0 && (
                                <span className="text-sm text-gray-600 ml-2">({filteredVisits.length})</span>
                            )}
                        </h3>
                    </div>

                    {filteredVisits.length === 0 ? (
                        <motion.div
                            className="bg-gray-50 rounded-xl p-8 text-center border-2 border-dashed border-gray-300"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                        >
                            <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                            <p className="text-gray-600 font-medium">Aucune visite {filter !== 'all' ? 'correspondante' : ''}</p>
                            <p className="text-sm text-gray-500 mt-1">Proposez une visite dans une conversation</p>
                        </motion.div>
                    ) : (
                        <motion.div
                            className="space-y-3"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                        >
                            {filteredVisits.map((visit, idx) => (
                                <motion.div
                                    key={visit.id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: idx * 0.05 }}
                                >
                                    <VisitBubble
                                        visit={visit}
                                        user={user}
                                        onUpdate={handleRefresh}
                                        isProposer={visit.proposed_by === (user?.id || user?.user_id)}
                                    />
                                </motion.div>
                            ))}
                        </motion.div>
                    )}
                </div>
            </div>
        </div>
    );
}
