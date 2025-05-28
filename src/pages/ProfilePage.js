import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useLocation } from 'wouter';

function ProfilePage() {
  const { user, logout } = useAuth();
  const [, setLocation] = useLocation();

  if (!user) {
    setLocation('/login');
    return null;
  }

  return (
    <div className="profile-page">
      <h2>Profil</h2>
      <p>Korisničko ime: {user.username}</p>
      <button onClick={() => { logout(); setLocation('/'); }}>
        Odjavi se
      </button>
    </div>
  );
}

export default ProfilePage;