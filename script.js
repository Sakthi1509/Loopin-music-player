const CLIENT_ID = "cd720f7c";
const GENRES = [ "chill", "workout", "romantic","pop","sad","emotional","acoustic"];
let playlist = [];
let currentIndex = 0;

// Map each genre to its corresponding card row
const cardRows = document.querySelectorAll(".scroll-container");
const cardRowMap = {};
cardRows.forEach(row => {
  const genre = row.getAttribute("data-genre");
  cardRowMap[genre] = row;
});


// Fetch and display songs for each genre
GENRES.forEach(genre => {
  const API_URL = `https://api.jamendo.com/v3.0/tracks/?client_id=${CLIENT_ID}&format=json&limit=10&fuzzytags=${genre}&include=musicinfo+stats`;

  fetch(API_URL)
    .then(res => res.json())
    .then(data => {
      data.results.forEach((track, index) => {
        playlist.push(track); // Add to global playlist

        const card = document.createElement("div");
        card.className = "music-card";
        card.innerHTML = `
          <img src="${track.album_image}" alt="${track.name}" />
          <h4>${track.name}</h4>
          <p>${track.artist_name}</p>
        `;

        card.addEventListener("click", () => {
          const lastPlayedId = localStorage.getItem("lastPlayedId");

          if (lastPlayedId === track.id) {
            window.location.href = "about.html";
          } else {
            currentIndex = playlist.findIndex(t => t.id === track.id);
            playTrack(track, currentIndex);
            localStorage.setItem("selectedTrack", JSON.stringify(track));
            localStorage.setItem("lastPlayedId", track.id);
          }
        });

        // Append to correct genre container
        const container = cardRowMap[genre];
        if (container) container.appendChild(card);
      });
    });
});

// Play track logic
function playTrack(track, index = null) {
  if (index !== null) currentIndex = index;
  else {
    const foundIndex = playlist.findIndex(t => t.id === track.id);
    if (foundIndex !== -1) currentIndex = foundIndex;
  }

  const footer = document.querySelector(".player-bar");
  footer.innerHTML = `
    <div class="now-playing">
      <img src="${track.album_image}" alt="${track.name}" />
      <div>
        <h5>${track.name}</h5>
        <p>${track.artist_name}</p>
      </div>
    </div>
    <div class="controls d-flex gap-3 align-items-center">
      <button class="btn btn-success btn-lg" id="prevBtn">
        <i class="bi bi-skip-start-fill"></i>
      </button>
      <button class="btn btn-success btn-lg" id="playPauseBtn">
        <i class="bi bi-pause-fill"></i>
      </button>
      <button class="btn btn-success btn-lg" id="nextBtn">
        <i class="bi bi-skip-end-fill"></i>
      </button>
      <audio id="audioPlayer" autoplay></audio>
    </div>
  `;

  const audio = document.getElementById("audioPlayer");
  audio.src = track.audio;
  audio.load();
  audio.play();

  const playPauseBtn = document.getElementById("playPauseBtn");
  const prevBtn = document.getElementById("prevBtn");
  const nextBtn = document.getElementById("nextBtn");

  // Clear old event listeners by cloning and replacing the audio element
  const newAudio = audio.cloneNode(true);
  audio.parentNode.replaceChild(newAudio, audio);

  newAudio.addEventListener("ended", () => {
    currentIndex = (currentIndex + 1) % playlist.length;
    playTrack(playlist[currentIndex], currentIndex);
  });

  playPauseBtn.addEventListener("click", () => {
    if (newAudio.paused) {
      newAudio.play();
      playPauseBtn.innerHTML = `<i class="bi bi-pause-fill"></i>`;
    } else {
      newAudio.pause();
      playPauseBtn.innerHTML = `<i class="bi bi-play-fill"></i>`;
    }
  });

  nextBtn.addEventListener("click", () => {
    currentIndex = (currentIndex + 1) % playlist.length;
    playTrack(playlist[currentIndex], currentIndex);
  });

  prevBtn.addEventListener("click", () => {
    currentIndex = (currentIndex - 1 + playlist.length) % playlist.length;
    playTrack(playlist[currentIndex], currentIndex);
  });

  newAudio.addEventListener("pause", () => {
    playPauseBtn.innerHTML = `<i class="bi bi-play-fill"></i>`;
  });

  newAudio.addEventListener("play", () => {
    playPauseBtn.innerHTML = `<i class="bi bi-pause-fill"></i>`;
  });
}

  


// Search logic
const searchBar = document.querySelector(".search-bar");
const searchDropdown = document.querySelector(".search-dropdown");
let searchTimeout;

searchBar.addEventListener("input", () => {
  const query = searchBar.value.trim();
  if (query.length < 2) {
    searchDropdown.style.display = "none";
    return;
  }

  clearTimeout(searchTimeout);
  searchTimeout = setTimeout(() => {
    fetchSearchResults(query);
  }, 300);
});

function fetchSearchResults(query) {
  const searchUrl = `https://api.jamendo.com/v3.0/tracks/?client_id=${CLIENT_ID}&format=json&limit=5&name=${encodeURIComponent(query)}&include=musicinfo+stats`;

  fetch(searchUrl)
    .then(res => res.json())
    .then(data => {
      if (!data.results.length) {
        searchDropdown.style.display = "none";
        return;
      }

      searchDropdown.innerHTML = "";
      data.results.forEach(track => {
        const item = document.createElement("div");
        item.className = "item";
        item.innerHTML = `
          <img src="${track.album_image}" alt="${track.name}" />
          <div>
            <div>${track.name}</div>
            <small>${track.artist_name}</small>
          </div>
        `;
        item.addEventListener("click", () => {
          playTrack(track);
          searchDropdown.style.display = "none";
          searchBar.value = "";
          localStorage.setItem("selectedTrack", JSON.stringify(track));
          window.location.href = "about.html";
        });
        searchDropdown.appendChild(item);
      });
      searchDropdown.style.display = "block";
    });
}

document.addEventListener("click", (e) => {
  if (!searchDropdown.contains(e.target) && e.target !== searchBar) {
    searchDropdown.style.display = "none";
  }
});
