import React, { useEffect, useState } from 'react';
import { getFranchises, deleteFranchise, createFranchise, updateFranchise } from '../services/api';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  TextField,
  Select,
  MenuItem,
  Typography,
  Box,
  Grid,
} from '@mui/material';

const FranchiseList = () => {
  const [franchises, setFranchises] = useState([]);
  const [editingFranchise, setEditingFranchise] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    location: '',
    contactNumber: '',
    status: 'active',
  });
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    fetchFranchises();
  }, []);

  const fetchFranchises = async () => {
    try {
      const response = await getFranchises();
      setFranchises(response.data);
    } catch (error) {
      alert('Error fetching franchises: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this franchise?')) {
      try {
        await deleteFranchise(id);
        alert('Franchise deleted successfully');
        fetchFranchises();
      } catch (error) {
        alert('Error deleting franchise: ' + (error.response?.data?.message || error.message));
      }
    }
  };

  const handleEdit = (franchise) => {
    setEditingFranchise(franchise);
    setFormData({
      name: franchise.name,
      location: franchise.location,
      contactNumber: franchise.contactNumber,
      status: franchise.status,
    });
    setShowForm(true);
  };

  const handleCancelEdit = () => {
    setEditingFranchise(null);
    setFormData({
      name: '',
      location: '',
      contactNumber: '',
      status: 'active',
    });
    setShowForm(false);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingFranchise) {
        await updateFranchise(editingFranchise._id, formData);
        alert('Franchise updated successfully!');
      } else {
        await createFranchise(formData);
        alert('Franchise created successfully!');
      }
      fetchFranchises();
      handleCancelEdit();
    } catch (error) {
      alert('Error submitting form: ' + (error.response?.data?.message || error.message));
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold', mb: 3 }}>
        
      </Typography>

      {showForm && (
        <Paper sx={{ p: 3, mb: 4 }}>
          <Typography variant="h6">{editingFranchise ? 'Edit Franchise' : 'Create Franchise'}</Typography>
          <form onSubmit={handleSubmit}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  fullWidth
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Location"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  fullWidth
                  required
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
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <Select
                  label="Status"
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  fullWidth
                  required
                >
                  <MenuItem value="active">Active</MenuItem>
                  <MenuItem value="inactive">Inactive</MenuItem>
                </Select>
              </Grid>
              <Grid item xs={12}>
                <Button type="submit" variant="contained" color="primary" sx={{ mr: 2 }}>
                  {editingFranchise ? 'Update Franchise' : 'Create Franchise'}
                </Button>
                {editingFranchise && (
                  <Button onClick={handleCancelEdit} variant="outlined" color="secondary">
                    Cancel
                  </Button>
                )}
              </Grid>
            </Grid>
          </form>
        </Paper>
      )}

      <Typography variant="h5" gutterBottom>
        
      </Typography>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 'bold', fontSize: '1.2rem' }}>Name</TableCell>
              <TableCell sx={{ fontWeight: 'bold', fontSize: '1.2rem' }}>Location</TableCell>
              <TableCell sx={{ fontWeight: 'bold', fontSize: '1.2rem' }}>Contact Number</TableCell>
              <TableCell sx={{ fontWeight: 'bold', fontSize: '1.2rem' }}>Status</TableCell>
              <TableCell sx={{ fontWeight: 'bold', fontSize: '1.2rem' }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {franchises.length > 0 ? (
              franchises.map((franchise) => (
                <TableRow key={franchise._id}>
                  <TableCell>{franchise.name}</TableCell>
                  <TableCell>{franchise.location}</TableCell>
                  <TableCell>{franchise.contactNumber}</TableCell>
                  <TableCell>{franchise.status}</TableCell>
                  <TableCell>
                    <Button onClick={() => handleEdit(franchise)} color="primary">
                      Edit
                    </Button>
                    <Button onClick={() => handleDelete(franchise._id)} color="error">
                      Delete
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} align="center">
                  No franchises available.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default FranchiseList;
