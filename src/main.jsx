import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { ThemeProvider, createTheme } from '@mui/material/styles'
import CssBaseline from '@mui/material/CssBaseline'
import './index.css'
import App from './App.jsx'

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#0d2149',
      light: '#2c4a7c',
      dark: '#081530',
      contrastText: '#ffffff'
    },
    secondary: {
      main: '#b08d57'
    },
    background: {
      default: '#f4f5f7',
      paper: '#ffffff'
    },
    text: {
      primary: '#1a1a1a',
      secondary: '#5f6368'
    }
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h5: {
      fontWeight: 600,
      letterSpacing: '-0.02em'
    },
    subtitle1: {
      fontWeight: 600,
      textTransform: 'uppercase',
      fontSize: '0.8rem',
      letterSpacing: '0.08em',
      color: '#5f6368'
    }
  },
  shape: {
    borderRadius: 10
  },
  components: {
    MuiTextField: {
      defaultProps: {
        variant: 'outlined',
        size: 'medium'
      }
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 600,
          borderRadius: 8
        }
      }
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none'
        }
      }
    }
  }
})

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <App />
    </ThemeProvider>
  </StrictMode>,
)
