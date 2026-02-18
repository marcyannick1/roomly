#!/usr/bin/env python3
"""
Script de test pour créer une annonce via l'API JSON
"""
import asyncio
import httpx
import json

async def test_create_property():
    # Token du bailleur
    token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJiYWlsbGV1ckBnbWFpbC5mciIsImV4cCI6MTc3MDkxMDUxMH0.6FKM77fEjUmJzZRDFCzcA4FL2AFLrzwpvI-JF5HAsh4"
    owner_id = 15
    
    # Payload minimal valide
    payload = {
        "title": "Test Annonce API",
        "description": "Test de création via API JSON",
        "price": 800.0,
        "surface": 30.0,
        "city": "Paris",
        "address": "123 Rue Test",
        "postal_code": "75001",
        "latitude": 48.8566,
        "longitude": 2.3522,
        "room_type": "studio",
        "furnished": True,
        "charges_included": False,
        "deposit": None,
        "floor": None,
        "total_floors": None,
        "available_from": "2026-02-20",
        "min_duration_months": None,
        "wifi": True,
        "washing_machine": False,
        "kitchen": True,
        "parking": False,
        "elevator": False,
        "workspace": False,
        "pets": False,
        "tv": False,
        "dryer": False,
        "ac": False,
        "garden": False,
        "balcony": False,
        "owner_id": owner_id
    }
    
    url = f"http://localhost:8000/api/properties/json?token={token}"
    
    print(f"🧪 Test création annonce via API JSON")
    print(f"URL: {url}")
    print(f"Payload: {json.dumps(payload, indent=2)}")
    print()
    
    async with httpx.AsyncClient() as client:
        try:
            response = await client.post(url, json=payload)
            print(f"Status: {response.status_code}")
            print(f"Response: {response.json()}")
            
            if response.status_code == 201:
                print("\n✅ Annonce créée avec succès!")
                print(f"ID: {response.json().get('id')}")
            else:
                print(f"\n❌ Erreur: {response.status_code}")
                
        except Exception as e:
            print(f"❌ Exception: {e}")

if __name__ == "__main__":
    asyncio.run(test_create_property())
