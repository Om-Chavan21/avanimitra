import { Container, Typography, Paper, Box } from '@mui/material';
import { useAuth } from '../context/AuthContext';

const UserDashboard = () => {
  const { user } = useAuth();

  return (
    <Container maxWidth="md">
      <Paper elevation={3} className="p-6 mt-8">
        <Typography variant="h4" component="h1" gutterBottom>
          User Dashboard
        </Typography>
        
        <Typography variant="body1" paragraph>
          Welcome to your dashboard! You are logged in as a regular user.
        </Typography>
        
        <Box className="mt-4 p-4 bg-gray-100 rounded-lg">
          <Typography variant="h6" gutterBottom>
            Your Account Information:
          </Typography>
          <Typography>
            User ID: {user?.id}
          </Typography>
        </Box>
        
        <Box className="mt-6">
          <Typography variant="body1">
            This is the protected user dashboard page. Only authenticated users can access this page.
          </Typography>
        </Box>
      </Paper>
    </Container>
  );
};

export default UserDashboard;
