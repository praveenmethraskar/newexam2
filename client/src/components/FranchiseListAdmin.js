import React, { useEffect, useState } from 'react';
import { getFranchises } from '../services/api'; 

const FranchiseList = () => {
  const [franchises, setFranchises] = useState([]);

 
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

  return (
    <div style={styles.container}>
      {/* Franchise List */}
      <table style={styles.table}>
        <thead>
          <tr>
            <th style={styles.th}>Name</th>
            <th style={styles.th}>Location</th>
            <th style={styles.th}>Contact Number</th>
            <th style={styles.th}>Status</th>
          </tr>
        </thead>
        <tbody>
          {franchises.length > 0 ? (
            franchises.map((franchise) => (
              <tr key={franchise._id} style={styles.tr}>
                <td style={styles.td}>{franchise.name}</td>
                <td style={styles.td}>{franchise.location}</td>
                <td style={styles.td}>{franchise.contactNumber}</td>
                <td style={styles.td}>{franchise.status}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="4" style={styles.noData}>No franchises available.</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

const styles = {
  container: {
    padding: '20px',
    overflowX: 'auto', 
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    marginTop: '20px',
    tableLayout: 'fixed', 
  },
  th: {
    padding: '12px',
    textAlign: 'left',
    backgroundColor: '#007bff',
    color: 'white',
    fontWeight: 'bold',
    border: '1px solid #ddd',
  },
  td: {
    padding: '12px',
    textAlign: 'left',
    border: '1px solid #ddd',
  },
  tr: {
    transition: 'background-color 0.3s ease',
  },
  trHover: {
    backgroundColor: '#f1f1f1',
  },
  noData: {
    textAlign: 'center',
    padding: '20px',
    color: '#888',
  },
};


const TableRow = ({ franchise }) => {
  return (
    <tr key={franchise._id} style={styles.tr} onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#f1f1f1'} onMouseOut={(e) => e.currentTarget.style.backgroundColor = ''}>
      <td style={styles.td}>{franchise.name}</td>
      <td style={styles.td}>{franchise.location}</td>
      <td style={styles.td}>{franchise.contactNumber}</td>
      <td style={styles.td}>{franchise.status}</td>
    </tr>
  );
};

export default FranchiseList;
