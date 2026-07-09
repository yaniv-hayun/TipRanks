import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#6C63FF',
      light: '#8B83FF',
      dark: '#4A42CC',
    },
    secondary: {
      main: '#00D4AA',
      light: '#33DDBB',
      dark: '#00A888',
    },
    background: {
      default: '#0A0E1A',
      paper: '#131729',
    },
    text: {
      primary: '#E8ECF4',
      secondary: '#8B92A8',
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h4: {
      fontWeight: 700,
      letterSpacing: '-0.02em',
    },
    body2: {
      color: '#8B92A8',
    },
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          border: '1px solid rgba(108, 99, 255, 0.12)',
        },
      },
    },
    MuiListSubheader: {
      styleOverrides: {
        root: {
          backgroundColor: 'transparent',
          fontWeight: 700,
          fontSize: '0.7rem',
          letterSpacing: '0.12em',
          textTransform: 'uppercase' as const,
          color: '#8B92A8',
          lineHeight: '32px',
          paddingTop: 8,
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          fontWeight: 600,
          fontSize: '0.65rem',
          letterSpacing: '0.04em',
          height: 22,
        },
      },
    },
  },
});

export default theme;
