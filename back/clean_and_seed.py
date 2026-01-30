#!/usr/bin/env python3
"""Script pour nettoyer et créer 20 annonces bien structurées"""
import asyncio
import sys
from datetime import date, timedelta
from pathlib import Path

project_root = Path(__file__).resolve().parent
sys.path.insert(0, str(project_root))

import os
from dotenv import load_dotenv
from sqlalchemy import select, delete
from sqlalchemy.ext.asyncio import AsyncSession

load_dotenv()

from app.db.session import AsyncSessionLocal
from app.models.user import User
from app.models.student import Student
from app.models.landlord import Landlord
from app.models.listing import Listing
from app.models.listing_photo import ListingPhoto
from app.models.like import Like
from app.models.match import Match


async def clean_users(db: AsyncSession):
    """Nettoyer les utilisateurs en gardant seulement etudiant@ipssi.fr et bailleur@gmail.fr"""
    print("🗑️  Nettoyage des utilisateurs...")
    
    # Récupérer les utilisateurs à garder
    result = await db.execute(
        select(User).where(User.email.in_(["etudiant@ipssi.fr", "bailleur@gmail.fr"]))
    )
    users_to_keep = result.scalars().all()
    user_ids_to_keep = [u.id for u in users_to_keep]
    
    if not user_ids_to_keep:
        print("⚠️  Aucun utilisateur etudiant@ipssi.fr ou bailleur@gmail.fr trouvé")
        return
    
    # Supprimer d'abord les dépendances
    await db.execute(delete(Match))
    await db.execute(delete(Like))
    await db.execute(delete(ListingPhoto))
    await db.execute(delete(Listing))
    
    # Supprimer les profils étudiants et bailleurs qui ne sont pas à garder
    await db.execute(delete(Student).where(Student.user_id.notin_(user_ids_to_keep)))
    await db.execute(delete(Landlord).where(Landlord.user_id.notin_(user_ids_to_keep)))
    
    # Supprimer les utilisateurs qui ne sont pas à garder
    await db.execute(delete(User).where(User.id.notin_(user_ids_to_keep)))
    
    await db.commit()
    print(f"✅ Utilisateurs nettoyés, gardé {len(user_ids_to_keep)} utilisateurs")


async def clean_listings(db: AsyncSession):
    """Supprimer toutes les annonces, photos, likes et matches"""
    print("🗑️  Suppression des annonces existantes...")
    
    # Supprimer dans l'ordre pour respecter les foreign keys
    await db.execute(delete(Match))
    await db.execute(delete(Like))
    await db.execute(delete(ListingPhoto))
    await db.execute(delete(Listing))
    
    await db.commit()
    print("✅ Toutes les annonces ont été supprimées")


