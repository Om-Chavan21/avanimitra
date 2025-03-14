import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container, Typography, Box, Paper, Grid, Button, Divider,
  Card, CardContent, CardMedia, IconButton, TextField, CircularProgress,
  Alert
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

  const handleQuantityChange = (productId, quantity) => {
    if (quantity < 1) return;
    updateCartItem(productId, quantity);
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

  const handleSubmitOrder = async () => {
    if (!cart.items.length) {
      setError('Your cart is empty');
      return;
    }

    if (!orderData.delivery_address.trim() || !orderData.receiver_phone.trim()) {
      setError('Please fill in all required fields');
      return;
    }

    try {
      setIsSubmitting(true);
      setError('');
      
      const token = localStorage.getItem('token');
      await api.post(
        '/orders',
        {
          ...orderData,
          items: cart.items.map(item => ({
            product_id: item.product_id,
            quantity: item.quantity
          }))
        },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      
      setSuccess('Order placed successfully!');
      setTimeout(() => {
        navigate('/orders');
      }, 1500);
    } catch (error) {
      setError(error.response?.data?.detail || 'Failed to place order');
    } finally {
      setIsSubmitting(false);
    }
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
        <Alert severity="error" className="mb-4">
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" className="mb-4">
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
                      sx={{ width: { xs: '100%', sm: 140 } }}
                      image={item.product.image_url}
                      alt={item.product.name}
                      className="object-cover"
                    />
                    <CardContent className="flex-grow">
                      <Box className="flex justify-between">
                        <Typography variant="h6">{item.product.name}</Typography>
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
                      <Typography variant="body1" color="primary">
                        ₹{item.product.price.toFixed(2)}
                      </Typography>
                      <Box className="flex items-center mt-2">
                        <IconButton 
                          color="primary" 
                          onClick={() => handleQuantityChange(item.product_id, item.quantity - 1)}
                          disabled={item.quantity <= 1}
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
                          sx={{ width: '60px', mx: 1 }}
                        />
                        <IconButton 
                          color="primary"
                          onClick={() => handleQuantityChange(item.product_id, item.quantity + 1)}
                        >
                          <AddIcon />
                        </IconButton>
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
                  onClick={handleSubmitOrder}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? <CircularProgress size={24} /> : 'Proceed to Payment'}
                </Button>
              </Box>
              </Paper>
          </Grid>
        </Grid>
      )}
    </Container>
  );
};

export default Cart;
