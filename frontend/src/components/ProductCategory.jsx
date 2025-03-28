// frontend/src/components/ProductCategory.jsx
import React from 'react';
import { Typography, Box, Grid, CircularProgress, Paper } from '@mui/material';
import ProductCard from './ProductCard';

const ProductCategory = ({ title, products, loading, error, id }) => {
  if (loading) {
    return (
      <Box display="flex" justifyContent="center" p={4}>
        <CircularProgress />
      </Box>
    );
  }
  
  if (error) {
    return (
      <Paper className="p-4 text-center text-red-500 my-4">
        {error}
      </Paper>
    );
  }
  
  if (!products || products.length === 0) {
    return null;
  }
  
  return (
    <Box id={id} className="mb-10">
      <Typography variant="h4" component="h2" gutterBottom className="mt-8 mb-4">
        {title}
      </Typography>
      <Grid container spacing={3}>
        {products.map((product) => (
          <Grid item key={product.id} xs={6} sm={4} md={3} lg={3}>
            <ProductCard product={product} />
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default ProductCategory;