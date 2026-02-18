#!/usr/bin/env python3
"""
Créer des likes de test pour vérifier l'affichage
"""
import sys
sys.path.insert(0, '/Users/rufus_m/Documents/IPSSI 2026_2027/ROOMLY/roomly/back')

from app.db import SessionLocal
from app.models.like import Like
from app.models.listing import Listing
from app.models.student import Student

def create_test_likes():
    db = SessionLocal()
    
    try:
        # Récupérer les 3 premières propriétés et un étudiant
        listings = db.query(Listing).order_by(Listing.id).limit(3).all()
        student = db.query(Student).first()
        
        if not listings or not student:
            print("❌ Pas assez de données de test")
            return
        
        print(f"📌 Étudiant: {student.id} - {student.email}")
        print(f"📌 Propriétés: {[l.id for l in listings]}\n")
        
        # Ajouter les likes
        likes_created = 0
        for idx, listing in enumerate(listings):
            # Vérifier si like existe déjà
            existing = db.query(Like).filter(
                Like.student_id == student.id,
                Like.listing_id == listing.id
            ).first()
            
            if not existing:
                like = Like(
                    student_id=student.id,
                    listing_id=listing.id,
                    is_like=True  # True = like, False = dislike
                )
                db.add(like)
                likes_created += 1
                print(f"✅ Like créé: Étudiant {student.id} → Propriété {listing.id}")
        
        db.commit()
        print(f"\n📊 {likes_created} likes créés avec succès")
        
        # Vérifier les comptages
        for listing in listings:
            count = db.query(Like).filter(
                Like.listing_id == listing.id,
                Like.is_like == True
            ).count()
            print(f"   Propriété {listing.id}: {count} likes")
        
    except Exception as e:
        print(f"❌ Erreur: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    create_test_likes()
