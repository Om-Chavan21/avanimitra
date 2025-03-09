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
              Email: contact@avanimitra.com
            </Typography>
            <Typography variant="body2" component="p" gutterBottom>
              Phone: +91 98765 43210
            </Typography>
            <Typography variant="body2" component="p" gutterBottom>
              Address: 123, Green Avenue, Organic Valley
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
