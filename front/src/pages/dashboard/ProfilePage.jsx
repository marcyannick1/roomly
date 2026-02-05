import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { User, Mail, Phone, Edit, Save, X } from 'lucide-react';
import { getCurrentUser, updateUserProfile } from '@/lib/api';
import { toast } from 'sonner';
import { ContentCard } from '@/components/dashboard/ContentCard';

export default function ProfilePage() {
  const [user, setUser] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: ''
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const response = await getCurrentUser();
      const currentUser = response.data?.user || response.data;
      setUser(currentUser);
      const fullName = currentUser.name || '';
      const [firstName, ...rest] = fullName.split(' ');
      const lastName = rest.join(' ');

      setFormData({
        first_name: currentUser.first_name || firstName || '',
        last_name: currentUser.last_name || lastName || '',
        email: currentUser.email || '',
        phone: currentUser.phone || currentUser.telephone || ''
      });
    } catch (error) {
      console.error('Erreur chargement profil:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const userId = user?.id ?? user?.user_id;
      await updateUserProfile(userId, formData);
      toast.success('✅ Profil mis à jour !');
      setIsEditing(false);
      await loadData();
    } catch (error) {
      console.error('Erreur mise à jour profil:', error);
      toast.error('Erreur lors de la mise à jour');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
      const fullName = user.name || '';
      const [firstName, ...rest] = fullName.split(' ');
      const lastName = rest.join(' ');

      setFormData({
        first_name: user.first_name || firstName || '',
        last_name: user.last_name || lastName || '',
        email: user.email || '',
        phone: user.phone || user.telephone || ''
      });
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

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <ContentCard title="Mon Profil">
        <div className="space-y-6">
          <div className="flex items-center justify-center">
            <div className="relative">
              <div className="w-32 h-32 rounded-full bg-gradient-to-br from-[#fec629] to-[#f5b519] flex items-center justify-center">
                <span className="text-5xl font-bold text-[#212220]">
                  {user?.first_name?.[0]}{user?.last_name?.[0]}
                </span>
              </div>
              <div className="absolute bottom-0 right-0 w-10 h-10 bg-[#212220] rounded-full flex items-center justify-center border-4 border-white">
                <User className="w-5 h-5 text-white" />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Prénom
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={formData.first_name}
                    onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-[#fec629] transition-colors"
                  />
                ) : (
                  <div className="px-4 py-3 bg-gray-50 rounded-xl text-gray-900 font-medium">
                    {user?.first_name || '-'}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Nom
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={formData.last_name}
                    onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-[#fec629] transition-colors"
                  />
                ) : (
                  <div className="px-4 py-3 bg-gray-50 rounded-xl text-gray-900 font-medium">
                    {user?.last_name || '-'}
                  </div>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                <Mail className="w-4 h-4 inline mr-2" />
                Email
              </label>
              {isEditing ? (
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-[#fec629] transition-colors"
                />
              ) : (
                <div className="px-4 py-3 bg-gray-50 rounded-xl text-gray-900 font-medium">
                  {user?.email || '-'}
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                <Phone className="w-4 h-4 inline mr-2" />
                Téléphone
              </label>
              {isEditing ? (
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-[#fec629] transition-colors"
                />
              ) : (
                <div className="px-4 py-3 bg-gray-50 rounded-xl text-gray-900 font-medium">
                  {user?.phone || '-'}
                </div>
              )}
            </div>

            <div className="pt-4 border-t-2 border-gray-100">
              {isEditing ? (
                <div className="flex gap-3">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleSave}
                    disabled={saving}
                    className="flex-1 bg-gradient-to-r from-[#fec629] to-[#f5b519] text-[#212220] px-6 py-3 rounded-full font-bold flex items-center justify-center gap-2 hover:shadow-lg transition-all disabled:opacity-50"
                  >
                    <Save className="w-5 h-5" />
                    {saving ? 'Enregistrement...' : 'Enregistrer'}
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleCancel}
                    className="flex-1 bg-white border-2 border-gray-300 text-gray-900 px-6 py-3 rounded-full font-bold flex items-center justify-center gap-2 hover:border-[#212220] transition-all"
                  >
                    <X className="w-5 h-5" />
                    Annuler
                  </motion.button>
                </div>
              ) : (
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setIsEditing(true)}
                  className="w-full bg-gradient-to-r from-[#fec629] to-[#f5b519] text-[#212220] px-6 py-3 rounded-full font-bold flex items-center justify-center gap-2 hover:shadow-lg transition-all"
                >
                  <Edit className="w-5 h-5" />
                  Modifier le profil
                </motion.button>
              )}
            </div>
          </div>
        </div>
      </ContentCard>
    </div>
  );
}
