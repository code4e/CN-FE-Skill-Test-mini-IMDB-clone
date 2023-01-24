(function () {

    let API_KEY = '119d0051';
    let BASE_URI = 'http://www.omdbapi.com/';
    let movieID = JSON.parse(localStorage.getItem("moviePageItemID"));
    let movieContainer = document.querySelector(".movie-container");

    let fetchMovie = async (id) => {
        let URI = `${BASE_URI}?apiKey=${API_KEY}&i=${id.valueOf()}&plot=full`;
        let URL = BASE_URI + "?apiKey=" + API_KEY + "&i=" + id + "&plot=full";
        let response = fetch(URI);
        return (await response).text();
    }


    fetchMovie(movieID).then(data => showMovieOnDOM(JSON.parse(data)));

    function showMovieOnDOM(movie) {

        let movieHTML = convertStringToHTML(`<div class="card mb-3 mx-auto m-3" style="max-width: 70rem;">
        <div class="row g-0 movie-card">
          <div class="col-md-4">
            <img src="${movie.Poster}" class="img-fluid rounded-start" alt="...">
          </div>
          <div class="col-md-8">
            <div class="card-body">
              <h4 class="card-title">${movie.Title}</h4>
              <p class="card-text">${movie.Plot}</p>
              <p class="card-text"><i class="fa-solid fa-film"></i> Directed by - &nbsp;
              <small class="text-muted">${movie.Director}</small>
              </p>

              <p><i class="fa-sharp fa-solid fa-people-group"></i> Cast - &nbsp; <small class="text-muted">${movie.Actors}</small></p>


              <p><i class="fa-solid fa-language"></i> Language - &nbsp; <small class="text-muted">${movie.Language}</small></p>

              <p class="imdb-score">
              <span class="score-container"><i class="fa-brands fa-imdb"></i> &nbsp; Score - &nbsp; </span>
              <small class="text-muted">${movie.imdbRating}</small></p>

              

              
            </div>
          </div>
        </div>
      </div>`);

      movieContainer.appendChild(movieHTML);

// 

    }


    function convertStringToHTML(str) {
        var dom = document.createElement('div');
        dom.innerHTML = str;
        return dom.children[0];
    };


})();