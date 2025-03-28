// frontend/src/theme.jsx
import { createTheme, responsiveFontSizes } from '@mui/material/styles';

// Color palette option 2: Pear green and Dark Pastel green
let theme = createTheme({
  palette: {
    primary: {
      main: '#45B649',
      light: '#7ed56f',
      dark: '#2b8a2b',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#DCE35B',
      light: '#e6eb85',
      dark: '#b7bc3c',
      contrastText: '#000000',
    },
    background: {
      default: '#f9f9f9',
      paper: '#ffffff',
    },
    text: {
      primary: '#333333',
      secondary: '#666666',
    },
    success: {
      main: '#4CAF50',
    },
    warning: {
      main: '#FFC93C',
    },
    error: {
      main: '#FF5252',
    },
    info: {
      main: '#87CEEB',
    },
  },
  typography: {
    fontFamily: '"Poppins", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontWeight: 700,
      fontSize: '2.5rem', // Smaller base size for better mobile scaling
    },
    h2: {
      fontWeight: 700,
      fontSize: '2.0rem',
    },
    h3: {
      fontWeight: 600,
      fontSize: '1.75rem',
    },
    h4: {
      fontWeight: 600,
      fontSize: '1.5rem',
    },
    h5: {
      fontWeight: 500,
      fontSize: '1.25rem',
    },
    h6: {
      fontWeight: 500,
      fontSize: '1.1rem',
    },
    button: {
      fontWeight: 500,
      textTransform: 'none',
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          boxShadow: 'none',
          '&:hover': {
            boxShadow: '0px 2px 4px rgba(0,0,0,0.2)',
          },
        },
        contained: {
          '&:hover': {
            boxShadow: '0px 2px 4px rgba(0,0,0,0.2)',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: '0px 2px 8px rgba(0,0,0,0.1)',
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          background: 'linear-gradient(135deg, #45B649 0%, #DCE35B 100%)',
          boxShadow: '0px 2px 10px rgba(0,0,0,0.1)',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 12,
        },
      },
    },
    // Mobile-specific adjustments
    MuiContainer: {
      styleOverrides: {
        root: {
          '@media (max-width:600px)': {
            padding: '0 12px',
          },
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          '@media (max-width:600px)': {
            padding: '8px',
          },
        },
      },
    },
  },
});

// Make typography responsive
theme = responsiveFontSizes(theme);

export { theme };
export default theme;