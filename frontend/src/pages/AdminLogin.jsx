import React, { useState } from 'react';
import { Box, TextField, Button, Paper, Typography } from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { adminApiClient } from '../apiClient';
import { toast } from 'react-toastify';

function AdminLogin() {
  const [mobileNumber, setMobileNumber] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({ mobileNumber: '', password: '' });
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/admin/dashboard';

  const validateForm = () => {
    let hasErrors = false;
    const newErrors = { ...errors };

    if (!mobileNumber || mobileNumber.length < 10) {
      newErrors.mobileNumber = 'Please enter a valid mobile number';
      hasErrors = true;
    } else {
      newErrors.mobileNumber = '';
    }

    if (!password) {
      newErrors.password = 'Password is required';
      hasErrors = true;
    } else {
      newErrors.password = '';
    }

    setErrors(newErrors);
    return !hasErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      const formData = new FormData();
      formData.append('username', mobileNumber);
      formData.append('password', password);

      const response = await adminApiClient.post('/token', formData);
      const { access_token } = response.data;

      localStorage.setItem('adminToken', access_token);

      navigate(from, { replace: true });
    } catch (error) {
      console.error(error);
      if (error.response.status === 403) {
        toast.error('You do not have admin privileges');
      } else {
        toast.error(error.response?.data?.detail || 'Login failed');
      }
    }
  };

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: 'calc(100vh - 64px)', // Adjust for navbar height
        padding: 2,
      }}
    >
      <Paper
        elevation={3}
        sx={{
          p: 4,
          maxWidth: 400,
          width: '100%',
        }}
      >
        <Typography variant="h5" component="h1" gutterBottom textAlign="center">
          Admin Login
        </Typography>
        <form onSubmit={handleSubmit}>
          <TextField
            label="Mobile Number"
            value={mobileNumber}
            onChange={(e) => setMobileNumber(e.target.value)}
            sx={{ marginBottom: 2 }}
            className="w-full"
            error={!!errors.mobileNumber}
            helperText={errors.mobileNumber}
          />
          <TextField
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            sx={{ marginBottom: 2 }}
            className="w-full"
            error={!!errors.password}
            helperText={errors.password}
          />
          <Button
            type="submit"
            variant="contained"
            fullWidth
            sx={{ mt: 3, mb: 2 }}
          >
            Login
          </Button>
        </form>
      </Paper>
    </Box>
  );
}

export default AdminLogin;
