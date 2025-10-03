import React, { useContext, useEffect, useState } from 'react';
import AuthContext from '../../context/AuthContext';
import type { User } from '../../context/AuthContext';

const Home: React.FC = () => {
  const { user, logout, getProfile } = useContext(AuthContext);
  const [profile, setProfile] = useState<User | null>(user);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    async function fetchProfile() {
      try {
        const data = await getProfile();
        setProfile(data);
      } catch (err: any) {
        let message = 'Failed to load profile.';
        if (err?.response?.data?.message) message = err.response.data.message;
        else if (err?.message) message = err.message;
        else if (typeof err === 'string') message = err;
        setError(message);
      }
    }
    fetchProfile();
  }, [getProfile]); // Only run once on mount

  return (
    <div style={{ maxWidth: 720, margin: '40px auto' }}>
      <h1>Welcome {profile?.name || 'User'}</h1>
      <p>Email: {profile?.email}</p>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <button onClick={logout}>Logout</button>
    </div>
  );
};

export default Home;