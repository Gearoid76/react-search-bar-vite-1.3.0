//src/auth.js
import axios from 'axios'
const client_secret = import.meta.env.VITE_CLIENT_SECRET;
const client_id = import.meta.env.VITE_CLIENT_ID;
const code = new URLSearchParams(window.location.search).get('code');
const authEndpoint = 'https://accounts.spotify.com/api/token';

if (code) {
    getAccessToken(client_id, client_secret, code).then(accessToken => {
        if (accessToken) {
            console.log("Successfully obtained access token:", accessToken);
            fetch('https://api.spotify.com/v1/me', {
                headers: {
                    'Authorization': `Bearer ${accessToken}`
                }
            })
            .then(response => response.json())
            .then(data => console.log(data))
            .catch(error => console.error('Error:', error));
            localStorage.setItem("Access2 Token:",accessToken);
        }
    });
}

export async function redirectToAuthCodeFlow(clientId) {
    const verifier = generateCodeVerifier(128);
    const challenge = await generateCodeChallenge(verifier);

    localStorage.setItem("verifier", verifier);

    const redirect_uri = import.meta.env.VITE_REDIRECT_URI || "http://localhost:5173/callback";

    const params = new URLSearchParams();
    params.append("client_id", clientId);
    params.append("response_type", "code");
    params.append("redirect_uri", redirect_uri);
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
    const redirect_uri = import.meta.env.VITE_REDIRECT_URI || "http://localhost:5173/callback";

    if (!verifier) {
        console.error("Code verifier not found");
        console.log("this is the verifier", verifier);
        return;
    }
    // this was in the original tutorial thought it would help me get my access_token
    const params = new URLSearchParams();  
    params.append("client_id", clientId);
    params.append("client_secret", clientSecret);
    params.append("grant_type", "authorization_code");
    params.append("redirect_uri", redirect_uri);
    params.append("code", code);
    params.append("code_verifier", verifier);


    try {
        const result = await axios.post(authEndpoint, null, {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Authorization': `Basic ${btoa(`${clientId}:${clientSecret}`)}`
            },
            params: {
                grant_type: 'client_credentials'
            }
        });
        return result.data.access_token;

        //const result = await fetch("https://accounts.spotify.com/api/token", null {
            //method: "POST",
            //headers: {
            //    'Content-Type': 'application/x-www-form-urlencoded',
            //    'Authorization': `Basic ${btoa(`${clientId}:${clientSecret}`)}`
            //},
            //params: {
            //    grant_type: 'client_credentials'
            //  }
        //});
        //return result.data.access_token;

        if (!result.ok) {
            console.error("Error fetching access token:", result.status, result.statusText);
            const errorResponse = await result.text();
            console.error("Error details:", errorResponse);
            return;
        }

        const data = await result.json();
        console.log("data.Access Token:", data.access_token);
        console.log("Token Type:", data.token_type);
        console.log("Expires In:", data.expires_in);
        console.log("Refresh Token:", data.refresh_token);
        console.log("Scope:", data.scope);

        return data.access_token;
    } catch (error) {
        console.error("Error during fetch operation:", error);
    }
}
