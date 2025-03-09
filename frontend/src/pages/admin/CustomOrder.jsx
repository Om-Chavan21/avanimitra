import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container, Typography, Box, Paper, Grid, TextField, Button,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  IconButton, CircularProgress, Autocomplete, InputAdornment,
  Dialog, DialogTitle, DialogContent, DialogActions, Alert,
  FormControl, InputLabel, Select, MenuItem
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import DeleteIcon from '@mui/icons-material/Delete';
import api from '../../utils/api';

const CustomOrder = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Order data
  const [selectedUser, setSelectedUser] = useState(null);
  const [orderDetails, setOrderDetails] = useState({
    delivery_address: '',
    receiver_phone: '',
    payment_status: 'pending',
    order_status: 'pending'
  });
  const [orderItems, setOrderItems] = useState([]);
  const [totalAmount, setTotalAmount] = useState(0);
  
  // Product selection dialog
  const [productDialogOpen, setProductDialogOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedQuantity, setSelectedQuantity] = useState(1);
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        
        // Fetch users
        const usersResponse = await api.get('/admin/users', {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        // Only regular users, not admins
        const regularUsers = usersResponse.data.filter(user => !user.is_admin);
        setUsers(regularUsers);
        
        // Fetch active products
        const productsResponse = await api.get('/products');
        setProducts(productsResponse.data);
      } catch (err) {
        setError('Failed to fetch required data');
        console.error('Error fetching data:', err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);
  
  // Calculate total amount when order items change
  useEffect(() => {
    const newTotal = orderItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    setTotalAmount(newTotal);
  }, [orderItems]);
  
  // Update delivery details when user changes
  useEffect(() => {
    if (selectedUser) {
      setOrderDetails({
        ...orderDetails,
        delivery_address: selectedUser.address || '',
        receiver_phone: selectedUser.phone || ''
      });
    }
  }, [selectedUser]);
  
  const handleUserChange = (event, newValue) => {
    setSelectedUser(newValue);
  };
  
  const handleOrderDetailsChange = (e) => {
    const { name, value } = e.target;
    setOrderDetails({
      ...orderDetails,
      [name]: value
    });
  };
  
  const handleOpenProductDialog = () => {
    setSelectedProduct(null);
    setSelectedQuantity(1);
    setProductDialogOpen(true);
  };
  
  const handleCloseProductDialog = () => {
    setProductDialogOpen(false);
  };
  
  const handleProductSelection = (event, newValue) => {
    setSelectedProduct(newValue);
  };
  
  const handleQuantityChange = (value) => {
    if (value < 1) return;
    setSelectedQuantity(value);
  };
  
  const handleAddProductToOrder = () => {
    if (!selectedProduct) return;
    
    // Check if product already exists in order
    const existingItemIndex = orderItems.findIndex(
      item => item.product_id === selectedProduct.id
    );
    
    if (existingItemIndex >= 0) {
      // Update quantity if product already exists
      const updatedItems = [...orderItems];
      updatedItems[existingItemIndex].quantity += selectedQuantity;
      setOrderItems(updatedItems);
    } else {
      // Add new product to order
      setOrderItems([
        ...orderItems, 
        {
          product_id: selectedProduct.id,
          product: selectedProduct,
          quantity: selectedQuantity,
          price: selectedProduct.price
        }
      ]);
    }
    
    handleCloseProductDialog();
  };
  
  const handleUpdateItemQuantity = (index, newQuantity) => {
    if (newQuantity < 1) return;
    
    const updatedItems = [...orderItems];
    updatedItems[index].quantity = newQuantity;
    setOrderItems(updatedItems);
  };
  
  const handleRemoveItem = (index) => {
    const updatedItems = [...orderItems];
    updatedItems.splice(index, 1);
    setOrderItems(updatedItems);
  };
  
  const validateOrder = () => {
    if (!selectedUser) {
      setError('Please select a customer');
      return false;
    }
    
    if (!orderDetails.delivery_address) {
      setError('Delivery address is required');
      return false;
    }
    
    if (!orderDetails.receiver_phone) {
      setError('Receiver phone is required');
      return false;
    }
    
    if (orderItems.length === 0) {
      setError('Please add at least one product to the order');
      return false;
    }
    
    return true;
  };
  
  const handleSubmitOrder = async () => {
    if (!validateOrder()) return;
    
    try {
      setSubmitting(true);
      setError('');
      setSuccess('');
      
      const token = localStorage.getItem('token');
      await api.post(
        '/admin/orders',
        {
          user_id: selectedUser.id,
          delivery_address: orderDetails.delivery_address,
          receiver_phone: orderDetails.receiver_phone,
          payment_status: orderDetails.payment_status,
          order_status: orderDetails.order_status,
          items: orderItems.map(item => ({
            product_id: item.product_id,
            quantity: item.quantity,
            price_at_purchase: item.price
          }))
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      
      setSuccess('Order created successfully!');
      
      // Reset form after successful submission
      setTimeout(() => {
        navigate('/admin/orders');
      }, 2000);
    } catch (err) {
      setError(`Failed to create order: ${err.response?.data?.detail || err.message}`);
    } finally {
      setSubmitting(false);
    }
  };

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
        Create Custom Order
      </Typography>
      
      {error && (
        <Alert severity="error" className="mb-4" onClose={() => setError('')}>
          {error}
        </Alert>
      )}
      
      {success && (
        <Alert severity="success" className="mb-4" onClose={() => setSuccess('')}>
          {success}
        </Alert>
      )}
      
      <Grid container spacing={4}>
        <Grid item xs={12} md={8}>
          <Paper className="p-4 mb-4">
            <Typography variant="h6" gutterBottom>
              Order Items
            </Typography>
            
            {orderItems.length === 0 ? (
              <Box className="text-center py-6">
                <Typography variant="body1" color="textSecondary" gutterBottom>
                  No items added to order
                </Typography>
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={handleOpenProductDialog}
                >
                  Add Product
                </Button>
              </Box>
            ) : (
              <>
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Product</TableCell>
                        <TableCell align="right">Price</TableCell>
                        <TableCell align="center">Quantity</TableCell>
                        <TableCell align="right">Subtotal</TableCell>
                        <TableCell></TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {orderItems.map((item, index) => (
                        <TableRow key={index}>
                          <TableCell>
                            <Box className="flex items-center">
                              <img 
                                src={item.product.image_url} 
                                alt={item.product.name}
                                className="w-12 h-12 object-cover mr-2"
                              />
                              <Typography variant="body2">
                                {item.product.name}
                              </Typography>
                            </Box>
                          </TableCell>
                          <TableCell align="right">
                            ₹{item.price.toFixed(2)}
                          </TableCell>
                          <TableCell align="center">
                            <Box className="flex items-center justify-center">
                              <IconButton 
                                size="small"
                                onClick={() => handleUpdateItemQuantity(index, item.quantity - 1)}
                              >
                                <RemoveIcon />
                              </IconButton>
                              <TextField
                                value={item.quantity}
                                size="small"
                                InputProps={{ readOnly: true }}
                                sx={{ width: 60, mx: 1, textAlign: 'center' }}
                              />
                              <IconButton 
                                size="small"
                                onClick={() => handleUpdateItemQuantity(index, item.quantity + 1)}
                              >
                                <AddIcon />
                              </IconButton>
                            </Box>
                          </TableCell>
                          <TableCell align="right">
                            ₹{(item.price * item.quantity).toFixed(2)}
                          </TableCell>
                          <TableCell>
                            <IconButton 
                              color="error"
                              onClick={() => handleRemoveItem(index)}
                            >
                              <DeleteIcon />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
                
                <Box className="mt-4 flex justify-between">
                  <Button
                    variant="outlined"
                    startIcon={<AddIcon />}
                    onClick={handleOpenProductDialog}
                  >
                    Add More Products
                  </Button>
                  <Typography variant="h6">
                    Total: ₹{totalAmount.toFixed(2)}
                  </Typography>
                </Box>
              </>
            )}
          </Paper>
          
          <Paper className="p-4">
            <Typography variant="h6" gutterBottom>
              Order Status
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Payment Status</InputLabel>
                  <Select
                    name="payment_status"
                    value={orderDetails.payment_status}
                    onChange={handleOrderDetailsChange}
                    label="Payment Status"
                  >
                    <MenuItem value="pending">Pending</MenuItem>
                    <MenuItem value="paid">Paid</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Order Status</InputLabel>
                  <Select
                    name="order_status"
                    value={orderDetails.order_status}
                    onChange={handleOrderDetailsChange}
                    label="Order Status"
                  >
                    <MenuItem value="pending">Pending</MenuItem>
                    <MenuItem value="processing">Processing</MenuItem>
                    <MenuItem value="shipped">Shipped</MenuItem>
                    <MenuItem value="delivered">Delivered</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={4}>
          <Paper className="p-4 mb-4">
            <Typography variant="h6" gutterBottom>
              Customer Information
            </Typography>
            
            <Autocomplete
              id="customer-select"
              options={users}
              getOptionLabel={(option) => `${option.name} (${option.phone})`}
              value={selectedUser}
              onChange={handleUserChange}
              renderInput={(params) => (
                <TextField 
                  {...params} 
                  label="Select Customer" 
                  margin="normal"
                  required
                />
              )}
            />
          </Paper>
          
          <Paper className="p-4">
            <Typography variant="h6" gutterBottom>
              Delivery Details
            </Typography>
            
            <TextField
              name="delivery_address"
              label="Delivery Address"
              fullWidth
              margin="normal"
              value={orderDetails.delivery_address}
              onChange={handleOrderDetailsChange}
              multiline
              rows={3}
              required
            />
            
            <TextField
              name="receiver_phone"
              label="Receiver's Phone"
              fullWidth
              margin="normal"
              value={orderDetails.receiver_phone}
              onChange={handleOrderDetailsChange}
              InputProps={{
                startAdornment: <InputAdornment position="start">+91</InputAdornment>,
              }}
              required
            />
            
            <Button
              variant="contained"
              color="primary"
              fullWidth
              size="large"
              className="mt-4"
              onClick={handleSubmitOrder}
              disabled={submitting}
            >
              {submitting ? <CircularProgress size={24} /> : 'Create Order'}
            </Button>
          </Paper>
        </Grid>
      </Grid>
      
      {/* Add Product Dialog */}
      <Dialog open={productDialogOpen} onClose={handleCloseProductDialog} maxWidth="sm" fullWidth>
        <DialogTitle>Add Product to Order</DialogTitle>
        <DialogContent>
          <Autocomplete
            id="product-select"
            options={products.filter(product => product.status === 'active')}
            getOptionLabel={(option) => option.name}
            value={selectedProduct}
            onChange={handleProductSelection}
            renderInput={(params) => (
              <TextField 
                {...params} 
                label="Select Product" 
                margin="normal"
                fullWidth
              />
            )}
            renderOption={(props, option) => (
              <Box component="li" {...props}>
                <Box className="flex items-center">
                  <img 
                    src={option.image_url} 
                    alt={option.name}
                    className="w-10 h-10 object-cover mr-2"
                  />
                  <Box>
                    <Typography variant="body1">{option.name}</Typography>
                    <Typography variant="body2" color="textSecondary">
                      ₹{option.price.toFixed(2)} - Stock: {option.stock_quantity}
                    </Typography>
                  </Box>
                </Box>
              </Box>
            )}
          />
          
          {selectedProduct && (
            <Box className="mt-4">
              <Typography variant="subtitle2" gutterBottom>
                Quantity:
              </Typography>
              <Box className="flex items-center">
                <IconButton 
                  size="small"
                  onClick={() => handleQuantityChange(selectedQuantity - 1)}
                >
                  <RemoveIcon />
                </IconButton>
                <TextField
                  value={selectedQuantity}
                  onChange={(e) => {
                    const value = parseInt(e.target.value);
                    if (!isNaN(value) && value > 0) {
                      handleQuantityChange(value);
                    }
                  }}
                  size="small"
                  type="number"
                  InputProps={{ inputProps: { min: 1 } }}
                  sx={{ width: 60, mx: 1 }}
                />
                <IconButton 
                  size="small"
                  onClick={() => handleQuantityChange(selectedQuantity + 1)}
                >
                  <AddIcon />
                </IconButton>
              </Box>
              
              <Box className="mt-4 flex justify-between">
                <Typography>
                  Price: ₹{selectedProduct.price.toFixed(2)}
                </Typography>
                <Typography>
                  Subtotal: ₹{(selectedProduct.price * selectedQuantity).toFixed(2)}
                </Typography>
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseProductDialog}>
            Cancel
          </Button>
          <Button 
            onClick={handleAddProductToOrder} 
            variant="contained" 
            color="primary"
            disabled={!selectedProduct}
          >
            Add to Order
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default CustomOrder;
