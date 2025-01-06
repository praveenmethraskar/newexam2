import React, { useState, useEffect } from 'react';
import { getExamData, deleteUserExamData, updateExamData, fetchDurationOptions } from '../services/api'; 
import { useNavigate } from 'react-router-dom';

const ExamData = () => {
  const navigate = useNavigate();
  
  const [examDataList, setExamDataList] = useState([]);
  const [filteredExamData, setFilteredExamData] = useState([]);
  const [errorMessage, setErrorMessage] = useState('');
  const [selectedFranchise, setSelectedFranchise] = useState('');
  const [editingExamId, setEditingExamId] = useState(null);
  const [editingData, setEditingData] = useState({
    name: '',
    examName: '',
    date: '',
    durationInMinutes: '',
    status: '',
  });
  const [durationList, setDurationList] = useState([]);
  
  const validExamNames = [
    'ServiceNow: CAD', 'ServiceNow: CSA', 'ServiceNow: Platform Developer',
    'ServiceNow: HR AND IMPLEMENTATION', 'ServiceNow: CLOUD ARCHITECTURE',
    'Salesforce developer', 'Salesforce administrators', 'Google cloud', 
    'Mulesoft', 'Fusion', 'PSI'
  ];

  const validStatuses = ['completed', 'Absent', 'Inprogress'];

  useEffect(() => {
    const fetchExamData = async () => {
      try {
        const response = await getExamData();
        if (response && response.length > 0) {
          const allExamData = response.flatMap(franchise =>
            (franchise.examData || []).map(exam => ({
              franchiseId: franchise._id,
              franchiseName: franchise.name,
              location: franchise.location,
              name: exam.name,
              examName: exam.examName,
              date: exam.date ? new Date(exam.date).toISOString().split('T')[0] : '', 
              duration: exam.durationInMinutes,
              status: exam.status,
              examId: exam._id,
            }))
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

  useEffect(() => {
    const fetchDurationOptionsList = async () => {
      try {
        const response = await fetchDurationOptions();
        if (response && Array.isArray(response)) {
          setDurationList(response.filter(duration => typeof duration === 'number'));
        } else {
          setDurationList([90, 100, 110, 115, 120, 130, 135, 240]); 
        }
      } catch (error) {
        console.error('Error fetching duration options:', error);
        setDurationList([30, 60, 90, 120, 150]);
      }
    };

    fetchDurationOptionsList();
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

  const handleDelete = async (examId, franchiseId) => {
    try {
      await deleteUserExamData(franchiseId, examId);
      setExamDataList(prevState => prevState.filter(exam => exam.examId !== examId));
      setFilteredExamData(prevState => prevState.filter(exam => exam.examId !== examId));
    } catch (error) {
      console.error('Error deleting exam data:', error);
      setErrorMessage('Unable to delete exam data. Please try again later.');
    }
  };

  const handleEditClick = (exam) => {
    setEditingExamId(exam.examId);
    setEditingData({
      franchiseId: exam.franchiseId,
      name: exam.name,
      examName: exam.examName,
      date: exam.date,
      durationInMinutes: exam.duration,
      status: exam.status,
    });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEditingData(prevData => ({ ...prevData, [name]: value }));
  };

  const handleSave = async () => {
    try {
      const updatedExam = {
        ...editingData,
        date: new Date(editingData.date).toISOString().split('T')[0], // Format date
      };

      const payload = { examData: [updatedExam] };
      await updateExamData(editingData.franchiseId, editingExamId, payload);

      setExamDataList(prevState =>
        prevState.map(examItem =>
          examItem.examId === editingExamId ? { ...examItem, ...updatedExam } : examItem
        )
      );
      setFilteredExamData(prevState =>
        prevState.map(examItem =>
          examItem.examId === editingExamId ? { ...examItem, ...updatedExam } : examItem
        )
      );

      setEditingExamId(null);
    } catch (error) {
      console.error('Error updating exam data:', error);
      setErrorMessage('Unable to update exam data. Please try again later.');
    }
  };

  const handleCancel = () => {
    setEditingExamId(null);
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.header}>Exam Data</h1>
      
      {/* Header - Align button, text, and filter in one row */}
      <div style={styles.headerRow}>
        <button
          style={styles.examReportButton}
          onClick={() => navigate('/exam-data-user')}
        >
          Create
        </button>
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
      </div>

      {errorMessage ? (
        <p style={styles.error}>{errorMessage}</p>
      ) : (
        <>
          {filteredExamData.length > 0 ? (
            <div style={styles.tableContainer}>
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={styles.th}>Franchise Name</th>
                    <th style={styles.th}>Location</th>
                    <th style={styles.th}>Exam Name</th>
                    <th style={styles.th}>Date</th>
                    <th style={styles.th}>Duration (minutes)</th>
                    <th style={styles.th}>Status</th>
                    <th style={styles.th}>Exam Taker Name</th>
                    <th style={styles.th}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredExamData.map((exam, index) => (
                    <tr key={index} style={styles.tr}>
                      <td style={styles.td}>{exam.franchiseName}</td>
                      <td style={styles.td}>{exam.location}</td>
                      <td style={styles.td}>
                        {editingExamId === exam.examId ? (
                          <select
                            name="examName"
                            value={editingData.examName}
                            onChange={handleChange}
                            style={styles.input}
                          >
                            {validExamNames.map((examName, index) => (
                              <option key={index} value={examName}>
                                {examName}
                              </option>
                            ))}
                          </select>
                        ) : (
                          exam.examName
                        )}
                      </td>
                      <td style={styles.td}>
                        {editingExamId === exam.examId ? (
                          <input
                            type="date"
                            name="date"
                            value={editingData.date}
                            onChange={handleChange}
                            style={styles.input}
                          />
                        ) : (
                          exam.date
                        )}
                      </td>
                      <td style={styles.td}>
                        {editingExamId === exam.examId ? (
                          <select
                            name="durationInMinutes"
                            value={editingData.durationInMinutes}
                            onChange={handleChange}
                            style={styles.input}
                          >
                            {durationList.map((duration, index) => (
                              <option key={index} value={duration}>
                                {duration} minutes
                              </option>
                            ))}
                          </select>
                        ) : (
                          exam.duration
                        )}
                      </td>
                      <td style={styles.td}>
                        {editingExamId === exam.examId ? (
                          <select
                            name="status"
                            value={editingData.status}
                            onChange={handleChange}
                            style={styles.input}
                          >
                            {validStatuses.map((status, index) => (
                              <option key={index} value={status}>
                                {status.charAt(0).toUpperCase() + status.slice(1)}
                              </option>
                            ))}
                          </select>
                        ) : (
                          exam.status
                        )}
                      </td>
                      <td style={styles.td}>
                        {editingExamId === exam.examId ? (
                          <input
                            type="text"
                            name="name"
                            value={editingData.name}
                            onChange={handleChange}
                            style={styles.input}
                          />
                        ) : (
                          exam.name
                        )}
                      </td>
                      <td style={styles.td}>
                        {editingExamId === exam.examId ? (
                          <>
                            <button onClick={handleSave} style={styles.saveButton}>
                              Save
                            </button>
                            <button onClick={handleCancel} style={styles.cancelButton}>
                              Cancel
                            </button>
                          </>
                        ) : (
                          <>
                            <button onClick={() => handleEditClick(exam)} style={styles.editButton}>
                              Edit
                            </button>
                            <button onClick={() => handleDelete(exam.examId, exam.franchiseId)} style={styles.deleteButton}>
                              Delete
                            </button>
                          </>
                        )}
                      </td>
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

const styles = {
  container: {
    padding: '20px',
    fontFamily: 'Arial, sans-serif',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center', 
    justifyContent: 'center',
    height: '100vh',
  },
  header: {
    fontSize: '2rem',
    marginBottom: '20px',
    color: '#333',
    textAlign: 'center',
  },
  headerRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginBottom: '20px',
  },
  examReportButton: {
    backgroundColor: '#007bff',
    color: 'white',
    padding: '12px 24px',
    fontSize: '1.2rem',
    fontWeight: '600',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    marginRight: '20px', 
  },
  filterContainer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
    width: '300px', 
  },
  filterLabel: {
    fontSize: '1rem',
    marginRight: '10px',
    fontWeight: '500',
  },
  filterSelect: {
    padding: '10px',
    fontSize: '1rem',
    borderRadius: '5px',
    border: '1px solid #ddd',
    width: '100%',
    maxWidth: '200px', 
    boxSizing: 'border-box',
    transition: 'all 0.3s ease',
  },
  filterSelectHover: {
    borderColor: '#007bff', 
  },
  tableContainer: {
    width: '100%',
    overflowX: 'auto',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    marginTop: '10px',
  },
  th: {
    backgroundColor: '#4CAF50',
    color: 'white',
    padding: '10px',
    textAlign: 'left',
  },
  td: {
    padding: '10px',
    border: '1px solid #ddd',
  },
  tr: {
    backgroundColor: '#f9f9f9',
  },
  editButton: {
    padding: '5px 10px',
    backgroundColor: '#4CAF50',
    color: 'white',
    border: 'none',
    cursor: 'pointer',
  },
  deleteButton: {
    padding: '5px 10px',
    backgroundColor: '#f44336',
    color: 'white',
    border: 'none',
    cursor: 'pointer',
  },
  saveButton: {
    padding: '5px 10px',
    backgroundColor: '#4CAF50',
    color: 'white',
    border: 'none',
    cursor: 'pointer',
  },
  cancelButton: {
    padding: '5px 10px',
    backgroundColor: '#ffc107',
    color: 'white',
    border: 'none',
    cursor: 'pointer',
    marginLeft: '10px',
  },
  noData: {
    textAlign: 'center',
    color: '#777',
  },
  error: {
    color: 'red',
    textAlign: 'center',
  },
};

export default ExamData;
