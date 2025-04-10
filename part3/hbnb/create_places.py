from app import create_app, db
from app.models.place import Place
from app.models.amenity import Amenity 
from app.models.user import User
from app.models.review import Review
import uuid
from datetime import datetime

app = create_app()

with app.app_context():
    print("Ajout de lieux dans la base de données...")
    
    # 1. Vérifier si nous avons des utilisateurs admin
    admin = User.query.filter_by(_email="admin@hbnb.io").first()
    
    if not admin:
        print("Création d'un utilisateur admin...")
        admin = User(
            id=str(uuid.uuid4()),
            _first_name="Admin",
            _last_name="HBnB",
            _email="admin@hbnb.io",
            _is_admin=True
        )
        admin.set_password("Password123")
        db.session.add(admin)
        db.session.commit()
        print(f"Utilisateur admin créé avec l'ID: {admin.id}")
    else:
        print(f"Utilisateur admin trouvé avec l'ID: {admin.id}")
    
    # 2. Vérification des aménités existantes
    wifi = Amenity.query.filter_by(_name="WiFi").first()
    pool = Amenity.query.filter_by(_name="Swimming Pool").first()
    ac = Amenity.query.filter_by(_name="Air Conditioning").first()
    
    # Créer les aménités manquantes
    if not wifi:
        wifi = Amenity(id=str(uuid.uuid4()), _name="WiFi")
        db.session.add(wifi)
    
    if not pool:
        pool = Amenity(id=str(uuid.uuid4()), _name="Swimming Pool")
        db.session.add(pool)
        
    if not ac:
        ac = Amenity(id=str(uuid.uuid4()), _name="Air Conditioning")
        db.session.add(ac)
    
    db.session.commit()
    print("Aménités vérifiées ou créées")
    
    # 3. Créer des lieux si nécessaire
    # Ces IDs correspondent à ceux que votre API renvoie déjà
    places_data = [
        {
            "id": "abcdef12-3456-7890-abcd-ef1234567890",
            "title": "The White House",
            "description": "The White House is the official residence of the US President",
            "price": 9.00,
            "latitude": 38.8977,
            "longitude": -77.0365,
            "amenities": [wifi, ac]
        },
        {
            "id": "bcdef123-4567-890a-bcde-f12345678901",
            "title": "Eiffel Tower Apartment",
            "description": "Luxury apartment with views of the Eiffel Tower",
            "price": 49.00,
            "latitude": 48.8584,
            "longitude": 2.2945,
            "amenities": [wifi, ac]
        },
        {
            "id": "cdef1234-5678-90ab-cdef-123456789012",
            "title": "Beach House",
            "description": "Beautiful beach house on the coast",
            "price": 100.00,
            "latitude": 34.0522,
            "longitude": -118.2437,
            "amenities": [wifi, pool]
        },
        {
            "id": "def12345-6789-0abc-def1-234567890123",
            "title": "Mountain Cabin",
            "description": "Cozy cabin in the mountains",
            "price": 150.00,
            "latitude": 39.5501,
            "longitude": -105.7821,
            "amenities": [wifi]
        },
        {
            "id": "ef123456-7890-abcd-ef12-345678901234",
            "title": "Downtown Loft",
            "description": "Modern loft in the heart of the city",
            "price": 180.00,
            "latitude": 40.7128,
            "longitude": -74.006,
            "amenities": [wifi, ac]
        }
    ]
    
    for place_data in places_data:
        # Vérifier si le lieu existe déjà
        place = Place.query.get(place_data["id"])
        
        if not place:
            # Créer le lieu
            place = Place(
                id=place_data["id"],
                _title=place_data["title"],
                _description=place_data["description"],
                _price=place_data["price"],
                _latitude=place_data["latitude"],
                _longitude=place_data["longitude"],
                _owner_id=admin.id
            )
            
            db.session.add(place)
            db.session.flush()  # Pour obtenir l'ID avant de faire des relations
            
            # Ajouter les aménités (selon votre structure de relation)
            # Si vous avez une méthode d'ajout d'aménités dans votre modèle
            if hasattr(place, "add_amenity"):
                for amenity in place_data["amenities"]:
                    place.add_amenity(amenity)
            # Sinon, si vous utilisez une relation directe
            elif hasattr(place, "amenities"):
                for amenity in place_data["amenities"]:
                    place.amenities.append(amenity)
            # Autrement, vous pourriez avoir besoin d'insérer dans une table de jointure
            
            print(f"Lieu créé: {place_data['title']}")
        else:
            print(f"Lieu existant: {place._title}")
    
    db.session.commit()
    
    # 4. Ajouter quelques avis pour chaque lieu
    for place_id in [place_data["id"] for place_data in places_data]:
        # Vérifier si le lieu a déjà des avis
        existing_reviews = Review.query.filter_by(_place_id=place_id).count()
        
        if existing_reviews == 0:
            # Ajouter un avis pour ce lieu
            review = Review(
                id=str(uuid.uuid4()),
                _text=f"Excellent séjour ! Je recommande vivement.",
                _rating=5,
                _user_id=admin.id,
                _place_id=place_id
            )
            db.session.add(review)
            print(f"Avis ajouté pour le lieu: {place_id}")
    
    db.session.commit()
    print("Tous les lieux ont été créés avec succès!")