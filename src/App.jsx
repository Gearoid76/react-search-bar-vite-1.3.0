import React, { useState, useEffect } from 'react';
import { redirectToAuthCodeFlow, getAccessToken } from './auth';
import { SearchBar } from './components/SearchBar';
import { SearchResultsList } from './components/SearchResultsList';
import CallbackPage from './components/CallbackPage';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import { HomePage } from './components/HomePage';

import './App.css';

export function App() {
  const [accessToken, setAccessToken] = useState('');
  const [results, setResults] = useState([]);
  const [playlist, setPlaylist] = useState(null);
  const [playlistTracks, setPlaylistTracks] = useState([]);

  useEffect(() => {
    const clientId = import.meta.env.VITE_CLIENT_ID;
    if (!accessToken) {
      redirectToAuthCodeFlow(clientId);
    }
  }, [accessToken]);

  const handleAddToPlaylist = (tracks, playlistName) => {
    if (!accessToken) {
      console.error('No access token available');
      return Promise.reject(new Error('No access token available'));
    }

    // Create a new playlist
    return fetch('https://api.spotify.com/v1/me/playlists', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: playlistName,
        description: 'New playlist created by app',
        public: false,
      }),
    })
      .then((response) => response.json())
      .then((data) => {
        const playlistId = data.id;
        setPlaylist({ id: playlistId, name: playlistName });

        const uris = tracks.map((track) => `spotify:track:${track.id}`);

        // Add the tracks to the newly created playlist
        return fetch(`https://api.spotify.com/v1/playlists/${playlistId}/tracks`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            uris: uris,
          }),
        })
          .then((response) => response.json())
          .then(() => {
            setPlaylistTracks(tracks);
            return Promise.resolve();
          });
      })
      .catch((error) => {
        console.error('Error creating or adding tracks to playlist:', error);
        return Promise.reject(error);
      });
  };

  return (
    <Router>
      <div className="App">
        <Routes>
         <Route 
            path="/" 
            element={<HomePage/>} 
            />
          <Route
            path="/callback"
            element={
              <CallbackPage
                setAccessToken={setAccessToken}
                getAccessToken={getAccessToken}
              />
            }
          />
          {/* Main App Route */}
          <Route
            path="/"
            element={
              <>
                <div className="headder">
                  <h1>Muusic(k)</h1>
                </div>
                <div className="search-bar-container">
                  <SearchBar setResults={setResults} accessToken={accessToken} />
                  <SearchResultsList
                    results={results}
                    onAddToSpotify={handleAddToPlaylist}
                  />
                </div>
                {playlist && (
                  <div className="playlist-display">
                    <h2>Playlist: {playlist.name}</h2>
                    <div className="playlist-tracks">
                      {playlistTracks.length > 0 ? (
                        playlistTracks.map((track, index) => (
                          <div key={index} className="playlist-track">
                            <img
                              src={track.imageUrl}
                              alt={track.name}
                              style={{ width: '50px', height: '50px' }}
                            />
                            <div>
                              <h3>{track.name}</h3>
                              <p>
                                {track.artist} - {track.album}
                              </p>
                              <a
                                href={track.externalUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                Listen on Spotify
                              </a>
                            </div>
                          </div>
                        ))
                      ) : (
                        <p>No tracks added yet.</p>
                      )}
                    </div>
                  </div>
                )}
              </>
            }
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
