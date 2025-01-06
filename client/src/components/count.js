import React, { useState, useEffect } from 'react';
import { getAllExamCounts } from '../services/api';

const ExamDataCount = ({ franchiseId }) => {
    const [examDataCount, setExamDataCount] = useState(null); // Overall counts (day, week, month)
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [selectedDate, setSelectedDate] = useState(''); // Selected date from filter
    const [selectedDateCount, setSelectedDateCount] = useState(null); // Count for selected date

    const fetchExamDataCount = async (date = null) => {
        setLoading(true);
        setError('');
        try {
            const response = await getAllExamCounts(franchiseId, date ? date : null); // Pass selected date
            if (date) {
                setSelectedDateCount(response.examsByDay); // Update selected date count
            } else {
                setExamDataCount(response); // Update default overall counts
            }
        } catch (err) {
            console.error(err);
            setError('An error occurred while fetching data.');
        } finally {
            setLoading(false);
        }
    };
    

    // Fetch default counts on component mount or franchiseId change
    useEffect(() => {
        fetchExamDataCount();
    }, [franchiseId]);

    // Fetch count for selected date
    useEffect(() => {
        if (selectedDate) {
            fetchExamDataCount(selectedDate);
        }
    }, [selectedDate]);

    return (
        <div>
            <h2>Exam Data Count for Franchise {franchiseId}</h2>

            {/* Date filter */}
            <div style={{ marginBottom: '20px' }}>
                <label htmlFor="datePicker" style={{ marginRight: '10px', fontWeight: 'bold' }}>
                    Select Date:
                </label>
                <input
                    id="datePicker"
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    disabled={loading}
                />
            </div>

            {/* Error message */}
            {error && <p style={{ color: 'red' }}>{error}</p>}

            {/* Selected date count */}
            {selectedDate && selectedDateCount !== null && (
                <div style={{ marginBottom: '20px', fontSize: '16px', color: '#333' }}>
                    <p>
                        Exam count for <strong>{selectedDate}</strong>: <strong>{selectedDateCount}</strong>
                    </p>
                </div>
            )}

            {/* Overall counts (day, week, month) */}
            {examDataCount && (
                <div
                    style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        marginTop: '20px',
                        gap: '10px',
                        flexWrap: 'wrap',
                    }}
                >
                    {/* Box for Exams Today */}
                    <div
                        style={{
                            width: '20%',
                            padding: '8px',
                            border: '1px solid #ccc',
                            borderRadius: '8px',
                            textAlign: 'center',
                            backgroundColor: '#f1f1f1',
                            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                        }}
                    >
                        <h3 style={{ color: '#333', fontSize: '14px' }}>Today</h3>
                        <p style={{ color: '#555', fontSize: '16px' }}>
                            {examDataCount.examsByDay !== undefined ? examDataCount.examsByDay : 'No data'}
                        </p>
                    </div>

                    {/* Box for Exams This Week */}
                    <div
                        style={{
                            width: '20%',
                            padding: '8px',
                            border: '1px solid #ccc',
                            borderRadius: '8px',
                            textAlign: 'center',
                            backgroundColor: '#e0f7fa',
                            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                        }}
                    >
                        <h3 style={{ color: '#00796b', fontSize: '14px' }}>Week</h3>
                        <p style={{ color: '#004d40', fontSize: '16px' }}>
                            {examDataCount.examsByWeek !== undefined ? examDataCount.examsByWeek : 'No data'}
                        </p>
                    </div>

                    {/* Box for Exams This Month */}
                    <div
                        style={{
                            width: '20%',
                            padding: '8px',
                            border: '1px solid #ccc',
                            borderRadius: '8px',
                            textAlign: 'center',
                            backgroundColor: '#fff3e0',
                            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                        }}
                    >
                        <h3 style={{ color: '#f57c00', fontSize: '14px' }}>Month</h3>
                        <p style={{ color: '#e65100', fontSize: '16px' }}>
                            {examDataCount.examsByMonth !== undefined ? examDataCount.examsByMonth : 'No data'}
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ExamDataCount;
