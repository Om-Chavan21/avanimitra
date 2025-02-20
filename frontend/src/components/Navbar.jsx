import React, { useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AppBar, Toolbar, Button, Box } from "@mui/material";
import { AuthContext } from "../App";

const Navbar = () => {
    const auth = useContext(AuthContext);
    const navigate = useNavigate();

    const handleSignOut = () => {
        auth.logout();
        navigate("/login");
    };

    return (
        <AppBar
            position="static"
            style={{ backgroundColor: "var(--color-g1)" }}
        >
            <Toolbar>
                <Box display="flex" justifyContent="space-between" width="100%">
                    <Box>
                        <Button color="inherit" component={Link} to="/home">
                            Home
                        </Button>
                    </Box>
                    {auth.isLoggedIn ? (
                        <Box>
                            <Button
                                color="inherit"
                                component={Link}
                                to="/edit-profile"
                            >
                                Edit Profile
                            </Button>
                            <Button color="inherit" onClick={handleSignOut}>
                                Sign Out
                            </Button>
                        </Box>
                    ) : (
                        <>
                            <Button
                                color="inherit"
                                component={Link}
                                to="/login"
                            >
                                Login
                            </Button>
                            {/* Optionally add a sign-up button */}
                            {/*<Button color="inherit" component={Link} to="/opt-in">Sign Up</Button>*/}
                        </>
                    )}
                </Box>
            </Toolbar>
        </AppBar>
    );
};

export default Navbar;
