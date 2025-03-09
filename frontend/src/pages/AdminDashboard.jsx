import { useState, useEffect } from 'react';
import { 
  Container, 
  Typography, 
  Paper, 
  Box, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow
} from '@mui/material';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';

const AdminDashboard = () => {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    // This is a mock function since we don't have an endpoint for this
    // In a real application, you would fetch users from the backend
    const mockUsers = [
      { id: '1', name: 'John Doe', phone: '9876543210', address: 'Mumbai, India' },
      { id: '2', name: 'Jane Smith', phone: '8765432109', address: 'Delhi, India' },
      { id: '3', name: 'Bob Johnson', phone: '7654321098', address: 'Bangalore, India' },
    ];

    // Simulate API call
    setTimeout(() => {
      setUsers(mockUsers);
      setLoading(false);
    }, 1000);

    // In a real app, you'd do something like:
    /*
    const fetchUsers = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await api.get('/users', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        setUsers(response.data);
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch users');
        setLoading(false);
      }
    };

    fetchUsers();
    */
  }, []);

  return (
    <Container maxWidth="lg">
      <Paper elevation={3} className="p-6 mt-8">
        <Typography variant="h4" component="h1" gutterBottom>
          Admin Dashboard
        </Typography>
        
        <Typography variant="body1" paragraph>
          Welcome to the admin dashboard! You have administrator privileges.
        </Typography>
        
        <Box className="mt-4 mb-6 p-4 bg-gray-100 rounded-lg">
          <Typography variant="h6" gutterBottom>
            Admin Information:
          </Typography>
          <Typography>
            Admin ID: {user?.id}
          </Typography>
        </Box>
        
        <Typography variant="h5" gutterBottom className="mt-8">
          User Management
        </Typography>
        
        {loading ? (
          <Typography>Loading users...</Typography>
        ) : error ? (
          <Typography color="error">{error}</Typography>
        ) : (
          <TableContainer component={Paper} className="mt-4">
            <Table>
              <TableHead>
                <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                  <TableCell><strong>Name</strong></TableCell>
                  <TableCell><strong>Phone</strong></TableCell>
                  <TableCell><strong>Address</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>{user.name}</TableCell>
                    <TableCell>+91 {user.phone}</TableCell>
                    <TableCell>{user.address}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>
    </Container>
  );
};

export default AdminDashboard;
