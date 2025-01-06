// src/pages/AdminDashboard.js
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { logout } from '../services/api'; // Adjust the path to your actual location
import FranchiseListAdmin from './FranchiseListAdmin';
import ExamCounts from './count';

const AdminDashboard = () => {
  const navigate = useNavigate();

  // Handle logout logic
  const handleLogout = async () => {
    try {
      const message = await logout();
      console.log(message); 

     
      localStorage.removeItem('token');

      
      navigate('/login');
    } catch (error) {
      console.error('Logout failed:', error);
      alert('There was an error logging out. Please try again.');
    }
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.header}>Welcome to Admin Dashboard</h1>

      {/* Button Container */}
      <div style={styles.buttonContainer}>
        <button style={styles.button} onClick={() => navigate('/create-user')}>Create User</button>
        <button style={styles.button} onClick={() => navigate('/exam-data')}>Manage Exam Data</button>
        <button style={{ ...styles.button, ...styles.logout }} onClick={handleLogout}>Logout</button>
      </div>

      <div style={styles.section}>
        <ExamCounts />
      </div>

      <div style={styles.section}>
        <FranchiseListAdmin />
      </div>
    </div>
  );
};

// Enhanced CSS styles in JS format
const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    padding: '20px',
    backgroundColor: '#f8f9fa',
    minHeight: '100vh',
    fontFamily: 'Arial, sans-serif',
  },
  header: {
    fontSize: '2.5rem',
    marginBottom: '30px',
    textAlign: 'center',
    color: '#343a40',
  },
  buttonContainer: {
    display: 'flex',
    justifyContent: 'space-evenly', 
    gap: '20px',
    marginBottom: '30px',
  },
  button: {
    padding: '15px 30px',
    fontSize: '18px',
    backgroundColor: '#007bff',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    transition: 'background-color 0.3s ease, transform 0.2s ease',
    width: '200px',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
  },
  buttonHover: {
    backgroundColor: '#0056b3',
  },
  logout: {
    backgroundColor: '#dc3545',
  },
  logoutHover: {
    backgroundColor: '#c82333',
  },
  section: {
    marginBottom: '40px',
  },
};

export default AdminDashboard;
