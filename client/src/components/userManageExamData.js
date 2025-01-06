import React, { useEffect, useState } from 'react';
import { getAssociatedFranchises, fetchDurationOptions, createUserExamData } from '../services/api';

const AssociatedFranchises = () => {
  const [examData, setExamData] = useState({
    examName: '',
    date: '',
    durationInMinutes: '',
    status: 'Inprogress',
    franchiseId: '',
  });
  const [franchiseList, setFranchiseList] = useState([]);
  const [durationList, setDurationList] = useState([]);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [userFullName, setUserFullName] = useState('');

  const validExamNames = [
    'ServiceNow: CAD', 'ServiceNow: CSA', 'ServiceNow: Platform Developer',
    'ServiceNow: HR AND IMPLEMENTATION', 'ServiceNow: CLOUD ARCHITECTURE',
    'Salesforce developer', 'Salesforce administrators', 'Google cloud', 
    'Mulesoft', 'Fusion', 'PSI'
  ];

  const validStatuses = ['completed', 'Absent', 'Inprogress'];

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [franchiseData, durationData] = await Promise.all([
          getAssociatedFranchises(),
          fetchDurationOptions(),
        ]);

        const flattenedFranchiseData = Array.isArray(franchiseData[0]) ? franchiseData[0] : franchiseData;

        if (!Array.isArray(flattenedFranchiseData) || flattenedFranchiseData.length === 0) {
          throw new Error('No associated franchises found for the user.');
        }

        if (!Array.isArray(durationData.options) || durationData.options.length === 0) {
          throw new Error('No exam durations available.');
        }

        setFranchiseList(flattenedFranchiseData);
        setDurationList(durationData.options);
      } catch (error) {
        setError(error.message || 'Failed to fetch data.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleExamDataChange = (e) => {
    const { name, value } = e.target;
    setExamData((prevData) => ({
      ...prevData,
      [name]: name === 'durationInMinutes' ? parseInt(value, 10) : value,
    }));
  };

  const handleUserFullNameChange = (e) => {
    const value = e.target.value;
    setUserFullName(value);
    setExamData((prevData) => ({
      ...prevData,
      name: value,
    }));
  };

  const validateForm = () => {
    if (!userFullName.trim()) {
      return 'Please provide the full name.';
    }
    if (!examData.examName || !validExamNames.includes(examData.examName)) {
      return 'Please select a valid exam name.';
    }
    if (!examData.status || !validStatuses.includes(examData.status)) {
      return 'Please select a valid status.';
    }
    if (!examData.date) {
      return 'Please provide the exam date.';
    }
    const examDate = new Date(examData.date);
    if (isNaN(examDate.getTime())) {
      return 'Invalid date format.';
    }
    if (isNaN(examData.durationInMinutes) || examData.durationInMinutes <= 0) {
      return 'Please select a valid exam duration.';
    }
    if (!examData.franchiseId) {
      return 'Please select a franchise.';
    }
    return null;
  };

  const handleCreateExamData = async (e) => {
    e.preventDefault();

    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);
    try {
      const payload = {
        examData: [
          {
            name: userFullName,
            examName: examData.examName,
            date: new Date(examData.date).toISOString().split('T')[0],
            durationInMinutes: parseInt(examData.durationInMinutes, 10),
            status: examData.status.trim(),
            franchiseId: examData.franchiseId,
          },
        ],
      };

      await createUserExamData(payload.examData, examData.franchiseId);

      setSuccess('Exam data created successfully!');
      setExamData({
        examName: '',
        date: '',
        durationInMinutes: '',
        status: 'Inprogress',
        franchiseId: '',
      });
      setUserFullName('');
      setError(null);
    } catch (error) {
      setError(error.response?.data?.message || error.message || 'Failed to create exam data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => setSuccess(''), 3000);
      return () => clearTimeout(timer);
    }
  }, [success]);

  return (
    <div style={styles.container}>
      <h2 style={styles.header}>Associated Franchise</h2>

      {loading && <p style={styles.loading}>Loading...</p>}
      {error && <p style={styles.error}>{error}</p>}
      {success && <p style={styles.success}>{success}</p>}

      <h3 style={styles.formTitle}>Create Exam Data</h3>
      <form onSubmit={handleCreateExamData} style={styles.form}>
        <div style={styles.formGroup}>
          <label htmlFor="franchiseId" style={styles.label}>Select Franchise</label>
          <select
            name="franchiseId"
            value={examData.franchiseId}
            onChange={handleExamDataChange}
            required
            style={styles.input}
          >
            <option value="">Select a franchise</option>
            {franchiseList.map((franchise) => (
              <option key={franchise._id} value={franchise._id}>
                {franchise.name}
              </option>
            ))}
          </select>
        </div>

        <div style={styles.formGroup}>
          <label htmlFor="userFullName" style={styles.label}>Full Name</label>
          <input
            type="text"
            name="userFullName"
            value={userFullName}
            onChange={handleUserFullNameChange}
            required
            style={styles.input}
          />
        </div>

        <div style={styles.formGroup}>
          <label htmlFor="examName" style={styles.label}>Exam Name</label>
          <select
            name="examName"
            value={examData.examName}
            onChange={handleExamDataChange}
            required
            style={styles.input}
          >
            <option value="">Select an exam</option>
            {validExamNames.map((exam, index) => (
              <option key={index} value={exam}>{exam}</option>
            ))}
          </select>
        </div>

        <div style={styles.formGroup}>
          <label htmlFor="date" style={styles.label}>Exam Date</label>
          <input
            type="date"
            name="date"
            value={examData.date}
            onChange={handleExamDataChange}
            required
            style={styles.input}
          />
        </div>

        <div style={styles.formGroup}>
          <label htmlFor="durationInMinutes" style={styles.label}>Duration (Minutes)</label>
          <select
            name="durationInMinutes"
            value={examData.durationInMinutes}
            onChange={handleExamDataChange}
            required
            style={styles.input}
          >
            <option value="">Select duration</option>
            {durationList.map((duration) => (
              <option key={duration} value={duration}>
                {duration} minutes
              </option>
            ))}
          </select>
        </div>

        <div style={styles.formGroup}>
          <label htmlFor="status" style={styles.label}>Status</label>
          <select
            name="status"
            value={examData.status}
            onChange={handleExamDataChange}
            required
            style={styles.input}
          >
            <option value="Inprogress">In Progress</option>
            <option value="completed">Completed</option>
            <option value="Absent">Absent</option>
          </select>
        </div>

        <button type="submit" disabled={loading} style={styles.submitButton}>
          {loading ? 'Submitting...' : 'Create Exam Data'}
        </button>
      </form>
    </div>
  );
};

const styles = {
  container: {
    maxWidth: '800px',
    margin: '0 auto',
    padding: '20px',
    fontFamily: 'Arial, sans-serif',
  },
  header: {
    textAlign: 'center',
    color: '#333',
    fontSize: '2rem',
    marginBottom: '20px',
  },
  formTitle: {
    fontSize: '1.5rem',
    marginBottom: '20px',
    textAlign: 'center',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '15px',
    padding: '20px',
    border: '1px solid #ddd',
    borderRadius: '8px',
    backgroundColor: '#f9f9f9',
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column',
  },
  label: {
    fontWeight: 'bold',
    marginBottom: '5px',
    color: '#555',
  },
  input: {
    padding: '10px',
    border: '1px solid #ccc',
    borderRadius: '5px',
    fontSize: '1rem',
    marginBottom: '10px',
  },
  submitButton: {
    padding: '10px 15px',
    backgroundColor: '#4CAF50',
    color: '#fff',
    fontSize: '1rem',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
  },
  loading: {
    textAlign: 'center',
    color: '#666',
  },
  error: {
    color: 'red',
    textAlign: 'center',
  },
  success: {
    color: 'green',
    textAlign: 'center',
  },
};

export default AssociatedFranchises;
