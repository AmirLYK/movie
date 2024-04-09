const API_KEY = "96efc622-6883-4ece-a8cf-abcb657effae";
const API_URL_POPULAR =
  "https://kinopoiskapiunofficial.tech/api/v2.2/films?order=RATING&type=FILM&ratingFrom=0&ratingTo=9&yearFrom=1000&yearTo=3000&page=1";
const API_URL_SEARCH =
  "https://kinopoiskapiunofficial.tech/api/v2.1/films/search-by-keyword?keyword=";
const API_URL_MOVIE_DETAILS =
  "https://kinopoiskapiunofficial.tech/api/v2.2/films/";

getMovies(API_URL_POPULAR);

async function getMovies(url) {
  const resp = await fetch(url, {
    headers: {
      "Content-Type": "application/json",
      "X-API-KEY": API_KEY,
    },
  });
  const respData = await resp.json();
  showMovies(respData);
}

async function getMoviesByKey(url) {
  const resp = await fetch(url, {
    headers: {
      "Content-Type": "application/json",
      "X-API-KEY": API_KEY,
    },
  });
  const respData = await resp.json();
  showMoviesByKey(respData);
}

function showMoviesByKey(data) {
  const moviesEl = document.querySelector(".movies");

  moviesEl.innerHTML = "";

  const existingMovies = document.querySelectorAll(".movie");

  existingMovies.forEach((existingMovie) => {
    const kinopoiskId = existingMovie.dataset.num;
    existingMovie.removeEventListener("click", handleMovieClick);
  });

  data.films.forEach((movie) => {
    const movieEl = document.createElement("div");
    movieEl.classList.add("movie");
    movieEl.innerHTML = `
    <div class="movie__cover-inner">
      <img
        class="movie__cover"
        src="${movie.posterUrl}"
        alt="${movie.nameRu}"/>
      <div class="movie__cover--darkened"></div>
    </div>
    <div class="movie__info">
      <div class="movie__title">${getName(movie.nameRu, movie.nameEn)}</div>
      <div class="movie__category">${movie.genres.map(
        (genre) => ` ${genre.genre}`
      )}</div>
      <div class="movie__average movie__average--${getClassByRate(
        getRating(movie.rating)
      )}">${getRating(movie.rating)}</div>
    </div>
    `;
    movieEl.dataset.num = movie.filmId;
    movieEl.addEventListener("click", handleMovieClick);
    moviesEl.appendChild(movieEl);
  });

  function handleMovieClick() {
    const kinopoiskId = this.dataset.num;
    openModal(kinopoiskId);
  }
}

function getName(strRu, strEn) {
  if (strRu == undefined) {
    return strEn;
  }
  return strRu;
}

function getRating(val) {
  if (val == "null" || val == undefined) {
    return 0;
  } else {
    return val;
  }
}

function getClassByRate(val) {
  if (val >= 7) {
    return "green";
  } else if (val >= 5) {
    return "orange";
  } else {
    return "red";
  }
}

function showMovies(data) {
  const moviesEl = document.querySelector(".movies");

  moviesEl.innerHTML = "";

  const existingMovies = document.querySelectorAll(".movie");

  existingMovies.forEach((existingMovie) => {
    const kinopoiskId = existingMovie.dataset.num;
    existingMovie.removeEventListener("click", handleMovieClick);
  });

  // Добавление новых элементов
  data.items.forEach((movie) => {
    const movieEl = document.createElement("div");
    movieEl.classList.add("movie");
    movieEl.dataset.num = movie.kinopoiskId;
    movieEl.innerHTML = `
    <div class="movie__cover-inner">
      <img
        class="movie__cover"
        src="${movie.posterUrl}"
        alt="${movie.nameRu}"/>
      <div class="movie__cover--darkened"></div>
    </div>
    <div class="movie__info">
      <div class="movie__title">${movie.nameRu}</div>
      <div class="movie__category">${movie.genres.map(
        (genre) => ` ${genre.genre}`
      )}</div>
      <div class="movie__average movie__average--${getClassByRate(
        movie.ratingKinopoisk
      )}">${movie.ratingKinopoisk}</div>
    </div>
    `;
    movieEl.addEventListener("click", handleMovieClick);
    moviesEl.appendChild(movieEl);
  });

  function handleMovieClick() {
    const kinopoiskId = this.dataset.num;
    console.log(`Clicked movie with ID: ${kinopoiskId}`);
    openModal(kinopoiskId);
  }
}

const form = document.querySelector("form");
const search = document.querySelector(".header__search");

form.addEventListener("submit", (e) => {
  e.preventDefault();

  const apiSearchUrl = `${API_URL_SEARCH}${search.value}`;

  if (search.value) {
    getMoviesByKey(apiSearchUrl);

    search.value = "";
  }
});

const modalEl = document.querySelector(".modal");

function openModal(id) {
  fetch(API_URL_MOVIE_DETAILS + id, {
    headers: {
      "Content-Type": "application/json",
      "X-API-KEY": API_KEY,
    },
  })
    .then((response) => response.json())
    .then((respData) => {
      modalEl.classList.add("modal--show");
      document.body.classList.toggle("stop-scrolling");

      modalEl.innerHTML = `
      <div class="modal__card">
        <img class="modal__movie-backdrop" src="${respData.posterUrl}" alt="">
        <h2>
          <span class="modal__movie-title">${respData.nameRu}</span>
          <span class="modal__movie-release-year"> - ${respData.year}</span>
        </h2>
        <ul class="modal__movie-info">
          <div class="loader"></div>
          <li class="modal__movie-genre">Жанр - ${
            Array.isArray(respData.genres)
              ? respData.genres.map((el) => `<span>${el.genre}</span>`)
              : ""
          }</li>
          ${
            respData.filmLength
              ? `<li class="modal__movie-runtime">Время - ${respData.filmLength} минут</li>`
              : ""
          }
          <li >Сайт: <a target="_blank" class="modal__movie-site" href="${
            respData.webUrl
          }">${respData.webUrl}</a></li>
          <li class="modal__movie-overview">Описание - ${
            respData.description
          }</li>
        </ul>
        <button type="button" class="modal__button-close">Закрыть</button>
      </div>
    `;

      const btnClose = document.querySelector(".modal__button-close");
      btnClose.addEventListener("click", () => closeModal());
    })
    .catch((error) => console.error("Error:", error));
}

function closeModal() {
  modalEl.classList.toggle("modal--show");
  document.body.classList.toggle("stop-scrolling");
}

window.addEventListener("click", (e) => {
  if (e.target === modalEl) {
    closeModal();
  }
});

window.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    closeModal();
  }
});
