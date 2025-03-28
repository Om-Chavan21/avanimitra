// frontend/src/components/ProductCard.jsx
import { useState, useEffect } from 'react';
import { 
  Card, CardContent, CardMedia, Typography, Button, 
  Dialog, DialogActions, DialogContent, DialogTitle,
  Box, IconButton, TextField, Chip, Select, MenuItem,
  InputLabel, FormControl, FormHelperText
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
  
  // For mangoes with custom sizing
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedUnit, setSelectedUnit] = useState('box');
  const [pricePerUnit, setPricePerUnit] = useState(product.price);
  const [hasCustomOptions, setHasCustomOptions] = useState(false);
  const [customOptions, setCustomOptions] = useState([]);
  
  // Handle mango sizing options
  useEffect(() => {
    // Check if this is a mango product with sizing options
    if (product.category === 'mangoes' && product.name.toLowerCase().includes('hapus')) {
      setHasCustomOptions(true);
      
      let options = [];
      const name = product.name.toLowerCase();
      
      // Detect product type and set available options
      if (name.includes('box')) {
        setSelectedUnit('box');
        
        if (name.includes('small')) {
          options = [{ size: 'Small 2dz Box', price: product.price }];
        } else if (name.includes('medium')) {
          options = [{ size: 'Medium 2dz Box', price: product.price }];
        } else if (name.includes('big')) {
          options = [{ size: 'Big 2dz Box', price: product.price }];
        }
      } else if (name.includes('peti')) {
        setSelectedUnit('peti');
        
        if (name.includes('small')) {
          options = [{ size: 'Small Peti (6.5-7dz)', price: product.price }];
        } else if (name.includes('medium')) {
          options = [{ size: 'Medium Peti (5.5-6dz)', price: product.price }];
        } else if (name.includes('big')) {
          options = [{ size: 'Big Peti (5-5.25dz)', price: product.price }];
        }
      } else {
        // Dozened options (individual units)
        setSelectedUnit('dozen');
        options = [
          { size: 'Small', price: 850 },
          { size: 'Medium', price: 1200 },
          { size: 'Big', price: 1550 }
        ];
      }
      
      setCustomOptions(options);
      
      if (options.length > 0) {
        setSelectedSize(options[0].size);
        setPricePerUnit(options[0].price);
      }
    }
  }, [product]);

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
    
    await addToCart(product.id, quantity, {
      selectedSize: hasCustomOptions ? selectedSize : null,
      pricePerUnit: hasCustomOptions ? pricePerUnit : product.price,
      unit: selectedUnit
    });
    handleClose();
  };
  
  const handleQuantityChange = async (newQuantity) => {
    if (newQuantity < 1) return;
    
    if (isInCart) {
      await updateCartItem(product.id, newQuantity, {
        selectedSize: cartItem.selectedSize,
        pricePerUnit: cartItem.pricePerUnit,
        unit: cartItem.unit
      });
    } else {
      setQuantity(newQuantity);
    }
  };

  const handleSizeChange = (event) => {
    const newSize = event.target.value;
    setSelectedSize(newSize);
    
    // Update price based on selected size
    const option = customOptions.find(opt => opt.size === newSize);
    if (option) {
      setPricePerUnit(option.price);
    }
  };

  return (
    <>
      <Card 
        className="h-full flex flex-col transition-transform duration-300 hover:shadow-lg hover:scale-105"
        onClick={handleOpen}
        sx={{ cursor: 'pointer' }}
      >
        <CardMedia
          component="img"
          image={product.image_url}
          alt={product.name}
          className="h-48 object-cover"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = "https://via.placeholder.com/300x200?text=Image+Not+Available";
          }}
        />
        <CardContent className="flex-grow p-3">
          <Box className="flex justify-between items-start mb-1">
            <Typography gutterBottom variant="h6" component="div" className="text-base sm:text-lg">
              {product.name}
            </Typography>
            <Chip
              label={product.category}
              size="small"
              color="primary"
              variant="outlined"
              className="ml-1"
            />
          </Box>
          <Typography variant="body2" color="text.secondary" className="line-clamp-3 text-xs sm:text-sm">
            {product.description}
          </Typography>
          <Box className="flex justify-between items-center mt-2">
            <Typography variant="h6" color="primary" className="text-base sm:text-lg">
              ₹{hasCustomOptions ? pricePerUnit.toFixed(2) : product.price.toFixed(2)}
            </Typography>
            <Button 
              size="small"
              color="inherit" 
              onClick={(e) => {
                e.stopPropagation();
                handleOpen();
              }}
              sx={{ 
                borderColor: 'primary.main', 
                color: 'primary.main', 
                padding: '4px 8px',
                fontSize: '0.75rem',
                '&:hover': { 
                  borderColor: 'primary.main', 
                  backgroundColor: 'primary.main', 
                  color: 'white' 
                } 
              }}
            >
              View
            </Button>
          </Box>
          {product.stock_quantity <= 10 && product.stock_quantity > 0 && (
            <Typography variant="caption" color="error" className="mt-1 block">
              Only {product.stock_quantity} left
            </Typography>
          )}
        </CardContent>
      </Card>
      
      <Dialog open={open} onClose={handleClose} maxWidth="md">
        <DialogTitle>{product.name}</DialogTitle>
        <DialogContent>
          <Box className="flex flex-col md:flex-row gap-4">
            <Box className="w-full md:w-1/2">
              <img 
                src={product.image_url} 
                alt={product.name} 
                className="w-full h-64 object-cover rounded"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = "https://via.placeholder.com/300x200?text=Image+Not+Available";
                }}
              />
            </Box>
            <Box className="w-full md:w-1/2">
              <Box className="flex justify-between items-center mb-2">
                <Chip
                  label={product.category}
                  color="primary"
                  size="small"
                />
                {product.status && (
                  <Chip
                    label={product.status.toUpperCase()}
                    color={product.status === 'active' ? 'success' : 'default'}
                    size="small"
                  />
                )}
              </Box>
              <Typography variant="body1" paragraph style={{ whiteSpace: 'pre-line' }}>
                {product.description}
              </Typography>
              
              {hasCustomOptions && customOptions.length > 0 && (
                <Box className="mt-3 mb-3">
                  <FormControl fullWidth size="small" margin="dense">
                    <InputLabel>Size</InputLabel>
                    <Select
                      value={selectedSize}
                      onChange={handleSizeChange}
                      label="Size"
                    >
                      {customOptions.map((option) => (
                        <MenuItem key={option.size} value={option.size}>
                          {option.size} (₹{option.price.toFixed(2)})
                        </MenuItem>
                      ))}
                    </Select>
                    <FormHelperText>
                      {selectedUnit === 'dozen' ? 'Price per dozen' : 'Price per box/peti'}
                    </FormHelperText>
                  </FormControl>
                </Box>
              )}
              
              <Typography variant="h5" color="primary" gutterBottom className="mt-2">
                ₹{hasCustomOptions ? pricePerUnit.toFixed(2) : product.price.toFixed(2)}
              </Typography>
              
              {product.stock_quantity > 0 ? (
                <>
                  <Typography variant="body2" color={product.stock_quantity <= 10 ? "error" : "textSecondary"}>
                    In stock: {product.stock_quantity} units
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
              disabled={product.stock_quantity === 0}
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