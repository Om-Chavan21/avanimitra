// frontend/src/pages/Cart.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container, Typography, Box, Paper, Grid, Button, Divider,
  Card, CardContent, CardMedia, IconButton, TextField, CircularProgress,
  Alert, Tooltip, Chip
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import DeleteIcon from '@mui/icons-material/Delete';
import InputAdornment from '@mui/material/InputAdornment';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';

const Cart = () => {
  const { cart, isLoading, updateCartItem, removeFromCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [orderData, setOrderData] = useState({
    delivery_address: user?.address || '',
    receiver_phone: user?.phone || ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleQuantityChange = (productId, quantity, customOptions) => {
    if (quantity < 1) return;
    updateCartItem(productId, quantity, customOptions);
  };

  const handleRemoveItem = (productId) => {
    removeFromCart(productId);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setOrderData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleProceedToPayment = () => {
    if (!cart.items.length) {
      setError('Your cart is empty');
      return;
    }

    if (!orderData.delivery_address.trim() || !orderData.receiver_phone.trim()) {
      setError('Please fill in all required fields');
      return;
    }

    // Navigate to payment options page with order details
    navigate('/payment-options', {
      state: {
        orderDetails: orderData,
        cartItems: cart.items,
        totalAmount: cart.total_price
      }
    });
  };

  if (isLoading) {
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
        Your Cart
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

      {!cart.items.length ? (
        <Paper className="p-6 text-center">
          <Typography variant="h6">Your cart is empty</Typography>
          <Button 
            variant="contained" 
            color="primary" 
            className="mt-4"
            onClick={() => navigate('/')}
          >
            Continue Shopping
          </Button>
        </Paper>
      ) : (
        <Grid container spacing={4}>
          <Grid item xs={12} md={8}>
            <Paper className="p-4">
              {cart.items.map((item) => (
                <Card key={item.product_id} className="mb-4">
                  <Box className="flex flex-col sm:flex-row">
                    <CardMedia
                      component="img"
                      sx={{ width: { xs: '100%', sm: 140 }, height: { xs: 140, sm: 'auto' } }}
                      image={item.product.image_url}
                      alt={item.product.name}
                      className="object-cover"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = "https://via.placeholder.com/140?text=Image+Not+Available";
                      }}
                    />
                    <CardContent className="flex-grow">
                      <Box className="flex justify-between">
                        <Typography variant="h6">
                          {item.product.name}
                          {item.selectedSize && (
                            <Chip 
                              size="small" 
                              label={item.selectedSize} 
                              color="primary" 
                              variant="outlined" 
                              sx={{ ml: 1 }}
                            />
                          )}
                        </Typography>
                        <IconButton 
                          color="error"
                          onClick={() => handleRemoveItem(item.product_id)}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Box>
                      
                      <Typography variant="body2" color="text.secondary" paragraph className="line-clamp-2">
                        {item.product.description}
                      </Typography>
                      
                      <Box className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                        <Typography variant="body1" color="primary" className="mb-2 sm:mb-0">
                          ₹{(item.pricePerUnit || item.product.price).toFixed(2)}
                          {item.unit && item.unit !== 'box' && (
                            <Typography component="span" variant="body2" color="text.secondary">
                              {` per ${item.unit}`}
                            </Typography>
                          )}
                        </Typography>
                        
                        <Box className="flex items-center">
                          <IconButton 
                            color="primary" 
                            onClick={() => handleQuantityChange(
                              item.product_id, 
                              item.quantity - 1, 
                              {
                                selectedSize: item.selectedSize,
                                pricePerUnit: item.pricePerUnit,
                                unit: item.unit
                              }
                            )}
                            disabled={item.quantity <= 1}
                            size="small"
                          >
                            <RemoveIcon />
                          </IconButton>
                          <TextField
                            variant="outlined"
                            size="small"
                            value={item.quantity}
                            InputProps={{
                              readOnly: true,
                            }}
                            sx={{ width: '55px', mx: 1 }}
                          />
                          <IconButton 
                            color="primary"
                            onClick={() => handleQuantityChange(
                              item.product_id, 
                              item.quantity + 1,
                              {
                                selectedSize: item.selectedSize,
                                pricePerUnit: item.pricePerUnit,
                                unit: item.unit
                              }
                            )}
                            size="small"
                          >
                            <AddIcon />
                          </IconButton>
                        </Box>
                      </Box>
                      
                      <Box className="mt-2 flex justify-end">
                        <Typography variant="body1" fontWeight="bold">
                          ₹{((item.pricePerUnit || item.product.price) * item.quantity).toFixed(2)}
                        </Typography>
                      </Box>
                    </CardContent>
                  </Box>
                </Card>
              ))}
            </Paper>
          </Grid>

          <Grid item xs={12} md={4}>
            <Paper className="p-4">
              <Typography variant="h6" gutterBottom>
                Order Summary
              </Typography>
              
              <Box className="flex justify-between py-2">
                <Typography variant="body1">Subtotal</Typography>
                <Typography variant="body1">₹{cart.total_price.toFixed(2)}</Typography>
              </Box>
              
              <Box className="flex justify-between py-2">
                <Typography variant="body1">Delivery Fee</Typography>
                <Typography variant="body1">₹0.00</Typography>
              </Box>
              
              <Divider className="my-2" />
              
              <Box className="flex justify-between py-2">
                <Typography variant="h6">Total</Typography>
                <Typography variant="h6" color="primary">₹{cart.total_price.toFixed(2)}</Typography>
              </Box>
              
              <Box className="mt-4">
                <Typography variant="h6" gutterBottom>
                  Delivery Details
                </Typography>
                
                <TextField
                  label="Delivery Address"
                  variant="outlined"
                  fullWidth
                  margin="normal"
                  name="delivery_address"
                  value={orderData.delivery_address}
                  onChange={handleInputChange}
                  multiline
                  rows={2}
                  required
                />
                
                <TextField
                  label="Receiver's Phone Number"
                  variant="outlined"
                  fullWidth
                  margin="normal"
                  name="receiver_phone"
                  value={orderData.receiver_phone}
                  onChange={handleInputChange}
                  InputProps={{
                    startAdornment: <InputAdornment position="start">+91</InputAdornment>,
                  }}
                  inputProps={{ maxLength: 10 }}
                  required
                />
                
                <Button 
                  variant="contained" 
                  color="primary"
                  fullWidth
                  size="large"
                  className="mt-4"
                  onClick={handleProceedToPayment}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? <CircularProgress size={24} /> : 'Proceed to Payment'}
                </Button>
              </Box>
            </Paper>
            
            <Box className="mt-4 text-center">
              <Button
                variant="outlined"
                onClick={() => navigate('/')}
              >
                Continue Shopping
              </Button>
            </Box>
          </Grid>
        </Grid>
      )}
    </Container>
  );
};

export default Cart;