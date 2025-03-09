import { createContext, useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';

// Create the context
const AuthContext = createContext(null); // Initialize with null instead of undefined

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  // Check if user is logged in on mount
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token');
      
      if (token) {
        try {
          const response = await api.get('/me', {
            headers: {
              Authorization: `Bearer ${token}`
            }
          });
          
          setUser(response.data);
          setIsAuthenticated(true);
        } catch (error) {
          localStorage.removeItem('token');
        }
      }
      
      setIsLoading(false);
    };

    checkAuth();
  }, []);

  // Login function
  const login = async (phone, password) => {
    try {
      const response = await api.post('/login', { phone, password });
      const { access_token, user_id, is_admin } = response.data;
      
      localStorage.setItem('token', access_token);
      setUser({ id: user_id, is_admin });
      setIsAuthenticated(true);
      
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        message: error.response?.data?.detail || 'Login failed'
      };
    }
  };

  // Admin login function
  const adminLogin = async (phone, password) => {
    try {
      const response = await api.post('/admin-login', { phone, password });
      const { access_token, user_id, is_admin } = response.data;
      
      localStorage.setItem('token', access_token);
      setUser({ id: user_id, is_admin });
      setIsAuthenticated(true);
      
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        message: error.response?.data?.detail || 'Admin login failed'
      };
    }
  };

  // Signup function
  const signup = async (userData) => {
    try {
      await api.post('/signup', userData);
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        message: error.response?.data?.detail || 'Signup failed'
      };
    }
  };

  // Logout function
  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    setIsAuthenticated(false);
    navigate('/');
  };

  const value = {
    user,
    isAuthenticated,
    isLoading,
    login,
    adminLogin,
    signup,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {!isLoading && children}
    </AuthContext.Provider>
  );
};

// Create custom hook for using the auth context
export const useAuth = () => {
  return useContext(AuthContext);
};
