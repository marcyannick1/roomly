import { useState } from 'react';
import { Modal, Form, DatePicker, TimePicker, Input, Button, Alert, Space } from 'antd';
import { CalendarOutlined, ClockCircleOutlined, InfoCircleOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import 'dayjs/locale/fr';
import locale from 'antd/locale/fr_FR';
import { createVisit } from '@/lib/api';
import { toast } from 'sonner';

dayjs.locale('fr');

const { TextArea } = Input;

// Generate time slots from 9h to 20h
const generateTimeSlots = () => {
    const slots = [];
    for (let hour = 9; hour <= 20; hour++) {
        slots.push(dayjs().hour(hour).minute(0));
        if (hour < 20) {
            slots.push(dayjs().hour(hour).minute(30));
        }
    }
    return slots;
};

export function VisitModal({ open, onOpenChange, matchId, user, onVisitCreated }) {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (values) => {
        try {
            if (!matchId) {
                toast.error('❌ Match introuvable. Ouvre une conversation valide avant de proposer une visite.');
                return;
            }
            const userId = user?.id || user?.user_id;
            if (!userId) {
                toast.error('❌ Utilisateur introuvable.');
                return;
            }
            setLoading(true);

            // Combine date and time
            const proposedDate = dayjs(values.date)
                .hour(values.time.hour())
                .minute(values.time.minute())
                .second(0);

            const visitData = {
                match_id: matchId,
                proposed_date: proposedDate.toISOString(),
                notes: values.notes || null,
            };

            await createVisit(userId, visitData);

            toast.success('✅ Proposition de visite envoyée !');
            form.resetFields();
            onOpenChange(false);
            if (onVisitCreated) onVisitCreated();
        } catch (error) {
            const apiMessage = error?.response?.data?.detail;
            console.error('Error creating visit:', error);
            toast.error(apiMessage ? `❌ ${apiMessage}` : '❌ Erreur lors de la création de la visite');
        } finally {
            setLoading(false);
        }
    };

    const disabledDate = (current) => {
        // Disable dates before today
        return current && current < dayjs().startOf('day');
    };

    return (
        <Modal
            title={
                <Space>
                    <CalendarOutlined style={{ color: '#faad14' }} />
                    <span style={{ fontSize: '20px', fontWeight: 'bold' }}>Planifier une visite</span>
                </Space>
            }
            open={open}
            onCancel={() => onOpenChange(false)}
            footer={null}
            width={550}
            centered
        >
            <p style={{ color: '#666', marginBottom: '24px' }}>
                Proposez une date et une heure pour visiter le logement.
            </p>

            <Form
                form={form}
                layout="vertical"
                onFinish={handleSubmit}
                initialValues={{
                    time: dayjs().hour(14).minute(0),
                }}
            >
                <Form.Item
                    label={<span style={{ fontSize: '16px', fontWeight: '600' }}>📅 Date de visite</span>}
                    name="date"
                    rules={[{ required: true, message: 'Veuillez sélectionner une date' }]}
                >
                    <DatePicker
                        style={{ width: '100%', height: '48px' }}
                        size="large"
                        format="dddd D MMMM YYYY"
                        placeholder="Choisir une date"
                        disabledDate={disabledDate}
                        locale={locale}
                    />
                </Form.Item>

                <Form.Item
                    label={<span style={{ fontSize: '16px', fontWeight: '600' }}>🕐 Heure de visite</span>}
                    name="time"
                    rules={[{ required: true, message: 'Veuillez sélectionner une heure' }]}
                >
                    <TimePicker
                        style={{ width: '100%', height: '48px' }}
                        size="large"
                        format="HH:mm"
                        minuteStep={30}
                        placeholder="Choisir une heure"
                        hideDisabledOptions
                        disabledTime={() => ({
                            disabledHours: () => {
                                const hours = [];
                                for (let i = 0; i < 9; i++) hours.push(i);
                                for (let i = 21; i < 24; i++) hours.push(i);
                                return hours;
                            }
                        })}
                    />
                </Form.Item>

                <Form.Item
                    label={<span style={{ fontSize: '16px', fontWeight: '600' }}>💬 Message (optionnel)</span>}
                    name="notes"
                >
                    <TextArea
                        rows={4}
                        placeholder="Ex: Je serais en retard de 10 min, merci de m'attendre..."
                        style={{ fontSize: '14px' }}
                    />
                </Form.Item>

                <Alert
                    title="Information"
                    description="Le bailleur recevra votre proposition et pourra l'accepter ou la refuser."
                    type="info"
                    showIcon
                    icon={<InfoCircleOutlined />}
                    style={{ marginBottom: '24px' }}
                />

                <Form.Item style={{ marginBottom: 0 }}>
                    <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
                        <Button
                            size="large"
                            onClick={() => onOpenChange(false)}
                            disabled={loading}
                        >
                            Annuler
                        </Button>
                        <Button
                            type="primary"
                            size="large"
                            htmlType="submit"
                            loading={loading}
                            style={{
                                background: 'linear-gradient(to right, #fadb14, #faad14)',
                                borderColor: '#faad14',
                                fontWeight: '600',
                            }}
                        >
                            Proposer la visite
                        </Button>
                    </Space>
                </Form.Item>
            </Form>
        </Modal>
    );
}
