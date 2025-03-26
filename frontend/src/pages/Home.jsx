import { useState, useEffect } from 'react';
import { 
  Container, Typography, Box, Grid, CircularProgress, 
  Paper, Button, Card, CardMedia, CardContent, useTheme
} from '@mui/material';
import ProductCard from '../components/ProductCard';
import api from '../utils/api';
import heroImage from '../assets/hero-bg.jpg';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import { styled } from '@mui/material/styles';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import PhoneIcon from '@mui/icons-material/Phone';

const StyledHeroBox = styled(Box)(({ theme }) => ({
  backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.7)), url(${heroImage})`,
  backgroundSize: 'cover',
  backgroundPosition: 'center',
  minHeight: '70vh',
  display: 'flex',
  alignItems: 'center',
  position: 'relative'
}));

const Home = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { isAuthenticated } = useAuth();
  const theme = useTheme();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

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
      <StyledHeroBox>
        <Container maxWidth="md">
          <Typography 
            variant="h1" 
            component="h1" 
            align="center" 
            className="font-bold mb-4 text-white"
            sx={{ fontSize: { xs: '2.5rem', md: '4rem' } }}
          >
            Avani Mitra
          </Typography>
          <Typography 
            variant="h4" 
            component="p" 
            align="center"
            className="mb-6 text-white"
            sx={{ fontSize: { xs: '1.2rem', md: '1.8rem' } }}
          >
            Savour the best farm harvests in India
          </Typography>
          <Typography 
            variant="body1" 
            align="center" 
            className="mx-auto text-white"
            sx={{ fontSize: { xs: '1rem', md: '1.1rem' }, maxWidth: '800px' }}
          >
            Connecting farmers to consumers. Organic, Local and Fresh.
            We deliver seasonal fruits, staple lentils and value added products to make your daily meals wholesome and flavorful.
          </Typography>
          <Box className="flex justify-center mt-8">
            <Button 
              variant="contained" 
              size="large" 
              color="secondary"
              component={Link}
              to={isAuthenticated ? "/cart" : "/login"}
              endIcon={<ShoppingCartIcon />}
              sx={{
                fontWeight: 'bold',
                px: 4,
                py: 1.5
              }}
            >
              Shop Now
            </Button>
          </Box>
        </Container>
      </StyledHeroBox>

      {/* Products Section */}
      <Box 
        sx={{
          py: 8,
          px: 2,
          bgcolor: theme.palette.background.default
        }}
      >
        <Container maxWidth="xl">
          <Box className="flex justify-between items-center mb-6">
            <Typography variant="h3" component="h2" gutterBottom>
              Our Organic Products
            </Typography>
            <Button 
              variant="contained" 
              color="primary"
              component={Link}
              to={isAuthenticated ? "/cart" : "/login"}
              endIcon={<ShoppingCartIcon />}
            >
              Click to Order
            </Button>
          </Box>
          
          <Typography variant="body1" paragraph className="mb-8 mx-auto" sx={{ maxWidth: '900px' }}>
            All the fruits and veggies are grown without chemical pesticides and fertilisers,
            ensuring you get the healthiest, most flavorful produce possible.
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
      </Box>

      {/* Contact Section */}
      <Box sx={{ 
        py: 8, 
        background: 'linear-gradient(135deg, #DCE35B 0%, #45B649 100%)',
        color: 'text.primary'
      }}>
        <Container maxWidth="lg">
          <Typography variant="h3" component="h2" align="center" gutterBottom>
            Contact Us
          </Typography>
          <Grid container spacing={4} justifyContent="center" className="mt-4">
            <Grid item xs={12} md={4}>
              <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', p: 3 }}>
                <WhatsAppIcon sx={{ fontSize: 50, color: '#25D366', mb: 2 }} />
                <Typography variant="h6" gutterBottom>WhatsApp</Typography>
                <Button 
                  variant="outlined" 
                  href="https://wa.me/918390770254" 
                  target="_blank"
                  sx={{ mt: 2 }}
                >
                  Chat with us
                </Button>
                <Typography variant="body2" color="text.secondary" className="mt-2">
                  +91 8390770254
                </Typography>
              </Card>
            </Grid>
            
            <Grid item xs={12} md={4}>
              <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', p: 3 }}>
                <PhoneIcon sx={{ fontSize: 50, color: theme.palette.primary.main, mb: 2 }} />
                <Typography variant="h6" gutterBottom>Call Us</Typography>
                <Button 
                  variant="outlined" 
                  href="tel:+918390770254"
                  sx={{ mt: 2 }}
                >
                  Make a call
                </Button>
                <Typography variant="body2" color="text.secondary" className="mt-2">
                  +91 8390770254
                </Typography>
              </Card>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* About Section */}
      <Box sx={{ 
        py: 8, 
        bgcolor: theme.palette.background.default
      }} id="about">
        <Container maxWidth="md">
          <Typography variant="h3" component="h2" align="center" gutterBottom>
            About Avani Mitra
          </Typography>
          {/* <Typography variant="body1" paragraph className="text-center mb-8">
            Avani Mitra is dedicated to cultivating the finest organic fruits using sustainable 
            farming practices that respect our environment and promote biodiversity.
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
          </Grid> */}
          
          <Box className="mt-8 text-center">
            <Button 
              variant="contained" 
              color="primary" 
              size="large"
              component={Link}
              to="/about"
            >
              Learn More About Us
            </Button>
          </Box>
        </Container>
      </Box>
    </div>
  );
};

export default Home;