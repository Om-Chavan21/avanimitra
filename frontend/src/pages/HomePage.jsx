import React, { useContext } from "react";
import { Box, Typography } from "@mui/material";
import { AuthContext } from "../App";

const HomePage = () => {
    const auth = useContext(AuthContext);

    return (
        <div className="flex flex-col justify-center items-center h-screen bg-gray-100">
            <Box className="bg-white rounded-lg shadow-xl p-8 w-full max-w-md">
                {auth.isLoggedIn ? (
                    <>
                        <Typography
                            variant="h4"
                            component="h2"
                            className="text-center mb-4"
                        >
                            Welcome back!
                        </Typography>
                        <Typography variant="body1" className="text-center">
                            You are logged in successfully.
                        </Typography>
                    </>
                ) : (
                    <>
                        <Typography
                            variant="h4"
                            component="h2"
                            className="text-center mb-4"
                        >
                            Welcome!
                        </Typography>
                        <Typography variant="body1" className="text-center">
                            Please log in or sign up to continue.
                        </Typography>
                    </>
                )}
            </Box>
        </div>
    );
};

export default HomePage;
