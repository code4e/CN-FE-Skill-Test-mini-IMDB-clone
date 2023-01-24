
(function () {

    //clear input search box when page gets loaded
    document.getElementById('search-box').value = '';


    let popover = document.querySelector('.wrapper details');
    let favoriteMoviesContainer = document.getElementById("favorites-movie-container");


    let API_KEY = '119d0051';
    let BASE_URI = 'http://www.omdbapi.com/';

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
            }


            if (popover.children.length == 2) {
                popover.children[1].remove();
            };

            popover.appendChild(moviesListUL);

            popover.addEventListener('click', getMovieAndAddToFavs);

        } else {
            if (popover.children.length == 2) {
                popover.children[1].remove();
            };

        }

    }

    async function getMovieAndAddToFavs(e) {

        if (e.target.tagName == "I") {
            let movieID = e.target.parentElement.id;


            let URI = `${BASE_URI}?apiKey=${API_KEY}&i=${movieID}`;
            fetch(URI)
                .then(response => response.text())
                .then(data => appendFavoriteTODOM(JSON.parse(data)));
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
          <button type="button" class="btn btn-info">Remove from Favorites</button>
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

    document.getElementById('search-box').addEventListener('keyup', getResultsFromAPI);


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



})();










