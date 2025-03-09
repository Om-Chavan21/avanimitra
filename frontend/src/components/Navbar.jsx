import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function Navbar() {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <nav className="flex justify-between items-center bg-gray-800 text-white py-4">
      <Link to="/" className="pl-4">
        Home
      </Link>
      {isAuthenticated ? (
        <>
          <Link to="/profile" className="px-4">
            Profile
          </Link>
          <button onClick={handleLogout} className="px-4">
            Logout
          </button>
        </>
      ) : (
        <>
          <Link to="/login" className="px-4">
            Login
          </Link>
          <Link to="/signup" className="px-4">
            Sign Up
          </Link>
        </>
      )}
    </nav>
  );
}

export default Navbar;
