import React, { useState, useEffect } from 'react';
import { getExamData } from '../services/api';

const ExamDataUser = () => {
  const [examDataList, setExamDataList] = useState([]);
  const [filteredExamData, setFilteredExamData] = useState([]);
  const [errorMessage, setErrorMessage] = useState('');
  const [selectedFranchise, setSelectedFranchise] = useState('');  

  useEffect(() => {
    const fetchExamData = async () => {
      try {
        const response = await getExamData();
         
  
        if (response && response.length > 0) {
          const allExamData = response.flatMap(franchise => 
            (franchise.examData || []).map(exam => {
               
  
              const takerName = exam.name || 'Unknown'; 
  
              return {
                franchiseId: franchise._id,  
                franchiseName: franchise.name,
                location: franchise.location,
                name: takerName,            
                examName: exam.examName,    
                date: new Date(exam.date).toLocaleDateString(), 
                duration: exam.durationInMinutes,  
                status: exam.status         
              };
            })
          );
          setExamDataList(allExamData);
          setFilteredExamData(allExamData); 
        } else {
          setErrorMessage('No exam data available for your franchises.');
        }
      } catch (error) {
        console.error('Error fetching exam data:', error);
        setErrorMessage('Unable to retrieve exam data. Please try again later.');
      }
    };
  
    fetchExamData();
  }, []);
  

  
  const handleFranchiseChange = (e) => {
    const franchiseName = e.target.value;
    setSelectedFranchise(franchiseName);

    if (franchiseName === '') {
      setFilteredExamData(examDataList);  
    } else {
      const filteredData = examDataList.filter(exam => exam.franchiseName === franchiseName);
      setFilteredExamData(filteredData);
    }
  };


  const franchiseNames = [...new Set(examDataList.map(exam => exam.franchiseName))];

  return (
    <div style={styles.container}>
      <h1 style={styles.header}>Exam Data</h1>

      {errorMessage ? (
        <p style={styles.error}>{errorMessage}</p>
      ) : (
        <>
          {/* Franchise filter dropdown */}
          <div style={styles.filterContainer}>
            <label style={styles.filterLabel}>Select Franchise:</label>
            <select
              value={selectedFranchise}
              onChange={handleFranchiseChange}
              style={styles.filterSelect}
            >
              <option value="">All Franchises</option>
              {franchiseNames.map((franchise, index) => (
                <option key={index} value={franchise}>
                  {franchise}
                </option>
              ))}
            </select>
          </div>

          {filteredExamData.length > 0 ? (
            <div style={styles.tableContainer}>
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={styles.th}>Franchise Name</th>
                    <th style={styles.th}>Location</th>
                    <th style={styles.th}>Exam Taker Name</th> {/* Updated column */}
                    <th style={styles.th}>Exam Name</th>
                    <th style={styles.th}>Date</th>
                    <th style={styles.th}>Duration (minutes)</th>
                    <th style={styles.th}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredExamData.map((exam, index) => (
                    <tr key={index} style={styles.tr}>
                      <td style={styles.td}>{exam.franchiseName}</td>
                      <td style={styles.td}>{exam.location}</td>
                      <td style={styles.td}>{exam.name}</td> {/* Exam Taker Name */}
                      <td style={styles.td}>{exam.examName}</td>
                      <td style={styles.td}>{exam.date}</td>
                      <td style={styles.td}>{exam.duration}</td>
                      <td style={styles.td}>{exam.status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p style={styles.noData}>No exam data available for the selected franchise.</p>
          )}
        </>
      )}
    </div>
  );
};

// CSS styles in JS format
const styles = {
  container: {
    padding: '20px',
    backgroundColor: '#f8f9fa',
    minHeight: '100vh',
  },
  header: {
    fontSize: '2rem',
    textAlign: 'center',
    marginBottom: '20px',
  },
  tableContainer: {
    overflowX: 'auto',
    marginTop: '20px',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    tableLayout: 'fixed',
    marginBottom: '20px',
  },
  th: {
    padding: '12px',
    backgroundColor: '#007bff',
    color: 'white',
    textAlign: 'left',
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
  error: {
    color: 'red',
    textAlign: 'center',
    marginBottom: '20px',
  },
  noData: {
    textAlign: 'center',
    padding: '20px',
    color: '#888',
  },
  filterContainer: {
    marginBottom: '20px',
    textAlign: 'center',
  },
  filterLabel: {
    marginRight: '10px',
    fontSize: '1rem',
  },
  filterSelect: {
    padding: '8px',
    fontSize: '1rem',
    borderRadius: '4px',
    border: '1px solid #ddd',
  },
};

export default ExamDataUser;
