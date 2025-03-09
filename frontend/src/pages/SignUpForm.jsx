import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { Box, TextField, Button, Autocomplete } from '@mui/material';
import { useNavigate } from 'react-router-dom';

function SignUpForm() {
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [mobileNumber, setMobileNumber] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState({
    name: "",
    mobileNumber: "",
    password: "",
    confirmPassword: "",
  });
  const [formSubmitted, setFormSubmitted] = useState(false);
  const navigate = useNavigate();
  const baseURL = import.meta.env.VITE_API_URL;

  const validateForm = () => {
    let hasErrors = false;
    const newErrors = { ...errors };

    if (!name) {
      newErrors.name = "Name is required";
      hasErrors = true;
    } else {
      newErrors.name = "";
    }

    if (!mobileNumber || mobileNumber.length < 10) {
      newErrors.mobileNumber = "Mobile number must be 10 digits";
      hasErrors = true;
    } else {
      newErrors.mobileNumber = "";
    }

    if (!password || password.length < 8) {
      newErrors.password = "Password must be at least 8 characters long";
      hasErrors = true;
    } else {
      newErrors.password = "";
    }

    if (!confirmPassword || confirmPassword !== password) {
      newErrors.confirmPassword = "Passwords do not match";
      hasErrors = true;
    } else {
      newErrors.confirmPassword = "";
    }

    setErrors(newErrors);
    return hasErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormSubmitted(true);
    if (validateForm()) {
      return;
    }
    try {
      const user = {
        name: name,
        address: address,
        mobile_number: mobileNumber,
        password: password,
      };
      
      await axios.post(`${baseURL}/users/`, user);
      toast.success("User created successfully! Please log in.");
      navigate('/login');
    } catch (error) {
      console.error(error);
      if (error.response && error.response.status === 400) {
        if (error.response.data.detail.includes("Mobile number already exists")) {
          toast.error("Mobile number already exists");
        } else {
          toast.error("Failed to create user. Please try again.");
        }
      } else {
        toast.error("Failed to create user. Please try again.");
      }
    }
  };

  return (
    <Box
      className="flex justify-center items-center h-screen"
      sx={{ padding: 0 }}
    >
      <form
        onSubmit={handleSubmit}
        className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4 w-full max-w-md"
      >
        <h2 className="text-lg font-bold mb-4">Sign Up</h2>
        <TextField
          label="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          sx={{ marginBottom: 2 }}
          className="w-full"
          error={!!errors.name}
          helperText={errors.name}
          required
        />
        <TextField
          label="Address"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          sx={{ marginBottom: 2 }}
          className="w-full"
        />
        <TextField
          label="Mobile Number"
          value={mobileNumber}
          onChange={(e) => setMobileNumber(e.target.value)}
          sx={{ marginBottom: 2 }}
          className="w-full"
          error={!!errors.mobileNumber}
          helperText={errors.mobileNumber}
          required
        />
        <TextField
          label="Create Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          sx={{ marginBottom: 2 }}
          className="w-full"
          error={!!errors.password}
          helperText={errors.password}
          required
        />
        <TextField
          label="Confirm Password"
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          sx={{ marginBottom: 2 }}
          className="w-full"
          error={!!errors.confirmPassword}
          helperText={errors.confirmPassword}
          required
        />
        <Button type="submit" variant="contained" className="w-full">
          Create
        </Button>
      </form>
    </Box>
  );
}

export default SignUpForm;
