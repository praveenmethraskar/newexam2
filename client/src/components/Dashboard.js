import React from 'react';
import { useNavigate } from 'react-router-dom';
import FranchiseList from './FranchiseList';
import { logout } from '../services/api';
import { Button, Container, Typography, Grid, Paper } from '@mui/material';
import ExamCounts from './count';

const Dashboard = () => {
  const navigate = useNavigate();
  
  const handleLogout = async () => {
    try {
      await logout(navigate);
      localStorage.removeItem('token');
      navigate('/login');
    } catch (error) {
      console.error('Logout failed:', error);
      alert('There was an error logging out. Please try again.');
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Paper elevation={4} sx={{ p: 4, mb: 4 }}>
        <Typography
          variant="h4"
          align="center"
          color="red"
          gutterBottom
          sx={{ mb: 6 }} 
        >
          WELCOME TO SUPERADMIN DASHBOARD
        </Typography>
        <Grid container spacing={4} sx={{ mb: 4 }}>
          <Grid item xs={12} md={3}>
            <Button
              variant="contained"
              color="primary"
              fullWidth
              sx={{ padding: '14px 24px', fontSize: '16px' }}
              onClick={() => navigate('/create-superadmin')}
            >
              Create User
            </Button>
          </Grid>
          <Grid item xs={12} md={3}>
            <Button
              variant="contained"
              color="secondary"
              fullWidth
              sx={{ padding: '14px 24px', fontSize: '16px' }}
              onClick={() => navigate('/create-franchise')}
            >
              Create Franchise
            </Button>
          </Grid>

          <Grid item xs={12} md={3}>
            <Button
              variant="contained"
              color="success"
              fullWidth
              sx={{
                padding: '16px 28px',
                fontSize: '18px',
                backgroundColor: '#4CAF50', 
                '&:hover': {
                  backgroundColor: '#45a049', 
                  boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.2)', 
                },
              }}
              onClick={() => navigate('/exam-data')} 
            >
              Manage Exam Data
            </Button>
          </Grid>

          <Grid item xs={12} md={3}>
            <Button
              variant="contained"
              color="error"
              fullWidth
              sx={{ padding: '14px 24px', fontSize: '16px' }}
              onClick={handleLogout}
            >
              Logout
            </Button>
          </Grid>
        </Grid>
      </Paper>

      <Paper elevation={3} sx={{ p: 3 }}>
        <Typography variant="h5" align="center" gutterBottom />
        <ExamCounts />
        <FranchiseList />
      </Paper>
    </Container>
  );
};

export default Dashboard;
