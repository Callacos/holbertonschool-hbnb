// Un seul écouteur DOMContentLoaded
document.addEventListener('DOMContentLoaded', () => {
    // Vérifier sur quelle page nous sommes
    const loginForm = document.getElementById('login-form');
    const priceFilter = document.getElementById('price-filter');
    const placeDetailsSection = document.getElementById('place-details');
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

    // Vérification d'authentification commune à toutes les pages
    const token = getCookie('token');
    const loginLink = document.getElementById('login-link');

    if (loginLink) {
        if (!token) {
            loginLink.style.display = 'block';
        } else {
            loginLink.style.display = 'none';
            
            // Charger les lieux seulement si nous sommes sur la page d'accueil
            const placesList = document.getElementById('places-list');
            if (placesList) {
                fetchPlaces(token);
            }
        }
    }

    // Configuration du filtre de prix sur la page d'accueil
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
    if (placeDetailsSection) {
        const placeId = getPlaceIdFromURL();
        
        if (placeId) {
            fetchPlaceDetails(token, placeId);
        } else {
            console.error('ID du lieu manquant dans l\'URL');
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
    const cookieArr = document.cookie.split(';');
    for (let cookie of cookieArr) {
        const [key, value] = cookie.trim().split('=');
        if (key === name) {
            return value;
        }
    }
    return null;
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
            console.error('Erreur lors du chargement des lieux:', response.status, response.statusText);
        }
    } catch (error) {
        console.error('Erreur réseau :', error);
    }
}

// Fonction pour afficher la liste des lieux
function displayPlaces(places) {
    const placesList = document.getElementById('places-list');
    
    if (!placesList) return;
    
    placesList.innerHTML = '';

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
        // Afficher des informations de débogage
        console.log(`Fetching place details for ID: ${placeId}`);
        console.log(`Using token: ${token ? 'Yes (token exists)' : 'No (token missing)'}`);

        const response = await fetch(`http://127.0.0.1:5000/api/v1/places/${placeId}`, {
            method: 'GET',
            headers: token ? {
                'Authorization': `Bearer ${token}`
            } : {}
        });

        console.log(`API response status: ${response.status}`);

        if (response.ok) {
            const place = await response.json();
            displayPlaceDetails(place);
        } else {
            console.error(`Erreur lors de la récupération des détails: ${response.status}, ${response.statusText}`);
            
            // Gérer le cas 404 spécifiquement
            if (response.status === 404) {
                const container = document.getElementById('place-details');
                if (container) {
                    container.innerHTML = '<div class="error-message">Désolé, ce lieu n\'existe pas ou a été supprimé.</div>';
                }
            } else {
                alert("Erreur lors du chargement des détails du lieu");
            }
        }
    } catch (error) {
        console.error('Erreur API :', error);
    }
}

// Fonction pour afficher les détails d'un lieu
function displayPlaceDetails(place) {
    const container = document.getElementById('place-details');
    if (!container) return;
    
    console.log('Displaying place details:', place);

    // Gérer les propriétés potentiellement manquantes
    const amenities = place.amenities ? 
        (Array.isArray(place.amenities) ? place.amenities.join(', ') : place.amenities) : 
        'Aucun';
    
    const reviews = place.reviews ? 
        (Array.isArray(place.reviews) && place.reviews.length > 0 ? 
            place.reviews.map(review => `
                <div class="review-card">
                    <p>"${review.comment || ''}"</p>
                    <small>Par ${review.user || 'un utilisateur'} - Note : ${review.rating || 0}⭐</small>
                </div>
            `).join('') : 
            '<p>Aucun avis pour le moment</p>') : 
        '<p>Aucun avis pour le moment</p>';

    const html = `
        <div class="place-info">
            <h2>${place.name || place.title || 'Sans titre'}</h2>
            <p>Hôte : ${place.host || 'Non spécifié'}</p>
            <p>Description : ${place.description || 'Aucune description'}</p>
            <p>Prix : ${place.price || 0}€ / nuit</p>
            <p>Équipements : ${amenities}</p>
        </div>
        <h3>Avis</h3>
        <div class="reviews">
            ${reviews}
        </div>
    `;

    container.innerHTML = html;
    
    // Mettre à jour le lien d'ajout d'avis
    const addReviewLink = document.querySelector('#add-review a');
    if (addReviewLink && place.id) {
        addReviewLink.href = `add_review.html?id=${place.id}`;
    }
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
    
    // S'il n'y a pas d'ID de lieu, afficher un message d'erreur
    if (!placeId) {
        alert('ID du lieu manquant. Impossible d\'ajouter un avis.');
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
        } else {
            console.error('Erreur lors de la récupération des détails du lieu:', response.status);
        }
    } catch (error) {
        console.error('Erreur lors de la récupération des détails du lieu:', error);
    }
}

// Fonction pour soumettre un commentaire
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