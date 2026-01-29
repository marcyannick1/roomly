import { useParams } from 'react-router-dom';

export default function ListingDetail() {
  const { listingId } = useParams();
  
  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold">Détail de l'annonce {listingId}</h1>
        <p className="text-muted-foreground mt-4">Page en construction</p>
      </div>
    </div>
  );
}
