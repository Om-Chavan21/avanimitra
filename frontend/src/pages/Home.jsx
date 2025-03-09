import { Container, Typography, Box, Button, Paper } from '@mui/material';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Home = () => {
  const { isAuthenticated, user } = useAuth();

  return (
    <Container maxWidth="md" className="mt-12">
      <Paper elevation={3} className="p-8">
        <Typography variant="h3" component="h1" align="center" gutterBottom>
          Welcome to Our Application
        </Typography>
        
        <Typography variant="body1" paragraph align="center">
          This is a demo application with authentication features including user and admin roles.
        </Typography>
        
        <Box className="flex justify-center space-x-4 mt-8">
          {isAuthenticated ? (
            <Button 
              variant="contained" 
              color="primary" 
              component={Link}
              to={user?.is_admin ? '/admin-dashboard' : '/dashboard'}
              size="large"
            >
              Go to {user?.is_admin ? 'Admin' : 'User'} Dashboard
            </Button>
          ) : (
            <>
              <Button 
                variant="contained" 
                color="primary" 
                component={Link}
                to="/signup"
                size="large"
              >
                Sign Up
              </Button>
              <Button 
                variant="outlined" 
                color="primary" 
                component={Link}
                to="/login"
                size="large"
              >
                Login
              </Button>
            </>
          )}
        </Box>
      </Paper>
    </Container>
  );
};

export default Home;
