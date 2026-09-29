<script lang="ts">
    import { onMount } from 'svelte';

    // Types for Last.fm API response
    interface LastFmImage {
      '#text': string;
      size: 'small' | 'medium' | 'large' | 'extralarge';
    }

    interface LastFmTrack {
      name: string;
      artist: { '#text': string; mbid?: string };
      album: { '#text': string; mbid?: string };
      image: LastFmImage[];
      '@attr'?: { nowplaying: string };
    }

    interface LastFmResponse {
      recenttracks: { track: LastFmTrack[] };
    }

    interface CurrentTrack {
      title: string;
      artist: string;
      album: string;
      albumArt: string;
      nowPlaying: boolean;
    }

    // Configuration
    const API_KEY = '72b89d115fa12d2c61234cd79823d568';
    const USERNAME = 'qweeren';

    let currentTrack: CurrentTrack | null = $state(null);
    let error: string | null = $state(null);
    let loading = $state(true);

    const spotifySearch = (q: string) => `https://open.spotify.com/search/${encodeURIComponent(q)}`;

    async function fetchNowPlaying(): Promise<void> {
      try {
        const response = await fetch(
          `https://ws.audioscrobbler.com/2.0/?method=user.getrecenttracks&user=${USERNAME}&api_key=${API_KEY}&format=json&limit=1`
        );
        if (!response.ok) throw new Error('Last.fm didn’t answer.');

        const data: LastFmResponse = await response.json();
        const track = data.recenttracks?.track?.[0];
        currentTrack = track
          ? {
              title: track.name,
              artist: track.artist['#text'],
              album: track.album['#text'],
              albumArt: track.image.find((img) => img.size === 'extralarge')?.['#text'] || '',
              nowPlaying: track['@attr']?.nowplaying === 'true'
            }
          : null;
        error = null;
      } catch (e) {
        error = e instanceof Error ? e.message : 'Last.fm didn’t answer.';
      } finally {
        loading = false;
      }
    }

    // Update the now playing status every 30 seconds
    onMount(() => {
      fetchNowPlaying();
      const interval = setInterval(fetchNowPlaying, 30000);
      return () => clearInterval(interval);
    });
</script>

<div class="deck" class:playing={currentTrack?.nowPlaying}>
    <div class="cassette">
        <span class="screw s1"></span><span class="screw s2"></span><span class="screw s3"></span><span class="screw s4"></span>

        <div class="label">
            {#if loading}
                <span class="state">rewinding…</span>
                <span class="title">loading last.fm</span>
            {:else if error}
                <span class="state">tape jammed</span>
                <span class="title">{error} Retrying every 30 seconds.</span>
            {:else if currentTrack}
                <span class="state">
                    {#if currentTrack.nowPlaying}<i class="rec"></i>playing right now{:else}last played{/if}
                </span>
                <a class="title" href={spotifySearch(`${currentTrack.title} ${currentTrack.artist}`)} target="_blank" rel="noopener noreferrer">
                    {currentTrack.title}
                </a>
                <a class="artist" href={spotifySearch(currentTrack.artist)} target="_blank" rel="noopener noreferrer">
                    {currentTrack.artist}
                </a>
                {#if currentTrack.album}
                    <span class="album">{currentTrack.album}</span>
                {/if}
            {:else}
                <span class="state">blank tape</span>
                <span class="title">Nothing scrobbled yet.</span>
            {/if}
        </div>

        <div class="window">
            <span class="reel left"></span>
            <span class="band"></span>
            <span class="reel right"></span>
        </div>
    </div>

    {#if currentTrack?.albumArt}
        <img class="art" src={currentTrack.albumArt} alt="{currentTrack.album} cover" />
    {/if}
</div>

<style>
    .deck {
        position: relative;
        width: min(460px, 100%);
    }

    .cassette {
        position: relative;
        aspect-ratio: 1.5;
        background: #000;
        border: 3px solid #fff;
        clip-path: polygon(0 0, 100% 0, 100% 100%, 88% 100%, 84% 88%, 16% 88%, 12% 100%, 0 100%);
    }

    .screw {
        position: absolute;
        width: 9px;
        height: 9px;
        border-radius: 50%;
        background: radial-gradient(circle, #000 25%, #8a8a8a 30%);
    }
    .s1 { top: 8px; left: 8px; }
    .s2 { top: 8px; right: 8px; }
    .s3 { bottom: 16%; left: 8px; }
    .s4 { bottom: 16%; right: 8px; }

    .label {
        position: absolute;
        inset: 6% 5% 17%;
        background: #e4f1ee;
        color: #000;
        padding: 0.55em 0.8em;
        display: flex;
        flex-direction: column;
        gap: 0.1em;
        transform: rotate(-0.6deg);
    }

    .state {
        font-family: 'Archivo', sans-serif;
        font-variation-settings: 'wdth' 62;
        font-weight: 700;
        font-size: 0.8rem;
        display: flex;
        align-items: center;
        gap: 0.4em;
    }
    .rec {
        width: 0.6em;
        height: 0.6em;
        background: #000;
        border-radius: 50%;
        animation: blink 1s steps(1) infinite;
    }

    .title {
        font-family: 'Jacquard 24', serif;
        font-size: clamp(1.5rem, 3vw, 2.1rem);
        line-height: 0.95;
        color: #000;
        text-decoration: none;
        overflow: hidden;
        text-overflow: ellipsis;
        display: -webkit-box;
        -webkit-line-clamp: 1;
        line-clamp: 1;
        -webkit-box-orient: vertical;
    }
    .artist,
    .album {
        font-family: 'Archivo', sans-serif;
        font-variation-settings: 'wdth' 75;
        font-size: 0.9rem;
        color: #000;
        text-decoration: none;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
    }
    .album { color: #3a3a3a; }
    a.title:hover,
    a.artist:hover {
        background: #000;
        color: #fff;
    }

    .window {
        position: absolute;
        left: 22%;
        right: 22%;
        bottom: 21%;
        height: 25%;
        border: 2px solid #000;
        background: #000;
        outline: 2px solid #e4f1ee;
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 0 6%;
    }
    .band {
        position: absolute;
        left: 18%;
        right: 18%;
        top: 40%;
        height: 20%;
        background: #3a3a3a;
    }
    .reel {
        position: relative;
        z-index: 1;
        height: 80%;
        aspect-ratio: 1;
        border-radius: 50%;
        background:
            radial-gradient(circle, #000 22%, transparent 24%),
            repeating-conic-gradient(#fff 0 12deg, #000 12deg 60deg);
        box-shadow: 0 0 0 3px #3a3a3a;
        animation: spin 1.6s linear infinite;
        animation-play-state: paused;
    }
    .reel.right { box-shadow: 0 0 0 1px #3a3a3a; }
    .playing .reel { animation-play-state: running; }
    .playing .reel.left { animation-duration: 2.3s; }

    .art {
        position: absolute;
        width: 34%;
        right: -9%;
        top: -16%;
        aspect-ratio: 1;
        object-fit: cover;
        transform: rotate(7deg);
        filter: grayscale(1) contrast(2.6) brightness(1.15);
        border: 3px solid #fff;
        box-shadow: 10px 10px 0 #000;
        transition: none;
    }
    .art:hover {
        filter: grayscale(1) contrast(3) invert(1);
    }

    @keyframes spin { to { transform: rotate(360deg); } }
    @keyframes blink { 50% { opacity: 0; } }

    @media (prefers-reduced-motion: reduce) {
        .reel, .rec { animation: none; }
    }
</style>
