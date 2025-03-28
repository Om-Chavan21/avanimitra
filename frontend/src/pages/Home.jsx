// frontend/src/pages/Home.jsx
import { useState, useEffect, useRef } from 'react';
import { 
  Container, Typography, Box, Grid, CircularProgress, 
  Paper, Button, Card, CardMedia, CardContent, useTheme
} from '@mui/material';
import ProductCategory from '../components/ProductCategory';
import api from '../utils/api';
import heroImage from '../assets/hero-bg.jpg';
import { Link as RouterLink } from 'react-router-dom';
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
  const productsRef = useRef(null);

  useEffect(() => {
    // Reset scroll position on page load
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

  // Separate products by category
  const mangoes = products.filter(product => product.category === 'mangoes');
  const otherProducts = products.filter(product => product.category !== 'mangoes');

  // Scroll to products section
  const scrollToProducts = () => {
    if (productsRef.current) {
      productsRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

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
              onClick={scrollToProducts}
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
        ref={productsRef}
        id="products"
        sx={{
          py: 8,
          px: 2,
          bgcolor: theme.palette.background.default,
          scrollMarginTop: '80px', // Ensures the section title is visible when scrolled to
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
              component={RouterLink}
              to={isAuthenticated ? "/cart" : "/login"}
              sx={{ 
                display: { xs: 'none', sm: 'flex' },
                minHeight: '36px',
                whiteSpace: 'nowrap'
              }}
            >
              Click to Order
            </Button>
          </Box>
          
          <Typography variant="body1" paragraph className="mb-8 mx-auto" sx={{ maxWidth: '900px' }}>
            All the fruits and veggies are grown without chemical pesticides and fertilisers,
            ensuring you get the healthiest, most flavorful produce possible.
          </Typography>

          {/* Seasonal Mangoes Section */}
          <ProductCategory 
            title="Seasonal Mangoes" 
            products={mangoes} 
            loading={loading} 
            error={error}
            id="mangoes"
          />

          {/* Other Organic Products */}
          <ProductCategory 
            title="Other Organic Products" 
            products={otherProducts} 
            loading={loading} 
            error={error}
            id="other-products"
          />
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
          
          <Box className="mt-8 text-center">
            <Button 
              variant="contained" 
              color="primary" 
              size="large"
              component={RouterLink}
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