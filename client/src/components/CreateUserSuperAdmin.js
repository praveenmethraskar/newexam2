import React, { useState, useEffect } from 'react';
import { createUser, getUsers, deleteUser, updateUser, getFranchises } from '../services/api';
import { Button, TextField, Grid, Box, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Select, MenuItem, InputLabel, FormControl } from '@mui/material';

const CreateUserSuperAdmin = () => {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    name: '',
    role: '',
    franchiseId: [], // Allow multiple franchises selection
  });

  const [franchises, setFranchises] = useState([]);
  const [users, setUsers] = useState([]);
  const [editingUser, setEditingUser] = useState(null);

  useEffect(() => {
    const fetchFranchises = async () => {
      try {
        const response = await getFranchises();
        setFranchises(response.data);
      } catch (error) {
        alert('Error fetching franchises: ' + (error.response?.data?.message || error.message));
      }
    };

    const fetchUsers = async () => {
      try {
        const response = await getUsers();
        
        setUsers(response);
      } catch (error) {
        alert('Error fetching users: ' + (error.response?.data?.message || error.message));
      }
    };

    fetchFranchises();
    fetchUsers();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'franchiseId') {
      
      setFormData({ ...formData, [name]: typeof value === 'string' ? value.split(',') : value });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (editingUser) {
        await updateUser(editingUser._id, formData);
        alert('User updated successfully!');
      } else {
        await createUser(formData);
        alert('User created successfully!');
      }

      setEditingUser(null);
      setFormData({
        username: '',
        password: '',
        name: '',
        role: '',
        franchiseId: [],
      });

      const response = await getUsers();
      setUsers(response);
    } catch (error) {
      alert('Error creating/updating user: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleEdit = (user) => {
    setEditingUser(user);
    setFormData({
      username: user.username || '',
      password: '', 
      name: user.name || '',
      role: user.role || '',
      franchiseId: user.franchiseId || [], 
    });
  };

  const handleDelete = async (userId) => {
    try {
      await deleteUser(userId);
      alert('User deleted successfully!');

      const response = await getUsers();
      setUsers(response);
    } catch (error) {
      alert('Failed to delete user. Please try again.');
    }
  };

  const isEditingSelf = editingUser && editingUser.role === 'superadmin';

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" sx={{ fontWeight: 'bold', marginBottom: 3 }}>Create or Edit User</Typography>

      <Paper sx={{ padding: 3, marginBottom: 4 }}>
        <form onSubmit={handleSubmit}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Username"
                name="username"
                value={formData.username}
                onChange={handleChange}
                fullWidth
                required
                variant="outlined"
                InputLabelProps={{
                  shrink: formData.username.length > 0, 
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                fullWidth
                required={!editingUser} 
                variant="outlined"
                InputLabelProps={{
                  shrink: formData.password.length > 0, 
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                fullWidth
                required
                variant="outlined"
                InputLabelProps={{
                  shrink: formData.name.length > 0, 
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth variant="outlined" required>
                <InputLabel>Role</InputLabel>
                <Select
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  label="Role"
                  disabled={isEditingSelf}
                >
                  <MenuItem value="">Select Role</MenuItem>
                  <MenuItem value="user">User</MenuItem>
                  <MenuItem value="admin">Admin</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth variant="outlined" required>
                <InputLabel>Franchise</InputLabel>
                <Select
                  name="franchiseId"
                  value={formData.franchiseId}
                  onChange={handleChange}
                  label="Franchise"
                  multiple 
                  disabled={isEditingSelf}
                >
                  <MenuItem value="">Select Franchise</MenuItem>
                  {franchises.map((franchise) => (
                    <MenuItem key={franchise._id} value={franchise._id}>
                      {franchise.name} - {franchise.location}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <Button type="submit" variant="contained" color="primary" sx={{ marginRight: 2 }}>
                {editingUser ? 'Update User' : 'Create User'}
              </Button>
              {editingUser && (
                <Button variant="outlined" color="secondary" onClick={() => setEditingUser(null)}>
                  Cancel
                </Button>
              )}
            </Grid>
          </Grid>
        </form>
      </Paper>

      <Typography variant="h5" sx={{ fontWeight: 'bold', marginBottom: 2 }}>All Users</Typography>

      <TableContainer component={Paper} sx={{ width: '100%' }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 'bold', fontSize: '1.1rem' }}>Username</TableCell>
              <TableCell sx={{ fontWeight: 'bold', fontSize: '1.1rem' }}>Name</TableCell>
              <TableCell sx={{ fontWeight: 'bold', fontSize: '1.1rem' }}>Role</TableCell>
              <TableCell sx={{ fontWeight: 'bold', fontSize: '1.1rem' }}>Franchise</TableCell>
              <TableCell sx={{ fontWeight: 'bold', fontSize: '1.1rem' }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
  {users.length > 0 ? (
    users.map((user) => {
      

      
      const franchise = user.franchise || [];  
      const franchiseNames = franchise.map((franchiseItem) => {
        const franchiseDetails = franchises.find((franchise) => franchise._id === franchiseItem._id);
        
        return franchiseDetails ? franchiseDetails.name : 'N/A'; 
      }).join(', ') || 'No franchise assigned'; 

      return (
        <TableRow key={user._id}>
          <TableCell>{user.username}</TableCell>
          <TableCell>{user.name}</TableCell>
          <TableCell>{user.role}</TableCell>
          <TableCell>{franchiseNames}</TableCell> {/* Display the franchise names */}
          <TableCell>
            <Button onClick={() => handleEdit(user)} color="primary" size="small">Edit</Button>
            {user.role !== 'superadmin' && (
              <Button
                onClick={() => handleDelete(user._id)}
                color="error"
                size="small"
                sx={{ marginLeft: 1 }}
              >
                Delete
              </Button>
            )}
          </TableCell>
        </TableRow>
      );
    })
  ) : (
    <TableRow>
      <TableCell colSpan={5} align="center">No users available</TableCell>
    </TableRow>
  )}
</TableBody>

        </Table>
      </TableContainer>
    </Box>
  );
};

export default CreateUserSuperAdmin;
