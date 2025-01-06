import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Box, TextField, Button, Typography, Grid, Card, CardContent } from '@mui/material';

const Login = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrorMessage('');

        try {
            const response = await axios.post('http://localhost:3001/api/login', { username, password });
            const { data } = response;

            // Store the JWT token in sessionStorage (not localStorage)
            sessionStorage.setItem('token', data.token);

            // Redirect based on user role
            if (data.user.role === 'superadmin') {
                navigate('/dashboard');
            } else if (data.user.role === 'admin') {
                navigate('/admin-dashboard');
            } else {
                navigate('/user-dashboard');
            }
        } catch (error) {
            console.error('Login failed:', error);
            setErrorMessage('Invalid credentials or server error. Please try again.');
        }
    };

    return (
        <Grid
            container
            alignItems="center"
            justifyContent="center"
            style={{ minHeight: '100vh', backgroundColor: '#f5f5f5' }}
        >
            <Grid item xs={11} sm={8} md={4}>
                <Card elevation={6} style={{ borderRadius: '12px' }}>
                    <CardContent>
                        <Box textAlign="center" mb={3}>
                            <Typography variant="h4" component="h1" gutterBottom>
                                Login
                            </Typography>
                            <Typography variant="body1" color="textSecondary">
                                Please enter your credentials to access the application.
                            </Typography>
                        </Box>

                        {errorMessage && (
                            <Typography variant="body2" color="error" align="center" gutterBottom>
                                {errorMessage}
                            </Typography>
                        )}

                        <form onSubmit={handleSubmit}>
                            <TextField
                                label="Username"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                fullWidth
                                margin="normal"
                                variant="outlined"
                            />
                            <TextField
                                label="Password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                fullWidth
                                margin="normal"
                                variant="outlined"
                            />
                            <Box mt={3}>
                                <Button
                                    type="submit"
                                    variant="contained"
                                    color="primary"
                                    fullWidth
                                    size="large"
                                    style={{ textTransform: 'none' }}
                                >
                                    Login
                                </Button>
                            </Box>
                        </form>
                    </CardContent>
                </Card>
            </Grid>
        </Grid>
    );
};

export default Login;
