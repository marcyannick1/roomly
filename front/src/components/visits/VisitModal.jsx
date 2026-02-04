import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Calendar as CalendarIcon, Clock, Loader2, Info } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { createVisit } from '@/lib/api';
import { toast } from 'sonner';

const formSchema = z.object({
    proposed_date: z.date({
        required_error: "La date est requise",
    }),
    notes: z.string().optional(),
});

// Generate time slots from 9h to 20h
const TIME_SLOTS = [];
for (let hour = 9; hour <= 20; hour++) {
    TIME_SLOTS.push(`${hour.toString().padStart(2, '0')}:00`);
    if (hour < 20) {
        TIME_SLOTS.push(`${hour.toString().padStart(2, '0')}:30`);
    }
}

export function VisitModal({ open, onOpenChange, matchId, user, onVisitCreated }) {
    const [loading, setLoading] = useState(false);
    const [selectedTime, setSelectedTime] = useState('14:00');

    const form = useForm({
        resolver: zodResolver(formSchema),
        defaultValues: {
            notes: '',
        },
    });

    const onSubmit = async (values) => {
        try {
            setLoading(true);

            // Combine date and time
            const [hours, minutes] = selectedTime.split(':');
            const proposedDate = new Date(values.proposed_date);
            proposedDate.setHours(parseInt(hours), parseInt(minutes), 0, 0);

            const visitData = {
                match_id: matchId,
                proposed_date: proposedDate.toISOString(),
                notes: values.notes || null,
            };

            await createVisit(user.id || user.user_id, visitData);

            toast.success('✅ Proposition de visite envoyée !');
            onOpenChange(false);
            form.reset();
            setSelectedTime('14:00');
            if (onVisitCreated) onVisitCreated();
        } catch (error) {
            console.error('Error creating visit:', error);
            toast.error("❌ Erreur lors de la création de la visite");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[450px]">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-bold">📅 Planifier une visite</DialogTitle>
                    <DialogDescription>
                        Proposez une date et une heure pour visiter le logement.
                    </DialogDescription>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        {/* Date Field */}
                        <FormField
                            control={form.control}
                            name="proposed_date"
                            render={({ field }) => (
                                <FormItem className="flex flex-col">
                                    <FormLabel className="text-base font-semibold">Date</FormLabel>
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <FormControl>
                                                <Button
                                                    variant="outline"
                                                    className={cn(
                                                        "w-full pl-4 text-left font-normal py-6 border-2 hover:border-yellow-400",
                                                        !field.value && "text-muted-foreground"
                                                    )}
                                                >
                                                    <CalendarIcon className="mr-3 h-5 w-5 text-yellow-500" />
                                                    {field.value ? (
                                                        <span className="font-semibold">
                                                            {format(field.value, "EEEE d MMMM yyyy", { locale: fr })}
                                                        </span>
                                                    ) : (
                                                        <span>Choisir une date</span>
                                                    )}
                                                </Button>
                                            </FormControl>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-auto p-0" align="start">
                                            <Calendar
                                                mode="single"
                                                selected={field.value}
                                                onSelect={field.onChange}
                                                disabled={(date) => date < new Date() || date.getTime() < new Date().setHours(0, 0, 0, 0)}
                                                initialFocus
                                                locale={fr}
                                            />
                                        </PopoverContent>
                                    </Popover>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* Time Field */}
                        <FormItem>
                            <FormLabel className="text-base font-semibold">Heure</FormLabel>
                            <Select value={selectedTime} onValueChange={setSelectedTime}>
                                <FormControl>
                                    <SelectTrigger className="py-6 border-2 hover:border-yellow-400">
                                        <Clock className="mr-3 h-5 w-5 text-yellow-500" />
                                        <SelectValue />
                                    </SelectTrigger>
                                </FormControl>
                                <SelectContent className="max-h-[200px]">
                                    {TIME_SLOTS.map((time) => (
                                        <SelectItem key={time} value={time}>
                                            {time}h
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </FormItem>

                        {/* Notes Field */}
                        <FormField
                            control={form.control}
                            name="notes"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-base font-semibold">Message (optionnel)</FormLabel>
                                    <FormControl>
                                        <Textarea
                                            placeholder="Ex: Je serais en retard de 10 min, merci de m'attendre..."
                                            className="resize-none min-h-24 border-2 focus:ring-yellow-400"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* Info Box */}
                        <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded">
                            <div className="flex gap-3">
                                <Info className="h-5 w-5 text-blue-400 flex-shrink-0 mt-0.5" />
                                <p className="text-sm text-blue-700">
                                    Le bailleur recevra votre proposition et pourra l'accepter ou la refuser.
                                </p>
                            </div>
                        </div>

                        <DialogFooter>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => onOpenChange(false)}
                                disabled={loading}
                            >
                                Annuler
                            </Button>
                            <Button
                                type="submit"
                                disabled={loading}
                                className="bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600 text-gray-900 font-semibold"
                            >
                                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Proposer la visite
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
