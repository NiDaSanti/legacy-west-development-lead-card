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
      main: '#b08d57',
      light: '#c8a878',
      dark: '#8c6f42'
    },
    background: {
      default: '#f0f2f6',
      paper: '#ffffff'
    },
    text: {
      primary: '#1a1a1a',
      secondary: '#5f6368'
    },
    divider: 'rgba(13, 33, 73, 0.08)'
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h5: {
      fontWeight: 700,
      letterSpacing: '-0.02em'
    },
    subtitle1: {
      fontWeight: 700,
      textTransform: 'uppercase',
      fontSize: '0.78rem',
      letterSpacing: '0.1em',
      color: '#0d2149'
    }
  },
  shape: {
    borderRadius: 12
  },
  shadows: [
    'none',
    '0 1px 2px rgba(13,33,73,0.05)',
    '0 2px 6px rgba(13,33,73,0.06)',
    '0 4px 10px rgba(13,33,73,0.07)',
    '0 6px 16px rgba(13,33,73,0.08)',
    '0 8px 20px rgba(13,33,73,0.09)',
    '0 10px 24px rgba(13,33,73,0.10)',
    '0 12px 28px rgba(13,33,73,0.10)',
    '0 14px 32px rgba(13,33,73,0.11)',
    '0 16px 36px rgba(13,33,73,0.11)',
    '0 18px 40px rgba(13,33,73,0.12)',
    '0 20px 44px rgba(13,33,73,0.12)',
    '0 22px 48px rgba(13,33,73,0.13)',
    '0 24px 52px rgba(13,33,73,0.13)',
    '0 26px 56px rgba(13,33,73,0.13)',
    '0 28px 60px rgba(13,33,73,0.14)',
    '0 30px 64px rgba(13,33,73,0.14)',
    '0 32px 68px rgba(13,33,73,0.14)',
    '0 34px 72px rgba(13,33,73,0.15)',
    '0 36px 76px rgba(13,33,73,0.15)',
    '0 38px 80px rgba(13,33,73,0.15)',
    '0 40px 84px rgba(13,33,73,0.16)',
    '0 42px 88px rgba(13,33,73,0.16)',
    '0 44px 92px rgba(13,33,73,0.16)',
    '0 46px 96px rgba(13,33,73,0.17)'
  ],
  components: {
    MuiTextField: {
      defaultProps: {
        variant: 'outlined',
        size: 'medium'
      },
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            transition: 'box-shadow 0.2s ease',
            '&.Mui-focused': {
              boxShadow: '0 0 0 3px rgba(176,141,87,0.18)'
            }
          }
        }
      }
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 700,
          borderRadius: 10
        },
        containedPrimary: {
          background: 'linear-gradient(135deg, #0d2149 0%, #1c3568 100%)',
          boxShadow: '0 6px 16px rgba(13,33,73,0.25)',
          '&:hover': {
            background: 'linear-gradient(135deg, #081530 0%, #14294f 100%)',
            boxShadow: '0 8px 20px rgba(13,33,73,0.32)'
          }
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
