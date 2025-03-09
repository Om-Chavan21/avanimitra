import React, { useState } from 'react';
import { Box, TextField, Button, Paper, Typography } from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function Login() {
  const [mobileNumber, setMobileNumber] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({ mobileNumber: '', password: '' });
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  const from = location.state?.from?.pathname || '/';

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

    const success = await login(mobileNumber, password);
    if (success) {
      navigate(from, { replace: true });
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
          Login
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
          <Typography variant="body2" align="center">
            Don't have an account?{' '}
            <Button variant="text" onClick={() => navigate('/signup')}>
              Sign Up
            </Button>
          </Typography>
        </form>
      </Paper>
    </Box>
  );
}

export default Login;
