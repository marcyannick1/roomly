import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Calendar, Clock, Check, X, Ban, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { acceptVisit, declineVisit, cancelVisit } from '@/lib/api';
import { toast } from 'sonner';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { Modal, Select } from 'antd';

export function VisitBubble({ visit, user, onUpdate, isProposer = false }) {
    const [loading, setLoading] = useState(false);
    const [declineOpen, setDeclineOpen] = useState(false);
    const [declineReason, setDeclineReason] = useState('Le créneau ne me convient pas');

    const declineReasons = [
        'Le créneau ne me convient pas',
        'Je ne suis plus disponible à cette date',
        'Le logement ne correspond plus à ma recherche',
        'Le logement a déjà été attribué',
        'Je préfère une autre date',
        'Autre raison',
    ];

    const handleAction = async (action) => {
        try {
            setLoading(true);
            if (action === 'accept') {
                await acceptVisit(visit.id);
                toast.success("✅ Visite acceptée !");
            } else if (action === 'cancel') {
                await cancelVisit(visit.id);
                toast.success("🗑️ Visite annulée");
            }
            if (onUpdate) onUpdate();
        } catch (error) {
            console.error(error);
            toast.error("Une erreur est survenue");
        } finally {
            setLoading(false);
        }
    };

    const handleDeclineConfirm = async () => {
        try {
            setLoading(true);
            await declineVisit(visit.id, declineReason);
            toast.success("❌ Visite refusée");
            setDeclineOpen(false);
            if (onUpdate) onUpdate();
        } catch (error) {
            console.error(error);
            toast.error("Une erreur est survenue");
        } finally {
            setLoading(false);
        }
    };

    const getStatusBadge = (status) => {
        const statusMap = {
            'pending': { bg: 'bg-yellow-100', text: 'text-yellow-800', label: '⏳ En attente', border: 'border-yellow-300' },
            'accepted': { bg: 'bg-green-100', text: 'text-green-800', label: '✅ Confirmée', border: 'border-green-300' },
            'declined': { bg: 'bg-red-100', text: 'text-red-800', label: '❌ Refusée', border: 'border-red-300' },
            'cancelled': { bg: 'bg-gray-100', text: 'text-gray-800', label: '🗑️ Annulée', border: 'border-gray-300' },
        };
        const config = statusMap[status?.toLowerCase()] || statusMap['pending'];
        return (
            <Badge className={`${config.bg} ${config.text} border ${config.border}`}>
                {config.label}
            </Badge>
        );
    };

    const visitDate = new Date(visit.proposed_date);
    const isUpcoming = visitDate > new Date();
    const isPending = visit.status?.toLowerCase() === 'pending';

    return (
        <motion.div
            className="w-full bg-white rounded-xl border-2 border-gray-200 overflow-hidden shadow-md hover:shadow-lg transition-shadow"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ y: -2 }}
        >
            {/* Header */}
            <div className="bg-gradient-to-r from-yellow-50 to-orange-50 p-4 border-b-2 border-gray-200 flex justify-between items-start">
                <div className="flex items-center gap-3">
                    <div className="bg-gradient-to-br from-yellow-400 to-orange-400 p-3 rounded-lg">
                        <Calendar className="w-5 h-5 text-white" />
                    </div>
                    <span className="font-bold text-gray-900 text-lg">Proposition de visite</span>
                </div>
                {getStatusBadge(visit.status)}
            </div>

            {/* Content */}
            <div className="p-5 space-y-4">
                {/* Date and Time */}
                <div className="flex items-start gap-4">
                    <div className="bg-gray-100 rounded-lg p-3 text-center min-w-[70px]">
                        <div className="text-xs font-semibold text-gray-600 uppercase">
                            {format(visitDate, 'MMM', { locale: fr })}
                        </div>
                        <div className="text-2xl font-bold text-gray-900">
                            {format(visitDate, 'd')}
                        </div>
                    </div>

                    <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-2 text-gray-700">
                            <Clock className="w-5 h-5 text-yellow-500" />
                            <span className="font-semibold text-lg">
                                {format(visitDate, 'HH:mm')}
                            </span>
                            <span className="text-sm text-gray-500">
                                ({format(visitDate, 'EEEE', { locale: fr })})
                            </span>
                        </div>
                        <div className="text-sm text-gray-600">
                            {format(visitDate, 'PPPP', { locale: fr })}
                        </div>
                    </div>
                </div>

                {/* Notes */}
                {visit.notes && (
                    <div className="bg-blue-50 border-l-4 border-blue-400 p-3 rounded italic text-gray-700">
                        💬 "{visit.notes}"
                    </div>
                )}

                {/* Status Indicator */}
                {!isUpcoming && (
                    <div className="bg-gray-50 p-3 rounded text-sm text-gray-600 italic">
                        📍 Cette visite est passée
                    </div>
                )}

                {/* Action Buttons */}
                {isPending && isUpcoming && (
                    <div className="pt-2 flex gap-2">
                        {isProposer ? (
                            // If user proposed the visit, show cancel button
                            <Button
                                size="sm"
                                variant="outline"
                                className="w-full text-red-600 hover:bg-red-50 border-red-300"
                                onClick={() => handleAction('cancel')}
                                disabled={loading}
                            >
                                {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                                <Ban className="w-4 h-4 mr-2" />
                                Annuler ma demande
                            </Button>
                        ) : (
                            // If user didn't propose, show accept/decline
                            <div className="flex gap-2 w-full">
                                <Button
                                    size="sm"
                                    className="flex-1 bg-green-500 hover:bg-green-600 text-white font-semibold"
                                    onClick={() => handleAction('accept')}
                                    disabled={loading}
                                >
                                    {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                                    <Check className="w-4 h-4 mr-1" />
                                    Accepter
                                </Button>
                                <Button
                                    size="sm"
                                    variant="outline"
                                    className="flex-1 text-red-600 hover:bg-red-50 border-red-300"
                                    onClick={() => setDeclineOpen(true)}
                                    disabled={loading}
                                >
                                    {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                                    <X className="w-4 h-4 mr-1" />
                                    Refuser
                                </Button>
                            </div>
                        )}
                    </div>
                )}

                {/* Confirmed Status */}
                {visit.status?.toLowerCase() === 'accepted' && (
                    <div className="bg-green-50 border-l-4 border-green-400 p-3 rounded text-sm text-green-700 font-semibold">
                        ✅ Visite confirmée - À bientôt !
                    </div>
                )}
            </div>

            <Modal
                title="Refuser la visite"
                open={declineOpen}
                onCancel={() => setDeclineOpen(false)}
                onOk={handleDeclineConfirm}
                okText="Confirmer le refus"
                cancelText="Annuler"
                okButtonProps={{ danger: true, loading }}
                cancelButtonProps={{ disabled: loading }}
            >
                <p className="text-gray-600 mb-4">Merci de sélectionner une raison pour le refus.</p>
                <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Raison du refus</label>
                    <Select
                        className="w-full"
                        value={declineReason}
                        onChange={(value) => setDeclineReason(value)}
                        options={declineReasons.map((reason) => ({ label: reason, value: reason }))}
                    />
                </div>
            </Modal>
        </motion.div>
    );
}
