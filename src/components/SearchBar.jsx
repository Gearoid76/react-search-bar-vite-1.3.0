// src/components/SearchBar.jsx
import React, { useState, useEffect } from 'react';
import { FaSearch } from 'react-icons/fa';
import '../App.css';
export const SearchBar = ({ setResults, accessToken }) => {
  const [input, setInput] = useState("");
  console.log("access_token", accessToken);

  useEffect(() => {
    console.log('Input at value:', input);
    if (accessToken) {
      console.log("Access Token Available:", accessToken); // Debugging line
    }else {
      console.error("Access token missing");
    }
  }, [accessToken]);

  const fetchData = (value) => {
    console.log("Fetching data for:", value); // Debugging line
    if (!accessToken) {
      console.error("No access token available");
      return;
    }
    const hardcodedAccessToken = "BQDw6fPlZi_3B-LD0c_sGOd-VfyZryuRRB6jcn3CZZEULOjNNHQAvbmYSk4XihHZEbOEzsOyWczLmjleKdDyyM7XchgBIGWyW6Gd3INfFMrqy9UtaYMllBvgMT9RA9bmZLZxVo6ux2PEh3FOgqdVY0dN1wPt200ML956VrWxSABpBLX_LFqvebW2bPNsnhTstPBJn8rE9ivCo70Z4_YDvwzTli9VistGLxgHuwdFweVzVVsvq9VZy2UeI_QZZxSfyKGu1i-2b6l7aDxOU4ec";
    const query = encodeURIComponent(value);
    fetch(`https://api.spotify.com/v1/search?q=${query}&type=track&limit=10`, {
      headers: {
        Authorization: `Bearer ${hardcodedAccessToken}`
      }
    })
      .then((response) => response.json())
      .then((data) => {
        console.log("spotify API response", data);
        if (data.tracks) {
          const results = data.tracks.items.map((track) => ({
            id: track.id,
            name: track.name,
            artist: track.artists[0].name,
            album: track.album.name,
            imageUrl: track.album.images[0]?.url,
            externalUrl: track.external_urls.spotify,
            spotifyUri: track.uri
          }));
          setResults(results);
        }
      })
      .catch((error) => console.error("Error fetching data from Spotify:", error));
  };

  const handleChange = (value) => {
    console.log('input changed:', value);
    setInput(value);
    if (value && accessToken) { 
      fetchData(value);
    } else {
      setResults([]);
    }
  };

  return (
    <div className='input-wrapper'>
      <input
        placeholder='Type to search..'
        value={input}
        onChange={(e) => handleChange(e.target.value)}
        //disabled={!accessToken} // Disable input if no access token is available
      />
      <FaSearch id="search-icon" />
    </div>
  );
};

