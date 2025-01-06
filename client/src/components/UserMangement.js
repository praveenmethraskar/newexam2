import React, { useState, useEffect } from 'react';
import { getUsers, deleteUser, updateUser } from '../services/api';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [editingUser, setEditingUser] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);


  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await getUsers();
      setUsers(response);
    } catch (err) {
      setError('Failed to load users. Please try again later.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

 
  const handleDelete = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;

    setActionLoading(true);
    try {
      await deleteUser(userId);
      setUsers((prev) => prev.filter((user) => user._id !== userId));
      setError(null);
    } catch (err) {
      setError('Error deleting user. Please try again later.');
      console.error(err);
    } finally {
      setActionLoading(false);
    }
  };

  
  const handleUpdate = async () => {
    if (!editingUser) return;

    setActionLoading(true);
    try {
      const updatedUser = await updateUser(editingUser._id, {
        username: editingUser.username,
        role: editingUser.role,
      });
      setUsers((prev) =>
        prev.map((user) => (user._id === editingUser._id ? updatedUser : user))
      );
      closeEditForm();
    } catch (err) {
      setError('Error updating user. Please try again later.');
      console.error(err);
    } finally {
      setActionLoading(false);
    }
  };

 
  const openEditForm = (user) => {
    setEditingUser({ ...user });
  };

 
  const closeEditForm = () => {
    setEditingUser(null);
  };

  return (
    <div>
      <h1>User Management</h1>

      {loading && <p>Loading users...</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}

      {!loading && users.length > 0 && (
        <table>
          <thead>
            <tr>
              <th>Username</th>
              <th>Role</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user._id}>
                <td>{user.username}</td>
                <td>{user.role}</td>
                <td>
                  <button onClick={() => openEditForm(user)}>Edit</button>
                  <button
                    onClick={() => handleDelete(user._id)}
                    disabled={actionLoading}
                  >
                    {actionLoading ? 'Deleting...' : 'Delete'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {!loading && users.length === 0 && <p>No users found.</p>}

      {editingUser && (
        <div className="edit-form">
          <h2>Edit User</h2>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleUpdate();
            }}
          >
            <div>
              <label htmlFor="username">Username:</label>
              <input
                id="username"
                type="text"
                value={editingUser.username}
                onChange={(e) =>
                  setEditingUser((prev) => ({ ...prev, username: e.target.value }))
                }
              />
            </div>
            <div>
              <label htmlFor="role">Role:</label>
              <select
                id="role"
                value={editingUser.role}
                onChange={(e) =>
                  setEditingUser((prev) => ({ ...prev, role: e.target.value }))
                }
              >
                <option value="user">User</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            <div>
              <button type="submit" disabled={actionLoading}>
                {actionLoading ? 'Saving...' : 'Save Changes'}
              </button>
              <button type="button" onClick={closeEditForm}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default UserManagement;