async def create_quality_listings(db: AsyncSession):
    """Créer 20 annonces de qualité avec tous les champs remplis"""
    
    # Récupérer un bailleur
    result = await db.execute(select(Landlord))
    landlord = result.scalars().first()
    if not landlord:
        print("❌ Aucun bailleur trouvé. Veuillez d'abord créer un compte bailleur.")
        return
    
    result = await db.execute(select(User).where(User.id == landlord.user_id))
    owner = result.scalars().first()
    if not owner:
        print("❌ Utilisateur bailleur introuvable.")
        return
    
    print(f"📝 Création de 20 annonces pour le bailleur {owner.email}...")
    
    listings_data = [
        {
            "title": "Studio lumineux proche Université Lyon 3",
            "description": "Charmant studio de 25m² entièrement rénové, situé à 5 minutes à pied du campus Lyon 3. Idéal pour étudiant, avec un espace de travail aménagé, une kitchenette équipée et une salle d'eau moderne. Quartier calme et bien desservi par les transports en commun.",
            "price": 580.00,
            "surface": 25.0,
            "charges_included": True,
            "deposit": 580.00,
            "city": "Lyon",
            "address": "45 Rue de la République",
            "postal_code": "69002",
            "latitude": 45.7578,
            "longitude": 4.8320,
            "room_type": "studio",
            "furnished": True,
            "floor": 3,
            "total_floors": 5,
            "available_from": date.today() + timedelta(days=15),
            "min_duration_months": 9,
            "wifi": True,
            "washing_machine": True,
            "kitchen": True,
            "parking": False,
            "elevator": True,
            "workspace": True,
            "pets": False,
            "tv": True,
            "dryer": False,
            "ac": False,
            "garden": False,
            "balcony": False,
            "photos": [
                "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800",
                "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800",
                "https://images.unsplash.com/photo-1502672260066-6bc2330b0ebd?w=800"
            ]
        },
        {
            "title": "T2 spacieux avec balcon - Quartier étudiant",
            "description": "Bel appartement T2 de 45m² avec balcon, situé au cœur du quartier étudiant. Cuisine équipée, grand séjour lumineux, chambre séparée. Proche commerces, bibliothèque universitaire et arrêts de bus. Immeuble sécurisé avec gardien.",
            "price": 750.00,
            "surface": 45.0,
            "charges_included": True,
            "deposit": 750.00,
            "city": "Lyon",
            "address": "12 Avenue Jean Jaurès",
            "postal_code": "69007",
            "latitude": 45.7485,
            "longitude": 4.8467,
            "room_type": "t2",
            "furnished": True,
            "floor": 2,
            "total_floors": 4,
            "available_from": date.today() + timedelta(days=30),
            "min_duration_months": 12,
            "wifi": True,
            "washing_machine": False,
            "kitchen": True,
            "parking": True,
            "elevator": False,
            "workspace": True,
            "pets": True,
            "tv": False,
            "dryer": False,
            "ac": True,
            "garden": False,
            "balcony": True,
            "photos": [
                "https://images.unsplash.com/photo-1502672023488-70e25813eb80?w=800",
                "https://images.unsplash.com/photo-1567767292278-a4f21aa2d36e?w=800",
                "https://images.unsplash.com/photo-1556912173-46c336c7fd55?w=800"
            ]
        },
        {
            "title": "Chambre en colocation - Quartier Bellecour",
            "description": "Belle chambre de 12m² dans un grand appartement en colocation de 4 personnes. Espaces communs spacieux : cuisine équipée, salon avec TV, 2 salles de bain. Ambiance conviviale entre étudiants. Internet fibre inclus.",
            "price": 420.00,
            "surface": 12.0,
            "charges_included": True,
            "deposit": 420.00,
            "city": "Lyon",
            "address": "8 Rue Mercière",
            "postal_code": "69002",
            "latitude": 45.7640,
            "longitude": 4.8330,
            "room_type": "chambre",
            "furnished": True,
            "floor": 1,
            "total_floors": 3,
            "available_from": date.today() + timedelta(days=7),
            "min_duration_months": 6,
            "wifi": True,
            "washing_machine": True,
            "kitchen": True,
            "parking": False,
            "elevator": False,
            "workspace": False,
            "pets": False,
            "tv": True,
            "dryer": True,
            "ac": False,
            "garden": False,
            "balcony": False,
            "photos": [
                "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=800",
                "https://images.unsplash.com/photo-1616594039964-ae9021a400a0?w=800"
            ]
        },
        {
            "title": "Studio moderne avec parking - Campus Gerland",
            "description": "Studio neuf de 22m² à 2 minutes du campus Lyon 1 Gerland. Équipé d'un coin cuisine moderne, salle de bain avec douche italienne. Place de parking sécurisée incluse. Résidence récente avec local vélos.",
            "price": 620.00,
            "surface": 22.0,
            "charges_included": True,
            "deposit": 620.00,
            "city": "Lyon",
            "address": "18 Rue Challemel Lacour",
            "postal_code": "69007",
            "latitude": 45.7265,
            "longitude": 4.8372,
            "room_type": "studio",
            "furnished": True,
            "floor": 1,
            "total_floors": 6,
            "available_from": date.today() + timedelta(days=20),
            "min_duration_months": 9,
            "wifi": True,
            "washing_machine": False,
            "kitchen": True,
            "parking": True,
            "elevator": True,
            "workspace": True,
            "pets": False,
            "tv": False,
            "dryer": False,
            "ac": True,
            "garden": False,
            "balcony": False,
            "photos": [
                "https://images.unsplash.com/photo-1554995207-c18c203602cb?w=800",
                "https://images.unsplash.com/photo-1631679706909-1844bbd07221?w=800"
            ]
        },
        {
            "title": "T3 lumineux avec terrasse - Croix-Rousse",
            "description": "Magnifique T3 de 65m² avec grande terrasse de 15m². 2 chambres, salon spacieux, cuisine équipée. Vue dégagée, quartier dynamique avec nombreux commerces et restaurants. Idéal pour colocation étudiante.",
            "price": 950.00,
            "surface": 65.0,
            "charges_included": False,
            "deposit": 1900.00,
            "city": "Lyon",
            "address": "23 Boulevard de la Croix-Rousse",
            "postal_code": "69004",
            "latitude": 45.7746,
            "longitude": 4.8295,
            "room_type": "t3",
            "furnished": False,
            "floor": 5,
            "total_floors": 6,
            "available_from": date.today() + timedelta(days=45),
            "min_duration_months": 12,
            "wifi": False,
            "washing_machine": False,
            "kitchen": True,
            "parking": False,
            "elevator": True,
            "workspace": True,
            "pets": True,
            "tv": False,
            "dryer": False,
            "ac": False,
            "garden": False,
            "balcony": True,
            "photos": [
                "https://images.unsplash.com/photo-1560185007-5f0bb1866cab?w=800",
                "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800",
                "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800"
            ]
        },
        {
            "title": "Chambre étudiante - Résidence avec services",
            "description": "Chambre de 15m² dans résidence étudiante avec nombreux services : salle de sport, laverie, espaces communs, wifi fibre. Charges et électricité incluses. Proche métro Garibaldi.",
            "price": 550.00,
            "surface": 15.0,
            "charges_included": True,
            "deposit": 550.00,
            "city": "Lyon",
            "address": "56 Cours Gambetta",
            "postal_code": "69003",
            "latitude": 45.7568,
            "longitude": 4.8590,
            "room_type": "chambre",
            "furnished": True,
            "floor": 3,
            "total_floors": 8,
            "available_from": date.today() + timedelta(days=10),
            "min_duration_months": 9,
            "wifi": True,
            "washing_machine": True,
            "kitchen": True,
            "parking": False,
            "elevator": True,
            "workspace": True,
            "pets": False,
            "tv": False,
            "dryer": True,
            "ac": True,
            "garden": True,
            "balcony": False,
            "photos": [
                "https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?w=800",
                "https://images.unsplash.com/photo-1598928506311-c55ded91a20c?w=800"
            ]
        },
        {
            "title": "Studio cosy - Quartier Part-Dieu",
            "description": "Petit studio de 18m² optimisé et chaleureux. Kitchenette intégrée, salle d'eau fonctionnelle. À 10 minutes à pied de la gare Part-Dieu et du centre commercial. Parfait pour étudiant souhaitant être au centre de tout.",
            "price": 540.00,
            "surface": 18.0,
            "charges_included": True,
            "deposit": 540.00,
            "city": "Lyon",
            "address": "31 Rue Garibaldi",
            "postal_code": "69006",
            "latitude": 45.7693,
            "longitude": 4.8513,
            "room_type": "studio",
            "furnished": True,
            "floor": 2,
            "total_floors": 5,
            "available_from": date.today() + timedelta(days=5),
            "min_duration_months": 6,
            "wifi": True,
            "washing_machine": False,
            "kitchen": True,
            "parking": False,
            "elevator": False,
            "workspace": False,
            "pets": False,
            "tv": True,
            "dryer": False,
            "ac": False,
            "garden": False,
            "balcony": False,
            "photos": [
                "https://images.unsplash.com/photo-1536376072261-38c75010e6c9?w=800",
                "https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=800"
            ]
        },
        {
            "title": "T2 avec jardin - Monplaisir",
            "description": "Charmant T2 de 42m² en rez-de-jardin avec accès privatif à un petit jardin de 20m². Cuisine séparée, chambre avec placards. Quartier résidentiel calme, proche commerces et transports.",
            "price": 720.00,
            "surface": 42.0,
            "charges_included": True,
            "deposit": 720.00,
            "city": "Lyon",
            "address": "14 Avenue des Frères Lumière",
            "postal_code": "69008",
            "latitude": 45.7415,
            "longitude": 4.8748,
            "room_type": "t2",
            "furnished": True,
            "floor": 0,
            "total_floors": 4,
            "available_from": date.today() + timedelta(days=25),
            "min_duration_months": 12,
            "wifi": True,
            "washing_machine": True,
            "kitchen": True,
            "parking": True,
            "elevator": False,
            "workspace": True,
            "pets": True,
            "tv": False,
            "dryer": False,
            "ac": False,
            "garden": True,
            "balcony": False,
            "photos": [
                "https://images.unsplash.com/photo-1600607687644-c7171b42498b?w=800",
                "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=800",
                "https://images.unsplash.com/photo-1600573472591-ee6b68d14c68?w=800"
            ]
        },
        {
            "title": "Colocation 4 chambres - Vieux Lyon",
            "description": "Grande colocation de 95m² avec 4 chambres dans immeuble typique du Vieux Lyon. Cuisine équipée, salon spacieux, 2 salles de bain. Ambiance conviviale garantie dans ce quartier historique animé.",
            "price": 480.00,
            "surface": 20.0,
            "charges_included": True,
            "deposit": 480.00,
            "city": "Lyon",
            "address": "7 Rue Saint-Jean",
            "postal_code": "69005",
            "latitude": 45.7641,
            "longitude": 4.8270,
            "room_type": "colocation",
            "furnished": True,
            "floor": 2,
            "total_floors": 4,
            "available_from": date.today() + timedelta(days=14),
            "min_duration_months": 6,
            "wifi": True,
            "washing_machine": True,
            "kitchen": True,
            "parking": False,
            "elevator": False,
            "workspace": False,
            "pets": False,
            "tv": True,
            "dryer": False,
            "ac": False,
            "garden": False,
            "balcony": True,
            "photos": [
                "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800",
                "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800"
            ]
        },
        {
            "title": "Studio design - Confluence",
            "description": "Studio moderne de 28m² dans le quartier neuf de Confluence. Design contemporain, équipé de tous les conforts. Vue sur le Rhône. Proche centre commercial, cinéma et restaurants. Quartier très bien desservi.",
            "price": 680.00,
            "surface": 28.0,
            "charges_included": True,
            "deposit": 680.00,
            "city": "Lyon",
            "address": "42 Cours Charlemagne",
            "postal_code": "69002",
            "latitude": 45.7397,
            "longitude": 4.8178,
            "room_type": "studio",
            "furnished": True,
            "floor": 4,
            "total_floors": 7,
            "available_from": date.today() + timedelta(days=35),
            "min_duration_months": 9,
            "wifi": True,
            "washing_machine": True,
            "kitchen": True,
            "parking": True,
            "elevator": True,
            "workspace": True,
            "pets": False,
            "tv": True,
            "dryer": False,
            "ac": True,
            "garden": False,
            "balcony": True,
            "photos": [
                "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=800",
                "https://images.unsplash.com/photo-1560448204-603b3fc33ddc?w=800",
                "https://images.unsplash.com/photo-1595526051245-4506e0005bd0?w=800"
            ]
        },
        {
            "title": "Chambre spacieuse - Villeurbanne",
            "description": "Grande chambre de 16m² dans appartement partagé à Villeurbanne. Proche campus Doua et métro. Cuisine équipée, salon commun, laverie dans l'immeuble. Colocataires étudiants sympathiques.",
            "price": 400.00,
            "surface": 16.0,
            "charges_included": True,
            "deposit": 400.00,
            "city": "Villeurbanne",
            "address": "25 Avenue Henri Barbusse",
            "postal_code": "69100",
            "latitude": 45.7640,
            "longitude": 4.8795,
            "room_type": "chambre",
            "furnished": True,
            "floor": 1,
            "total_floors": 3,
            "available_from": date.today() + timedelta(days=8),
            "min_duration_months": 6,
            "wifi": True,
            "washing_machine": True,
            "kitchen": True,
            "parking": False,
            "elevator": False,
            "workspace": True,
            "pets": False,
            "tv": False,
            "dryer": False,
            "ac": False,
            "garden": False,
            "balcony": False,
            "photos": [
                "https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?w=800"
            ]
        },
        {
            "title": "T2 rénové - Quartier Saxe-Gambetta",
            "description": "Appartement T2 de 40m² entièrement rénové. Cuisine ouverte sur salon, chambre séparée, salle de bain moderne. Très lumineux, calme, proche métro Saxe-Gambetta. Charges réduites.",
            "price": 710.00,
            "surface": 40.0,
            "charges_included": False,
            "deposit": 710.00,
            "city": "Lyon",
            "address": "89 Avenue Félix Faure",
            "postal_code": "69003",
            "latitude": 45.7570,
            "longitude": 4.8530,
            "room_type": "t2",
            "furnished": False,
            "floor": 3,
            "total_floors": 5,
            "available_from": date.today() + timedelta(days=40),
            "min_duration_months": 12,
            "wifi": False,
            "washing_machine": False,
            "kitchen": True,
            "parking": False,
            "elevator": True,
            "workspace": True,
            "pets": False,
            "tv": False,
            "dryer": False,
            "ac": False,
            "garden": False,
            "balcony": False,
            "photos": [
                "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?w=800",
                "https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=800"
            ]
        },
        {
            "title": "Studio avec mezzanine - Quartier Université",
            "description": "Studio atypique de 30m² avec mezzanine pour le coin nuit. Espace optimisé et fonctionnel. À 5 minutes du campus Lyon 2. Cuisine équipée, salle de bain avec baignoire. Immeuble avec gardien.",
            "price": 600.00,
            "surface": 30.0,
            "charges_included": True,
            "deposit": 600.00,
            "city": "Lyon",
            "address": "15 Quai Claude Bernard",
            "postal_code": "69007",
            "latitude": 45.7502,
            "longitude": 4.8380,
            "room_type": "studio",
            "furnished": True,
            "floor": 2,
            "total_floors": 6,
            "available_from": date.today() + timedelta(days=18),
            "min_duration_months": 9,
            "wifi": True,
            "washing_machine": False,
            "kitchen": True,
            "parking": False,
            "elevator": True,
            "workspace": True,
            "pets": False,
            "tv": False,
            "dryer": False,
            "ac": False,
            "garden": False,
            "balcony": False,
            "photos": [
                "https://images.unsplash.com/photo-1536376072261-38c75010e6c9?w=800",
                "https://images.unsplash.com/photo-1574643156929-51fa098b0394?w=800"
            ]
        },
        {
            "title": "Colocation premium - Tête d'Or",
            "description": "Belle colocation de standing de 85m² avec 3 chambres. Proche du parc de la Tête d'Or. Tout équipé : lave-vaisselle, sèche-linge, climatisation. Quartier recherché et tranquille.",
            "price": 520.00,
            "surface": 22.0,
            "charges_included": True,
            "deposit": 520.00,
            "city": "Lyon",
            "address": "33 Boulevard des Belges",
            "postal_code": "69006",
            "latitude": 45.7728,
            "longitude": 4.8543,
            "room_type": "colocation",
            "furnished": True,
            "floor": 4,
            "total_floors": 5,
            "available_from": date.today() + timedelta(days=22),
            "min_duration_months": 12,
            "wifi": True,
            "washing_machine": True,
            "kitchen": True,
            "parking": True,
            "elevator": True,
            "workspace": True,
            "pets": False,
            "tv": True,
            "dryer": True,
            "ac": True,
            "garden": True,
            "balcony": True,
            "photos": [
                "https://images.unsplash.com/photo-1600585154363-67eb9e2e2099?w=800",
                "https://images.unsplash.com/photo-1600566753151-384129cf4e3e?w=800",
                "https://images.unsplash.com/photo-1600573472550-8090b5e0745e?w=800"
            ]
        },
        {
            "title": "Studio calme - Quartier Brotteaux",
            "description": "Studio de 24m² dans quartier résidentiel calme des Brotteaux. Bien agencé avec coin cuisine, espace de vie et salle d'eau. Proche parc et commerces. Idéal pour étudiant recherchant le calme.",
            "price": 590.00,
            "surface": 24.0,
            "charges_included": True,
            "deposit": 590.00,
            "city": "Lyon",
            "address": "18 Rue de Créqui",
            "postal_code": "69006",
            "latitude": 45.7688,
            "longitude": 4.8495,
            "room_type": "studio",
            "furnished": True,
            "floor": 1,
            "total_floors": 4,
            "available_from": date.today() + timedelta(days=12),
            "min_duration_months": 9,
            "wifi": True,
            "washing_machine": False,
            "kitchen": True,
            "parking": False,
            "elevator": False,
            "workspace": True,
            "pets": False,
            "tv": False,
            "dryer": False,
            "ac": False,
            "garden": False,
            "balcony": False,
            "photos": [
                "https://images.unsplash.com/photo-1502672260066-6bc2330b0ebd?w=800",
                "https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=800"
            ]
        },
        {
            "title": "T3 meublé - Jean Macé",
            "description": "Grand T3 de 70m² entièrement meublé et équipé. 2 chambres avec rangements, grand salon lumineux, cuisine équipée avec lave-vaisselle. Proche métro Jean Macé et marché. Parfait pour colocation.",
            "price": 980.00,
            "surface": 70.0,
            "charges_included": True,
            "deposit": 1960.00,
            "city": "Lyon",
            "address": "56 Avenue Jean Jaurès",
            "postal_code": "69007",
            "latitude": 45.7465,
            "longitude": 4.8423,
            "room_type": "t3",
            "furnished": True,
            "floor": 3,
            "total_floors": 6,
            "available_from": date.today() + timedelta(days=50),
            "min_duration_months": 12,
            "wifi": True,
            "washing_machine": True,
            "kitchen": True,
            "parking": True,
            "elevator": True,
            "workspace": True,
            "pets": True,
            "tv": True,
            "dryer": True,
            "ac": True,
            "garden": False,
            "balcony": True,
            "photos": [
                "https://images.unsplash.com/photo-1560185009-5bf9f2849488?w=800",
                "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800",
                "https://images.unsplash.com/photo-1600607687644-afdfd04b7da4?w=800"
            ]
        },
        {
            "title": "Chambre individuelle - Résidence moderne",
            "description": "Chambre de 14m² dans résidence étudiante neuve. Salle de bain privative, kitchenette intégrée. Accès salle de sport et espaces communs. Internet fibre inclus. Proche métro et commerces.",
            "price": 570.00,
            "surface": 14.0,
            "charges_included": True,
            "deposit": 570.00,
            "city": "Lyon",
            "address": "28 Rue Paul Bert",
            "postal_code": "69003",
            "latitude": 45.7548,
            "longitude": 4.8650,
            "room_type": "chambre",
            "furnished": True,
            "floor": 5,
            "total_floors": 9,
            "available_from": date.today() + timedelta(days=6),
            "min_duration_months": 9,
            "wifi": True,
            "washing_machine": True,
            "kitchen": True,
            "parking": False,
            "elevator": True,
            "workspace": True,
            "pets": False,
            "tv": False,
            "dryer": True,
            "ac": True,
            "garden": False,
            "balcony": False,
            "photos": [
                "https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?w=800",
                "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800"
            ]
        },
        {
            "title": "Studio duplex - Presqu'île",
            "description": "Studio en duplex de 32m² au cœur de la Presqu'île. Niveau inférieur : cuisine et salon, niveau supérieur : mezzanine avec lit. Plein centre-ville, à proximité de toutes commodités et universités.",
            "price": 720.00,
            "surface": 32.0,
            "charges_included": True,
            "deposit": 720.00,
            "city": "Lyon",
            "address": "41 Rue de la Charité",
            "postal_code": "69002",
            "latitude": 45.7515,
            "longitude": 4.8320,
            "room_type": "studio",
            "furnished": True,
            "floor": 3,
            "total_floors": 5,
            "available_from": date.today() + timedelta(days=28),
            "min_duration_months": 6,
            "wifi": True,
            "washing_machine": False,
            "kitchen": True,
            "parking": False,
            "elevator": False,
            "workspace": True,
            "pets": False,
            "tv": True,
            "dryer": False,
            "ac": False,
            "garden": False,
            "balcony": False,
            "photos": [
                "https://images.unsplash.com/photo-1554995207-c18c203602cb?w=800",
                "https://images.unsplash.com/photo-1502672260066-6bc2330b0ebd?w=800",
                "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800"
            ]
        },
        {
            "title": "T2 avec cave - Quartier Montchat",
            "description": "Appartement T2 de 48m² avec cave et parking. Cuisine équipée séparée, chambre spacieuse avec placard, salon lumineux. Quartier calme et commerçant. Proche bus et tramway.",
            "price": 780.00,
            "surface": 48.0,
            "charges_included": True,
            "deposit": 780.00,
            "city": "Lyon",
            "address": "72 Avenue Lacassagne",
            "postal_code": "69003",
            "latitude": 45.7525,
            "longitude": 4.8762,
            "room_type": "t2",
            "furnished": True,
            "floor": 2,
            "total_floors": 4,
            "available_from": date.today() + timedelta(days=32),
            "min_duration_months": 12,
            "wifi": True,
            "washing_machine": True,
            "kitchen": True,
            "parking": True,
            "elevator": False,
            "workspace": True,
            "pets": True,
            "tv": False,
            "dryer": False,
            "ac": False,
            "garden": False,
            "balcony": True,
            "photos": [
                "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?w=800",
                "https://images.unsplash.com/photo-1567767292278-a4f21aa2d36e?w=800",
                "https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=800"
            ]
        },
        {
            "title": "Grande chambre - Colocation conviviale",
            "description": "Chambre lumineuse de 18m² dans colocation de 5 personnes. Grande cuisine équipée, salon spacieux, 2 salles de bain. Ambiance étudiante sympa. Proche université Lyon 3 et métro Sans Souci.",
            "price": 450.00,
            "surface": 18.0,
            "charges_included": True,
            "deposit": 450.00,
            "city": "Lyon",
            "address": "44 Rue Marius Berliet",
            "postal_code": "69008",
            "latitude": 45.7385,
            "longitude": 4.8685,
            "room_type": "chambre",
            "furnished": True,
            "floor": 1,
            "total_floors": 3,
            "available_from": date.today() + timedelta(days=16),
            "min_duration_months": 6,
            "wifi": True,
            "washing_machine": True,
            "kitchen": True,
            "parking": False,
            "elevator": False,
            "workspace": False,
            "pets": False,
            "tv": True,
            "dryer": False,
            "ac": False,
            "garden": False,
            "balcony": False,
            "photos": [
                "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=800",
                "https://images.unsplash.com/photo-1616594039964-ae9021a400a0?w=800"
            ]
        }
    ]
    
    created_count = 0
    for data in listings_data:
        # Créer le listing
        photos_urls = data.pop("photos")
        
        listing = Listing(
            owner_id=owner.id,
            **data
        )
        
        db.add(listing)
        await db.flush()  # Pour obtenir l'ID du listing
        
        # Ajouter les photos
        for photo_url in photos_urls:
            photo = ListingPhoto(
                listing_id=listing.id,
                url=photo_url
            )
            db.add(photo)
        
        created_count += 1
    
    await db.commit()
    print(f"✅ {created_count} annonces de qualité créées avec succès")


async def main():
    async with AsyncSessionLocal() as db:
        try:
            print("=" * 60)
            print("🏠 NETTOYAGE COMPLET ET CRÉATION D'ANNONCES")
            print("=" * 60)
            
            # Étape 1 : Nettoyer les utilisateurs
            await clean_users(db)
            
            # Étape 2 : Créer 20 annonces propres
            await create_quality_listings(db)
            
            print("\n" + "=" * 60)
            print("✨ Processus terminé avec succès!")
            print("=" * 60)
            
        except Exception as e:
            print(f"\n❌ Erreur: {e}")
            import traceback
            traceback.print_exc()
            await db.rollback()
            raise


if __name__ == "__main__":
    asyncio.run(main())
