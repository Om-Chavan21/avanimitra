import { AppBar, Button, Toolbar, Typography, Box } from '@mui/material';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const auth = useAuth();
  // Add a check to ensure auth exists before destructuring
  const isAuthenticated = auth?.isAuthenticated;
  const user = auth?.user;
  const logout = auth?.logout;

  return (
    <AppBar position="static">
      <Toolbar>
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          <Link to="/" className="text-white no-underline">
            Authentication App
          </Link>
        </Typography>
        
        {isAuthenticated ? (
          <Box>
            {user?.is_admin && (
              <Button 
                color="inherit" 
                component={Link} 
                to="/admin-dashboard"
              >
                Admin Dashboard
              </Button>
            )}
            <Button 
              color="inherit" 
              component={Link} 
              to="/dashboard"
            >
              Dashboard
            </Button>
            <Button color="inherit" onClick={logout}>
              Logout
            </Button>
          </Box>
        ) : (
          <Box>
            <Button color="inherit" component={Link} to="/login">
              Login
            </Button>
            <Button color="inherit" component={Link} to="/signup">
              Sign Up
            </Button>
            <Button color="inherit" component={Link} to="/admin-login">
              Admin Login
            </Button>
          </Box>
        )}
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;
