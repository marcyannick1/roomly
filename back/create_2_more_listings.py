#!/usr/bin/env python3
"""
Créer 2 annonces de test supplémentaires
"""
import asyncio
import httpx
import json

async def create_test_listings():
    token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJiYWlsbGV1ckBnbWFpbC5mciIsImV4cCI6MTc3MDkxMDUxMH0.6FKM77fEjUmJzZRDFCzcA4FL2AFLrzwpvI-JF5HAsh4"
    owner_id = 15
    
    listings = [
        {
            "title": "T3 spacieux Marais",
            "description": "Bel appartement 3 pièces avec belle vue",
            "price": 1500.0,
            "surface": 65.0,
            "city": "Paris",
            "address": "45 Rue de Turenne",
            "postal_code": "75003",
            "latitude": 48.8620,
            "longitude": 2.3620,
            "room_type": "apartment",
            "furnished": True,
            "charges_included": False,
            "deposit": 1500.0,
            "floor": 2,
            "total_floors": 4,
            "available_from": "2026-03-01",
            "wifi": True,
            "kitchen": True,
            "washing_machine": True,
            "balcony": True,
            "owner_id": owner_id
        },
        {
            "title": "Chambre chez l'habitant Belleville",
            "description": "Chambre chaleureuse dans quartier branché",
            "price": 550.0,
            "surface": 12.0,
            "city": "Paris",
            "address": "78 Rue de Belleville",
            "postal_code": "75020",
            "latitude": 48.8745,
            "longitude": 2.3900,
            "room_type": "room",
            "furnished": True,
            "charges_included": True,
            "deposit": 550.0,
            "floor": 3,
            "total_floors": 5,
            "available_from": "2026-02-28",
            "wifi": True,
            "kitchen": False,
            "workspace": True,
            "owner_id": owner_id
        }
    ]
    
    url = f"http://localhost:8000/api/properties/json?token={token}"
    
    async with httpx.AsyncClient() as client:
        for i, listing in enumerate(listings, 1):
            print(f"\n🧪 Création annonce {i}/2: {listing['title']}")
            try:
                response = await client.post(url, json=listing)
                if response.status_code == 201:
                    data = response.json()
                    print(f"✅ Créée avec succès! ID: {data['id']}")
                else:
                    print(f"❌ Erreur {response.status_code}: {response.json()}")
            except Exception as e:
                print(f"❌ Exception: {e}")

if __name__ == "__main__":
    asyncio.run(create_test_listings())
