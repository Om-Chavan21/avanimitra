// frontend/src/pages/admin/ProductManagement.jsx
import { useState, useEffect } from 'react';
import {
  Container, Typography, Box, Paper, Button, TextField, Grid,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Dialog, DialogTitle, DialogContent, DialogActions, IconButton,
  CircularProgress, FormControl, InputLabel, Select, MenuItem, Alert,
  Card, CardMedia, Tabs, Tab, FormControlLabel, Switch, Tooltip
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import api from '../../utils/api';

const ProductManagement = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  
  // Dialog states
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogMode, setDialogMode] = useState('add'); // 'add', 'edit', or 'duplicate'
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    stock_quantity: '',
    category: '',
    image_url: '',
    status: '',
    has_custom_options: false,
    custom_options: []
  });
  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Delete confirmation dialog
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);
  
  // Product categories
  const categories = [
    'mangoes', 'apples', 'bananas', 'berries', 'citrus', 'grapes', 
    'melons', 'stone_fruits', 'tropical', 'other'
  ];
  
  // Product statuses
  const statuses = ['active', 'inactive', 'out_of_stock', 'seasonal'];
  
  // Tab for managoes vs other products
  const [tabValue, setTabValue] = useState(0);
  
  useEffect(() => {
    fetchProducts();
  }, []);
  
  const fetchProducts = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await api.get('/admin/products', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setProducts(response.data);
      setError('');
    } catch (err) {
      setError('Failed to fetch products. Please try again.');
      console.error('Error fetching products:', err);
    } finally {
      setLoading(false);
    }
  };
  
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleOpenDialog = (mode, product = null) => {
    setDialogMode(mode);
    if (mode === 'edit' || mode === 'duplicate') {
      const productCopy = {
        id: mode === 'edit' ? product.id : undefined,
        name: product.name,
        description: product.description,
        price: product.price.toString(),
        stock_quantity: product.stock_quantity.toString(),
        category: product.category,
        image_url: product.image_url,
        status: product.status,
        has_custom_options: product.has_custom_options || false,
        custom_options: product.custom_options || []
      };
      
      // If it's a duplicate, modify the name slightly
      if (mode === 'duplicate') {
        productCopy.name = `${productCopy.name} (Copy)`;
      }
      
      setFormData(productCopy);
    } else {
      // Default values for new product
      setFormData({
        name: '',
        description: '',
        price: '',
        stock_quantity: '',
        category: 'other', // Default category
        image_url: '',
        status: 'active', // Default status
        has_custom_options: false,
        custom_options: []
      });
    }
    setFormErrors({});
    setOpenDialog(true);
  };
  
  const handleCloseDialog = () => {
    setOpenDialog(false);
  };
  
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === 'checkbox' ? checked : value;
    
    setFormData({
      ...formData,
      [name]: newValue
    });
    
    // Clear the error for this field
    if (formErrors[name]) {
      setFormErrors({
        ...formErrors,
        [name]: ''
      });
    }
  };
  
  const validateForm = () => {
    const errors = {};
    if (!formData.name.trim()) errors.name = 'Name is required';
    if (!formData.description.trim()) errors.description = 'Description is required';
    if (!formData.price) errors.price = 'Price is required';
    else if (isNaN(formData.price) || parseFloat(formData.price) <= 0) {
      errors.price = 'Price must be a positive number';
    }
    if (!formData.stock_quantity) errors.stock_quantity = 'Stock quantity is required';
    else if (isNaN(formData.stock_quantity) || parseInt(formData.stock_quantity) < 0) {
      errors.stock_quantity = 'Stock quantity must be a non-negative number';
    }
    if (!formData.category) errors.category = 'Category is required';
    if (!formData.image_url.trim()) errors.image_url = 'Image URL is required';
    if (!formData.status) errors.status = 'Status is required';
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };
  
  const handleSubmit = async () => {
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    setSuccess('');
    setError('');
    
    try {
      const token = localStorage.getItem('token');
      const payload = {
        ...formData,
        price: parseFloat(formData.price),
        stock_quantity: parseInt(formData.stock_quantity)
      };
      
      if (dialogMode === 'add' || dialogMode === 'duplicate') {
        await api.post('/admin/products', payload, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setSuccess('Product added successfully!');
      } else {
        const { id, ...updatePayload } = payload;
        await api.put(`/admin/products/${id}`, updatePayload, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setSuccess('Product updated successfully!');
      }
      
      // Refresh products list
      fetchProducts();
      handleCloseDialog();
    } catch (err) {
      setError(`Failed to ${dialogMode === 'add' ? 'add' : 'update'} product: ${err.response?.data?.detail || err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleOpenDeleteDialog = (product) => {
    setProductToDelete(product);
    setDeleteDialogOpen(true);
  };
  
  const handleCloseDeleteDialog = () => {
    setDeleteDialogOpen(false);
    setProductToDelete(null);
  };
  
  const handleDeleteProduct = async () => {
    if (!productToDelete) return;
    
    setIsSubmitting(true);
    setSuccess('');
    setError('');
    
    try {
      const token = localStorage.getItem('token');
      await api.delete(`/admin/products/${productToDelete.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setSuccess('Product deleted successfully!');
      fetchProducts();
    } catch (err) {
      setError(`Failed to delete product: ${err.response?.data?.detail || err.message}`);
    } finally {
      setIsSubmitting(false);
      handleCloseDeleteDialog();
    }
  };

  // Filter products based on category and status
  const filterProducts = (products) => {
    return products.filter(product => {
      const categoryMatch = categoryFilter === 'all' || product.category === categoryFilter;
      const statusMatch = statusFilter === 'all' || product.status === statusFilter;
      return categoryMatch && statusMatch;
    });
  };
  
  // Separate products by category for tabs
  const mangoes = products.filter(product => product.category === 'mangoes');
  const otherProducts = products.filter(product => product.category !== 'mangoes');
  
  // Get the correct list based on current tab and filters
  const displayProducts = tabValue === 0 ? 
    filterProducts(products) : 
    tabValue === 1 ? 
    filterProducts(mangoes) : 
    filterProducts(otherProducts);
  
  return (
    <Container maxWidth="lg" className="py-8">
      <Box className="flex justify-between items-center mb-6">
        <Typography variant="h4" component="h1">
          Product Management
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog('add')}
        >
          Add Product
        </Button>
      </Box>
      
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
      
      <Box className="mb-4">
        <Tabs value={tabValue} onChange={handleTabChange}>
          <Tab label="All Products" />
          <Tab label="Mangoes" />
          <Tab label="Other Products" />
        </Tabs>
      </Box>
      
      <Box className="flex flex-wrap gap-4 mb-4">
        <FormControl size="small" sx={{ minWidth: 150 }}>
          <InputLabel>Category</InputLabel>
          <Select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            label="Category"
          >
            <MenuItem value="all">All Categories</MenuItem>
            {categories.map(category => (
              <MenuItem key={category} value={category}>
                {category.replace('_', ' ')}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        
        <FormControl size="small" sx={{ minWidth: 150 }}>
          <InputLabel>Status</InputLabel>
          <Select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            label="Status"
          >
            <MenuItem value="all">All Statuses</MenuItem>
            {statuses.map(status => (
              <MenuItem key={status} value={status}>
                {status}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>
      
      {loading ? (
        <Box display="flex" justifyContent="center" p={4}>
          <CircularProgress />
        </Box>
      ) : displayProducts.length === 0 ? (
        <Paper className="p-4 text-center">
          <Typography color="textSecondary">No products found</Typography>
        </Paper>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Image</TableCell>
                <TableCell>Name</TableCell>
                <TableCell>Category</TableCell>
                <TableCell align="right">Price (₹)</TableCell>
                <TableCell align="right">Stock</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {displayProducts.map((product) => (
                <TableRow key={product.id}>
                  <TableCell>
                    <img 
                      src={product.image_url} 
                      alt={product.name} 
                      className="w-16 h-16 object-cover"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = "https://via.placeholder.com/150?text=Image+Error";
                      }}
                    />
                  </TableCell>
                  <TableCell>{product.name}</TableCell>
                  <TableCell>{product.category}</TableCell>
                  <TableCell align="right">{product.price.toFixed(2)}</TableCell>
                  <TableCell align="right">{product.stock_quantity}</TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded text-xs ${
                      product.status === 'active' 
                        ? 'bg-green-100 text-green-800' 
                        : product.status === 'inactive'
                          ? 'bg-gray-100 text-gray-800'
                          : product.status === 'seasonal'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-red-100 text-red-800'
                    }`}>
                      {product.status}
                    </span>
                  </TableCell>
                  <TableCell align="center">
                    <Tooltip title="Edit">
                      <IconButton 
                        color="primary" 
                        onClick={() => handleOpenDialog('edit', product)}
                        size="small"
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Duplicate">
                      <IconButton 
                        color="info" 
                        onClick={() => handleOpenDialog('duplicate', product)}
                        size="small"
                      >
                        <ContentCopyIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete">
                      <IconButton 
                        color="error" 
                        onClick={() => handleOpenDeleteDialog(product)}
                        size="small"
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
      
      {/* Add/Edit Product Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {dialogMode === 'add' ? 'Add New Product' : dialogMode === 'duplicate' ? 'Duplicate Product' : 'Edit Product'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} className="pt-2">
            <Grid item xs={12} sm={6}>
              <TextField
                name="name"
                label="Product Name"
                fullWidth
                value={formData.name}
                onChange={handleInputChange}
                error={!!formErrors.name}
                helperText={formErrors.name}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth error={!!formErrors.category} required>
                <InputLabel>Category</InputLabel>
                <Select
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  label="Category"
                >
                  {categories.map((category) => (
                    <MenuItem key={category} value={category}>
                      {category.replace('_', ' ')}
                    </MenuItem>
                  ))}
                </Select>
                {formErrors.category && (
                  <Typography variant="caption" color="error">
                    {formErrors.category}
                  </Typography>
                )}
              </FormControl>
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                name="description"
                label="Description"
                fullWidth
                multiline
                rows={3}
                value={formData.description}
                onChange={handleInputChange}
                error={!!formErrors.description}
                helperText={formErrors.description}
                required
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                name="price"
                label="Price (₹)"
                fullWidth
                type="number"
                value={formData.price}
                onChange={handleInputChange}
                error={!!formErrors.price}
                helperText={formErrors.price}
                inputProps={{ min: 0, step: 0.01 }}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                name="stock_quantity"
                label="Stock Quantity"
                fullWidth
                type="number"
                value={formData.stock_quantity}
                onChange={handleInputChange}
                error={!!formErrors.stock_quantity}
                helperText={formErrors.stock_quantity}
                inputProps={{ min: 0, step: 1 }}
                required
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                name="image_url"
                label="Image URL"
                fullWidth
                value={formData.image_url}
                onChange={handleInputChange}
                error={!!formErrors.image_url}
                helperText={formErrors.image_url}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth error={!!formErrors.status} required>
                <InputLabel>Status</InputLabel>
                <Select
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  label="Status"
                >
                  {statuses.map((status) => (
                    <MenuItem key={status} value={status}>
                      {status}
                    </MenuItem>
                  ))}
                </Select>
                {formErrors.status && (
                  <Typography variant="caption" color="error">
                    {formErrors.status}
                  </Typography>
                )}
              </FormControl>
            </Grid>
            
            {formData.image_url && (
              <Grid item xs={12}>
                <Typography variant="subtitle2" gutterBottom>
                  Image Preview
                </Typography>
                <Card className="w-full h-48 bg-gray-100 flex items-center justify-center overflow-hidden">
                  <CardMedia
                    component="img" 
                    image={formData.image_url}
                    alt="Product preview" 
                    className="max-h-full object-contain"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = "https://via.placeholder.com/400x300?text=Invalid+Image+URL";
                    }}
                  />
                </Card>
              </Grid>
            )}
            
            {formData.category === 'mangoes' && (
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={formData.has_custom_options}
                      onChange={handleInputChange}
                      name="has_custom_options"
                    />
                  }
                  label="This product has custom sizing options"
                />
                <Typography variant="caption" color="text.secondary">
                  Enable this for products with different sizes or packaging options
                </Typography>
              </Grid>
            )}
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit} 
            variant="contained" 
            color="primary"
            disabled={isSubmitting}
          >
            {isSubmitting ? <CircularProgress size={24} /> : 'Save'}
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={handleCloseDeleteDialog}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete "{productToDelete?.name}"? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteDialog} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button 
            onClick={handleDeleteProduct} 
            color="error" 
            variant="contained"
            disabled={isSubmitting}
          >
            {isSubmitting ? <CircularProgress size={24} /> : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default ProductManagement;