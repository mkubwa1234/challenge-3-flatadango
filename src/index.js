document.addEventListener("DOMContentLoaded", function() {
    
    // Function to fetch movie details
    function fetchMovieDetails(id) {
        return fetch(`/films/${id}`)
            .then(response => response.json())
            .catch(error => console.error('Error fetching movie details:', error));
    }

    // Function to update movie details on the page
    function updateMovieDetails(movie) {
        const movieDetails = document.getElementById('movie-details');
        movieDetails.innerHTML = `
            <img src="${movie.poster}" alt="${movie.title} Poster">
            <h2>${movie.title}</h2>
            <p>${movie.description}</p>
            <p>Showtime: ${movie.showtime}</p>
            <p>Runtime: ${movie.runtime} minutes</p>
            <p>Available Tickets: ${movie.capacity - movie.tickets_sold}</p>
            <button id="buy-ticket" data-id="${movie.id}">Buy Ticket</button>
        `;
        // Attach event listener for Buy Ticket button
        document.getElementById('buy-ticket').addEventListener('click', buyTicket);
    }

    // Function to handle buying a ticket
    function buyTicket(event) {
        const movieId = event.target.dataset.id;
        fetchMovieDetails(movieId)
            .then(movie => {
                if (movie.tickets_sold < movie.capacity) {
                    // Update tickets_sold on the server
                    const newTicketsSold = movie.tickets_sold + 1;
                    fetch(`/films/${movieId}`, {
                        method: 'PATCH',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            tickets_sold: newTicketsSold
                        })
                    })
                    .then(() => {
                        // Update movie details on the page
                        movie.tickets_sold = newTicketsSold;
                        updateMovieDetails(movie);
                    })
                    .catch(error => console.error('Error buying ticket:', error));
                } else {
                    // Movie is sold out
                    event.target.textContent = 'Sold Out';
                    event.target.disabled = true;
                    // Add sold-out class to the film item in the menu
                    const filmItem = document.querySelector(`#films li[data-id="${movieId}"]`);
                    filmItem.classList.add('sold-out');
                }
            })
            .catch(error => console.error('Error fetching movie details:', error));
    }

    // Function to fetch all movies
    function fetchAllMovies() {
        return fetch('/films')
            .then(response => response.json())
            .catch(error => console.error('Error fetching movies:', error));
    }

    // Function to populate movies in the menu
    function populateMovies(movies) {
        const filmsList = document.getElementById('films');
        filmsList.innerHTML = '';
        movies.forEach(movie => {
            const listItem = document.createElement('li');
            listItem.textContent = movie.title;
            listItem.dataset.id = movie.id;
            listItem.classList.add('film-item');
            // Add delete button next to each film
            const deleteButton = document.createElement('button');
            deleteButton.textContent = 'Delete';
            deleteButton.dataset.id = movie.id;
            deleteButton.addEventListener('click', deleteFilm);
            listItem.appendChild(deleteButton);
            filmsList.appendChild(listItem);
        });
    }

    // Function to handle deleting a film
    function deleteFilm(event) {
        const movieId = event.target.dataset.id;
        fetch(`/films/${movieId}`, {
            method: 'DELETE'
        })
        .then(() => {
            // Remove film from the menu
            const filmItem = document.querySelector(`#films li[data-id="${movieId}"]`);
            filmItem.remove();
        })
        .catch(error => console.error('Error deleting film:', error));
    }

    // Initial setup when the page loads
    fetchMovieDetails(1).then(updateMovieDetails); // Display details of the first movie
    fetchAllMovies().then(populateMovies); // Display all movies in the menu
});
