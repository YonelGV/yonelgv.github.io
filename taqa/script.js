document.addEventListener('DOMContentLoaded', function () {
    // --- Referencias a Elementos del DOM (CORREGIDO) ---
const player = document.getElementById('player');
const playerContainer = document.getElementById('player-container');
const playBtn = document.getElementById('play-btn');
const prevBtn = document.getElementById('prev-btn');
const nextBtn = document.getElementById('next-btn'); // <--- ERROR CORREGIDO
const progressBar = document.getElementById('progress-bar');
const volumeSlider = document.getElementById('volume-slider');
const titleDisplay = document.querySelector('.track-info .title');
const startTimeDisplay = document.querySelector('.start-time');
const endTimeDisplay = document.querySelector('.end-time');

    // --- Estado del Reproductor ---
    let currentTrack = 0;
    let isPlaying = false;
    let playlist = [];

    // --- Generar Playlist ---
    for (let i = 1; i <= 200; i++) {
        playlist.push({
            title: `Himno ${i}`,
            artist: 'Himnario',
            album: 'Edición 2009',
            artwork: 'taqa.png',
            audio: `https://github.com/YonelGV/taqa/raw/main/${i}.mp3`
        });
    }

    // --- Funciones Principales ---

    function loadTrack(index, autoPlay = false) {
        if (index < 0 || index >= playlist.length) return;
        
        const track = playlist[index];
        currentTrack = index;
        player.src = track.audio;
        titleDisplay.textContent = track.title;
        
        if ('mediaSession' in navigator) {
            navigator.mediaSession.metadata = new MediaMetadata({
                title: track.title,
                artist: track.artist,
                album: track.album,
                artwork: [{ src: track.artwork, sizes: '512x512', type: 'image/png' }]
            });
        }

        if (autoPlay) {
            playTrack();
        }
    }
    
    async function playTrack() {
        // Solo intenta reproducir si hay una fuente cargada
        if (!player.src) return;

        try {
            await player.play();
            isPlaying = true;
            playBtn.innerHTML = '<i class="fa fa-pause"></i>';
            if ('mediaSession' in navigator) {
                navigator.mediaSession.playbackState = "playing";
            }
        } catch (error) {
            console.warn("La reproducción fue bloqueada por el navegador o interrumpida:", error.name);
            // **MEJORA PARA EVITAR EL AbortError**
            // En lugar de llamar a pauseTrack(), solo actualizamos el estado y la UI.
            // Esto evita la llamada redundante a player.pause() que causa el error.
            isPlaying = false;
            playBtn.innerHTML = '<i class="fa fa-play"></i>';
            if ('mediaSession' in navigator) {
                navigator.mediaSession.playbackState = "paused";
            }
        }
    }

    function pauseTrack() {
        player.pause();
        isPlaying = false;
        playBtn.innerHTML = '<i class="fa fa-play"></i>';
        if ('mediaSession' in navigator) {
            navigator.mediaSession.playbackState = "paused";
        }
    }

    function togglePlayPause() {
        if (isPlaying) {
            pauseTrack();
        } else {
            playTrack();
        }
    }

    function nextTrack() {
        currentTrack = (currentTrack + 1) % playlist.length;
        loadTrack(currentTrack, true);
    }

    function prevTrack() {
        currentTrack = (currentTrack - 1 + playlist.length) % playlist.length;
        loadTrack(currentTrack, true);
    }

    // --- Actualización de UI (Tiempo y Barra) ---
    function updateProgress() {
        if (!player.duration) return;
        progressBar.value = player.currentTime;
        startTimeDisplay.textContent = formatTime(player.currentTime);
    }

    function setProgress(e) {
        player.currentTime = e.target.value;
    }
    
    function formatTime(seconds) {
        seconds = isNaN(seconds) ? 0 : seconds;
        const m = Math.floor(seconds / 60);
        const s = Math.floor(seconds % 60).toString().padStart(2, '0');
        return `${m}:${s}`;
    }

    // --- Sistema de Temas ---
    function switchTheme(theme) {
        document.body.className = `theme-${theme}`;
    }

    // --- Inicialización y Event Listeners ---

    // Controles del reproductor
    playBtn.addEventListener('click', togglePlayPause);
    nextBtn.addEventListener('click', nextTrack);
    prevBtn.addEventListener('click', prevTrack);
    
    // Eventos del tag <audio>
    player.addEventListener('timeupdate', updateProgress);
    player.addEventListener('loadedmetadata', () => {
        endTimeDisplay.textContent = formatTime(player.duration);
        progressBar.max = player.duration;
    });
    player.addEventListener('ended', nextTrack);
    player.addEventListener('error', (e) => {
        console.error('Error en el elemento de audio:', e);
        titleDisplay.textContent = "Error al cargar himno";
    });

    // Controles de progreso y volumen
    progressBar.addEventListener('input', setProgress);
    volumeSlider.addEventListener('input', (e) => player.volume = e.target.value);
    
    // Switcher de Temas
    document.querySelectorAll('.theme-btn').forEach(btn => {
        btn.addEventListener('click', () => switchTheme(btn.dataset.theme));
    });

    // Carga inicial desde URL o el primer track
    const urlParams = new URLSearchParams(window.location.search);
    const trackNum = parseInt(urlParams.get('num'), 10);
    const initialTrackIndex = !isNaN(trackNum) && trackNum > 0 && trackNum <= playlist.length 
        ? trackNum - 1 
        : 0;
    
    loadTrack(initialTrackIndex, false);

    // Page Visibility API
    document.addEventListener('visibilitychange', () => {
        if (document.hidden && isPlaying) {
            pauseTrack();
        }
    });

    // Intersection Observer
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (!entry.isIntersecting && isPlaying) {
                pauseTrack();
            }
        });
    }, { threshold: 0.1 });
    
    observer.observe(playerContainer);
    
    // Media Session Action Handlers
    if ('mediaSession' in navigator) {
        navigator.mediaSession.setActionHandler('play', playTrack);
        navigator.mediaSession.setActionHandler('pause', pauseTrack);
        navigator.mediaSession.setActionHandler('nexttrack', nextTrack);
        navigator.mediaSession.setActionHandler('previoustrack', prevTrack);
    }
});