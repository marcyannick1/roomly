#!/usr/bin/env python3
"""
Test: Vérifier que les likes sont comptés correctement
"""
import asyncio
import httpx
import json

async def test_likes():
    token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJiYWlsbGV1ckBnbWFpbC5mciIsImV4cCI6MTc3MDkxMDUxMH0.6FKM77fEjUmJzZRDFCzcA4FL2AFLrzwpvI-JF5HAsh4"
    
    url = f"http://localhost:8000/api/properties/landlord/my?token={token}"
    
    print("🧪 Test: Récupérer les annonces avec likes_count\n")
    
    async with httpx.AsyncClient() as client:
        try:
            response = await client.get(url)
            if response.status_code == 200:
                listings = response.json()
                print(f"✅ {len(listings)} annonces trouvées\n")
                
                total_likes = 0
                for listing in listings:
                    likes = listing.get('likes_count', 0)
                    total_likes += likes
                    print(f"📌 {listing['title']}")
                    print(f"   Likes: {likes}")
                    print(f"   Prix: {listing['price']}€")
                    print(f"   Ville: {listing['city']}\n")
                
                print(f"📊 Total likes reçus: {total_likes}")
            else:
                print(f"❌ Erreur {response.status_code}")
                
        except Exception as e:
            print(f"❌ Exception: {e}")

if __name__ == "__main__":
    asyncio.run(test_likes())
