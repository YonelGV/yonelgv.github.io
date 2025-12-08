document.addEventListener('DOMContentLoaded', function() {
    const player = document.getElementById('player');
    const playButton = document.getElementById('play-btn');
    const prevButton = document.getElementById('prev');
    const nextButton = document.getElementById('next');
    const dur = document.getElementById('dur');

    let playlist = [];
    for (let i = 1; i <= 200; i++) {
        playlist.push({
            'title': `Himno ${i}`,
            'audio': `https://github.com/YonelGV/quechuaMP3/raw/main/quechuaMP3/${i}.mp3`
        });
    }

    let currentTrack = 0;
    const n = playlist.length;

    function loadTrack(index, autoPlay = true) {
        if (index >= 0 && index < n) {
            player.src = playlist[index].audio;
            document.querySelector('.title').innerText = playlist[index].title;
            console.log(`Loading track: ${playlist[index].title}`);
            player.load();
            if (autoPlay) {
                player.play().then(() => {
                    playButton.classList.remove('fa-play');
                    playButton.classList.add('fa-pause');
                }).catch(error => {
                    console.error('Error in auto-playing the track:', error);
                });
            }
        }
    }

    function getTrackNumberFromURL() {
        const urlParams = new URLSearchParams(window.location.search);
        return parseInt(urlParams.get('num'));
    }

    function updateTrackBasedOnURL() {
        const trackNumber = getTrackNumberFromURL();
        if (!isNaN(trackNumber) && trackNumber >= 1 && trackNumber <= n) {
            currentTrack = trackNumber - 1;  // Convert to zero-based index
            loadTrack(currentTrack, false);  // Don't auto-play initially
        }
    }

    playButton.addEventListener('click', function() {
        if (player.paused) {
            player.play();
            playButton.classList.remove('fa-play');
            playButton.classList.add('fa-pause');
        } else {
            player.pause();
            playButton.classList.remove('fa-pause');
            playButton.classList.add('fa-play');
        }
    });

    prevButton.addEventListener('click', function() {
        currentTrack = (currentTrack > 0) ? currentTrack - 1 : n - 1;
        loadTrack(currentTrack);
    });

    nextButton.addEventListener('click', function() {
        currentTrack = (currentTrack < n - 1) ? currentTrack + 1 : 0;
        loadTrack(currentTrack);
    });

    function calculateTotalValue(length) {
        let minutes = Math.floor(length / 60),
            seconds = Math.floor(length % 60),
            time = minutes + ':' + (seconds < 10 ? '0' : '') + seconds;
        return time;
    }

    function calculateCurrentValue(currentTime) {
        let minutes = Math.floor(currentTime / 60),
            seconds = Math.floor(currentTime % 60),
            time = minutes + ':' + (seconds < 10 ? '0' : '') + seconds;
        return time;
    }

    function initProgressBar() {
        let length = player.duration;
        let currentTime = player.currentTime;
        let totalLength = calculateTotalValue(length);
        document.querySelector(".end-time").innerText = totalLength;
        let currentTimeValue = calculateCurrentValue(currentTime);
        document.querySelector(".start-time").innerText = currentTimeValue;
        dur.value = currentTime;
        if (player.currentTime === player.duration) {
            playButton.classList.remove('fa-pause');
            playButton.classList.add('fa-play');
            dur.value = 0;
        }
    }

    player.addEventListener('timeupdate', initProgressBar);
    player.addEventListener('loadedmetadata', function() {
        dur.max = player.duration;
    });

    dur.addEventListener('input', function() {
        player.currentTime = dur.value;
    });

    function setVolumeControl() {
        $(".volumeControl .outer").on("click", function(e) {
            let volumePosition = e.pageX - $(this).offset().left;
            let audioVolume = volumePosition / $(this).width();
            if (audioVolume >= 0 && audioVolume <= 1) {
                player.volume = audioVolume;
                $(this).find(".inner").css("width", audioVolume * 100 + "%");
            }
        });
    }

    setVolumeControl();

    function themeSwitch() {
        $('#darkButton').click(() => switchTheme('dark'));
        $('#whiteButton').click(() => switchTheme('default'));
        $('#blueButton').click(() => switchTheme('blue'));
    }

    function switchTheme(theme) {
        const themes = {
            dark: {
                skinClass: 'dark audio-player',
                innerBg: '#fff',
                textColor: '#fff',
            },
            default: {
                skinClass: 'white audio-player',
                innerBg: '#555',
                textColor: '#555',
            },
            blue: {
                skinClass: 'blue audio-player',
                innerBg: '#fff',
                textColor: '#fff',
            },
        };

        const selectedTheme = themes[theme];
        $('#skin').attr('class', selectedTheme.skinClass);
        $('.inner').css('background', selectedTheme.innerBg);
        $('.title, .time').css('color', selectedTheme.textColor);
        $('.fa-volume-up, .audio-player #play-btn, .ctrl_btn').css({
            'color': selectedTheme.textColor,
            'border-color': selectedTheme.textColor
        });
    }

    themeSwitch();

    // Load the track based on the URL parameter
    updateTrackBasedOnURL();

    // Load the first track by default if no URL parameter is provided
    if (isNaN(getTrackNumberFromURL())) {
        loadTrack(currentTrack, false);
    }

    // Add event listeners to log any issues with loading the audio file
    player.addEventListener('error', function(e) {
        console.error('Error loading audio file:', e);
    });
});