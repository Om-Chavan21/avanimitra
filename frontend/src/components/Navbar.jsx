import { useState } from 'react';
import {
  AppBar, Button, Toolbar, Typography, Box, IconButton,
  Badge, Menu, MenuItem, Avatar, Tooltip, Divider
} from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import PersonIcon from '@mui/icons-material/Person';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import LogoutIcon from '@mui/icons-material/Logout';
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
  const [adminMenuAnchorEl, setAdminMenuAnchorEl] = useState(null);
  
  const handleProfileMenuOpen = (event) => {
    setProfileAnchorEl(event.currentTarget);
  };
  
  const handleProfileMenuClose = () => {
    setProfileAnchorEl(null);
  };
  
  const handleAdminMenuOpen = (event) => {
    setAdminMenuAnchorEl(event.currentTarget);
  };
  
  const handleAdminMenuClose = () => {
    setAdminMenuAnchorEl(null);
  };
  
  const handleNavigate = (path) => {
    navigate(path);
    handleProfileMenuClose();
    handleAdminMenuClose();
  };
  
  const handleLogout = () => {
    logout();
    handleProfileMenuClose();
    handleAdminMenuClose();
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
              <>
                <Tooltip title="Admin Menu">
                  <IconButton
                    color="inherit"
                    onClick={handleAdminMenuOpen}
                    sx={{ ml: 2 }}
                  >
                    <Avatar sx={{ width: 32, height: 32, bgcolor: 'secondary.main' }}>
                      <AdminPanelSettingsIcon />
                    </Avatar>
                  </IconButton>
                </Tooltip>
                <Menu
                  anchorEl={adminMenuAnchorEl}
                  open={Boolean(adminMenuAnchorEl)}
                  onClose={handleAdminMenuClose}
                  transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                  anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                >
                  <MenuItem onClick={() => handleNavigate('/admin-dashboard')}>
                    Dashboard
                  </MenuItem>
                  <MenuItem onClick={() => handleNavigate('/admin/products')}>
                    Manage Products
                  </MenuItem>
                  <MenuItem onClick={() => handleNavigate('/admin/orders')}>
                    Manage Orders
                  </MenuItem>
                  <MenuItem onClick={() => handleNavigate('/admin/users')}>
                    Manage Users
                  </MenuItem>
                  <Divider />
                  <MenuItem onClick={handleLogout}>
                    <LogoutIcon fontSize="small" className="mr-2" />
                    Logout
                  </MenuItem>
                </Menu>
              </>
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
                    <LogoutIcon fontSize="small" className="mr-2" />
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
