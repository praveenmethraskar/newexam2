import React from 'react';
import { useNavigate } from 'react-router-dom';
import { logout } from '../services/api'; // Ensure the path is correct
import ExamDataUser from './ExamDataUser';
import ExamCounts from './count';


const UserDashboard = () => {
  const navigate = useNavigate();

  // Handle logout logic
  const handleLogout = async () => {
    try {
      const message = await logout();
       

     
      localStorage.removeItem('token');

     
      navigate('/login');
    } catch (error) {
      console.error('Logout failed:', error);
      alert('There was an error logging out. Please try again.');
    }
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.header}>Welcome To User Dashboard</h1>

      {/* Button Container */}
      <div style={styles.buttonContainer}>
        <button style={styles.button} onClick={() => navigate('/exam-data-user')}>Exam Report</button>
        <button style={{ ...styles.button, ...styles.logout }} onClick={handleLogout}>Logout</button>

        
      </div>
      <div><ExamCounts/></div>
      

     
      <ExamDataUser />
    </div>
  );
};


const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    padding: '20px',
    backgroundColor: '#f8f9fa',
    minHeight: '100vh',
  },
  header: {
    fontSize: '2rem',
    marginBottom: '20px',
    textAlign: 'center',
  },
  buttonContainer: {
    display: 'flex',
    justifyContent: 'center', 
    gap: '15px',
    marginBottom: '20px',
  },
  button: {
    padding: '12px 24px',
    fontSize: '16px',
    backgroundColor: '#007bff',
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    transition: 'background-color 0.3s ease',
    width: '180px', 
  },
  logout: {
    backgroundColor: '#dc3545',
  },
};

export default UserDashboard;
