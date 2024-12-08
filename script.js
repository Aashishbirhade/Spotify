let currentSong = new Audio();
let songs = [];
let currFolder = "";
const IMAGE_PATHS = {
    play: "image/play.svg",
    pause: "image/pause.svg",
    volume: "image/volume.svg",
    mute: "image/mute.svg",
};

// Utility to format seconds to MM:SS
function secondsToMinutesSeconds(second) {
    if (isNaN(second) || second < 0) return "00:00";
    const minutes = Math.floor(second / 60);
    const remainingSecond = Math.floor(second % 60);
    return `${String(minutes).padStart(2, '0')}:${String(remainingSecond).padStart(2, '0')}`;
}

// Fetch songs from a folder
async function getSongs(folder) {
    try {
        currFolder = folder;
        const response = await fetch(`/${folder}/`);
        const html = await response.text();
        const div = document.createElement("div");
        div.innerHTML = html;

        songs = Array.from(div.getElementsByTagName("a"))
            .filter(link => link.href.endsWith(".mp3"))
            .map(link => decodeURIComponent(link.href.split(`/${folder}/`)[1]));

        renderPlaylist();
        attachSongListeners();
        return songs;
    } catch (error) {
        console.error("Error fetching songs:", error);
    }
}

// Render playlist
function renderPlaylist() {
    const songUL = document.querySelector(".songlist ul");
    songUL.innerHTML = songs
        .map(song => `
            <li>
                <img class="invert" src="/image/music.svg" alt="">
                <div class="info">
                    <div>${song}</div>
                    <div>Aashish</div>
                </div>
                <div class="playnow">
                    <span>Play now</span>
                    <img class="invert" src="${IMAGE_PATHS.play}" alt="">
                </div>
            </li>
        `).join("");
}

// Attach listeners to songs in the playlist
function attachSongListeners() {
    document.querySelectorAll(".songlist li").forEach(item => {
        item.addEventListener("click", () => {
            const track = item.querySelector(".info div").textContent.trim();
            playMusic(track);
        });
    });
}

// Play a specific track
function playMusic(track, pause = false) {
    currentSong.src = `/${currFolder}/${track}`;
    if (!pause) {
        currentSong.play();
        document.getElementById("play").src = IMAGE_PATHS.pause;
    }
    document.querySelector(".songinfo").textContent = decodeURIComponent(track);
    document.querySelector(".songtime").textContent = "00:00 / 00:00";
}

// Fetch and display albums
async function displayAlbums() {
    try {
        const response = await fetch(`/song/`);
        const html = await response.text();
        const div = document.createElement("div");
        div.innerHTML = html;

        const albums = Array.from(div.getElementsByTagName("a"))
            .filter(link => link.href.includes("/song") && !link.href.includes(".htaccess"));

        const cardContainer = document.querySelector(".cardContainer");
        for (const album of albums) {
            const folder = album.href.split("/").slice(-2)[0];
            const metadata = await fetch(`/song/${folder}/info.json`).then(res => res.json());
            cardContainer.innerHTML += `
                <div data-folder="${folder}" class="card">
                    <div class="play">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M5 20V4L19 12L5 20Z" stroke="#141B34" fill="#000" stroke-width="1.5" stroke-linejoin="round" />
                        </svg>
                    </div>
                    <img src="/song/${folder}/cover.jpg" alt="">
                    <h2>${metadata.title}</h2>
                    <p>${metadata.description}</p>
                </div>
            `;
        }

        attachAlbumListeners();
    } catch (error) {
        console.error("Error fetching albums:", error);
    }
}

// Attach listeners to album cards
function attachAlbumListeners() {
    document.querySelectorAll(".card").forEach(card => {
        card.addEventListener("click", async () => {
            const folder = card.dataset.folder;
            songs = await getSongs(`song/${folder}`);
            playMusic(songs[0]);
        });
    });
}

// Main initialization function
async function main() {
    await getSongs("song/ncs");
    playMusic(songs[0], true);

    await displayAlbums();

    document.getElementById("play").addEventListener("click", togglePlayPause);
    currentSong.addEventListener("timeupdate", updateTime);
    document.querySelector(".seekbar").addEventListener("click", seekTrack);
    document.querySelector(".volume>img").addEventListener("click", toggleMute);
    document.querySelector(".range input").addEventListener("input", adjustVolume);
    document.getElementById("previous").addEventListener("click", playPreviousSong);
    document.getElementById("next").addEventListener("click", playNextSong);
    currentSong.addEventListener("ended", playNextSong);
}

// Toggle play/pause
function togglePlayPause() {
    if (currentSong.paused) {
        currentSong.play();
        this.src = IMAGE_PATHS.pause;
    } else {
        currentSong.pause();
        this.src = IMAGE_PATHS.play;
    }
}

// Update time display
function updateTime() {
    document.querySelector(".songtime").textContent = `${secondsToMinutesSeconds(currentSong.currentTime)} / ${secondsToMinutesSeconds(currentSong.duration)}`;
    document.querySelector(".circle").style.left = `${(currentSong.currentTime / currentSong.duration) * 100}%`;
}

// Seek track
function seekTrack(e) {
    const percent = (e.offsetX / this.offsetWidth);
    currentSong.currentTime = percent * currentSong.duration;
}

// Adjust volume
function adjustVolume(e) {
    currentSong.volume = e.target.value / 100;
    document.querySelector(".volume>img").src = currentSong.volume > 0 ? IMAGE_PATHS.volume : IMAGE_PATHS.mute;
}

// Toggle mute
function toggleMute() {
    const isMuted = this.src.includes("mute");
    this.src = isMuted ? IMAGE_PATHS.volume : IMAGE_PATHS.mute;
    currentSong.volume = isMuted ? 0.2 : 0;
    document.querySelector(".range input").value = currentSong.volume * 100;
}

// Play previous song
function playPreviousSong() {
    const index = songs.indexOf(decodeURIComponent(currentSong.src.split("/").pop()));
    if (index > 0) playMusic(songs[index - 1]);
}

// Play next song
function playNextSong() {
    const index = songs.indexOf(decodeURIComponent(currentSong.src.split("/").pop()));
    if (index < songs.length - 1) playMusic(songs[index + 1]);
}

main();
