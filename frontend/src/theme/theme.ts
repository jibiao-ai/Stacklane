import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: {
      main: '#165DFF',
      light: '#4080FF',
      dark: '#0E42D2',
      contrastText: '#FFFFFF',
    },
    secondary: {
      main: '#14C9C9',
      light: '#37D4D4',
      dark: '#0FA5A5',
    },
    error: {
      main: '#F53F3F',
      light: '#F76560',
      dark: '#CB2634',
    },
    warning: {
      main: '#FF7D00',
      light: '#FF9A2E',
      dark: '#D25F00',
    },
    success: {
      main: '#00B42A',
      light: '#27C346',
      dark: '#009A29',
    },
    background: {
      default: '#F7F8FA',
      paper: '#FFFFFF',
    },
    text: {
      primary: '#1D2129',
      secondary: '#4E5969',
      disabled: '#C9CDD4',
    },
    divider: '#E5E6EB',
  },
  typography: {
    fontFamily: '"Inter", "PingFang SC", "HarmonyOS Sans SC", -apple-system, BlinkMacSystemFont, sans-serif',
    h1: { fontSize: '2rem', fontWeight: 600, lineHeight: 1.3 },
    h2: { fontSize: '1.5rem', fontWeight: 600, lineHeight: 1.4 },
    h3: { fontSize: '1.25rem', fontWeight: 600, lineHeight: 1.4 },
    h4: { fontSize: '1.125rem', fontWeight: 500, lineHeight: 1.5 },
    h5: { fontSize: '1rem', fontWeight: 500, lineHeight: 1.5 },
    h6: { fontSize: '0.875rem', fontWeight: 500, lineHeight: 1.5 },
    body1: { fontSize: '0.875rem', lineHeight: 1.6 },
    body2: { fontSize: '0.75rem', lineHeight: 1.5 },
  },
  shape: {
    borderRadius: 8,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 500,
          borderRadius: 8,
          boxShadow: 'none',
          '&:hover': {
            boxShadow: 'none',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
          border: '1px solid #E5E6EB',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          fontSize: '0.875rem',
          padding: '12px 16px',
        },
        head: {
          fontWeight: 600,
          backgroundColor: '#F7F8FA',
          color: '#4E5969',
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 4,
          fontWeight: 500,
          fontSize: '0.75rem',
        },
      },
    },
  },
});

export default theme;
