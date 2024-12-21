import React from 'react';
import { Link } from 'react-router-dom';

export function HomePage() {
  return (
    <div className="home-page">
      <h1>Welcome to Muusic(k)</h1>
      <p>Discover and create Spotify playlists effortlessly!</p>
      <Link to="/app" className="start-button">
        Get Started
      </Link>
    </div>
  );
}
