// Un seul écouteur DOMContentLoaded principal pour toutes les pages
document.addEventListener('DOMContentLoaded', () => {
    // Déterminer sur quelle page nous sommes
    const loginForm = document.getElementById('login-form');
    const priceFilter = document.getElementById('price-filter');
    const placeDetails = document.getElementById('place-details');
    const reviewForm = document.getElementById('review-form');

    // Configuration pour la page de login
    if (loginForm) {
        loginForm.addEventListener('submit', async (event) => {
            event.preventDefault();
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            await loginUser(email, password);
        });
    }

    // Vérification d'authentification commune
    checkAuthentication();

    // Configuration du filtre de prix sur la page d'index
    if (priceFilter) {
        priceFilter.addEventListener('change', (event) => {
            const selectedPrice = event.target.value;
            const places = document.querySelectorAll('.place-item');

            places.forEach(place => {
                const price = parseFloat(place.getAttribute('data-price'));
                if (selectedPrice === 'All' || price <= parseFloat(selectedPrice)) {
                    place.style.display = 'block';
                } else {
                    place.style.display = 'none';
                }
            });
        });
    }
    
    // Configuration pour la page de détails d'un lieu
    if (placeDetails) {
        const token = getCookie('token');
        const placeId = getPlaceIdFromURL();
        
        if (placeId) {
            fetchPlaceDetails(token, placeId);
        }
    }
    
    // Configuration pour la page d'ajout de commentaire
    if (reviewForm) {
        setupReviewForm();
    }
});

// Fonction pour se connecter
async function loginUser(email, password) {
    const response = await fetch('http://127.0.0.1:5000/api/v1/auth/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({ email, password })
    });

    if (response.ok) {
        const data = await response.json();
        document.cookie = `token=${data.access_token}; path=/`;
        window.location.href = 'index.html';
    } else {
        alert('Login failed: ' + response.statusText);
    }
}

// Fonction pour récupérer un cookie par son nom
function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
    return null;
}

// Fonction pour vérifier l'authentification de l'utilisateur
function checkAuthentication() {
    const token = getCookie('token');
    const loginLink = document.getElementById('login-link');
    const placesList = document.getElementById('places-list');

    if (loginLink) {
        if (!token) {
            loginLink.style.display = 'block';
        } else {
            loginLink.style.display = 'none';
            
            // Charger les lieux seulement si nous sommes sur la page index
            if (placesList) {
                fetchPlaces(token);
            }
        }
    }
}

