import asyncio
from app.db.session import get_db
from sqlalchemy import text

async def create_test_messages():
    async for db in get_db():
        # Récupérer le match 37 (celui que l'utilisateur essaie d'ouvrir)
        # Note: dans matches, landlord_id est un user_id, student_id est un student.id
        result = await db.execute(text('''
            SELECT m.id, m.student_id, m.landlord_id, s.user_id as student_user_id, m.landlord_id as landlord_user_id
            FROM matches m
            JOIN students s ON m.student_id = s.id
            WHERE m.id = 37
        '''))
        match_row = result.fetchone()
        
        if not match_row:
            print("❌ Match 37 non trouvé")
            return
        
        match_id, student_id, landlord_id, student_user_id, landlord_user_id = match_row
        print(f"✅ Match trouvé: ID={match_id}")
        print(f"   Student ID={student_id} → User {student_user_id}")
        print(f"   Landlord User ID={landlord_user_id}")
        
        # Supprimer les anciens messages du match pour repartir propre
        await db.execute(text('DELETE FROM messages WHERE match_id = :match_id'), {'match_id': match_id})
        print(f"🗑️  Messages existants supprimés")
        
        # Insérer message de l'étudiant
        await db.execute(text('''
            INSERT INTO messages (match_id, sender_id, content, is_read, created_at)
            VALUES (:match_id, :sender_id, :content, false, now())
        '''), {
            'match_id': match_id,
            'sender_id': student_user_id,
            'content': "Bonjour, je suis très intéressé par votre logement. Serait-il possible d'organiser une visite cette semaine ?"
        })
        print(f"📩 Message 1 créé (Étudiant {student_user_id} → Bailleur {landlord_user_id})")
        
        # Insérer message du bailleur
        await db.execute(text('''
            INSERT INTO messages (match_id, sender_id, content, is_read, created_at)
            VALUES (:match_id, :sender_id, :content, false, now())
        '''), {
            'match_id': match_id,
            'sender_id': landlord_user_id,
            'content': "Bonjour ! Merci de votre intérêt. Je suis disponible pour une visite jeudi après-midi ou vendredi matin. Qu'est-ce qui vous conviendrait le mieux ?"
        })
        print(f"📩 Message 2 créé (Bailleur {landlord_user_id} → Étudiant {student_user_id})")
        
        await db.commit()
        
        # Vérifier les messages créés
        result = await db.execute(text('''
            SELECT id, sender_id, content, created_at
            FROM messages
            WHERE match_id = :match_id
            ORDER BY created_at
        '''), {'match_id': match_id})
        
        print(f"\n✅ Messages créés avec succès pour le match {match_id}:")
        for row in result:
            print(f"  - ID: {row[0]}, Sender: {row[1]}, Content: {row[2][:50]}...")
        
        print(f"\n🎯 Pour tester:")
        print(f"  1. Connectez-vous avec: etudiant@ipssi.fr")
        print(f"  2. Allez dans 'Messages'")
        print(f"  3. Sélectionnez la conversation avec Jokast KASSA")
        print(f"  4. Le match 37 devrait maintenant fonctionner !")
        
        break

if __name__ == "__main__":
    asyncio.run(create_test_messages())
