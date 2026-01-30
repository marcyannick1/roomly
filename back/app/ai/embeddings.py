import numpy as np
from sentence_transformers import SentenceTransformer
from app.ai.config import ROOM_TYPES, STUDY_LEVELS, DEFAULT_BUDGET, DEFAULT_SURFACE, DEFAULT_NOISE

# Modèle multilingue optimisé pour le français
# Alternatives: "distiluse-base-multilingual-cased-v2", "paraphrase-multilingual-MiniLM-L12-v2"
embedding_model = SentenceTransformer('paraphrase-multilingual-mpnet-base-v2')

def create_student_embedding(student) -> np.ndarray:
    """Crée un embedding sémantique basé sur la description des préférences de l'étudiant"""

    # Construction d'une description textuelle du profil étudiant
    room_types = student.room_type.replace(",", ", ") if student.room_type else "tous types"
    furnished_pref = "meublé" if student.furnished else "non meublé"
    smoking = "fumeur" if student.smoking else "non-fumeur"
    pets = "avec animaux" if student.pets else "sans animaux"

    description = (
        f"Étudiant recherche logement {room_types}, {furnished_pref}. "
        f"Budget maximum {student.max_budget or DEFAULT_BUDGET}€. "
        f"Niveau d'études: {student.study_level or 'non spécifié'}. "
        f"Profil: {smoking}, {pets}. "
        f"Tolérance au bruit: {student.noise_level or DEFAULT_NOISE}/10."
    )

    # Génère l'embedding avec le modèle pré-entraîné
    return embedding_model.encode(description, convert_to_numpy=True)


def create_listing_embedding(listing) -> np.ndarray:
    """Crée un embedding sémantique basé sur la description complète de l'annonce"""

    # Construction d'une description textuelle détaillée du logement
    furnished = "meublé" if listing.furnished else "non meublé"

    amenities = []
    if listing.wifi:
        amenities.append("wifi")
    if listing.washing_machine:
        amenities.append("lave-linge")
    if listing.parking:
        amenities.append("parking")
    if listing.elevator:
        amenities.append("ascenseur")
    if listing.kitchen:
        amenities.append("cuisine équipée")

    amenities_text = ", ".join(amenities) if amenities else "équipements standards"

    description = (
        f"{listing.title}. "
        f"Type: {listing.room_type}, {furnished}. "
        f"Prix: {listing.price}€. "
        f"Surface: {listing.surface or DEFAULT_SURFACE}m². "
        f"Localisation: {listing.address}, {listing.city} {listing.postal_code}. "
        f"Étage {listing.floor}/{listing.total_floors}. "
        f"Équipements: {amenities_text}. "
        f"{listing.description}"
    )

    # Génère l'embedding avec le modèle pré-entraîné
    return embedding_model.encode(description, convert_to_numpy=True)
