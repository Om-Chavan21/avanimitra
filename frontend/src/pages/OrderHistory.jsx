import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Container, Typography, Box, Paper, Tabs, Tab, 
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Button, Chip, CircularProgress
} from '@mui/material';
import { format } from 'date-fns';
import api from '../utils/api';

const OrderHistory = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [tabValue, setTabValue] = useState(0);
  
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await api.get('/orders', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        setOrders(response.data);
      } catch (error) {
        setError('Failed to fetch orders');
        console.error('Error fetching orders:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchOrders();
  }, []);
  
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };
  
  const getStatusColor = (status) => {
    switch(status) {
      case 'pending':
        return 'warning';
      case 'processing':
        return 'info';
      case 'shipped':
        return 'primary';
      case 'delivered':
        return 'success';
      case 'cancelled':
        return 'error';
      default:
        return 'default';
    }
  };
  
  const formatDate = (dateString) => {
    return format(new Date(dateString), 'dd MMM yyyy, h:mm a');
  };
  
  const activeOrders = orders.filter(order => 
    ['pending', 'processing', 'shipped'].includes(order.order_status)
  );
  
  const pastOrders = orders.filter(order => 
    ['delivered', 'cancelled'].includes(order.order_status)
  );
  
  const displayOrders = tabValue === 0 ? activeOrders : pastOrders;

  if (loading) {
    return (
      <Container maxWidth="lg" className="py-8">
        <Box display="flex" justifyContent="center" p={4}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" className="py-8">
      <Typography variant="h4" component="h1" gutterBottom>
        Your Orders
      </Typography>
      
      <Paper className="mb-6">
        <Tabs 
          value={tabValue} 
          onChange={handleTabChange}
          indicatorColor="primary"
          textColor="primary"
          centered
        >
          <Tab label={`Active Orders (${activeOrders.length})`} />
          <Tab label={`Past Orders (${pastOrders.length})`} />
        </Tabs>
      </Paper>
      
      {error ? (
        <Paper className="p-4 text-center text-red-500">
          {error}
        </Paper>
      ) : displayOrders.length === 0 ? (
        <Paper className="p-6 text-center">
          <Typography variant="h6">
            {tabValue === 0 ? "No active orders" : "No past orders"}
          </Typography>
          <Button 
            variant="contained" 
            color="primary" 
            component={Link} 
            to="/" 
            className="mt-4"
          >
            Shop Now
          </Button>
        </Paper>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Order Date</TableCell>
                <TableCell>Order ID</TableCell>
                <TableCell>Items</TableCell>
                <TableCell>Total Amount</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Action</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {displayOrders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell>{formatDate(order.order_date)}</TableCell>
                  <TableCell>#{order.id.substring(0, 8)}</TableCell>
                  <TableCell>{order.items.length} items</TableCell>
                  <TableCell>₹{order.total_amount.toFixed(2)}</TableCell>
                  <TableCell>
                    <Chip 
                      label={order.order_status.toUpperCase()} 
                      color={getStatusColor(order.order_status)} 
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Button 
                      variant="outlined" 
                      size="small" 
                      component={Link} 
                      to={`/orders/${order.id}`}
                    >
                      View Details
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Container>
  );
};

export default OrderHistory;
