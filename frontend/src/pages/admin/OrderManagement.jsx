import { useState, useEffect } from 'react';
import {
  Container, Typography, Box, Paper, Button, Grid,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Dialog, DialogTitle, DialogContent, DialogActions,
  CircularProgress, FormControl, InputLabel, Select, MenuItem, 
  Chip, Tab, Tabs, Divider, Card, CardContent, CardMedia, Alert
} from '@mui/material';
import { Link, useSearchParams } from 'react-router-dom';
import { format } from 'date-fns';
import api from '../../utils/api';

const OrderManagement = () => {
  const [searchParams] = useSearchParams();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // View order dialog
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  
  // Status update dialog
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);
  const [newStatus, setNewStatus] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Tab state
  const [tabValue, setTabValue] = useState(0);
  
  useEffect(() => {
    // Check URL parameters for specific tab
    const statusParam = searchParams.get('status');
    if (statusParam === 'active') {
      setTabValue(0);
    } else if (statusParam === 'past') {
      setTabValue(1);
    }
    
    // Check if a specific order should be viewed
    const orderIdParam = searchParams.get('orderId');
    
    fetchOrders(orderIdParam);
  }, [searchParams]);
  
  const fetchOrders = async (specificOrderId = null) => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await api.get('/admin/orders', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      const fetchedOrders = response.data;
      setOrders(fetchedOrders);
      
      // If a specific order ID was requested, open it in the view dialog
      if (specificOrderId) {
        const orderToView = fetchedOrders.find(order => order.id === specificOrderId);
        if (orderToView) {
          handleViewOrder(orderToView);
        }
      }
      
      setError('');
    } catch (err) {
      setError('Failed to fetch orders. Please try again.');
      console.error('Error fetching orders:', err);
    } finally {
      setLoading(false);
    }
  };
  
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };
  
  const handleViewOrder = (order) => {
    setSelectedOrder(order);
    setViewDialogOpen(true);
  };
  
  const handleCloseViewDialog = () => {
    setViewDialogOpen(false);
    setSelectedOrder(null);
  };
  
  const handleOpenStatusDialog = (order) => {
    setSelectedOrder(order);
    setNewStatus(order.order_status);
    setStatusDialogOpen(true);
  };
  
  const handleCloseStatusDialog = () => {
    setStatusDialogOpen(false);
    setSelectedOrder(null);
    setNewStatus('');
  };
  
  const handleStatusChange = (e) => {
    setNewStatus(e.target.value);
  };
  
  const handleUpdateStatus = async () => {
    if (!selectedOrder || !newStatus) return;
    
    setIsSubmitting(true);
    setError('');
    setSuccess('');
    
    try {
      const token = localStorage.getItem('token');
      await api.put(
        `/admin/orders/${selectedOrder.id}/status`, 
        { order_status: newStatus },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      
      setSuccess(`Order status updated to ${newStatus.toUpperCase()} successfully!`);
      fetchOrders();
      handleCloseStatusDialog();
    } catch (err) {
      setError(`Failed to update order status: ${err.response?.data?.detail || err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const formatDate = (dateString) => {
    return format(new Date(dateString), 'dd MMM yyyy, h:mm a');
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
  
  // Filter orders based on tab
  const activeOrders = orders.filter(order => 
    ['pending', 'processing', 'shipped'].includes(order.order_status)
  );
  
  const pastOrders = orders.filter(order => 
    ['delivered', 'cancelled'].includes(order.order_status)
  );
  
  const displayOrders = tabValue === 0 ? activeOrders : pastOrders;

  return (
    <Container maxWidth="lg" className="py-8">
      <Typography variant="h4" component="h1" gutterBottom>
        Order Management
      </Typography>
      
      {success && (
        <Alert severity="success" className="mb-4" onClose={() => setSuccess('')}>
          {success}
        </Alert>
      )}
      
      {error && (
        <Alert severity="error" className="mb-4" onClose={() => setError('')}>
          {error}
        </Alert>
      )}
      
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
      
      {loading ? (
        <Box display="flex" justifyContent="center" p={4}>
          <CircularProgress />
        </Box>
      ) : displayOrders.length === 0 ? (
        <Paper className="p-6 text-center">
          <Typography variant="h6">
            {tabValue === 0 ? "No active orders" : "No past orders"}
          </Typography>
        </Paper>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Order ID</TableCell>
                <TableCell>Date</TableCell>
                <TableCell>Customer</TableCell>
                <TableCell>Items</TableCell>
                <TableCell align="right">Amount (₹)</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {displayOrders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell>#{order.id.substring(0, 8)}</TableCell>
                  <TableCell>{formatDate(order.order_date)}</TableCell>
                  <TableCell>{order.customer_name}</TableCell>
                  <TableCell>{order.items.length} items</TableCell>
                  <TableCell align="right">{order.total_amount.toFixed(2)}</TableCell>
                  <TableCell>
                    <Chip 
                      label={order.order_status.toUpperCase()} 
                      color={getStatusColor(order.order_status)} 
                      size="small" 
                      className="cursor-pointer"
                      onClick={() => handleOpenStatusDialog(order)}
                    />
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="outlined"
                      size="small"
                      onClick={() => handleViewOrder(order)}
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
      
      {/* View Order Dialog */}
      <Dialog 
        open={viewDialogOpen} 
        onClose={handleCloseViewDialog}
        maxWidth="md"
        fullWidth
      >
        {selectedOrder && (
          <>
            <DialogTitle>
              <Box className="flex justify-between items-center">
                <Typography variant="h6">
                  Order #{selectedOrder.id.substring(0, 8)}
                </Typography>
                <Chip 
                  label={selectedOrder.order_status.toUpperCase()} 
                  color={getStatusColor(selectedOrder.order_status)}
                  className="cursor-pointer"
                  onClick={() => {
                    handleCloseViewDialog();
                    handleOpenStatusDialog(selectedOrder);
                  }}
                />
              </Box>
            </DialogTitle>
            <DialogContent>
              <Grid container spacing={3}>
                <Grid item xs={12} md={8}>
                  <Typography variant="subtitle1" gutterBottom>
                    Order Items
                  </Typography>
                  {selectedOrder.items.map((item) => (
                    <Card key={item.id} className="mb-3">
                      <Box className="flex">
                        <CardMedia
                          component="img"
                          sx={{ width: 100 }}
                          image={item.product.image_url}
                          alt={item.product.name}
                        />
                        <CardContent className="flex-grow">
                          <Typography variant="subtitle1">
                            {item.product.name}
                          </Typography>
                          <Box className="flex justify-between mt-2">
                            <Typography variant="body2">
                              Quantity: {item.quantity}
                            </Typography>
                            <Typography variant="body1" color="primary">
                              ₹{item.price_at_purchase.toFixed(2)}
                            </Typography>
                          </Box>
                        </CardContent>
                      </Box>
                    </Card>
                  ))}
                </Grid>
                
                <Grid item xs={12} md={4}>
                  <Paper className="p-3">
                    <Typography variant="subtitle1" gutterBottom>
                      Order Information
                    </Typography>
                    <Box className="mb-2">
                      <Typography variant="body2" color="textSecondary">
                        Date:
                      </Typography>
                      <Typography variant="body1">
                        {formatDate(selectedOrder.order_date)}
                      </Typography>
                    </Box>
                    <Box className="mb-2">
                      <Typography variant="body2" color="textSecondary">
                        Customer:
                      </Typography>
                      <Typography variant="body1">
                        {selectedOrder.customer_name}
                      </Typography>
                    </Box>
                    <Box className="mb-2">
                      <Typography variant="body2" color="textSecondary">
                        Phone:
                      </Typography>
                      <Typography variant="body1">
                        +91 {selectedOrder.receiver_phone}
                      </Typography>
                    </Box>
                    <Box className="mb-2">
                      <Typography variant="body2" color="textSecondary">
                        Delivery Address:
                      </Typography>
                      <Typography variant="body1">
                        {selectedOrder.delivery_address}
                      </Typography>
                    </Box>
                    
                    <Divider className="my-3" />
                    
                    <Box className="mb-2">
                      <Typography variant="body2" color="textSecondary">
                        Payment Status:
                      </Typography>
                      <Chip 
                        label={selectedOrder.payment_status.toUpperCase()} 
                        color={selectedOrder.payment_status === 'paid' ? 'success' : 'warning'}
                        size="small"
                      />
                    </Box>
                    
                    <Divider className="my-3" />
                    
                    <Box className="flex justify-between mb-2">
                      <Typography variant="body1">Subtotal:</Typography>
                      <Typography variant="body1">
                        ₹{selectedOrder.total_amount.toFixed(2)}
                      </Typography>
                    </Box>
                    <Box className="flex justify-between mb-2">
                      <Typography variant="body1">Delivery Fee:</Typography>
                      <Typography variant="body1">
                        ₹0.00
                      </Typography>
                    </Box>
                    <Box className="flex justify-between">
                      <Typography variant="h6">Total:</Typography>
                      <Typography variant="h6" color="primary">
                        ₹{selectedOrder.total_amount.toFixed(2)}
                      </Typography>
                    </Box>
                  </Paper>
                </Grid>
              </Grid>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleCloseViewDialog}>
                Close
              </Button>
              <Button 
                variant="contained" 
                color="primary"
                onClick={() => {
                  handleCloseViewDialog();
                  handleOpenStatusDialog(selectedOrder);
                }}
              >
                Update Status
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
      
      {/* Status Update Dialog */}
      <Dialog open={statusDialogOpen} onClose={handleCloseStatusDialog}>
        <DialogTitle>
          Update Order Status
        </DialogTitle>
        <DialogContent>
          <Box className="pt-2">
            <FormControl fullWidth>
              <InputLabel>Status</InputLabel>
              <Select
                value={newStatus}
                onChange={handleStatusChange}
                label="Status"
              >
                <MenuItem value="pending">Pending</MenuItem>
                <MenuItem value="processing">Processing</MenuItem>
                <MenuItem value="shipped">Shipped</MenuItem>
                <MenuItem value="delivered">Delivered</MenuItem>
                <MenuItem value="cancelled">Cancelled</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseStatusDialog} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button 
            onClick={handleUpdateStatus} 
            variant="contained" 
            color="primary"
            disabled={isSubmitting}
          >
            {isSubmitting ? <CircularProgress size={24} /> : 'Update'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default OrderManagement;
