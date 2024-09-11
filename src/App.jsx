// src/App.jsx
import React, { useState, useEffect } from 'react';
import { redirectToAuthCodeFlow, getAccessToken } from './auth';
import { SearchBar } from './components/SearchBar';
import { SearchResultsList } from './components/SearchResultsList';
//import Footer from './components/Footer';
import './App.css';

function App() {
  const [accessToken, setAccessToken] = useState(null);
  const [results, setResults] = useState([]);
  const [playlist, setPlaylist] = useState(null); // Store the playlist details
  const [playlistTracks, setPlaylistTracks] = useState([]);


  useEffect(() => {
    const clientId = import.meta.env.VITE_CLIENT_ID;
    const params = new URLSearchParams(window.location.search);
    const code = params.get("code");

    if (!code) {
      redirectToAuthCodeFlow(clientId);
    } else {
      getAccessToken(clientId, code)
        .then((token) => {
          setAccessToken(token);
        })
        .catch((error) => console.error("Error fetching access token:", error));
    }
  }, []);
  const handleAddToPlaylist = (tracks, playlistName) => {
    if (!accessToken) {
      console.error("No access token available");
      return;
    }
    const hardcodedAccessToken = "BQDw6fPlZi_3B-LD0c_sGOd-VfyZryuRRB6jcn3CZZEULOjNNHQAvbmYSk4XihHZEbOEzsOyWczLmjleKdDyyM7XchgBIGWyW6Gd3INfFMrqy9UtaYMllBvgMT9RA9bmZLZxVo6ux2PEh3FOgqdVY0dN1wPt200ML956VrWxSABpBLX_LFqvebW2bPNsnhTstPBJn8rE9ivCo70Z4_YDvwzTli9VistGLxgHuwdFweVzVVsvq9VZy2UeI_QZZxSfyKGu1i-2b6l7aDxOU4ec";
    // Create a new playlist
    fetch('https://api.spotify.com/v1/me/playlists', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${hardcodedAccessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: playlistName,
        description: 'New playlist created by app',
        public: false,
      }),
    })
      .then(response => response.json())
      .then(data => {
        const playlistId = data.id;
        setPlaylist({ id: playlistId, name: playlistName });

        const uris = tracks.map(track =>`spotify:track:${track.id}`);

        // Add the track to the newly created playlist
        fetch(`https://api.spotify.com/v1/playlists/${playlistId}/tracks`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            uris: uris,
          }),
        })
          .then(response => response.json())
          .then(() => {
            setPlaylistTracks(tracks);
          })
          .catch(error => console.error('Error adding track to playlist:', error));
      })
      .catch(error => console.error('Error creating playlist:', error));
  };

  return (
    <div className="App">
      <div className="headder">
        <h1>Muusic(k)</h1>
      </div>
      <div className="search-bar-container">
        <SearchBar setResults={setResults} accessToken={accessToken} />
        <SearchResultsList results={results} onAddToSpotify={handleAddToPlaylist} />
      </div> 
      {playlist && (
        <div className="playlist-display">
          <h2>Playlist: {playlist.name}</h2>
          <div className="playlist-tracks">
            {playlistTracks.length > 0 ? (
              playlistTracks.map((track, index) => (
                <div key={index} className="playlist-track">
                  <img src={track.imageUrl} alt={track.name} style={{ width: '50px', height: '50px' }} />
                  <div>
                    <h3>{track.name}</h3>
                    <p>{track.artist} - {track.album}</p>
                    <a href={track.externalUrl} target="_blank" rel="noopener noreferrer">Listen on Spotify</a>
                  </div>
                </div>
              ))
           ) : (
              <p>No tracks added yet.</p>
            )}
          </div>
        </div> 
      )}
     
    </div>
    
  );
}
export default App;
