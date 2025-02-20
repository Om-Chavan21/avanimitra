import React, { useState, useEffect } from "react";
import {
    BrowserRouter as Router,
    Route,
    Routes,
    Navigate,
    useLocation,
} from "react-router-dom";
import OptInPage from "./pages/OptInPage";
import CompleteProfilePage from "./pages/CompleteProfilePage";
import LoginPage from "./pages/LoginPage";
import EditProfilePage from "./pages/EditProfilePage";
import HomePage from "./pages/HomePage";
import Navbar from "./components/Navbar";
import "./App.css";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// Create a context for authentication
export const AuthContext = React.createContext(null);

// Protected Route component
function ProtectedRoute({ children }) {
    const auth = useAuth();
    const location = useLocation();

    if (!auth.isLoggedIn) {
        return (
            <Navigate to="/login" replace state={{ path: location.pathname }} />
        );
    }

    return children;
}

// Custom hook for authentication
function useAuth() {
    const [auth, setAuth] = useState({
        isLoggedIn: false,
        user: null,
        token: null,
    });

    useEffect(() => {
        const storedToken = localStorage.getItem("token");
        const storedUser = localStorage.getItem("user");

        if (storedToken && storedUser) {
            setAuth({
                isLoggedIn: true,
                user: JSON.parse(storedUser),
                token: storedToken,
            });
        }
    }, []);

    const login = (user, token) => {
        localStorage.setItem("token", token);
        localStorage.setItem("user", JSON.stringify(user));
        setAuth({ isLoggedIn: true, user: user, token: token });
    };

    const logout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        setAuth({ isLoggedIn: false, user: null, token: null });
    };

    return {
        ...auth,
        login,
        logout,
    };
}

function App() {
    return (
        <AuthContext.Provider value={useAuth()}>
            <Router>
                <Navbar />
                <ToastContainer
                    position="top-right"
                    autoClose={5000}
                    hideProgressBar={false}
                    newestOnTop={false}
                    closeOnClick
                    rtl={false}
                    pauseOnFocusLoss
                    draggable
                    pauseOnHover
                    theme="light"
                />
                <Routes>
                    <Route path="/" element={<Navigate to="/home" />} />
                    <Route path="/opt-in" element={<OptInPage />} />
                    <Route path="/login" element={<LoginPage />} />
                    <Route
                        path="/complete-profile"
                        element={
                            <ProtectedRoute>
                                <CompleteProfilePage />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/edit-profile"
                        element={
                            <ProtectedRoute>
                                <EditProfilePage />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/home"
                        element={
                            <ProtectedRoute>
                                <HomePage />
                            </ProtectedRoute>
                        }
                    />
                </Routes>
            </Router>
        </AuthContext.Provider>
    );
}

export default App;
