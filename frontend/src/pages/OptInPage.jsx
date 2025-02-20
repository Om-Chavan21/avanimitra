import React, { useState, useRef, useEffect } from "react";
import {
    TextField,
    Button,
    Box,
    InputAdornment,
    IconButton,
} from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import axios from "axios"; // Import Axios
import { validateFullName, validateWhatsAppNumber } from "../utils/validation";
import PasswordTextField from "../components/PasswordTextField";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const OptInPage = () => {
    const [fullName, setFullName] = useState("");
    const [whatsAppNumber, setWhatsAppNumber] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [optInDisabled, setOptInDisabled] = useState(true);
    const [showPassword, setShowPassword] = useState(false);
    const [fullNameError, setFullNameError] = useState("");
    const [whatsAppNumberError, setWhatsAppNumberError] = useState("");
    const fullNameField = useRef(null);
    const navigate = useNavigate();

    useEffect(() => {
        if (fullNameField.current) {
            fullNameField.current.focus();
        }
    }, []);

    const handleFullNameChange = (event) => {
        const name = event.target.value;
        setFullName(name);
        setFullNameError(validateFullName(name));
    };

    const handleWhatsAppNumberChange = (event) => {
        const value = event.target.value;
        if (/^\d{0,10}$/.test(value)) {
            setWhatsAppNumber(value);
            setWhatsAppNumberError(validateWhatsAppNumber(value));
        }
    };

    const handlePasswordChange = (event) => {
        setPassword(event.target.value);
    };

    const handleConfirmPasswordChange = (event) => {
        setConfirmPassword(event.target.value);
        if (event.target.value.length >= 8) {
            setOptInDisabled(false);
        } else {
            setOptInDisabled(true);
        }
    };

    const handleShowConfirmPassword = () => {
        const nameError = validateFullName(fullName);
        const numberError = validateWhatsAppNumber(whatsAppNumber);

        setFullNameError(nameError);
        setWhatsAppNumberError(numberError);

        if (nameError === "" && numberError === "") {
            setShowConfirmPassword(true);
        }
    };

    const handleOptIn = async () => {
        try {
            const response = await axios.post(
                "http://localhost:8000/register/",
                {
                    name: fullName,
                    phone_number: whatsAppNumber,
                    password: password,
                }
            );

            console.log("Registration successful", response.data);
            toast.success("Registration successful!");

            // Navigate to complete profile page
            navigate("/complete-profile", {
                state: {
                    name: fullName,
                    whatsAppNumber: whatsAppNumber,
                    id: response.data.id, // Pass the new user ID
                },
            });
        } catch (error) {
            console.error(
                "Registration failed",
                error.response ? error.response.data : error.message
            );
            toast.error(
                error.response?.data?.detail ||
                    "Registration failed. Please try again."
            );
        }
    };

    useEffect(() => {
        if (password === confirmPassword && confirmPassword.length >= 8) {
            setOptInDisabled(false);
        } else {
            setOptInDisabled(true);
        }
    }, [password, confirmPassword]);

    const handleClickShowPassword = () => {
        setShowPassword(!showPassword);
    };

    const handleMouseDownPassword = (event) => {
        event.preventDefault();
    };

    const optInButtonStyle = {
        backgroundColor: "var(--color-g3)",
        marginTop: "2rem",
        color: "white",
        "&:disabled": {
            backgroundColor: "#cccccc",
            color: "#666666",
        },
    };

    const confirmPasswordButtonStyle = {
        backgroundColor: "var(--color-y2)",
        marginTop: "1rem",
    };

    return (
        <div className="flex flex-col justify-center items-center h-screen bg-gray-100">
            <Box className="bg-white rounded-lg shadow-xl p-8 w-full max-w-md">
                <h2
                    className="text-2xl font-semibold mb-6 text-center"
                    style={{ color: "var(--color-g1)" }}
                >
                    Join Us!
                </h2>
                <TextField
                    inputRef={fullNameField}
                    id="full-name"
                    variant="outlined"
                    label="Full Name"
                    required
                    fullWidth
                    margin="normal"
                    inputProps={{
                        minLength: 4,
                        maxLength: 30,
                    }}
                    value={fullName}
                    onChange={handleFullNameChange}
                    error={!!fullNameError}
                    helperText={fullNameError}
                />
                <TextField
                    id="whatsapp-mobile"
                    variant="outlined"
                    label="WhatsApp Number"
                    fullWidth
                    margin="normal"
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                +91
                            </InputAdornment>
                        ),
                    }}
                    required
                    value={whatsAppNumber}
                    onChange={handleWhatsAppNumberChange}
                    error={!!whatsAppNumberError}
                    helperText={whatsAppNumberError}
                />
                <PasswordTextField
                    id="password"
                    label="Create Password"
                    fullWidth
                    margin="normal"
                    required
                    inputProps={{
                        minLength: 8,
                    }}
                    value={password}
                    onChange={handlePasswordChange}
                    showPassword={showPassword}
                    handleClickShowPassword={handleClickShowPassword}
                    handleMouseDownPassword={handleMouseDownPassword}
                />
                {!showConfirmPassword ? (
                    <Button
                        variant="contained"
                        color="primary"
                        fullWidth
                        onClick={handleShowConfirmPassword}
                        disabled={password.length < 8}
                        style={confirmPasswordButtonStyle}
                    >
                        Confirm Password
                    </Button>
                ) : (
                    <TextField
                        id="confirm-password"
                        label="Confirm Password"
                        type="password"
                        fullWidth
                        margin="normal"
                        required
                        inputProps={{
                            minLength: 8,
                        }}
                        value={confirmPassword}
                        onChange={handleConfirmPasswordChange}
                        error={
                            confirmPassword !== "" &&
                            password !== confirmPassword
                        }
                        helperText={
                            confirmPassword !== "" &&
                            password !== confirmPassword
                                ? "Passwords do not match"
                                : ""
                        }
                    />
                )}
                <Button
                    variant="contained"
                    color="primary"
                    disabled={optInDisabled}
                    onClick={handleOptIn}
                    style={optInButtonStyle}
                    fullWidth
                >
                    Opt In!
                </Button>
            </Box>
        </div>
    );
};

export default OptInPage;
