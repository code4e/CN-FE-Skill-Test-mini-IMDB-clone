
(function () {

    //look for favorites in the local storage, if any
    let localStorageItem = localStorage.getItem('favorites');
    let favoritesArr = (localStorageItem ? JSON.parse(localStorageItem) : []);
    //clear input search box when page gets loaded
    document.getElementById('search-box').value = '';

    //when the page first loads, reset moviePageItem from localStorage
    localStorage.setItem("moviePageItemID", "");


    let popover = document.querySelector('.wrapper details');
    let favoriteMoviesContainer = document.getElementById("favorites-movie-container");


    let API_KEY = '119d0051';
    let BASE_URI = 'http://www.omdbapi.com/';


    //fetch favorites from the local storage and append it to DOM
    (function () {
        favoritesArr.forEach(movie => {
            appendFavoriteTODOM(movie);
        });
    })();



    let fetchMovies = async (searchTerm) => {
        let URI = `${BASE_URI}?apiKey=${API_KEY}&s=${searchTerm}&page=1`;
        let response = fetch(URI);
        return (await response).text();
    }

    let appendSearchResultsToDOMSuggestions = function (movies) {
        let moviesArray = movies.Search;
        // console.log(moviesArray);

        //only iterate if the search results does have movies, (as the search results may also return undefined)
        if (Array.isArray(moviesArray)) {

            let moviesListUL = convertStringToHTML(`<ul id="popover-list" class="popover-component"></ul>`);

            //show only upto first 5 suggestions
            let len = moviesArray.length > 5 ? 5 : moviesArray.length;

            for (let i = 0; i < len; i++) {

                let movie = moviesArray[i];
                let movieHTML = convertStringToHTML(`<li id="${movie.imdbID}" class="popover-component">
                <span class="popover-component">${movie.Title} (${movie.Year})</span>
                <i class="fa-solid fa-heart popover-component"></i>
                </li>`
                );

                moviesListUL.appendChild(movieHTML);

                //attach "redirect to movie page" event listener to each search result movie
                movieHTML.addEventListener('click', (e) => {
                    if (e.target.tagName != "I") redirectToMoviePage(movie.imdbID);
                });
            }


            if (popover.children.length == 2) {
                popover.children[1].remove();
            };

            popover.appendChild(moviesListUL);

            popover.addEventListener('click', handleFavoritesList);

        } else {
            if (popover.children.length == 2) {
                popover.children[1].remove();
            };

        }

    }

    function redirectToMoviePage(id) {

        localStorage.setItem("moviePageItemID", JSON.stringify(id));
        // now redirect to the movie page and display the movie details of the movie that was clicked
        window.location.href = './movie.html';
    }

    //fetch movie which is to be added to favorites and add it to DOM and favorites array
    async function handleFavoritesList(e) {

        if (e.target.tagName == "I") {
            let movieID = e.target.parentElement.id;
            let URI = `${BASE_URI}?apiKey=${API_KEY}&i=${movieID}`;
            fetch(URI)
                .then(response => response.text())
                .then(data => {

                    let movieJSO = JSON.parse(data);

                    let movie = {
                        imdbID: movieJSO.imdbID,
                        Poster: movieJSO.Poster,
                        Title: movieJSO.Title,
                        imdbRating: movieJSO.imdbRating,
                        Plot: movieJSO.Plot
                    };

                    //check if the movie to be added already exists in favorites
                    if (!favoritesArr.some(m => m.imdbID == movie.imdbID)) {
                        //add favorite movie to RAM
                        favoritesArr.push(movie);

                        //add favorite movie to DOM
                        appendFavoriteTODOM(movie);

                        //save to local storage
                        localStorage.setItem("favorites", JSON.stringify(favoritesArr));
                    }else{
                        alert("This movie already exists in favorites");
                    }


                });
        }
    }

    function appendFavoriteTODOM(movie) {
        let favMovieHTML = convertStringToHTML(`<div class="col favorite-movie" id=${movie.imdbID}>
        <div class="card h-100">
        <img src="${movie.Poster}" class="card-img-top" alt="..." height="350" width="100">
          <div class="card-body">
          <h6 class="card-title movie-head">
          ${movie.Title}
              <div>
                  <i class="fa-brands fa-imdb"></i>
                  <span>${movie.imdbRating}</span>
             </div>
          </h6>
          <p class="card-text">${movie.Plot}</p>
          </div>
          <button type="button" class="btn btn-info remove-from-favorites-btn">Remove from Favorites</button>
        </div>
      </div>`);




        favoriteMoviesContainer.appendChild(favMovieHTML);
        if (popover.children.length == 2) {
            popover.children[1].remove();
        };

    }

    function convertStringToHTML(str) {
        var dom = document.createElement('div');
        dom.innerHTML = str;
        return dom.children[0];
    };




    let getResultsFromAPI = function (e) {


        let inputValue = e.target.value;


        if (inputValue.length <= 2) {
            popover.removeAttribute("open");
            if (popover.children.length == 2) {
                // popover[1].remove();
                popover.children[1].remove();
            };
        }
        //only make the fetch api request, when the search value has more than 3 characters, otherwise, it returns "too many values" as response
        else {
            popover.setAttribute("open", "");

            fetchMovies(inputValue).then(data => appendSearchResultsToDOMSuggestions(JSON.parse(data)));
        }
    }

    //apply throttling to the movie search event listener callback to rate limit the expensive api calling 
    let betterAPICallmaker = throttle(getResultsFromAPI, 100);


    document.getElementById('search-box').addEventListener('keyup', betterAPICallmaker);


    //remove popover from dom when ever the page is clicked somewhere else
    document.addEventListener('click', function (e) {
        if (!e.target.classList.contains("popover-component")) {
            popover.removeAttribute("open");
            if (popover.children.length == 2) {
                // popover[1].remove();
                popover.children[1].remove();
            };
        }
    });

    //throttle fn to rate limit the expensive api calls by delaying the call with a certain limit
    function throttle(fn, delay) {
        let flag = true;
        return function () {
            let event = arguments[0];
            if (flag) {
                fn(event);
                flag = false;
                setTimeout(() => {
                    flag = true;
                }, delay);
            }
        }
    }


    favoriteMoviesContainer.addEventListener('click', function (e) {
        //check if the target is the remove button. If yes, then remove from favorites
        if (e.target.classList.contains("remove-from-favorites-btn")) {
            let favMovieCard = e.target.parentElement.parentElement;
            let favMovieID = favMovieCard.id;
            //remove from RAM
            let idx = favoritesArr.findIndex(movie => movie.imdbID == favMovieID);
            if (idx == -1) return;
            favoritesArr.splice(idx, 1);


            //remove from DOM
            favMovieCard.remove();


            //remove from local storage
            localStorage.setItem("favorites", JSON.stringify(favoritesArr));
        }
        //check if the movie card was clicked. If yes, then go to movie page
        else if (e.target.id != "favorites-movie-container") {

            //find the parent of the card that has the id of the movie which is to be viewed, (doesn't work on Internet explorer)
            const r1 = e.target.closest(".favorite-movie");
            if (r1 != null) {
                //redirect to the clicked movie
                redirectToMoviePage(r1.id);
            }
        }
    });


})();










