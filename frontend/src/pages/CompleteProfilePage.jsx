import React, { useState, useEffect, useContext } from "react";
import { TextField, Button, Box } from "@mui/material";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { validateAddress, validateAreaOfResidence } from "../utils/validation";
import { AuthContext } from "../App"; // Import AuthContext

const CompleteProfilePage = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [address, setAddress] = useState("");
    const [areaOfResidence, setAreaOfResidence] = useState("");
    const [googleMapsLink, setGoogleMapsLink] = useState("");
    const [addressError, setAddressError] = useState("");
    const [areaOfResidenceError, setAreaOfResidenceError] = useState("");
    const [optInButtonDisabled, setOptInButtonDisabled] = useState(true);
    const auth = useContext(AuthContext); // Use the auth context

    // Extract name, WhatsApp number, and id from location state
    const { name, whatsAppNumber, id } = location.state || {};

    useEffect(() => {
        // Check if required fields are filled
        if (
            address &&
            areaOfResidence &&
            !addressError &&
            !areaOfResidenceError
        ) {
            setOptInButtonDisabled(false);
        } else {
            setOptInButtonDisabled(true);
        }
    }, [address, areaOfResidence, addressError, areaOfResidenceError]);

    useEffect(() => {
        setAddressError(validateAddress(address));
    }, [address]);

    useEffect(() => {
        setAreaOfResidenceError(validateAreaOfResidence(areaOfResidence));
    }, [areaOfResidence]);

    const handleAddressChange = (event) => {
        setAddress(event.target.value);
        setAddressError(validateAddress(event.target.value));
    };

    const handleAreaOfResidenceChange = (event) => {
        setAreaOfResidence(event.target.value);
        setAreaOfResidenceError(validateAreaOfResidence(event.target.value));
    };

    const handleGoogleMapsLinkChange = (event) => {
        setGoogleMapsLink(event.target.value);
    };

    const handleSubmit = async () => {
        const payload = {
            name: name,
            phone_number: whatsAppNumber,
            address: address,
            area_of_residence: areaOfResidence,
            google_maps_link: googleMapsLink,
            password: "password",
        };

        try {
            const response = await axios.put(
                `http://localhost:8000/customers/${id}`,
                payload,
                {
                    headers: {
                        Authorization: `Bearer ${auth.token}`,
                    },
                }
            );
            console.log("Response:", response.data);
            toast.success("Profile completed and data sent successfully!");
            // After successful submission, log the user in automatically
            auth.login(name, auth.token); // You might need to adjust this

            navigate("/home"); // Redirect to home page after successful submission
        } catch (error) {
            console.error("Error:", error);
            toast.error("Failed to submit profile. Please try again.");
            if (error.response) {
                console.log("Data:", error.response.data);
                console.log("Status:", error.response.status);
                console.log("Headers:", error.response.headers);
                toast.error(
                    `Server responded with an error: ${error.response.status}`
                );
            } else if (error.request) {
                console.log(error.request);
                toast.error("No response received from the server.");
            } else {
                console.log("Error", error.message);
                toast.error(`Error setting up the request: ${error.message}`);
            }
        }
    };

    const profileButtonStyle = {
        backgroundColor: "var(--color-g3)",
        marginTop: "2rem",
        color: "white",
        "&:disabled": {
            backgroundColor: "#cccccc",
            color: "#666666",
        },
    };

    return (
        <div className="flex flex-col justify-center items-center h-screen bg-gray-100">
            <Box className="bg-white rounded-lg shadow-xl p-8 w-full max-w-md">
                <h2
                    className="text-2xl font-semibold mb-6 text-center"
                    style={{ color: "var(--color-g1)" }}
                >
                    Complete Your Profile
                </h2>
                <TextField
                    id="full-name"
                    label="Full Name"
                    variant="outlined"
                    fullWidth
                    margin="normal"
                    value={name} // Display name
                    InputProps={{
                        readOnly: true,
                    }}
                />
                <TextField
                    id="whatsapp-mobile"
                    label="WhatsApp Number"
                    variant="outlined"
                    fullWidth
                    margin="normal"
                    value={whatsAppNumber} // Display WhatsApp number
                    InputProps={{
                        readOnly: true,
                    }}
                />
                <TextField
                    id="address"
                    label="Address"
                    variant="outlined"
                    fullWidth
                    margin="normal"
                    required
                    value={address}
                    onChange={handleAddressChange}
                    error={!!addressError}
                    helperText={addressError}
                />
                <TextField
                    id="area-of-residence"
                    label="Area of Residence"
                    variant="outlined"
                    fullWidth
                    margin="normal"
                    required
                    value={areaOfResidence}
                    onChange={handleAreaOfResidenceChange}
                    error={!!areaOfResidenceError}
                    helperText={areaOfResidenceError}
                />
                <TextField
                    id="google-maps-link"
                    label="Google Maps Link (Optional)"
                    variant="outlined"
                    fullWidth
                    margin="normal"
                    value={googleMapsLink}
                    onChange={handleGoogleMapsLinkChange}
                />
                <Button
                    variant="contained"
                    color="primary"
                    onClick={handleSubmit}
                    style={profileButtonStyle}
                    fullWidth
                    disabled={optInButtonDisabled}
                >
                    Complete Profile
                </Button>
            </Box>
        </div>
    );
};

export default CompleteProfilePage;
