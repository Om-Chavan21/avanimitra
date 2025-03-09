import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Container, Typography, Box, Paper, Grid, Card, CardContent,
  Button, List, ListItem, ListItemText, Divider, CircularProgress
} from '@mui/material';
import InventoryIcon from '@mui/icons-material/Inventory';
import PeopleIcon from '@mui/icons-material/People';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import AddShoppingCartIcon from '@mui/icons-material/AddShoppingCart';
import { useAuth } from '../../context/AuthContext';
import api from '../../utils/api';

const AdminDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    products: 0,
    users: 0,
    activeOrders: 0,
    deliveredOrders: 0
  });
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        
        // Get products count
        const productsResponse = await api.get('/products', {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        // Get users count
        const usersResponse = await api.get('/admin/users', {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        // Get orders
        const ordersResponse = await api.get('/admin/orders', {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        // Calculate stats
        const activeOrders = ordersResponse.data.filter(
          order => ['pending', 'processing', 'shipped'].includes(order.order_status)
        );
        const deliveredOrders = ordersResponse.data.filter(
          order => order.order_status === 'delivered'
        );
        
        setStats({
          products: productsResponse.data.length,
          users: usersResponse.data.filter(user => !user.is_admin).length,
          activeOrders: activeOrders.length,
          deliveredOrders: deliveredOrders.length
        });
        
        // Set recent orders (up to 5)
        setRecentOrders(ordersResponse.data.slice(0, 5));
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  return (
    <Container maxWidth="lg" className="py-8">
      <Typography variant="h4" component="h1" gutterBottom>
        Admin Dashboard
      </Typography>
      
      <Typography variant="body1" paragraph>
        Welcome back, {user?.name}. Here's an overview of your store.
      </Typography>
      
      {loading ? (
        <Box display="flex" justifyContent="center" p={4}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          <Grid container spacing={4} className="mb-6">
            <Grid item xs={12} sm={6} lg={3}>
              <Card className="h-full">
                <CardContent className="flex flex-col items-center text-center">
                  <InventoryIcon fontSize="large" color="primary" />
                  <Typography variant="h4" className="my-2">
                    {stats.products}
                  </Typography>
                  <Typography variant="body1" color="textSecondary">
                    Products
                  </Typography>
                  <Button 
                    component={Link} 
                    to="/admin/products"
                    size="small"
                    className="mt-2"
                  >
                    Manage
                  </Button>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} sm={6} lg={3}>
              <Card className="h-full">
                <CardContent className="flex flex-col items-center text-center">
                  <PeopleIcon fontSize="large" color="primary" />
                  <Typography variant="h4" className="my-2">
                    {stats.users}
                  </Typography>
                  <Typography variant="body1" color="textSecondary">
                    Users
                  </Typography>
                  <Button 
                    component={Link} 
                    to="/admin/users"
                    size="small"
                    className="mt-2"
                  >
                    Manage
                  </Button>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} sm={6} lg={3}>
              <Card className="h-full">
                <CardContent className="flex flex-col items-center text-center">
                  <LocalShippingIcon fontSize="large" color="primary" />
                  <Typography variant="h4" className="my-2">
                    {stats.activeOrders}
                  </Typography>
                  <Typography variant="body1" color="textSecondary">
                    Active Orders
                  </Typography>
                  <Button 
                    component={Link} 
                    to="/admin/orders?status=active"
                    size="small"
                    className="mt-2"
                  >
                    Manage
                  </Button>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} sm={6} lg={3}>
              <Card className="h-full">
                <CardContent className="flex flex-col items-center text-center">
                  <AddShoppingCartIcon fontSize="large" color="primary" />
                  <Typography variant="h4" className="my-2">
                    {stats.deliveredOrders}
                  </Typography>
                  <Typography variant="body1" color="textSecondary">
                    Delivered Orders
                  </Typography>
                  <Button 
                    component={Link} 
                    to="/admin/orders?status=past"
                    size="small"
                    className="mt-2"
                  >
                    View
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
          
          <Grid container spacing={4}>
            <Grid item xs={12} md={6}>
              <Paper className="p-4">
                <Box className="flex justify-between items-center mb-3">
                  <Typography variant="h6">Recent Orders</Typography>
                  <Button 
                    component={Link} 
                    to="/admin/orders"
                    size="small"
                  >
                    View All
                  </Button>
                </Box>
                
                {recentOrders.length === 0 ? (
                  <Typography variant="body2" color="textSecondary" className="text-center py-4">
                    No orders found
                  </Typography>
                ) : (
                  <List>
                    {recentOrders.map((order, index) => (
                      <Box key={order.id}>
                        <ListItem>
                          <ListItemText
                            primary={`Order #${order.id.substring(0, 8)}`}
                            secondary={`${new Date(order.order_date).toLocaleDateString()} - ${order.order_status.toUpperCase()}`}
                          />
                          <Button 
                            variant="outlined" 
                            size="small"
                            component={Link}
                            to={`/admin/orders?orderId=${order.id}`}
                          >
                            View
                          </Button>
                        </ListItem>
                        {index < recentOrders.length - 1 && <Divider />}
                      </Box>
                    ))}
                  </List>
                )}
              </Paper>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Paper className="p-4">
                <Typography variant="h6" gutterBottom>
                  Quick Actions
                </Typography>
                <Box className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                  <Button 
                    variant="contained" 
                    component={Link} 
                    to="/admin/products"
                    className="w-full" 
                    startIcon={<InventoryIcon />}
                  >
                    Manage Products
                  </Button>
                  <Button 
                    variant="contained" 
                    component={Link} 
                    to="/admin/users"
                    className="w-full" 
                    startIcon={<PeopleIcon />}
                  >
                    Manage Users
                  </Button>
                  <Button 
                    variant="contained" 
                    component={Link} 
                    to="/admin/orders"
                    className="w-full" 
                    startIcon={<LocalShippingIcon />}
                  >
                    Manage Orders
                  </Button>
                  <Button 
                    variant="contained" 
                    component={Link} 
                    to="/admin/custom-order"
                    className="w-full" 
                    startIcon={<AddShoppingCartIcon />}
                  >
                    Create Order
                  </Button>
                </Box>
              </Paper>
              
              <Paper className="p-4 mt-4">
                <Typography variant="h6" gutterBottom>
                  Admin Info
                </Typography>
                <Box className="mt-2">
                  <Typography variant="body2" color="textSecondary">
                    Name:
                  </Typography>
                  <Typography variant="body1" gutterBottom>
                    {user?.name}
                  </Typography>
                  
                  <Typography variant="body2" color="textSecondary">
                    Phone:
                  </Typography>
                  <Typography variant="body1" gutterBottom>
                    +91 {user?.phone}
                  </Typography>
                  
                  <Typography variant="body2" color="textSecondary">
                    Role:
                  </Typography>
                  <Typography variant="body1">
                    Administrator
                  </Typography>
                </Box>
              </Paper>
            </Grid>
          </Grid>
        </>
      )}
    </Container>
  );
};

export default AdminDashboard;

