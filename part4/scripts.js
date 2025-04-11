// Un seul écouteur DOMContentLoaded
function setupReviewForm() {
    const form = document.getElementById('review-form');
    if (!form) console.log("yo");

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const textarea = form.querySelector('textarea');
        const reviewText = textarea.value;
        const rating = form.querySelector('select').value;

        const urlParams = new URLSearchParams(window.location.search);
        console.log(urlParams.id)
        const placeId = urlParams.get('id'); // Extrait la valeur de 'id'
        console.log(placeId);

        try {
        const response = await submitReview(getCookie('token'), placeId, reviewText, rating);
        console.log("yayaya")

        if (response.ok) {
            alert("Avis ajouté avec succès !");
            textarea.value = "";
        } else {
            alert("Erreur lors de l'ajout de l'avis.");
        }
    } catch (error) {
            console.error('Error submitting review:', error);
            alert('Erreur lors de l\'ajout de l\'avis.');
        }
    });
}

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
        console.log("yoyoyo")
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
            
            // Properly await the reviews fetch and pass the result to displayReviews
            const reviews = await fetchReviews(token);
            displayReviews(reviews);
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
async function displayPlaceDetails(place) {
    const container = document.getElementById('place-details');


    if (!container) return;

    // Gérer les propriétés potentiellement manquantes
    const amenities = place.amenities ? 
        (Array.isArray(place.amenities) ? place.amenities.join(', ') : place.amenities) : 
        'Aucun';


    const reviews = await fetchReviews(getCookie('token'));

    const html = `
        <div class="place-info">
            <h2>${place.name || place.title || 'Sans titre'}</h2>
            <p>Hôte : ${place.host || 'Non spécifié'}</p>
            <p>Description : ${place.description || 'Aucune description'}</p>
            <p>Prix : ${place.price || 0}€ / nuit</p>
            <p>Équipements : ${amenities}</p>
        </div>
        <h3>Avis</h3>
        <div id="reviews">
            ${reviews}
        </div>
    `;

    container.innerHTML = html;

    const reviewsContainer = document.getElementById('reviews');

    const reviewsHTML = reviews.map(review => `
                <div class="review-card">
                    <p>"${review.text || ''}"</p>
                    <small>Par ${review.user || 'un utilisateur'} - Note : ${review.rating || 0}⭐</small>
                </div>
            `);
    reviewsContainer.innerHTML = reviewsHTML.join('');

    


    
    // Mettre à jour le lien d'ajout d'avis
    const addReviewLink = document.querySelector('#add-review a');
    if (addReviewLink && place.id) {
        addReviewLink.href = `add_review.html?id=${place.id}`;
    }
}

// Récupérer l'ID depuis l'URL
const urlParams = new URLSearchParams(window.location.search);
const placeId = urlParams.get('id'); // Extrait la valeur de 'id'

function getPlaceIdFromURL() {
    const params = new URLSearchParams(window.location.search);
    return params.get('id');  // Récupère l'ID du lieu à partir de l'URL
}

function getCookie(name) {
    const cookieArr = document.cookie.split(';');
    for (let cookie of cookieArr) {
        const [key, value] = cookie.trim().split('=');
        if (key === name) {
            return decodeURIComponent(value);
        }
    }
    return null;
}


async function fetchReviews(token) {
    const placeId = getPlaceIdFromURL();
    if (!placeId) {
        console.error('No place ID specified');
        return [];
    }
    
    try {
        const headers = {
            'Content-Type': 'application/json'
        };
        
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }
        
        // Use the correct endpoint to get reviews for a specific place
        const response = await fetch(`http://127.0.0.1:5000/api/v1/places/${placeId}/reviews`, {
            method: 'GET',
            headers: headers,
        });
        
        
        if (response.ok) {
            const reviews = await response.json();
            console.log('Fetched reviews:', reviews);
            return reviews; // Return the reviews data
        } else {
            console.error('Failed to fetch reviews:', response.statusText);
            return [];
        }
    } catch (error) {
        console.error('Error fetching reviews:', error.message);
        return [];
    }
}

function displayReviews(reviews) {
    const reviewsSection = document.getElementById('reviews');
    if (!reviewsSection) return;
    reviewsSection.innerHTML = '';
    
    const header = document.createElement('h2');
    header.textContent = 'REVIEWS';
    reviewsSection.appendChild(header);
    
    const reviewsContainer = document.createElement('div');
    reviewsContainer.className = 'reviews-container';
    reviewsSection.appendChild(reviewsContainer);
    
    if (Array.isArray(reviews) && reviews.length > 0) {
        reviews.forEach(review => {
            const reviewCard = document.createElement('div');
            reviewCard.className = 'review-card';
            
            reviewCard.innerHTML = `
                <div class="review-header">
                    <img src="images/ane.avif" alt="Reviewer" class="reviewer-img">
                    <div class="reviewer-info">
                        <h3 class="reviewer-name">User ID: ${review.user_id}</h3>
                        <p class="review-date">${review.created_at || 'No date'}</p>
                    </div>
                </div>
                <div class="review-content">
                    <p>${review.text}</p>
                    <p class="review-rating">Rating: ${review.rating} / 5</p>
                </div>
            `;
            reviewsContainer.appendChild(reviewCard);
        });
    } else {
        const noReviews = document.createElement('p');
        noReviews.textContent = 'No reviews yet for this place.';
        reviewsContainer.appendChild(noReviews);
    }
}

function handlePriceFilter(event) {
    const maxPrice = event.target.value;
    const placesList = document.getElementById('places-list');
    
    if (!placesList || !placesList.dataset.places) return;
    
    const places = JSON.parse(placesList.dataset.places);

    let cardsContainer = placesList.querySelector('.place_cards');
    if (!cardsContainer) {
        cardsContainer = document.createElement('div');
        cardsContainer.className = 'place_cards';
        placesList.appendChild(cardsContainer);
    }
    
 
    cardsContainer.innerHTML = '';
    

    places.forEach(place => {
        if (maxPrice === 'all' || parseInt(place.price || 0) <= parseInt(maxPrice)) {
            const placeElement = createPlaceElement(place);
            cardsContainer.appendChild(placeElement);
        }
    });
}


async function submitReview(token, placeId, text, rating) {
    try {
        const headers = {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        };
        

        const tokenPayload = parseJwt(token);
        const userId = tokenPayload.sub || tokenPayload.id;
        
        if (!userId) {
            throw new Error('Could not determine user ID from token');
        }
        
        const response = await fetch(`http://localhost:5000/api/v1/reviews/`, {
            method: 'POST',
            headers: headers,
            body: JSON.stringify({
                text: text,
                rating: parseInt(rating),
                user_id: userId.id,
                place_id: placeId
            }), 
        });
        
        if (response.ok) {
 
            document.getElementById('review').value = '';
            document.getElementById('rating').value = '5';
            

            await fetchReviews(token);
            
 
            alert('Review submitted successfully!');
        } else {
            const errorData = await response.json();
            //throw new Error(errorData.error || 'Failed to submit review: ' + response.statusText);
            throw new Error(response.message)
        }
    } catch (error) {
        throw new Error('Error submitting review: ' + error.message);
    }
}

function parseJwt(token) {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));

    return JSON.parse(jsonPayload);
}


