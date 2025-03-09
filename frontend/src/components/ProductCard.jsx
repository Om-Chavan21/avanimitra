import { useState } from 'react';
import { 
  Card, CardContent, CardMedia, Typography, Button, 
  Dialog, DialogActions, DialogContent, DialogTitle,
  Box, IconButton, TextField
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useNavigate } from 'react-router-dom';

const ProductCard = ({ product }) => {
  const [open, setOpen] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const { isAuthenticated } = useAuth();
  const { cart, addToCart, updateCartItem } = useCart();
  const navigate = useNavigate();
  
  const isInCart = cart?.items?.some(item => item.product_id === product.id);
  const cartItem = cart?.items?.find(item => item.product_id === product.id);

  const handleOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    // Reset quantity when dialog closes
    if (!isInCart) {
      setQuantity(1);
    }
  };

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    
    await addToCart(product.id, quantity);
    handleClose();
  };

  const handleQuantityChange = async (newQuantity) => {
    if (newQuantity < 1) return;
    
    if (isInCart) {
      await updateCartItem(product.id, newQuantity);
    } else {
      setQuantity(newQuantity);
    }
  };

  return (
    <>
      <Card 
        className="h-full flex flex-col transition-transform duration-300 hover:shadow-lg hover:scale-105"
        onClick={handleOpen}
      >
        <CardMedia
          component="img"
          height="140"
          image={product.image_url}
          alt={product.name}
          className="h-48 object-cover"
        />
        <CardContent className="flex-grow">
          <Typography gutterBottom variant="h6" component="div">
            {product.name}
          </Typography>
          <Typography variant="body2" color="text.secondary" className="line-clamp-3">
            {product.description}
          </Typography>
          <Typography variant="h6" color="primary" className="mt-2">
            ₹{product.price.toFixed(2)}
          </Typography>
        </CardContent>
      </Card>

      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>{product.name}</DialogTitle>
        <DialogContent>
          <Box className="flex flex-col md:flex-row gap-4">
            <Box className="w-full md:w-1/2">
              <img 
                src={product.image_url} 
                alt={product.name} 
                className="w-full h-64 object-cover rounded"
              />
            </Box>
            <Box className="w-full md:w-1/2">
              <Typography variant="body1" paragraph>
                {product.description}
              </Typography>
              <Typography variant="h5" color="primary" gutterBottom>
                ₹{product.price.toFixed(2)}
              </Typography>
              <Box className="flex items-center mt-4">
                <IconButton 
                  color="primary"
                  onClick={() => handleQuantityChange(isInCart ? cartItem.quantity - 1 : quantity - 1)}
                  disabled={isInCart ? cartItem.quantity <= 1 : quantity <= 1}
                >
                  <RemoveIcon />
                </IconButton>
                <TextField
                  variant="outlined"
                  size="small"
                  value={isInCart ? cartItem.quantity : quantity}
                  InputProps={{
                    readOnly: true,
                  }}
                  sx={{ width: '60px', mx: 1 }}
                />
                <IconButton 
                  color="primary"
                  onClick={() => handleQuantityChange(isInCart ? cartItem.quantity + 1 : quantity + 1)}
                >
                  <AddIcon />
                </IconButton>
              </Box>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Close</Button>
          {!isInCart ? (
            <Button 
              onClick={handleAddToCart} 
              variant="contained" 
              color="primary"
            >
              Add to Cart
            </Button>
          ) : (
            <Button 
              variant="contained" 
              color="primary"
              onClick={() => navigate('/cart')}
            >
              Go to Cart
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </>
  );
};

export default ProductCard;
