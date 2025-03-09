import { useState, useEffect } from 'react';
import { 
  Container, Typography, Box, Grid, CircularProgress, 
  Paper
} from '@mui/material';
import ProductCard from '../components/ProductCard';
import api from '../utils/api';
import heroImage from '../assets/hero-bg.jpg'; // You'll need to add this image

const Home = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await api.get('/products');
        setProducts(response.data);
      } catch (error) {
        setError('Failed to fetch products. Please try again later.');
        console.error('Error fetching products:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  return (
    <div>
      {/* Hero Section */}
      <Box 
        className="bg-cover bg-center py-20 text-white relative"
        sx={{
          backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.7)), url(${heroImage})`,
          minHeight: '70vh',
          display: 'flex',
          alignItems: 'center'
        }}
      >
        <Container maxWidth="md">
          <Typography 
            variant="h1" 
            component="h1" 
            align="center" 
            className="font-bold mb-4"
            sx={{ fontSize: { xs: '2.5rem', md: '4rem' } }}
          >
            Avanimitra
          </Typography>
          <Typography 
            variant="h4" 
            component="p" 
            align="center"
            className="mb-8"
            sx={{ fontSize: { xs: '1.2rem', md: '1.8rem' } }}
          >
            Nature's Bounty, Delivered Fresh
          </Typography>
          <Typography 
            variant="body1" 
            align="center" 
            className="max-w-2xl mx-auto"
            sx={{ fontSize: { xs: '1rem', md: '1.1rem' } }}
          >
            Experience the pure taste of organic fruits, harvested at peak ripeness and delivered straight from our farms to your doorstep.
          </Typography>
        </Container>
      </Box>

      {/* Products Section */}
      <Container maxWidth="xl" className="py-12">
        <Typography variant="h3" component="h2" align="center" gutterBottom>
          Our Organic Products
        </Typography>
        <Typography variant="body1" align="center" paragraph className="mb-8 max-w-2xl mx-auto">
          We grow our fruits without synthetic pesticides or fertilizers, ensuring you get the healthiest, most flavorful produce possible.
        </Typography>

        {loading ? (
          <Box display="flex" justifyContent="center" p={4}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Paper className="p-4 text-center text-red-500">
            {error}
          </Paper>
        ) : (
          <Grid container spacing={4}>
            {products.map((product) => (
              <Grid item key={product.id} xs={12} sm={6} md={4} lg={3}>
                <ProductCard product={product} />
              </Grid>
            ))}
          </Grid>
        )}
      </Container>

      {/* About Section */}
      <Box className="bg-gray-100 py-16" id="about">
        <Container maxWidth="md">
          <Typography variant="h3" component="h2" align="center" gutterBottom>
            About Avanimitra
          </Typography>
          <Typography variant="body1" paragraph className="text-center mb-8">
            Avanimitra is dedicated to cultivating the finest organic fruits using sustainable farming practices that respect our environment and promote biodiversity.
          </Typography>
          <Grid container spacing={4}>
            <Grid item xs={12} md={4}>
              <Box className="text-center">
                <Typography variant="h6" gutterBottom>Organic Certified</Typography>
                <Typography variant="body2">
                  All our produce is certified organic, meeting the strictest standards in the industry.
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} md={4}>
              <Box className="text-center">
                <Typography variant="h6" gutterBottom>Farm to Table</Typography>
                <Typography variant="body2">
                  We deliver directly from our farms to your doorstep, ensuring maximum freshness.
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} md={4}>
              <Box className="text-center">
                <Typography variant="h6" gutterBottom>Sustainable Practices</Typography>
                <Typography variant="body2">
                  Our farming methods preserve soil health and promote ecological balance.
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>
    </div>
  );
};

export default Home;
