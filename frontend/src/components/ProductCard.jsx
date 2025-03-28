import { useState } from 'react';
import { 
  Card, CardContent, CardMedia, Typography, Button, 
  Dialog, DialogActions, DialogContent, DialogTitle,
  Box, IconButton, TextField, Chip, FormControl,
  InputLabel, Select, MenuItem, RadioGroup, FormControlLabel, Radio
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useNavigate } from 'react-router-dom';

const ProductCard = ({ product }) => {
  const [open, setOpen] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [selectedOption, setSelectedOption] = useState(null);
  const { isAuthenticated } = useAuth();
  const { cart, addToCart, updateCartItem } = useCart();
  const navigate = useNavigate();
  
  // Find if this product is in cart
  const cartItemIndex = cart?.items?.findIndex(item => item.product_id === product.id);
  const isInCart = cartItemIndex > -1;
  const cartItem = isInCart ? cart.items[cartItemIndex] : null;
  
  // Set default option when dialog opens
  const initializeOptions = () => {
    if (product.has_price_options && product.price_options?.length > 0) {
      // Default to first option
      setSelectedOption(product.price_options[0]);
    } else {
      setSelectedOption(null);
    }
  };
  
  const handleOpen = () => {
    setOpen(true);
    setQuantity(1);
    initializeOptions();
  };
  
  const handleClose = () => {
    setOpen(false);
  };
  
  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    
    // Create cart item with correct structure
    const cartItem = {
      product_id: product.id,
      quantity: quantity
    };
    
    // Add selected option if applicable - ensuring it's a plain object
    if (selectedOption) {
      cartItem.selected_option = {
        type: selectedOption.type,
        size: selectedOption.size,
        quantity: selectedOption.quantity,
        price: selectedOption.price
      };
    }
    
    await addToCart(cartItem);
    handleClose();
  };
  
  const handleQuantityChange = async (newQuantity) => {
    if (newQuantity < 1) return;
    
    if (isInCart) {
      // Update cart item
      const updatedItem = {
        product_id: product.id,
        quantity: newQuantity
      };
      
      if (cartItem.selected_option) {
        updatedItem.selected_option = cartItem.selected_option;
      }
      
      await updateCartItem(product.id, updatedItem);
    } else {
      setQuantity(newQuantity);
    }
  };
  
  const handleOptionChange = (event) => {
    // Find the selected option by matching it from the price_options array
    const optionType = event.target.name === 'optionType' ? event.target.value : (selectedOption?.type || 'box');
    const optionSize = event.target.name === 'optionSize' ? event.target.value : (selectedOption?.size || product.price_options[0].size);
    
    const newOption = product.price_options.find(
      option => option.type === optionType && option.size === optionSize
    );
    
    if (newOption) {
      setSelectedOption(newOption);
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
          <Box className="flex justify-between items-start">
            <Typography gutterBottom variant="h6" component="div">
              {product.name}
            </Typography>
            <Box>
              {product.is_seasonal && (
                <Chip
                  label="Seasonal"
                  size="small"
                  color="secondary"
                  variant="outlined"
                  className="ml-1 mb-1"
                />
              )}
              <Chip
                label={product.category}
                size="small"
                color="primary"
                variant="outlined"
                className="ml-1"
              />
            </Box>
          </Box>
          <Typography variant="body2" color="text.secondary" className="line-clamp-3">
            {product.description}
          </Typography>
          <Box className="flex justify-between items-center mt-2">
            {product.has_price_options ? (
              <Typography variant="h6" color="primary">
                From ₹{Math.min(...product.price_options.map(opt => opt.price)).toFixed(2)}
              </Typography>
            ) : (
              <Typography variant="h6" color="primary">
                ₹{product.price.toFixed(2)}
              </Typography>
            )}
            <Button 
              color="inherit" 
              onClick={handleOpen}
              sx={{ 
                borderColor: 'primary.main', 
                color: 'primary.main', 
                '&:hover': { 
                  borderColor: 'primary.main', 
                  backgroundColor: 'primary.main', 
                  color: 'white' 
                } 
              }}
            >
              Add to Cart
            </Button>
          </Box>
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
              <Box className="flex justify-between items-center mb-2">
                {product.is_seasonal && (
                  <Chip
                    label="Seasonal"
                    color="secondary"
                    size="small"
                  />
                )}
                <Chip
                  label={product.category}
                  color="primary"
                  size="small"
                />
              </Box>
              <Typography variant="body1" paragraph>
                {product.description}
              </Typography>
              
              {product.has_price_options ? (
                <Box className="mb-3">
                  <Typography variant="subtitle1" gutterBottom>
                    Choose Option:
                  </Typography>
                  
                  <FormControl component="fieldset" fullWidth margin="normal">
                    <RadioGroup
                      name="optionType"
                      value={selectedOption?.type || 'box'}
                      onChange={handleOptionChange}
                    >
                      <Box className="space-y-2">
                        {Array.from(new Set(product.price_options.map(opt => opt.type))).map(type => (
                          <FormControlLabel 
                            key={type} 
                            value={type} 
                            control={<Radio />} 
                            label={type === 'box' ? 'Full Box' : 'By Dozen'}
                          />
                        ))}
                      </Box>
                    </RadioGroup>
                  </FormControl>
                  
                  {selectedOption && (
                    <Box className="p-3 border rounded mt-2">
                      <Typography variant="body2" gutterBottom>
                        <strong>Size:</strong> {selectedOption.size}
                      </Typography>
                      <Typography variant="body2" gutterBottom>
                        <strong>Quantity:</strong> {selectedOption.quantity}
                      </Typography>
                      <Typography variant="h6" color="primary">
                        ₹{selectedOption.price.toFixed(2)}
                      </Typography>
                    </Box>
                  )}
                </Box>
              ) : (
                <Typography variant="h6" color="primary" gutterBottom>
                  ₹{product.price.toFixed(2)}
                </Typography>
              )}
              
              {product.stock_quantity > 0 ? (
                <>
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
                      disabled={(isInCart ? cartItem.quantity : quantity) >= product.stock_quantity}
                    >
                      <AddIcon />
                    </IconButton>
                  </Box>
                </>
              ) : (
                <Typography variant="body2" color="error" className="mt-2">
                  Out of stock
                </Typography>
              )}
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
              disabled={product.stock_quantity === 0 || (product.has_price_options && !selectedOption)}
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