// Mock Data pour l'application statique

export const mockUser = {
  id: "1",
  name: "Jean Dupont",
  email: "jean@example.com",
  role: "landlord", // ou "student"
  avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=jean",
  phone: "+33 6 12 34 56 78",
  address: "123 Rue de Paris, 75000 Paris",
};

export const mockStudentUser = {
  id: "2",
  name: "Marie Martin",
  email: "marie@example.com",
  role: "student",
  avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=marie",
  phone: "+33 6 98 76 54 32",
  university: "Université de Paris",
  budget: 600,
};

export const mockProperties = [
  {
    id: "1",
    title: "Appartement lumineux 2 pièces",
    description: "Bel appartement avec balcon, proche métro",
    price: 650,
    location: "14e arrondissement, Paris",
    lat: 48.8296,
    lng: 2.3374,
    bedrooms: 2,
    bathrooms: 1,
    area: 55,
    amenities: ["WiFi", "Chauffage inclus", "Parking"],
    images: [
      "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800",
      "https://images.unsplash.com/photo-1524738232033-c9387fb37601?w=800",
    ],
    landlord: {
      id: "1",
      name: "Jean Dupont",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=jean",
    },
    status: "active",
    createdAt: "2024-02-01",
  },
  {
    id: "2",
    title: "Studio moderne dans le Marais",
    description: "Studio rénové, très lumineux, secteur touristique",
    price: 550,
    location: "4e arrondissement, Paris",
    lat: 48.8595,
    lng: 2.3621,
    bedrooms: 1,
    bathrooms: 1,
    area: 32,
    amenities: ["WiFi", "Climatisation", "Lave-linge"],
    images: [
      "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800",
    ],
    landlord: {
      id: "1",
      name: "Jean Dupont",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=jean",
    },
    status: "active",
    createdAt: "2024-02-05",
  },
  {
    id: "3",
    title: "Chambre dans colocation 3 pièces",
    description: "Chambre spacieuse dans un bel appartement en colocation",
    price: 450,
    location: "13e arrondissement, Paris",
    lat: 48.8216,
    lng: 2.3698,
    bedrooms: 1,
    bathrooms: 1,
    area: 18,
    amenities: ["WiFi", "Cuisine partagée", "Espace commun"],
    images: [
      "https://images.unsplash.com/photo-1540932239986-310128078ceb?w=800",
    ],
    landlord: {
      id: "3",
      name: "Pierre Leclerc",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=pierre",
    },
    status: "active",
    createdAt: "2024-02-10",
  },
];

export const mockMatches = [
  {
    id: "1",
    propertyId: "1",
    studentId: "2",
    studentName: "Marie Martin",
    studentAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=marie",
    propertyTitle: "Appartement lumineux 2 pièces",
    status: "pending", // pending, accepted, rejected
    createdAt: "2024-02-15",
    message: "Très intéressé par cet appartement!",
  },
  {
    id: "2",
    propertyId: "2",
    studentId: "2",
    studentName: "Marie Martin",
    studentAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=marie",
    propertyTitle: "Studio moderne dans le Marais",
    status: "accepted",
    createdAt: "2024-02-14",
    message: "Parfait pour moi!",
  },
];

export const mockMessages = [
  {
    id: "1",
    conversationId: "conv-1",
    senderId: "1",
    senderName: "Jean Dupont",
    recipientId: "2",
    recipientName: "Marie Martin",
    message: "Bonjour, l'appartement vous intéresse?",
    timestamp: "2024-02-15T10:30:00",
    read: true,
  },
  {
    id: "2",
    conversationId: "conv-1",
    senderId: "2",
    senderName: "Marie Martin",
    recipientId: "1",
    recipientName: "Jean Dupont",
    message: "Oui beaucoup! Quand pouvons-nous le visiter?",
    timestamp: "2024-02-15T10:45:00",
    read: true,
  },
  {
    id: "3",
    conversationId: "conv-1",
    senderId: "1",
    senderName: "Jean Dupont",
    recipientId: "2",
    recipientName: "Marie Martin",
    message: "Samedi à 14h vous convient?",
    timestamp: "2024-02-15T11:00:00",
    read: false,
  },
];

export const mockNotifications = [
  {
    id: "1",
    type: "new_match",
    title: "Nouvelle candidature",
    message: "Marie Martin s'intéresse à votre propriété",
    read: false,
    timestamp: "2024-02-15T14:30:00",
  },
  {
    id: "2",
    type: "message",
    title: "Nouveau message",
    message: "Vous avez un message de Marie Martin",
    read: true,
    timestamp: "2024-02-15T13:00:00",
  },
];

export const mockLandlordStats = {
  totalProperties: 2,
  totalMatches: 5,
  activeProperties: 2,
  unreadNotifications: 2,
  views: 120,
  messages: 15,
};

export const mockCalendarEvents = [
  {
    id: "1",
    title: "Visite appartement 2 pièces",
    date: "2024-02-17",
    time: "14:00",
    propertyId: "1",
    studentName: "Marie Martin",
  },
  {
    id: "2",
    title: "Appel avec candidat",
    date: "2024-02-20",
    time: "10:00",
    propertyId: "2",
    studentName: "Pierre Durand",
  },
];
