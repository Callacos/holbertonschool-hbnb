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

    // Vérifier si l'élément price-filter existe avant d'ajouter un écouteur d'événement
    const priceFilter = document.getElementById('price-filter');
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
    
    // Vérifier si nous sommes sur la page de détails d'un lieu
    const placeDetails = document.getElementById('place-details');
    if (placeDetails) {
        checkAuthenticationAndFetchPlace();
    }
});

