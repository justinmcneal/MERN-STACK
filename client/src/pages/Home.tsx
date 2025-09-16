import React, { useContext, useEffect, useState } from 'react';
import AuthContext, { User } from '../context/AuthContext';

const Home: React.FC = () => {
  const auth = useContext(AuthContext);

  if (!auth) throw new Error('AuthContext must be used within AuthProvider');

  const { user, logout, getProfile } = auth;
  const [profile, setProfile] = useState<User | null>(user);

  useEffect(() => {
    async function fetchProfile() {
      try {
        const data = await getProfile();
        setProfile(data);
      } catch (err) {
        console.error(err);
      }
    }
    fetchProfile();
  }, [getProfile]);

  return (
    <div style={{ maxWidth: 720, margin: '40px auto' }}>
      <h1>Welcome {profile?.name || 'User'}</h1>
      <p>Email: {profile?.email}</p>
      <button onClick={logout}>Logout</button>
    </div>
  );
};

export default Home;