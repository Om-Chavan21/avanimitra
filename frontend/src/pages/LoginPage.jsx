import React, { useState, useContext } from "react";
import {
    TextField,
    Button,
    Box,
    Typography,
    Link as MuiLink,
} from "@mui/material";
import { Link, useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import { AuthContext } from "../App";

const LoginPage = () => {
    const [phoneNumber, setPhoneNumber] = useState("");
    const [password, setPassword] = useState("");
    const navigate = useNavigate();
    const location = useLocation();
    const auth = useContext(AuthContext);

    const handleSubmit = async (event) => {
        event.preventDefault();
        try {
            const response = await axios.post(
                "http://localhost:8000/token",
                new URLSearchParams({
                    username: phoneNumber,
                    password: password,
                }),
                {
                    headers: {
                        "Content-Type": "application/x-www-form-urlencoded",
                    },
                }
            );
            auth.login(phoneNumber, response.data.access_token);
            toast.success("Login successful!");
            navigate("/home"); // Redirect to home page after successful login
        } catch (error) {
            console.error("Login failed", error);
            toast.error("Invalid credentials");
        }
    };

    return (
        <div className="flex flex-col justify-center items-center h-screen bg-gray-100">
            <Box className="bg-white rounded-lg shadow-xl p-8 w-full max-w-md">
                <Typography
                    variant="h5"
                    component="h2"
                    className="text-center mb-4"
                >
                    Login
                </Typography>
                <form onSubmit={handleSubmit}>
                    <TextField
                        label="WhatsApp Number"
                        variant="outlined"
                        fullWidth
                        margin="normal"
                        required
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                    />
                    <TextField
                        label="Password"
                        variant="outlined"
                        fullWidth
                        margin="normal"
                        type="password"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                    <Button
                        type="submit"
                        variant="contained"
                        color="primary"
                        fullWidth
                        style={{ marginTop: "1rem" }}
                    >
                        Login
                    </Button>
                </form>
                <Typography
                    variant="body2"
                    className="text-center mt-4"
                    style={{ color: "var(--color-g1)" }}
                >
                    Don't have an account?{" "}
                    <Link to="/opt-in" style={{ color: "var(--color-y2)" }}>
                        Sign up
                    </Link>
                </Typography>
            </Box>
        </div>
    );
};

export default LoginPage;
