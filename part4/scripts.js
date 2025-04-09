document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('login-form');

    if (loginForm) {
        loginForm.addEventListener('submit', async (event) => {
            event.preventDefault();
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            await loginUser(email, password);
        });
    }

    checkAuthentication();

    document.getElementById('price-filter').addEventListener('change', (event) => {
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
});

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

function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
}

function checkAuthentication() {
    const token = getCookie('token');
    const loginLink = document.getElementById('login-link');

    if (!token) {
        loginLink.style.display = 'block';
    } else {
        loginLink.style.display = 'none';
        fetchPlaces(token);
    }
}

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

function displayPlaces(places) {
    const placesList = document.getElementById('places-list');
    placesList.innerHTML = ''; // vide la liste actuelle

    places.forEach(place => {
        const placeDiv = document.createElement('div');
        placeDiv.classList.add('place-item');
        placeDiv.setAttribute('data-price', place.price);

        placeDiv.innerHTML = `
            <h2>${place.title}</h2>
            <p>Prix : ${place.price}€/nuit</p>
            <p>${place.description}</p>
            <p>Lieu : ${place.longitude},${place.latitude}</p>
            <a href="place.html?id=${place.id}" class="deteailbouton" >Voir les détail</a>
        `;

        placesList.appendChild(placeDiv);
    });
}

function getPlaceIdFromURL() {
    const params = new URLSearchParams(window.location.search);
    return params.get('id');
}

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

function checkAuthenticationAndFetchPlace() {
    const token = getCookie('token');
    const placeId = getPlaceIdFromURL();
    const reviewSection = document.getElementById('add-review');

    if (token) {
        reviewSection.style.display = 'block';
    }

    fetchPlaceDetails(token, placeId);
}

async function fetchPlaceDetails(token, placeId) {
    try {
        const response = await fetch(`https://your-api-url/places/${placeId}`, {
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

function displayPlaceDetails(place) {
    const container = document.getElementById('place-details');
    container.innerHTML = '';

    const html = `
        <div class="place-info">
            <h2>${place.name}</h2>
            <p>Hôte : ${place.host}</p>
            <p>Description : ${place.description}</p>
            <p>Prix : ${place.price}€ / nuit</p>
            <p>Équipements : ${place.amenities.join(', ')}</p>
        </div>
        <div class="reviews">
            ${place.reviews.map(review => `
                <div class="review-card">
                    <p>"${review.comment}"</p>
                    <small>Par ${review.user} - Note : ${review.rating}⭐</small>
                </div>
            `).join('')}
        </div>
    `;

    container.innerHTML = html;
}

document.addEventListener('DOMContentLoaded', checkAuthenticationAndFetchPlace);
