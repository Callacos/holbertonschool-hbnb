# HBNB - Partie 4 : Client Web Simple

## Description

Cette partie du projet HBNB vise à développer une interface web interactive en utilisant HTML5, CSS et JavaScript ES6. L'objectif est de permettre aux utilisateurs d'interagir avec les services back-end développés précédemment, en offrant une expérience utilisateur fluide et dynamique.

## Objectifs

-   Créer une interface utilisateur conviviale suivant les spécifications de design fournies.
    
-   Implémenter des fonctionnalités côté client pour interagir avec l'API back-end.
    
-   Assurer une gestion sécurisée et efficace des données via JavaScript.
    
-   Appliquer des pratiques modernes de développement web pour créer une application dynamique.
    

## Structure du Projet

Le répertoire `part4` contient les fichiers suivants :

-   `index.html` : Page principale affichant la liste des lieux.
    
-   `login.html` : Page de connexion pour les utilisateurs.
    
-   `place.html` : Page détaillée d'un lieu spécifique.
    
-   `add_review.html` : Formulaire pour ajouter un avis sur un lieu.
    
-   `scripts.js` : Fichier JavaScript contenant la logique côté client.
    
-   `styles.css` : Fichier CSS pour le style de l'application.
    
-   `images/` : Répertoire contenant les images utilisées dans l'application.
    

## Pages  Réaliser

### 1. Formulaire de Connexion (`login.html`)

-   Formulaire avec des champs pour l'email et le mot de passe.
    
-   Envoi des données au back-end pour authentification.
    
-   Stockage du token JWT dans un cookie pour la gestion de session.
    

### 2. Liste des Lieux (`index.html`)

-   Affichage d'une liste de lieux sous forme de cartes (`place-card`).
    
-   Chaque carte affiche le nom, le prix par nuit et un bouton "Voir les détails" (`details-button`).
    
-   Filtrage possible des lieux par prix.
    

### 3. Détails d'un Lieu (`place.html`)

-   Affichage des informations détaillées d'un lieu : hôte, prix, description, commodités.
    
-   Liste des avis existants, chaque avis affiché sous forme de carte (`review-card`).
    
-   Bouton pour accéder au formulaire d'ajout d'avis si l'utilisateur est authentifié.
    

### 4. Formulaire d'Avis (`add_review.html`)

-   Formulaire pour ajouter un avis sur un lieu spécifique.
    
-   Accessible uniquement aux utilisateurs authentifiés.
    

## Spécifications de Style

-   **Structure Requise :**
    
    -   **En-tête :**
        
        -   Logo de l'application (`logo.png`) avec la classe `logo`.
            
        -   Bouton ou lien de connexion avec la classe `login-button`.
            
    -   **Pied de page :**
        
        -   Texte indiquant que tous les droits sont réservés.
            
    -   **Barre de navigation :**
        
        -   Liens de navigation pertinents (par exemple, `index.html` et `login.html`).
            
-   **Données à Afficher :**
    
    -   **Index (`index.html`) :**
        
        -   Liste des lieux sous forme de cartes (`place-card`).
            
        -   Chaque carte inclut le nom, le prix par nuit et un bouton "Voir les détails" (`details-button`).
            
    -   **Détails d'un Lieu (`place.html`) :**
        
        -   Informations détaillées sur le lieu, y compris l'hôte, le prix, la description et les commodités, utilisant les classes `place-details` et `place-info`.
            
        -   Liste des avis existants, chaque avis affiché sous forme de carte (`review-card`) avec le commentaire, le nom de l'utilisateur et la note.
            
        -   Bouton pour accéder au formulaire d'ajout d'avis si l'utilisateur est connecté.
            
        -   Remplacer le bouton précédent par un formulaire pour ajouter un nouvel avis si l'utilisateur est connecté, utilisant les classes `add-review` et `form`
        

## Gestion des Sessions

-   Utilisation de cookies pour stocker le token JWT après une connexion réussie.
    
-   Vérification de l'authentification de l'utilisateur avant d'accéder à certaines pages ou fonctionnalités.
    

## Communication avec l'API

-   Utilisation de l'API Fetch pour interagir avec le back-end.
    
-   Gestion des erreurs et des exceptions lors des appels API.
    
-   Implémentation de CORS côté serveur pour permettre les requêtes cross-origin.
    

## Validation

-   Toutes les pages doivent être valides selon le [Validateur W3C](https://validator.w3.org/).
    

## Ressources

-   [Documentation HTML5](https://developer.mozilla.org/fr/docs/Web/Guide/HTML/HTML5)
    
-   [Documentation CSS3](https://developer.mozilla.org/fr/docs/Web/CSS)
    
-   [Fonctionnalités de JavaScript ES6](https://developer.mozilla.org/fr/docs/Web/JavaScript)
    
-   [API Fetch](https://developer.mozilla.org/fr/docs/Web/API/Fetch_API)
    
-   [Bases du Design Web Responsive](https://developer.mozilla.org/fr/docs/Learn/CSS/CSS_layout/Responsive_Design)
    
-   [Gestion des Cookies en JavaScript](https://developer.mozilla.org/fr/docs/Web/API/Document/cookie)
    
-   [Validation des Formulaires côté Client](https://developer.mozilla.org/fr/docs/Learn/Forms/Form_validation)
    


## By   
### CALLACOS