<script lang="ts">
    import { onMount } from 'svelte';

    export let isDarkMode: boolean; // Import the prop
  
    // Types for Last.fm API response
    interface LastFmImage {
      '#text': string;
      size: 'small' | 'medium' | 'large' | 'extralarge';
    }
  
    interface LastFmArtist {
      '#text': string;
      mbid?: string;
    }
  
    interface LastFmTrack {
      name: string;
      artist: LastFmArtist;
      album: {
        '#text': string;
        mbid?: string;
      };
      image: LastFmImage[];
      '@attr'?: {
        nowplaying: string;
      };
    }
  
    interface LastFmResponse {
      recenttracks: {
        track: LastFmTrack[];
        '@attr': {
          user: string;
          totalPages: string;
          page: string;
          total: string;
          perPage: string;
        };
      };
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
  
    let currentTrack: CurrentTrack | null = null;
    let error: string | null = null;
    let loading = true;
  
    async function fetchNowPlaying(): Promise<void> {
      try {
        const response = await fetch(
          `https://ws.audioscrobbler.com/2.0/?method=user.getrecenttracks&user=${USERNAME}&api_key=${API_KEY}&format=json&limit=1`
        );
  
        if (!response.ok) {
          throw new Error('Failed to fetch data from Last.fm');
        }
  
        const data: LastFmResponse = await response.json();
        const track = data.recenttracks?.track?.[0];
  
        if (track) {
          currentTrack = {
            title: track.name,
            artist: track.artist['#text'],
            album: track.album['#text'],
            albumArt:
              track.image.find((img: LastFmImage) => img.size === 'large')
                ?.['#text'] || '',
            nowPlaying: track['@attr']?.nowplaying === 'true',
          };
        } else {
          currentTrack = null;
        }
      } catch (e) {
        error = e instanceof Error ? e.message : 'An unknown error occurred';
      } finally {
        loading = false;
      }
    }
  
    // Update the now playing status every 30 seconds
    let interval: ReturnType<typeof setInterval>;
    onMount(() => {
      fetchNowPlaying();
      interval = setInterval(fetchNowPlaying, 30000);
  
      return () => {
        clearInterval(interval);
      };
    });
  </script>
  
  <div class="now-playing-container" class:dark-mode={isDarkMode}>
    {#if loading}
      <div class="loading">Loading...</div>
    {:else if error}
      <div class="error">{error}</div>
    {:else if currentTrack}
      <div class="track-info">
        <img
          src={currentTrack.albumArt}
          alt={`${currentTrack.album} album art`}
          class="album-art"
        />
        <div class="track-details">
          {#if currentTrack.nowPlaying}
            <div class="now-playing-badge">Now Playing</div>
          {/if}
          <h2 class="track-title">{currentTrack.title}</h2>
          <p class="track-artist">{currentTrack.artist}</p>
          <p class="track-album">{currentTrack.album}</p>
        </div>
      </div>
    {:else}
      <div class="no-track">No recently played tracks</div>
    {/if}
  </div>
  
  <style>
    .now-playing-container {
      max-width: 400px;
      padding: 1.5rem;
      border-radius: 12px;
      background: var(--background-color, #fff);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
      transition: background 0.3s, color 0.3s;
    }
  
    .track-info {
      display: flex;
      gap: 1rem;
      align-items: center;
    }
  
    .album-art {
      width: 120px;
      height: 120px;
      border-radius: 8px;
      object-fit: cover;
    }
  
    .track-details {
      flex: 1;
    }
  
    .now-playing-badge {
      display: inline-block;
      background: #1db954;
      color: white;
      padding: 0.5rem 0.75rem;
      border-radius: 20px;
      font-size: 0.875rem;
      margin-bottom: 0.5rem;
    }
  
    .track-title {
      margin: 0;
      font-size: 1.5rem;
      font-weight: bold;
    }
  
    .track-artist {
      margin: 0.25rem 0;
      color: #666;
    }
  
    .track-album {
      margin: 0;
      color: #888;
      font-size: 0.9rem;
    }
  
    .loading,
    .error,
    .no-track {
      text-align: center;
      padding: 1rem;
      color: #666;
    }
  
    .error {
      color: #dc2626;
    }
  
    /* Dark mode styles */
    :global(.dark-mode) {
      --background-color: #1a1b1e;
      color: #e0e0e0;
    }
  </style>
  