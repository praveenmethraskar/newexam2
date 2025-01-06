import React, { useState } from 'react';
import { createFranchise } from '../services/api';
import { Button, TextField, Grid, Box, Typography, Paper, Select, MenuItem } from '@mui/material';

const CreateFranchise = () => {
  const [formData, setFormData] = useState({
    name: '',
    location: '',
    contactNumber: '',
    status: 'active', 
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await createFranchise(formData);
      alert('Franchise created successfully!');
    } catch (error) {
      alert('Error creating franchise: ' + (error.response?.data?.message || error.message));
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" sx={{ fontWeight: 'bold', marginBottom: 3 }}>Create Franchise</Typography>

      <Paper sx={{ padding: 3 }}>
        <form onSubmit={handleSubmit}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Franchise Name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                fullWidth
                required
                variant="outlined"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Franchise Location"
                name="location"
                value={formData.location}
                onChange={handleChange}
                fullWidth
                required
                variant="outlined"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Contact Number"
                name="contactNumber"
                value={formData.contactNumber}
                onChange={handleChange}
                fullWidth
                required
                variant="outlined"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <Select
                label="Status"
                name="status"
                value={formData.status}
                onChange={handleChange}
                fullWidth
                variant="outlined"
              >
                <MenuItem value="active">Active</MenuItem>
                <MenuItem value="inactive">Inactive</MenuItem>
              </Select>
            </Grid>
            <Grid item xs={12}>
              <Button type="submit" variant="contained" color="primary" sx={{ width: '100%' }}>
                Create Franchise
              </Button>
            </Grid>
          </Grid>
        </form>
      </Paper>
    </Box>
  );
};

export default CreateFranchise;
