import { useState } from 'react';
import { 
  AppBar, Button, Toolbar, Typography, Box, IconButton, 
  Badge, Menu, MenuItem, Avatar, Tooltip, Divider
} from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import PersonIcon from '@mui/icons-material/Person';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

const Navbar = () => {
  const auth = useAuth();
  const cart = useCart();
  const navigate = useNavigate();
  
  // Safety checks
  const isAuthenticated = auth?.isAuthenticated;
  const user = auth?.user;
  const logout = auth?.logout;
  const cartItems = cart?.cart?.items || [];
  
  const [profileAnchorEl, setProfileAnchorEl] = useState(null);

  const handleProfileMenuOpen = (event) => {
    setProfileAnchorEl(event.currentTarget);
  };

  const handleProfileMenuClose = () => {
    setProfileAnchorEl(null);
  };

  const handleNavigate = (path) => {
    navigate(path);
    handleProfileMenuClose();
  };

  const handleLogout = () => {
    logout();
    handleProfileMenuClose();
  };

  return (
    <AppBar position="static">
      <Toolbar>
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          <Link to="/" className="text-white no-underline">
            Avanimitra Organics
          </Link>
        </Typography>
        
        {isAuthenticated ? (
          <Box display="flex" alignItems="center">
            {user?.is_admin ? (
              <Button 
                color="inherit" 
                component={Link} 
                to="/admin-dashboard"
              >
                Admin Panel
              </Button>
            ) : (
              <>
                <Tooltip title="Cart">
                  <IconButton 
                    color="inherit"
                    component={Link}
                    to="/cart"
                  >
                    <Badge badgeContent={cartItems.length} color="error">
                      <ShoppingCartIcon />
                    </Badge>
                  </IconButton>
                </Tooltip>

                <Tooltip title="Account">
                  <IconButton
                    color="inherit"
                    onClick={handleProfileMenuOpen}
                    sx={{ ml: 2 }}
                  >
                    <Avatar sx={{ width: 32, height: 32, bgcolor: 'secondary.main' }}>
                      <PersonIcon />
                    </Avatar>
                  </IconButton>
                </Tooltip>

                <Menu
                  anchorEl={profileAnchorEl}
                  open={Boolean(profileAnchorEl)}
                  onClose={handleProfileMenuClose}
                  transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                  anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                >
                  <MenuItem onClick={() => handleNavigate('/profile')}>
                    Edit Profile
                  </MenuItem>
                  <MenuItem onClick={() => handleNavigate('/orders')}>
                    Order History
                  </MenuItem>
                  <Divider />
                  <MenuItem onClick={handleLogout}>
                    Logout
                  </MenuItem>
                </Menu>
              </>
            )}
          </Box>
        ) : (
          <Box>
            <Button color="inherit" component={Link} to="/login">
              Login
            </Button>
            <Button color="inherit" component={Link} to="/signup">
              Sign Up
            </Button>
          </Box>
        )}
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;
