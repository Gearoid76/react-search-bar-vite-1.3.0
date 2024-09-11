//src/auth.js
import axios from 'axios'
const client_secret = import.meta.env.VITE_CLIENT_SECRET;
const client_id = import.meta.env.VITE_CLIENT_ID;
const code = new URLSearchParams(window.location.search).get('code');
localStorage.setItem('auth_code', code);
const authEndpoint = 'https://accounts.spotify.com/api/token';

export async function redirectToAuthCodeFlow(clientId) {
    const verifier = generateCodeVerifier(128);
    const challenge = await generateCodeChallenge(verifier);

    localStorage.setItem("verifier", verifier);                         //localStorage verifier

    const redirectUri = import.meta.env.VITE_REDIRECT_URI;
    console.log("redirect_uri", redirectUri);

    const params = new URLSearchParams();
    params.append("client_id", clientId);
    params.append("response_type", "code");
    params.append("redirect_uri", redirectUri); 
    params.append("scope", "user-read-private user-read-email playlist-read-private playlist-read-collaborative playlist-modify-public playlist-modify-private user-library-modify");
    params.append("code_challenge_method", "S256");
    params.append("code_challenge", challenge);

    document.location = `https://accounts.spotify.com/authorize?${params.toString()}`;
}

export function generateCodeVerifier(length) {
    let text = '';
    const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

    for (let i = 0; i < length; i++) {
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
}

export async function generateCodeChallenge(codeVerifier) {
    const data = new TextEncoder().encode(codeVerifier);
    const digest = await window.crypto.subtle.digest('SHA-256', data);
    return btoa(String.fromCharCode.apply(null, [...new Uint8Array(digest)]))
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/, '');
}

export async function getAccessToken(clientId, clientSecret, code) {
    const verifier = localStorage.getItem("verifier");
    const redirectUri = import.meta.env.VITE_REDIRECT_URI 
    const saved_code = localStorage.getItem('auth_code'); 

    const params = new URLSearchParams();  
    params.append("client_id", clientId);
    params.append("code", saved_code);                           
    //params.append("client_secret", clientSecret); 
    params.append("grant_type", "authorization_code");
    params.append("redirect_uri", redirectUri);
    params.append("code_verifier", verifier);

    console.log('Request params:', params.toString());
    console.log('code', saved_code);                              
    console.log('Client_secret', clientSecret); 
    console.log('Client_id:', clientId);

    try {
        const result = await axios.post(authEndpoint, params, {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            }
        });

        console.log("Access Token", result.data.access_token);
        return result.access_token;

            const data = await result.json();
            console.log("data.Access Token:", result.data.access_token);
            console.log("Token Type:", result.data.token_type);
            console.log("Expires In:", data.expires_in);
            console.log("Refresh Token:", data.refresh_token);
            console.log("Scope:", data.scope);
    
            return data.access_token;

        } catch (error) {
            if (error.response) {
                console.error('Error response:', error.response.data);
            } else {
                console.error('Error during fetch operation:', error);
            }
        }
    }