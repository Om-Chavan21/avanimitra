import React from 'react';
import { useAuth } from '../context/AuthContext';

function Profile() {
  const { user } = useAuth();

  if (!user) {
    return <div>Please log in to view your profile.</div>;
  }

  return (
    <div>
      <h2>Profile</h2>
      <p>Name: {user.name}</p>
      <p>Address: {user.address}</p>
      <p>Mobile Number: {user.mobile_number}</p>
    </div>
  );
}

export default Profile;
