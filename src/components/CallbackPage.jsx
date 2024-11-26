import { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';

const CallbackPage = ({ setAccessToken, getAccessToken }) => {
  const [searchParams] = useSearchParams();
  const code = searchParams.get('code');

  useEffect(() => {
    if (code) {
      console.log('Authorization Code:', code);
      // Exchange the code for an access token
      getAccessToken(code)
        .then((token) => {
          setAccessToken(token);
          console.log('AccessToken Set:', token);
        })
        .catch((error) => console.error('Error fetching access token:', error));
    } else {
      console.error('Authorization code missing.');
    }
  }, [code, setAccessToken, getAccessToken]);

  return <div>Processing your authentication...</div>;
};

export default CallbackPage;
