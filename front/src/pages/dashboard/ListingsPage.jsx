import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Button, Space, Avatar, Typography, Tag, Statistic, Row, Col, Popconfirm, Spin } from 'antd';
import { Home, Plus, Edit, Trash2, MapPin, Euro, Eye, Heart } from 'lucide-react';
import { getLandlordListings, deleteListing, getCurrentUser } from '@/lib/api';
import { toast } from 'sonner';
import { EmptyState } from '@/components/dashboard/EmptyState';

const { Title, Text } = Typography;

export default function ListingsPage() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const userResponse = await getCurrentUser();
      const currentUser = userResponse.data?.user || userResponse.data;
      setUser(currentUser);

      const userId = currentUser?.id ?? currentUser?.user_id;
      const listingsResponse = await getLandlordListings(userId);
      setListings(listingsResponse.data || []);
    } catch (error) {
      console.error('Erreur chargement annonces:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (listingId) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer cette annonce ?')) {
      return;
    }

    try {
      await deleteListing(listingId);
      toast.success('✅ Annonce supprimée');
      setListings(prev => prev.filter(l => l.id !== listingId));
    } catch (error) {
      console.error('Erreur suppression:', error);
      toast.error('Erreur lors de la suppression');
    }
  };

  const handleEdit = (listingId) => {
    navigate(`/dashboard/listing/edit/${listingId}`);
  };

  const handleNewListing = () => {
    navigate('/dashboard/listing/new');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className="w-full space-y-6">
      <Card bordered={false} className="shadow-lg">
        <div className="flex items-center justify-between">
          <Space align="center" size="middle">
            <Avatar size={64} icon={<Home />} style={{ backgroundColor: '#fec629', color: '#212220' }} />
            <div>
              <Title level={2} style={{ margin: 0, fontFamily: 'Outfit' }}>Mes Annonces</Title>
              <Text type="secondary">Gérez vos logements et suivez les statistiques</Text>
            </div>
          </Space>
          <Button
            type="primary"
            size="large"
            icon={<Plus className="w-5 h-5" />}
            onClick={handleNewListing}
            style={{ backgroundColor: '#fec629', borderColor: '#fec629', color: '#212220', height: '48px', fontWeight: 'bold' }}
          >
            Nouvelle annonce
          </Button>
        </div>
      </Card>

      {!listings || listings.length === 0 ? (
        <div className="flex items-center justify-center h-96">
          <EmptyState
            icon={Home}
            title="Aucune annonce"
            description="Créez votre première annonce pour commencer !"
          />
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {listings.map((listing) => (
            <ListingCard
              key={listing.id}
              listing={listing}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function ListingCard({ listing, onEdit, onDelete }) {
  const hasPhoto = listing.photos?.[0]?.url;
  
  return (
    <Card
      hoverable
      cover={
        <div className="relative h-56 bg-gradient-to-br from-gray-100 to-gray-200">
          {hasPhoto ? (
            <>
              <img
                src={listing.photos[0].url}
                alt={listing.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
            </>
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Home className="w-20 h-20 text-gray-300" />
            </div>
          )}

          <div className="absolute top-4 right-4 flex gap-2">
            <Button
              shape="circle"
              icon={<Edit className="w-4 h-4" />}
              onClick={() => onEdit(listing.id)}
              style={{ backgroundColor: 'white' }}
            />
            <Popconfirm
              title="Supprimer cette annonce ?"
              description="Cette action est irréversible."
              onConfirm={() => onDelete(listing.id)}
              okText="Supprimer"
              cancelText="Annuler"
              okButtonProps={{ danger: true }}
            >
              <Button
                shape="circle"
                icon={<Trash2 className="w-4 h-4" />}
                danger
                style={{ backgroundColor: 'white', color: '#ff4d4f' }}
              />
            </Popconfirm>
          </div>
        </div>
      }
    >
      <Space direction="vertical" size="middle" style={{ width: '100%' }}>
        <div>
          <Title level={4} style={{ margin: 0, fontFamily: 'Outfit' }}>{listing.title}</Title>
          <Space size={4} style={{ marginTop: 8 }}>
            <MapPin className="w-4 h-4 text-gray-400" />
            <Text type="secondary">{listing.city}</Text>
          </Space>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Euro className="w-5 h-5 text-[#fec629]" />
            <Text strong style={{ fontSize: '20px', color: '#212220' }}>{listing.price}€</Text>
            <Text type="secondary">/mois</Text>
          </div>
          <Tag color="blue">{listing.property_type}</Tag>
        </div>

        <Row gutter={16}>
          <Col span={12}>
            <Statistic
              title="Vues"
              value={listing.views || 0}
              prefix={<Eye className="w-4 h-4" />}
              valueStyle={{ fontSize: '16px' }}
            />
          </Col>
          <Col span={12}>
            <Statistic
              title="Likes"
              value={listing.likes_count || 0}
              prefix={<Heart className="w-4 h-4" />}
              valueStyle={{ fontSize: '16px', color: '#ff4d4f' }}
            />
          </Col>
        </Row>
      </Space>
    </Card>
  );
}
