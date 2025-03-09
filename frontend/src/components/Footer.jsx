import { Box, Container, Typography, Grid, Link as MuiLink } from '@mui/material';

const Footer = () => {
  return (
    <Box component="footer" sx={{ bgcolor: 'background.paper', py: 6, mt: 'auto' }}>
      <Container maxWidth="lg">
        <Grid container spacing={4} justifyContent="space-between">
          <Grid item xs={12} sm={6} md={3}>
            <Typography variant="h6" color="text.primary" gutterBottom>
              Avanimitra Organics
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Bringing nature's goodness to your doorstep
            </Typography>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Typography variant="h6" color="text.primary" gutterBottom>
              Quick Links
            </Typography>
            <Typography variant="body2" component="p" gutterBottom>
              <MuiLink href="/" color="inherit" underline="hover">
                Home
              </MuiLink>
            </Typography>
            <Typography variant="body2" component="p" gutterBottom>
              <MuiLink href="#about" color="inherit" underline="hover">
                About Us
              </MuiLink>
            </Typography>
            <Typography variant="body2" component="p" gutterBottom>
              <MuiLink href="#products" color="inherit" underline="hover">
                Products
              </MuiLink>
            </Typography>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Typography variant="h6" color="text.primary" gutterBottom>
              Contact
            </Typography>
            <Typography variant="body2" component="p" gutterBottom>
              Email: <MuiLink href="mailto:contact@avanimitra.com" color="inherit" underline="hover">
                contact@avanimitra.com
              </MuiLink>
            </Typography>
            <Typography variant="body2" component="p" gutterBottom>
              <MuiLink href="https://wa.me/918390770254" color="inherit" underline="hover" target="_blank" rel="noopener noreferrer">
                Chat with us on WhatsApp
              </MuiLink>
            </Typography>
            <Typography variant="body2" component="p" gutterBottom>
              Phone: +91 8390770254
            </Typography>
            <Typography variant="body2" component="p" gutterBottom>
              Address: Near MIT, Kothrud, Pune
            </Typography>
            <Typography variant="body2" component="p" gutterBottom>
              <MuiLink href="https://www.instagram.com/avanimitraorganics" color="inherit" underline="hover" target="_blank" rel="noopener noreferrer">
                <i className="fa-brands fa-instagram" /> Follow us on Instagram
              </MuiLink>
            </Typography>
          </Grid>
        </Grid>
        <Box mt={5}>
          <Typography variant="body2" color="text.secondary" align="center">
            {'© '}
            {new Date().getFullYear()}{' '}
            <MuiLink color="inherit" href="/">
              Avanimitra Organics
            </MuiLink>
            {' | All rights reserved.'}
          </Typography>
        </Box>
      </Container>
    </Box>
  );
};

export default Footer;
