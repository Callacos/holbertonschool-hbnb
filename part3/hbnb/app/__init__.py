from flask import Flask, request
from flask_restx import Api
from flask_bcrypt import Bcrypt
from flask_jwt_extended import JWTManager
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from app.extensions import db, bcrypt, jwt

jwt = JWTManager()
bcrypt = Bcrypt()
from app.api.v1.users import api as users_ns
from app.api.v1.amenities import api as amenities_ns
from app.api.v1.places import api as place_ns
from app.api.v1.reviews import api as reviews_ns
from app.api.v1.auth import api as auth_ns
from app.api.v1.protected import api as protected_ns
     
def create_app(config_class="config.DevelopmentConfig"):
    # Créer l'objet Flask d'abord
    app = Flask(__name__)

    CORS(app,
     resources={r"/api/*": {"origins": "http://127.0.0.1:5500"}},
     supports_credentials=True)
    
    @app.route('/api/v1/auth/login', methods=['OPTIONS'])
    def handle_login_options():
        return '', 200

    @app.route('/api/v1/places/<place_id>/reviews', methods=['OPTIONS'])
    def handle_place_options():
        return '', 200
    
    @app.route('/api/v1/reviews', methods=['OPTIONS'])
    def handle_add_review():
        return '', 200
    # Puis configurer l'application
    app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///hbnb.db'
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    app.config.from_object(config_class)
    
    # Créer l'API
    api = Api(app, version='1.0', title='HBnB API', description='HBnB Application API',
              security='Bearer Auth', authorizations={
                  'Bearer Auth': {
                      'type': 'apiKey',
                      'in': 'header',
                      'name': 'Authorization',
                      'description': "Jwt authorization header"
                  }
              })
              
    # Initialiser les extensions
    db.init_app(app)
    bcrypt.init_app(app)
    jwt.init_app(app)
    
    # Register the namespaces
    api.add_namespace(users_ns, path='/api/v1/users')
    api.add_namespace(amenities_ns, path='/api/v1/amenities')
    api.add_namespace(place_ns, path='/api/v1/places')
    api.add_namespace(reviews_ns, path='/api/v1/reviews')
    api.add_namespace(auth_ns, path='/api/v1/auth')
    api.add_namespace(protected_ns, path='/api/v1/protected')

    # Créer les tables
    with app.app_context():
        db.create_all()

    # Ajouter un gestionnaire spécial pour les requêtes OPTIONS
    @app.route('/api/v1/<path:path>', methods=['OPTIONS'])
    def handle_options(path):
        # Répondre directement aux requêtes OPTIONS avec un statut 200
        response = app.make_default_options_response()
        response.headers.add('Access-Control-Allow-Origin', '*')
        response.headers.add('Access-Control-Allow-Headers', 'Content-Type,Authorization,Accept')
        response.headers.add('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS')
        response.headers.add('Access-Control-Allow-Credentials', 'true')
        return response
    
    
     # Middleware pour intercepter et répondre aux requêtes OPTIONS
    @app.before_request
    def handle_preflight():
        if request.method == "OPTIONS":
            # Retourner une réponse vide avec les en-têtes CORS appropriés
            response = app.make_default_options_response()
            response.headers.add('Access-Control-Allow-Origin', '*')
            response.headers.add('Access-Control-Allow-Headers', 'Content-Type,Authorization,Accept')
            response.headers.add('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS')
            response.headers.add('Access-Control-Allow-Credentials', 'true')
            return response
        
    return app