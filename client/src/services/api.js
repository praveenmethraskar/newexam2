import axios from "axios";


const API = axios.create({
    baseURL: process.env.REACT_APP_API_BASE_URL || "http://localhost:3001", 
});


export default function getAuthToken() {
    const token = sessionStorage.getItem("token"); // Fetch the token from sessionStorage
    if (!token) {
        // If no token, redirect to login page
        window.location.href = "/login"; // Replace with the actual path to your login page
        throw new Error("No authorization token found.");
    }
    return token;
}


const handleError = (error, message) => {
    console.error(message, error.response?.data || error.message);
    throw new Error(message);
};


API.interceptors.request.use((req) => {
    try {
        const token = getAuthToken(); // Fetch the token from sessionStorage
        if (token) {
            req.headers.Authorization = `Bearer ${token}`; // Add the token to the Authorization header
        }
    } catch (err) {
        console.error("Authorization token not found.");
    }
    return req;
});


 const loginUser = async ({ username, password }) => {
    try {
        const response = await API.post('/api/login', { username, password });
        if (response.data.token) {
            // Store the token in sessionStorage
            sessionStorage.setItem("token", response.data.token);
        }
        return response.data; 
    } catch (error) {
        console.error("Login failed:", error.response?.data || error.message);
        throw new Error("Login failed. Please try again.");
    }
};



export const logout = () => {
    sessionStorage.removeItem("token"); // Remove the token from sessionStorage
    window.location.href = '/login'; // Redirect to the login page
};



export const createFranchise = (data) => API.post("/franchises", data);
export const getFranchises = () => API.get("/franchises");

export const deleteFranchise = async (id) => {
    try {
        const response = await API.delete(`/franchises/${id}`);
        return response.data;
    } catch (error) {
        console.error("Error deleting franchise:", error.response?.data || error.message);
        throw new Error("Error deleting franchise. Please try again.");
    }
};

export const updateFranchise = (id, data) => API.put(`/franchises/${id}`, data);

// User APIs
export const createUser = (data) => API.post("/users", data);

// Function to get users
export const getUsers = async () => {
    try {
        const response = await API.get("/users");
        return response.data;
    } catch (error) {
        console.error("Error fetching users:", error.response?.data || error.message);
        throw new Error("Error fetching users. Please try again.");
    }
};

// Delete User API
export const deleteUser = async (userId) => {
    try {
        const response = await API.delete(`/users/${userId}`);
        return response.data;
    } catch (error) {
        console.error("Error deleting user:", error.response?.data || error.message);
        throw new Error("Error deleting user. Please try again.");
    }
};

// Fetch Exam Names (Add this API function if needed)
export const fetchExamNames = async () => {
    try {
        const response = await API.get('/api/examNames');  // Assuming this endpoint exists
        if (response && response.data) {
            return response.data || []; // Return the data or an empty array
        } else {
            throw new Error('Invalid response data for exam names');
        }
    } catch (error) {
        console.error('Error fetching exam names:', error);
        throw error;
    }
};


// Function to update a user by ID
export const updateUser = async (userId, userData) => {
    try {
        const response = await API.put(`/users/${userId}`, userData);
        return response.data;
    } catch (error) {
        console.error("Error updating user:", error.response?.data || error.message);
        throw new Error("Error updating user. Please try again.");
    }
};

// Exam Data APIs for a franchise
export const createUserExamData = async (examData, franchiseId) => {
    console.log('Sending Exam Data:', { examData });
    if (!Array.isArray(examData) || examData.length === 0) {
        console.error('Invalid examData array:', examData);
        throw new Error('Invalid exam data array.');
    }

    examData.forEach((exam) => {
        const { name, examName, date, durationInMinutes, status } = exam;

        if (!name || !examName || !date || !durationInMinutes || !status) {
            console.error('Missing fields in exam data:', exam);
            throw new Error('Each exam data object must have name, examName, date, durationInMinutes, and status.');
        }

        if (isNaN(new Date(date).getTime())) {
            throw new Error('Invalid date format. Use YYYY-MM-DD.');
        }

        if (isNaN(durationInMinutes)) {
            throw new Error('Invalid duration. Must be a number.');
        }

        const validStatuses = ['completed', 'Absent', 'Inprogress'];
        if (!validStatuses.includes(status)) {
            throw new Error(`Invalid status. Allowed values: ${validStatuses.join(', ')}.`);
        }
    });

    try {
        console.log('Request URL:', `/franchises/${franchiseId}/exam-data`);

        const response = await API.post(`/api/franchises/${franchiseId}/exam-data`, { examData });
        console.log('Exam data creation response:', response.data);
        return response.data;
     } catch (error) {
        if (error.response) {
           
            console.error('Server responded with an error:', error.response.status, error.response.data);
        } else if (error.request) {
           
            console.error('No response received:', error.request);
        } else {
            
            console.error('Error setting up the request:', error.message);
        }
        throw new Error('Error creating exam data.');
    }

};

export const updateExamData = async (franchiseId, examId, examData) => {
    if (!franchiseId || !examId) {
        throw new Error('Invalid franchiseId or examId.');
    }
    try {
       
        const response = await API.put(`/franchises/${franchiseId}/exam-data/${examId}`, examData);
        return response.data; 
    } catch (error) {
        handleError(error, "Error updating exam data. Please try again.");
        throw error; 
    }
};

export const deleteUserExamData = async (franchiseId, examId) => {
    if (!franchiseId || !examId) {
        throw new Error('Invalid franchiseId or examId.');
    }
    try {
        
        const response = await API.delete(`/franchises/${franchiseId}/exam-data/${examId}`);
        return response.data; 
    } catch (error) {
        handleError(error, "Error deleting exam data. Please try again.");
        throw error; 
    }
};



export const getAssociatedFranchises = async () => {
    try {
        const response = await API.get('/franchises/associated');
        return response.data;
    } catch (error) {
        handleError(error, "Error fetching associated franchises. Please try again.");
    }
};


export const fetchDurationOptions = async () => {
    try {
        const response = await API.get('/api/durationOptions');
        if (response && response.data) {
            return response.data || []; 
        } else {
            throw new Error('Invalid response data');
        }
    } catch (error) {
        console.error('Error in fetchDurationOptions:', error);
        throw error;
    }
};

// Get all exam counts for franchises
export const getAllExamCounts = async (franchiseId, period) => {
    try {
        const response = await API.get('/api/exam/count', {
            params: { 
                franchiseId,  
                period, // Pass the specific date or period
            },
        });

        return response.data; 
    } catch (error) {
        handleError(error, "Error fetching exam counts. Please try again.");
    }
};







export const getExamData = async () => {
    const token = sessionStorage.getItem('token'); // Get the token from sessionStorage
    const response = await axios.get('http://localhost:3001/api/exam-data', { 
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });
    return response.data;
};
