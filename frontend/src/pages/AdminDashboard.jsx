import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { adminApiClient } from '../apiClient';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';

function AdminDashboard() {
  const [users, setUsers] = useState([]);
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const checkAdminLoginStatus = async () => {
      try {
        console.log('Attempting to fetch users...');
        const response = await adminApiClient.get('/admin/users');
        console.log('Users fetched successfully:', response.data);
        setUsers(response.data);
        setIsAdminLoggedIn(true);
      } catch (error) {
        console.error('Error fetching users:', error);
        if (error.response) {
          console.log('Error response:', error.response);
          if (error.response.status === 401) {
            console.log('Unauthorized. Redirecting to login...');
            navigate('/admin/login', { state: { from: location.pathname }, replace: true });
          } else {
            toast.error(error.response.data.detail || 'Failed to load users');
          }
        } else {
          toast.error('An error occurred while loading users');
        }
      }
    };
    checkAdminLoginStatus();
  }, [navigate, location.pathname]);

  if (!isAdminLoggedIn) {
    return null; // Or render a loading indicator
  }

  return (
    <div>
      <h2>Admin Dashboard</h2>
      <p>Welcome to the admin dashboard.</p>
      <h3>Users:</h3>
      <ul>
        {users.map((user) => (
          <li key={user._id}>
            {user.name} ({user.mobile_number})
          </li>
        ))}
      </ul>
    </div>
  );
}

export default AdminDashboard;
