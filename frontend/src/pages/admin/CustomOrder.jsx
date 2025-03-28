// frontend/src/pages/admin/CustomOrder.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container, Typography, Box, Paper, Grid, TextField, Button,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  IconButton, CircularProgress, Autocomplete, InputAdornment,
  Dialog, DialogTitle, DialogContent, DialogActions, Alert,
  FormControl, InputLabel, Select, MenuItem, Divider, Switch, FormControlLabel,
  Chip, Tooltip
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import DeleteIcon from '@mui/icons-material/Delete';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import PercentIcon from '@mui/icons-material/Percent';
import api from '../../utils/api';
import PasswordField from '../../components/PasswordField';

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
  
  // Custom rate fields
  const [discountType, setDiscountType] = useState('none'); // none, order, item
  const [orderDiscount, setOrderDiscount] = useState(0);
  const [orderDiscountType, setOrderDiscountType] = useState('percentage'); // percentage, fixed
  
  // Product selection dialog
  const [productDialogOpen, setProductDialogOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedQuantity, setSelectedQuantity] = useState(1);
  const [customItemRate, setCustomItemRate] = useState(0);
  const [useCustomItemRate, setUseCustomItemRate] = useState(false);
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedUnit, setSelectedUnit] = useState('box');
  const [customOptions, setCustomOptions] = useState([]);

  // New user dialog
  const [newUserDialogOpen, setNewUserDialogOpen] = useState(false);
  const [newUser, setNewUser] = useState({
    name: '',
    phone: '',
    address: '',
    password: 'password' // Default password
  });
  const [newUserErrors, setNewUserErrors] = useState({});

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
        const productsResponse = await api.get('/admin/products', {
          headers: { Authorization: `Bearer ${token}` }
        });
        // Only active products with stock
        const activeProducts = productsResponse.data.filter(
          product => product.status === 'active' && product.stock_quantity > 0
        );
        setProducts(activeProducts);
      } catch (err) {
        setError('Failed to fetch required data');
        console.error('Error fetching data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Calculate total amount when order items change or when discount changes
  useEffect(() => {
    // Calculate base total
    const baseTotal = orderItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    // Apply discounts
    if (discountType === 'order' && orderDiscount > 0) {
      if (orderDiscountType === 'percentage') {
        // Percentage discount
        const discountAmount = baseTotal * (orderDiscount / 100);
        setTotalAmount(baseTotal - discountAmount);
      } else {
        // Fixed amount discount
        setTotalAmount(Math.max(0, baseTotal - orderDiscount));
      }
    } else {
      // No discount or item-level discounts are already included in item prices
      setTotalAmount(baseTotal);
    }
  }, [orderItems, discountType, orderDiscount, orderDiscountType]);

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

  // Update custom options when product changes
  useEffect(() => {
    if (selectedProduct) {
      const price = selectedProduct.price;
      setCustomItemRate(price);
      
      // Check if this is a mango product with sizing options
      if (selectedProduct.category === 'mangoes') {
        let options = [];
        const name = selectedProduct.name.toLowerCase();
        
        // Detect product type and set available options
        if (name.includes('box')) {
          setSelectedUnit('box');
          
          if (name.includes('small')) {
            options = [{ size: 'Small 2dz Box', price: selectedProduct.price }];
          } else if (name.includes('medium')) {
            options = [{ size: 'Medium 2dz Box', price: selectedProduct.price }];
          } else if (name.includes('big')) {
            options = [{ size: 'Big 2dz Box', price: selectedProduct.price }];
          }
        } else if (name.includes('peti')) {
          setSelectedUnit('peti');
          
          if (name.includes('small')) {
            options = [{ size: 'Small Peti (6.5-7dz)', price: selectedProduct.price }];
          } else if (name.includes('medium')) {
            options = [{ size: 'Medium Peti (5.5-6dz)', price: selectedProduct.price }];
          } else if (name.includes('big')) {
            options = [{ size: 'Big Peti (5-5.25dz)', price: selectedProduct.price }];
          }
        } else {
          // Standard mango options
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
          setCustomItemRate(options[0].price);
        }
      } else {
        setCustomOptions([]);
        setSelectedSize('');
        setSelectedUnit('box');
      }
    }
  }, [selectedProduct]);

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
    setCustomItemRate(0);
    setUseCustomItemRate(false);
    setSelectedSize('');
    setSelectedUnit('box');
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

  const handleCustomRateChange = (e) => {
    const value = parseFloat(e.target.value);
    if (!isNaN(value) && value >= 0) {
      setCustomItemRate(value);
    }
  };

  const handleSizeChange = (event) => {
    const newSize = event.target.value;
    setSelectedSize(newSize);
    
    // Update price based on selected size
    const option = customOptions.find(opt => opt.size === newSize);
    if (option) {
      setCustomItemRate(option.price);
    }
  };

  const handleAddProductToOrder = () => {
    if (!selectedProduct) return;

    const price = useCustomItemRate ? customItemRate : 
                  selectedSize ? customOptions.find(opt => opt.size === selectedSize)?.price || selectedProduct.price : 
                  selectedProduct.price;

    // Check if product already exists in order with the same size option
    const existingItemIndex = orderItems.findIndex(item => 
      item.product_id === selectedProduct.id && item.selected_size === selectedSize
    );

    if (existingItemIndex >= 0) {
      // Update quantity if product already exists with the same size
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
          price: price,
          custom_price: useCustomItemRate,
          selected_size: selectedSize,
          unit: selectedUnit
        }
      ]);
    }
    handleCloseProductDialog();
  };

  const handleUpdateItemQuantity = (index, newQuantity) => {
    if (newQuantity < 1) return;
    
    const product = orderItems[index].product;
    if (newQuantity > product.stock_quantity) {
      setError(`Cannot add more than ${product.stock_quantity} units of ${product.name}`);
      return;
    }
    
    const updatedItems = [...orderItems];
    updatedItems[index].quantity = newQuantity;
    setOrderItems(updatedItems);
  };

  const handleRemoveItem = (index) => {
    const updatedItems = [...orderItems];
    updatedItems.splice(index, 1);
    setOrderItems(updatedItems);
  };

  const handleDiscountTypeChange = (e) => {
    setDiscountType(e.target.value);
  };

  const handleOrderDiscountChange = (e) => {
    const value = parseFloat(e.target.value);
    if (!isNaN(value) && value >= 0) {
      setOrderDiscount(value);
    }
  };
  
  const handleOrderDiscountTypeChange = (e) => {
    setOrderDiscountType(e.target.value);
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
      
      // Prepare discount information
      const discountInfo = 
        discountType === 'order' 
          ? {
              discount_type: orderDiscountType,
              discount_value: orderDiscount
            }
          : {};
      
      // Format items for API
      const itemsForApi = orderItems.map(item => ({
        product_id: item.product_id,
        quantity: item.quantity,
        price_at_purchase: item.price,
        selected_size: item.selected_size || null,
        unit: item.unit || 'box'
      }));
      
      await api.post(
        '/admin/custom-orders',
        {
          user_id: selectedUser.id,
          delivery_address: orderDetails.delivery_address,
          receiver_phone: orderDetails.receiver_phone,
          payment_status: orderDetails.payment_status,
          order_status: orderDetails.order_status,
          items: itemsForApi,
          ...discountInfo,
          total_amount: totalAmount
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

  // New user dialog functions
  const handleOpenNewUserDialog = () => {
    setNewUser({
      name: '',
      phone: '',
      address: '',
      password: 'password' // Default password
    });
    setNewUserErrors({});
    setNewUserDialogOpen(true);
  };

  const handleCloseNewUserDialog = () => {
    setNewUserDialogOpen(false);
  };

  const handleNewUserChange = (e) => {
    const { name, value } = e.target;
    setNewUser({
      ...newUser,
      [name]: value
    });
    
    // Clear error for this field
    if (newUserErrors[name]) {
      setNewUserErrors({
        ...newUserErrors,
        [name]: ''
      });
    }
  };

  const validateNewUser = () => {
    const errors = {};
    
    if (!newUser.name.trim()) {
      errors.name = 'Name is required';
    }
    
    if (!newUser.phone.trim()) {
      errors.phone = 'Phone number is required';
    } else if (!/^\d{10}$/.test(newUser.phone)) {
      errors.phone = 'Phone number must be 10 digits';
    }
    
    if (!newUser.address.trim()) {
      errors.address = 'Address is required';
    }
    
    setNewUserErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleCreateNewUser = async () => {
    if (!validateNewUser()) return;
    
    try {
      setSubmitting(true);
      const token = localStorage.getItem('token');
      
      const response = await api.post(
        '/admin/users',
        newUser,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      
      // Add new user to the users list and select it
      const newCreatedUser = response.data;
      setUsers([...users, newCreatedUser]);
      setSelectedUser(newCreatedUser);
      
      // Close dialog
      handleCloseNewUserDialog();
      setSuccess('New customer created successfully!');
    } catch (err) {
      setError(`Failed to create user: ${err.response?.data?.detail || err.message}`);
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
                                onError={(e) => {
                                  e.target.onerror = null;
                                  e.target.src = "https://via.placeholder.com/48?text=Image+Not+Available";
                                }}
                              />
                              <Box>
                                <Typography variant="body2">
                                  {item.product.name}
                                </Typography>
                                {item.selected_size && (
                                  <Chip 
                                    size="small" 
                                    label={item.selected_size} 
                                    color="primary" 
                                    variant="outlined" 
                                  />
                                )}
                                <Typography variant="caption" color="textSecondary">
                                  Stock: {item.product.stock_quantity}
                                </Typography>
                                {item.custom_price && (
                                  <Typography variant="caption" color="primary" sx={{ display: 'block' }}>
                                    Custom Price
                                  </Typography>
                                )}
                              </Box>
                            </Box>
                          </TableCell>
                          <TableCell align="right">
                            {item.custom_price ? (
                              <Typography color="primary">₹{item.price.toFixed(2)}</Typography>
                            ) : (
                              <Typography>₹{item.price.toFixed(2)}</Typography>
                            )}
                            {item.unit && item.unit !== 'box' && (
                              <Typography variant="caption" color="textSecondary">
                                per {item.unit}
                              </Typography>
                            )}
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

          <Paper className="p-4 mb-4">
            <Typography variant="h6" gutterBottom>
              Discount Options
            </Typography>
            <FormControl fullWidth margin="normal">
              <InputLabel>Discount Type</InputLabel>
              <Select
                value={discountType}
                onChange={handleDiscountTypeChange}
                label="Discount Type"
              >
                <MenuItem value="none">No Discount</MenuItem>
                <MenuItem value="order">Order-level Discount</MenuItem>
                <MenuItem value="item">Item-level Custom Prices</MenuItem>
              </Select>
            </FormControl>
            
            {discountType === 'order' && (
              <Box className="mt-3">
                <Grid container spacing={2} alignItems="center">
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="Discount Value"
                      type="number"
                      value={orderDiscount}
                      onChange={handleOrderDiscountChange}
                      fullWidth
                      InputProps={{
                        endAdornment: (
                          <InputAdornment position="end">
                            {orderDiscountType === 'percentage' ? '%' : '₹'}
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <FormControl fullWidth>
                      <InputLabel>Discount Method</InputLabel>
                      <Select
                        value={orderDiscountType}
                        onChange={handleOrderDiscountTypeChange}
                        label="Discount Method"
                      >
                        <MenuItem value="percentage">Percentage</MenuItem>
                        <MenuItem value="fixed">Fixed Amount</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                </Grid>
                {orderDiscountType === 'percentage' && orderDiscount > 0 && (
                  <Typography variant="body2" color="textSecondary" className="mt-2">
                    Discount Amount: ₹{((orderItems.reduce((sum, item) => sum + (item.price * item.quantity), 0) * orderDiscount) / 100).toFixed(2)}
                  </Typography>
                )}
              </Box>
            )}
            
            {discountType === 'item' && (
              <Typography variant="body2" color="textSecondary" className="mt-2">
                Use custom prices when adding individual products to the order.
              </Typography>
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
            <Box className="flex justify-between items-center mb-4">
              <Typography variant="h6" gutterBottom>
                Customer Information
              </Typography>
              <Button
                startIcon={<PersonAddIcon />}
                onClick={handleOpenNewUserDialog}
                size="small"
              >
                New Customer
              </Button>
            </Box>
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
            options={products.filter(product => product.status === 'active' && product.stock_quantity > 0)}
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
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = "https://via.placeholder.com/40?text=Image+Not+Available";
                    }}
                  />
                  <Box>
                    <Typography variant="body1">{option.name}</Typography>
                    <Typography variant="body2" color="textSecondary">
                      ₹{option.price.toFixed(2)} - Stock: {option.stock_quantity} - {option.category}
                    </Typography>
                  </Box>
                </Box>
              </Box>
            )}
          />

          {selectedProduct && (
            <>
              {selectedProduct.category === 'mangoes' && customOptions.length > 0 && (
                <Box className="mt-3 mb-1">
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
                    <Typography variant="caption" color="textSecondary" sx={{ mt: 1 }}>
                      {selectedUnit === 'dozen' ? 'Price is per dozen' : `Price is per ${selectedUnit}`}
                    </Typography>
                  </FormControl>
                </Box>
              )}
              
              <Box className="mt-4">
                <Typography variant="subtitle2" gutterBottom>
                  Quantity: (Available: {selectedProduct.stock_quantity})
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
                      if (!isNaN(value) && value > 0 && value <= selectedProduct.stock_quantity) {
                        handleQuantityChange(value);
                      }
                    }}
                    size="small"
                    type="number"
                    InputProps={{ 
                      inputProps: { 
                        min: 1, 
                        max: selectedProduct.stock_quantity 
                      } 
                    }}
                    sx={{ width: 60, mx: 1 }}
                  />
                  <IconButton 
                    size="small"
                    onClick={() => handleQuantityChange(Math.min(selectedQuantity + 1, selectedProduct.stock_quantity))}
                  >
                    <AddIcon />
                  </IconButton>
                </Box>
              </Box>
              
              <Box className="mt-4">
                <FormControlLabel
                  control={
                    <Switch
                      checked={useCustomItemRate}
                      onChange={(e) => setUseCustomItemRate(e.target.checked)}
                      color="primary"
                    />
                  }
                  label="Use Custom Price"
                />
                
                {useCustomItemRate && (
                  <TextField
                    label="Custom Price (₹)"
                    type="number"
                    value={customItemRate}
                    onChange={handleCustomRateChange}
                    fullWidth
                    margin="normal"
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">₹</InputAdornment>
                      ),
                    }}
                  />
                )}
              </Box>
              
              <Box className="mt-4 flex justify-between">
                <Typography>
                  Price: ₹{(useCustomItemRate ? customItemRate : customOptions.find(o => o.size === selectedSize)?.price || selectedProduct.price).toFixed(2)}
                  {selectedUnit && selectedUnit !== 'box' && ` per ${selectedUnit}`}
                </Typography>
                <Typography>
                  Subtotal: ₹{((useCustomItemRate ? customItemRate : customOptions.find(o => o.size === selectedSize)?.price || selectedProduct.price) * selectedQuantity).toFixed(2)}
                </Typography>
              </Box>
              
              {useCustomItemRate && selectedProduct && customItemRate !== selectedProduct.price && (
                <Box className="mt-2 p-2 bg-orange-50 rounded">
                  <Typography variant="body2" color="warning.main">
                    {customItemRate > selectedProduct.price ? 'Price increased by ' : 'Price decreased by '}
                    {Math.abs(customItemRate - selectedProduct.price).toFixed(2)} (
                    {Math.round(Math.abs((customItemRate / selectedProduct.price - 1) * 100))}%)
                  </Typography>
                </Box>
              )}
            </>
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

      {/* New Customer Dialog */}
      <Dialog open={newUserDialogOpen} onClose={handleCloseNewUserDialog} maxWidth="sm" fullWidth>
        <DialogTitle>Create New Customer</DialogTitle>
        <DialogContent>
          <Box className="pt-2">
            <TextField
              name="name"
              label="Full Name"
              fullWidth
              margin="normal"
              value={newUser.name}
              onChange={handleNewUserChange}
              error={!!newUserErrors.name}
              helperText={newUserErrors.name}
              required
            />
            
            <TextField
              name="phone"
              label="Phone Number"
              fullWidth
              margin="normal"
              value={newUser.phone}
              onChange={handleNewUserChange}
              error={!!newUserErrors.phone}
              helperText={newUserErrors.phone}
              InputProps={{
                startAdornment: <InputAdornment position="start">+91</InputAdornment>,
              }}
              inputProps={{ maxLength: 10 }}
              required
            />
            
            <TextField
              name="address"
              label="Address"
              fullWidth
              margin="normal"
              multiline
              rows={2}
              value={newUser.address}
              onChange={handleNewUserChange}
              error={!!newUserErrors.address}
              helperText={newUserErrors.address}
              required
            />
            
            <Box mt={2}>
              <Typography variant="body2" color="textSecondary" gutterBottom>
                Note: A default password "password" will be set for this customer.
              </Typography>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseNewUserDialog} disabled={submitting}>
            Cancel
          </Button>
          <Button 
            onClick={handleCreateNewUser} 
            variant="contained" 
            color="primary"
            disabled={submitting}
          >
            {submitting ? <CircularProgress size={24} /> : 'Create Customer'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default CustomOrder;