// File: /apps/web/src/App.tsx
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Container, Box, AppBar, Toolbar, Typography } from '@mui/material';
import UploadPage from './pages/UploadPage';
import DashboardPage from './pages/DashboardPage';

function App() {
  return (
    <Router>
      <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <AppBar position="static" elevation={1}>
          <Toolbar>
            <Typography variant="h6" component="div" sx={{ flexGrow: 1, fontWeight: 600 }}>
              📊 Data Processing Dashboard
            </Typography>
          </Toolbar>
        </AppBar>
        
        <Container maxWidth="xl" sx={{ mt: 4, mb: 4, flex: 1 }}>
          <Routes>
            <Route path="/" element={<UploadPage />} />
            <Route path="/dashboard/:id" element={<DashboardPage />} />
          </Routes>
        </Container>
        
        <Box
          component="footer"
          sx={{
            py: 3,
            px: 2,
            mt: 'auto',
            backgroundColor: (theme) => theme.palette.grey[200],
            textAlign: 'center',
          }}
        >
          <Typography variant="body2" color="text.secondary">
            Data Processing Dashboard © {new Date().getFullYear()}
          </Typography>
        </Box>
      </Box>
    </Router>
  );
}

export default App;

