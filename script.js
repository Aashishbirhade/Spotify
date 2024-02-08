let currentSong = new Audio();
let songs;
let currfolder;
function secondsToMinutesSeconds(second) {
    if (isNaN(second) || second < 0) {
        return "00:00";
    }
    const minutes = Math.floor(second / 60);
    const remainingSecond = Math.floor(second % 60);

    const formattedMinutes = String(minutes).padStart(2, '0');
    const formattedSeconds = String(remainingSecond).padStart(2, '0');
    return `${formattedMinutes}:${formattedSeconds}`;
}
async function getSongs(folder) {
    currfolder = folder;
    let a = await fetch(`https://aashishbirhade.github.io/Spotify/${folder}/`);
    let response = await a.text();
    let div = document.createElement("div");
    div.innerHTML = response;
    let as = div.getElementsByTagName("a")
    songs = []
    for (let index = 0; index < as.length; index++) {
        const element = as[index];
        if (element.href.endsWith(".mp3")) {
            songs.push(element.href.split(`/${folder}/`)[1])
        }
    }
    //show all songs in the playlist
    let songUL = document.querySelector(".songlist").getElementsByTagName("ul")[0]
    songUL.innerHTML = ""
    for (const song of songs) {
        songUL.innerHTML = songUL.innerHTML + `<li><img class="invert" src="/image/music.svg" alt="">
               <div class="info">
                   <div>${song.replaceAll("%20", " ")} </div>
                   <div>aashish</div>
               </div>
               <div class="playnow">
                    <span>Play now</span>
                   <img class="invert" src="image/play.svg" alt="">
               </div>
         
                 
       </li>`;
        //attach an event listener to each song
    }
    Array.from(document.querySelector(".songlist").getElementsByTagName("li")).forEach(e => {
        e.addEventListener("click", element => {

            playMusic(e.querySelector(".info").firstElementChild.innerHTML.trim())
        })

    })
    return songs
}

const playMusic = (track, pause = false) => {
    // let audio =new Audio("/song/"+track)
    currentSong.src = `/${currfolder}/` + track
    if (!pause) {
        currentSong.play()
        play.src = "image/pause.svg"
    }
    document.querySelector(".songinfo").innerHTML = decodeURI(track)
    document.querySelector(".songtime").innerHTML = "00:00/00:00 "

}

async function displayalbums() {
    let a = await fetch(`http://127.0.0.1:5500/song/`)
    let response = await a.text();
    let div = document.createElement("div");
    div.innerHTML = response;
    let anchors = div.getElementsByTagName("a")
    let cardContainer = document.querySelector(".cardContainer")
    let array = Array.from(anchors)
    for (let index = 0; index < array.length; index++) {
        const e = array[index];


        if (e.href.includes("/song/")) {
            let folder = e.href.split("/").slice(-1)[0]
            //get the metadata of the folder 
            let a = await fetch(`http://127.0.0.1:5500/song/${folder}/info.json`)
            let response = await a.json();

            cardContainer.innerHTML = cardContainer.innerHTML + `  <div data-folder="${folder}" class="card">
                    <div  class="play">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                            xmlns="http://www.w3.org/2000/svg">
                            <path d="M5 20V4L19 12L5 20Z" stroke="#141B34" fill="#000" stroke-width="1.5"
                                stroke-linejoin="round" />
                        </svg>
                    </div>
                    <img src="/song/${folder}/cover.jpg" alt="">
                    <h2>${response.title}</h2>
                    <p>${response.description}</p>
                </div>`
        }


    }
    //load the playlist whenever card is clicked
    Array.from(document.getElementsByClassName("card")).forEach(e => {
        e.addEventListener("click", async item => {
            songs = await getSongs(`song/${item.currentTarget.dataset.folder}`)
            playMusic(songs[0])

        })
    })

}

async function main() {

    await getSongs("song/ncs")

    playMusic(songs[0], true)

    //display all the albums
    await displayalbums()

    //attach an event listener to play and paused
    play.addEventListener("click", () => {
        if (currentSong.paused) {
            currentSong.play()
            play.src = "image/pause.svg"
        }
        else {
            currentSong.pause()
            play.src = "image/play.svg"
        }
    })



    //listen for timeupdate event
    currentSong.addEventListener("timeupdate", () => {
        console.log(currentSong.currentTime, currentSong.duration)
        document.querySelector(".songtime").innerHTML = `${secondsToMinutesSeconds(currentSong.currentTime)} / ${secondsToMinutesSeconds(currentSong.duration)}`
        document.querySelector(".circle").style.left = (currentSong.currentTime / currentSong.duration) * 100 + "%";
    })
    //add an event listener foe seek
    document.querySelector(".seekbar").addEventListener("click", e => {
        let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100
        document.querySelector(".circle").style.left = percent + "%";
        currentSong.currentTime = ((currentSong.duration) * percent) / 100
    })
    //add an event listener for hamburger
    document.querySelector(".hamburger").addEventListener("click", () => {
        document.querySelector(".left").style.left = "0"
    })
    //add an event listener for hamburger close
    document.querySelector(".close").addEventListener("click", () => {
        document.querySelector(".left").style.left = "-120%"
    })
    //add an event listener for privious and next
    previous.addEventListener("click", () => {
        console.log("previous")
        let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0])
        if ((index - 1) >= 0) {
            playMusic(songs[index - 1])
        }
    })

    next.addEventListener("click", () => {
        currentSong.pause()
        console.log("next")
        let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0])
        if ((index + 1) < songs.length) {
            playMusic(songs[index + 1])
        }
    })
    //add an event for range
    document.querySelector(".range").getElementsByTagName("input")[0].addEventListener("change", (e) => {
        currentSong.volume = parseInt(e.target.value) / 100
        if (currentSong.volume > 0) {
            document.querySelector(".volume>img").src = document.querySelector(".volume>img").src.replace("/image/mute.svg", "/image/volume.svg")
        }
    })
    //add event for mute track
    document.querySelector(".volume>img").addEventListener("click", (e) => {
        if (e.target.src.includes("/image/volume.svg")) {
            e.target.src = e.target.src.replace("/image/volume.svg", "/image/mute.svg")
            currentSong.volume = 0;
            document.querySelector(".range").getElementsByTagName("input")[0].value = 0;
        }
        else {
            e.target.src = e.target.src.replace("/image/mute.svg", "/image/volume.svg")
            currentSong.volume = .2;
            document.querySelector(".range").getElementsByTagName("input")[0].value = 20
        }
    })

    // Listen for when the current song ends
    currentSong.addEventListener("ended", () => {
        console.log("Song ended");
        playNextSong();
    });

    // Function to play the next song
    function playNextSong() {
        let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0]);
        if ((index + 1) < songs.length) {
            playMusic(songs[index + 1]);
            
        } else {
            // If it's the last song, you might want to stop playback or loop back to the first song
            // For now, let's just stop playback
            currentSong.pause();
            play.src = "image/play.svg"; // Change the play button icon
        }
    }

}
main()