// Fonction pour récupérer les lieux depuis l'API
async function fetchPlaces(token) {
    try {
        const response = await fetch('http://127.0.0.1:5000/api/v1/places', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (response.ok) {
            const places = await response.json();
            displayPlaces(places);
        } else {
            console.error('Erreur lors du chargement des lieux');
        }
    } catch (error) {
        console.error('Erreur réseau :', error);
    }
}

// Fonction pour afficher la liste des lieux
function displayPlaces(places) {
    const placesList = document.getElementById('places-list');
    
    if (!placesList) return;
    
    placesList.innerHTML = ''; // vide la liste actuelle

    places.forEach(place => {
        const placeDiv = document.createElement('div');
        placeDiv.classList.add('place-item');
        placeDiv.setAttribute('data-price', place.price || 0);

        placeDiv.innerHTML = `
            <h2>${place.title || place.name || ''}</h2>
            <p>Prix : ${place.price || 0}€/nuit</p>
            <p>${place.description || ''}</p>
            <p>Lieu : ${place.longitude || 0},${place.latitude || 0}</p>
            <a href="place.html?id=${place.id}" class="deteailbouton">Voir les détails</a>
        `;

        placesList.appendChild(placeDiv);
    });
}

// Fonction pour extraire l'ID du lieu depuis l'URL
function getPlaceIdFromURL() {
    const params = new URLSearchParams(window.location.search);
    return params.get('id');
}

// Fonction pour récupérer les détails d'un lieu depuis l'API
async function fetchPlaceDetails(token, placeId) {
    if (!placeId) {
        console.error('ID du lieu manquant dans l\'URL');
        return;
    }
    
    try {
        const response = await fetch(`http://127.0.0.1:5000/api/v1/places/${placeId}`, {
            method: 'GET',
            headers: token ? {
                'Authorization': `Bearer ${token}`
            } : {}
        });

        if (response.ok) {
            const place = await response.json();
            displayPlaceDetails(place);
        } else {
            alert("Lieu introuvable");
        }
    } catch (error) {
        console.error('Erreur API :', error);
    }
}

// Fonction pour afficher les détails d'un lieu
function displayPlaceDetails(place) {
    const container = document.getElementById('place-details');
    if (!container) return;
    
    container.innerHTML = '';

    // Gestion des propriétés potentiellement manquantes
    const amenities = place.amenities ? 
        (Array.isArray(place.amenities) ? place.amenities.join(', ') : place.amenities) : 
        '';
    
    const reviews = place.reviews ? 
        (Array.isArray(place.reviews) ? 
            place.reviews.map(review => `
                <div class="review-card">
                    <p>"${review.comment || ''}"</p>
                    <small>Par ${review.user || ''} - Note : ${review.rating || 0}⭐</small>
                </div>
            `).join('') : 
            '') : 
        '';

    const html = `
        <div class="place-info">
            <h2>${place.name || place.title || ''}</h2>
            <p>Hôte : ${place.host || ''}</p>
            <p>Description : ${place.description || ''}</p>
            <p>Prix : ${place.price || 0}€ / nuit</p>
            <p>Équipements : ${amenities}</p>
            <a href="add_review.html?id=${place.id}" class="btn btn-primary">Ajouter une évaluation</a>
        </div>
        <div class="reviews">
            ${reviews}
        </div>
    `;

    container.innerHTML = html;
}

// Nouvelle fonction pour configurer le formulaire d'ajout de commentaire
function setupReviewForm() {
    const token = getCookie('token');
    const placeId = getPlaceIdFromURL();
    
    // Vérifier si l'utilisateur est authentifié
    if (!token) {
        // Rediriger vers la page d'index si non authentifié
        window.location.href = 'index.html';
        return;
    }
    
    // Ajouter le nom du lieu en cours de révision si possible
    fetchPlaceName(token, placeId);
    
    // Configurer le formulaire de commentaire
    const reviewForm = document.getElementById('review-form');
    if (reviewForm) {
        reviewForm.addEventListener('submit', async (event) => {
            event.preventDefault();
            
            // Récupérer les données du formulaire (avec les IDs de votre HTML)
            const reviewText = document.getElementById('review').value;
            const rating = document.getElementById('rating').value;
            
            // Vérifier que le commentaire n'est pas vide
            if (!reviewText.trim()) {
                alert('Veuillez entrer un commentaire');
                return;
            }
            
            // Soumettre le commentaire
            await submitReview(token, placeId, reviewText, rating);
        });
    }
}

// Fonction pour récupérer et afficher le nom du lieu dans le formulaire
async function fetchPlaceName(token, placeId) {
    if (!placeId) {
        alert('ID du lieu manquant. Veuillez retourner à la page des détails du lieu.');
        return;
    }
    
    try {
        const response = await fetch(`http://127.0.0.1:5000/api/v1/places/${placeId}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (response.ok) {
            const place = await response.json();
            // Ajouter le nom du lieu à l'en-tête du formulaire
            const formHeading = document.querySelector('#review-form h2');
            if (formHeading) {
                formHeading.textContent = `Ajouter une évaluation pour ${place.name || place.title || 'ce lieu'}`;
            }
        }
    } catch (error) {
        console.error('Erreur lors de la récupération des détails du lieu:', error);
    }
}

// Nouvelle fonction pour soumettre un commentaire
async function submitReview(token, placeId, reviewText, rating) {
    try {
        const response = await fetch(`http://127.0.0.1:5000/api/v1/places/${placeId}/reviews`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                comment: reviewText,
                rating: parseInt(rating) || 5
            })
        });

        if (response.ok) {
            // Afficher un message de succès
            alert('Commentaire soumis avec succès !');
            
            // Effacer le formulaire
            document.getElementById('review').value = '';
            document.getElementById('rating').value = '5'; // Réinitialiser à la valeur par défaut
            
            // Rediriger vers la page de détails du lieu
            window.location.href = `place.html?id=${placeId}`;
        } else {
            // Gérer les erreurs de l'API
            try {
                const errorData = await response.json();
                alert(`Échec de la soumission du commentaire: ${errorData.message || response.statusText}`);
            } catch (parseError) {
                alert(`Échec de la soumission du commentaire: ${response.statusText}`);
            }
        }
    } catch (error) {
        console.error('Erreur lors de la soumission du commentaire:', error);
        alert('Une erreur est survenue lors de la soumission du commentaire');
    }
}