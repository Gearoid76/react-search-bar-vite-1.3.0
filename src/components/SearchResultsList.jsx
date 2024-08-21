//src/components/SearchResultsList.jsx
import React, { useState } from 'react';
import { SearchResult } from './SearchResult';
import { FaMinus } from 'react-icons/fa';
import '../App.css';

export const SearchResultsList = ({ results, onAddToSpotify }) => {
  const [selectedTracks, setSelectedTracks] = useState([]);
  const [playlistName, setPlaylistName] = useState('Created from Muusic(k)');

  const handleAddTrack = (track) => {
    setSelectedTracks((prevTracks) => [...prevTracks, track]);
  };

  const handleRemoveTrack = (track) => {
    setSelectedTracks((prevTracks) => prevTracks.filter(t => t.id !== track.id));
  };

  const handlePushToSpotify = () => {
    if (playlistName.trim() && selectedTracks.length > 0) {
      onAddToSpotify(selectedTracks, playlistName);
      setSelectedTracks([]); // Clear selected tracks after pushing to Spotify
    }
  };
  
  return (
    <div className='results-list'>
      {results.map((result, id) => (
        <SearchResult
          key={id}
          result={result}
          onAddTrack={() => handleAddTrack(result)}
          onRemoveTrack={() => handleRemoveTrack(result)}
          isSelected={selectedTracks.some(track => track.id === result.id)}
        />
      ))}

      {/* Playlist management UI */}
      {selectedTracks.length > 0 && (
        <div className="playlist-container">
          <input
            type="text"
            value={playlistName}
            onChange={(e) => setPlaylistName(e.target.value)}
            placeholder="Enter playlist name"
          />
          <div className="playlist-tracks">
            {selectedTracks.map(track => (
              <div key={track.id} className="playlist-track">
                <h3><p>{track.name}</p></h3><p>{track.artist} - {track.album}</p>
                <FaMinus className='minus-icon' onClick={() => handleRemoveTrack(track)} />
                
              </div>
            ))}
          </div>
          <button onClick={handlePushToSpotify}>Push to Spotify</button>
        </div>
      )}
    </div>
  );
};

