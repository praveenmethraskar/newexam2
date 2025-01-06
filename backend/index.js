const express = require('express');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const app = express();
app.use(express.json());

const cors = require('cors');
app.use(cors());

// Database connection
mongoose.connect('mongodb://localhost:27017/exam_center', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', () => {
    console.log('Database connected');
});

const examDataSchema = new mongoose.Schema({
    name: { 
        type: String, 
        required: true, 
        trim: true 
    }, // Name of the individual
    
    examName: { 
        type: String, 
        required: true, 
        enum: [
            'ServiceNow: CAD',
            'ServiceNow: CSA',
            'ServiceNow: Platform Developer',
            'ServiceNow: HR AND IMPLEMENTATION',
            'ServiceNow: CLOUD ARCHITECTURE',
            'Salesforce developer',
            'Salesforce administrators',
            'Google cloud',
            'Mulesoft',
            'Fusion',
            'PSI'
        ] 
    }, // Name of the exam
    date: { 
        type: Date, 
        required: true 
    }, // Date of the exam
    durationInMinutes: { 
        type: Number, 
        required: true, 
        enum: [90, 100, 110, 115, 120, 130, 135, 240] 
    }, // Duration in minutes
    status: { 
        type: String, 
        required: true, 
        enum: ['completed', 'Absent', 'Inprogress'] 
    } // Status of the exam
});

const franchiseSchema = new mongoose.Schema({
    name: { type: String, required: true },
    location: { type: String, required: true },
    status: { type: String, enum: ['active', 'inactive'], default: 'active' },
    contactNumber: { type: String, required: true },
    examData: [examDataSchema],
    admin: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    
});

const Franchise = mongoose.model('Franchise', franchiseSchema);

const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    name: { type: String, required: true },
    role: { type: String, enum: ['superadmin', 'admin', 'user'], required: true },
    franchise: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Franchise' }],
});

const User = mongoose.model('User', userSchema);

const authenticate = (roles) => async (req, res, next) => {
    try {
        const token = req.headers.authorization.split(' ')[1];
        
        const decoded = jwt.verify(token, 'secret_key');
        req.user = decoded;

        if (!roles.includes(decoded.role)) {
            return res.status(403).json({ message: 'Access denied' });
        }

        next();
    } catch (error) {
        return res.status(401).json({ message: 'Unauthorized' });
    }
};

// Login API
app.post('/api/login', async (req, res) => {
    const { username, password } = req.body;
    try {
        const user = await User.findOne({ username });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (password !== user.password) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const token = jwt.sign({ id: user._id, role: user.role }, 'secret_key', { expiresIn: '1h' });
        res.status(200).json({
            message: 'Login successful',
            user: {
                id: user._id,
                username: user.username,
                name: user.name,
                role: user.role,
            },
            token,
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});




// Admin Creation API 
app.post('/admins', authenticate(['superadmin']), async (req, res) => {
    const { username, password, name, franchiseId } = req.body;   
    try {
        const franchise = await Franchise.findById(franchiseId);
        if (!franchise) {
            return res.status(404).json({ message: 'Franchise not found' });
        }

        const admin = new User({
            username,
            password,
            name,
            role: 'admin',
            franchise: franchiseId,  // Assign admin to a specific franchise
        });

        await admin.save();

        // Assign this admin to the franchise
        franchise.admin = admin._id;
        await franchise.save();

        res.status(201).json(admin);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});
// Franchise Creation API
app.post('/franchises', authenticate(['superadmin','admin']), async (req, res) => {
    const { name, location, status, contactNumber } = req.body;
    try {
        const franchise = new Franchise({ name, location, status, contactNumber });
        await franchise.save();
        res.status(201).json(franchise);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});
// User Creation API
app.post('/admins', authenticate(['superadmin']), async (req, res) => {
    const { username, password, name, franchiseId } = req.body;
    
    try {
        const franchise = await Franchise.findById(franchiseId);
        if (!franchise) {
            return res.status(404).json({ message: 'Franchise not found' });
        }

        const admin = new User({
            username,
            password,
            name,
            role: 'admin',
            franchise: franchiseId,  // Assign admin to a specific franchise
        });

        await admin.save();

        // Assign this admin to the franchise
        franchise.admin = admin._id;
        await franchise.save();

        res.status(201).json(admin);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});
// User Creation API (Allow multiple admins for different franchises)
app.post('/users', authenticate(['admin', 'superadmin']), async (req, res) => {
    const { username, password, name, role, franchiseId } = req.body;
    try {
        const franchise = await Franchise.findById(franchiseId);
        if (!franchise) {
            return res.status(404).json({ message: 'Franchise not found' });
        }

        const user = new User({
            username,
            password,
            name,
            role,
            franchise: franchiseId,
        });

        await user.save();
        res.status(201).json(user);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});
// Get all franchises - updated route for fetching franchises
app.get('/franchises', authenticate(['superadmin', 'admin']), async (req, res) => {
    try {
        const franchises = await Franchise.find().populate('admin');
        res.status(200).json(franchises);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});
// Admin and Franchise Update API
app.put('/users/:id', authenticate(['admin', 'superadmin']), async (req, res) => {
    const { id } = req.params;
    const { username, password, name, role, franchiseId } = req.body;

    try {
        const user = await User.findById(id);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Restrict all users from updating superadmins except themselves
        if (
            req.user.role !== 'superadmin' &&
            user.role === 'superadmin' &&
            req.user._id !== id
        ) {
            return res.status(403).json({
                message: 'Only superadmins can update other superadmins.',
            });
        }

        // Admins can update their own data and other admins' data, but not superadmins
        if (req.user.role === 'admin' || req.user.role === 'superadmin') {
            if (username) user.username = username;
            if (password) user.password = password;
            if (name) user.name = name;
            if (role && req.user.role === 'superadmin') user.role = role; // Superadmins can update role
            if (franchiseId) {
                const franchise = await Franchise.findById(franchiseId);
                if (!franchise) {
                    return res.status(404).json({ message: 'Franchise not found' });
                }
                user.franchise = franchiseId;
            }
        }

        await user.save();
        res.status(200).json(user);
    } catch (error) {
        console.error('Error updating user:', error);
        res.status(500).json({ message: 'An unexpected error occurred.' });
    }
});
// Route to get franchises associated with the user (only for authenticated users)
app.get('/franchises/associated', authenticate(['user', 'admin', 'superadmin']), async (req, res) => {
    try {
        if (req.user.role === 'user') {
            const user = await User.findById(req.user.id).populate('franchise');
            if (!user) {
                return res.status(404).json({ message: 'User not found' });
            }
            if (!user.franchise) {
                return res.status(404).json({ message: 'No franchise associated with this user' });
            }
            return res.status(200).json([user.franchise]);
        } else {
            const franchises = await Franchise.find();
            res.status(200).json(franchises);
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});
// Logout API (clear session)
app.post('/api/logout', authenticate(['superadmin', 'admin', 'user']), (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            return res.status(500).json({ message: 'Error logging out' });
        }
        res.clearCookie('connect.sid'); // Clear cookie associated with session
        res.status(200).json({ message: 'Logged out successfully' });
    });
});
// Get all users with populated franchise details
app.get('/users', authenticate(['admin', 'superadmin']), async (req, res) => {
    try {
        const users = await User.find().populate('franchise');
        res.status(200).json(users);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});
// Delete Franchise API
app.delete('/franchises/:id', authenticate(['superadmin', 'admin']), async (req, res) => {
    const { id } = req.params;
    try {
        const franchise = await Franchise.findByIdAndDelete(id);
        if (!franchise) {
            return res.status(404).json({ message: 'Franchise not found' });
        }
        res.status(200).json({ message: 'Franchise deleted successfully', franchise });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});
// Update Franchise API
app.put('/franchises/:id', authenticate(['superadmin', 'admin']), async (req, res) => {
    const { id } = req.params;
    const updatedData = req.body;
    try {
        const franchise = await Franchise.findByIdAndUpdate(id, updatedData, { new: true });
        if (!franchise) {
            return res.status(404).json({ message: 'Franchise not found' });
        }
        res.status(200).json(franchise);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});
// Delete User API
app.delete('/users/:id', authenticate(['admin', 'superadmin']), async (req, res) => {
    const { id } = req.params;

    try {
        const user = await User.findById(id);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Admins can delete their own data and other admins' data, but not superadmins
        if (req.user.role === 'admin') {
            if (user.role === 'superadmin') {
                return res.status(403).json({
                    message: 'Admins cannot delete superadmins.',
                });
            }
        }

        // Restrict all users from deleting superadmins except themselves
        if (
            req.user.role !== 'superadmin' &&
            user.role === 'superadmin' &&
            req.user._id !== id
        ) {
            return res.status(403).json({
                message: 'Only superadmins can delete other superadmins.',
            });
        }

        await User.findByIdAndDelete(id);
        res.status(200).json({ message: 'User deleted successfully.' });
    } catch (error) {
        console.error('Error deleting user:', error);
        res.status(500).json({ message: 'An unexpected error occurred.' });
    }
});
// Create Exam Data API for a Franchise
app.post('/api/franchises/:franchiseId/exam-data', authenticate(['user', 'admin', 'superadmin']), async (req, res) => {
    const { franchiseId } = req.params; // Franchise ID from the route parameter
    const { examData } = req.body; // Exam data from the request body

    try {
        // Validate that examData is an array and contains at least one object
        if (!examData || !Array.isArray(examData) || examData.length === 0) {
            return res.status(400).json({ message: 'Exam data must be a non-empty array.' });
        }

        // Get the user from the request
        const userId = req.user.id;

        // Find the user to check their associated franchises
        const user = await User.findById(userId).populate('franchise');
        if (!user) {
            return res.status(404).json({ message: 'User not found.' });
        }

        // Check if the user is a superadmin. If so, skip franchise association check
        if (req.user.role !== 'superadmin') {
            // Check if the franchiseId belongs to one of the user's associated franchises
            const isFranchiseAssociated = user.franchise.some(franchise => franchise._id.toString() === franchiseId);
            if (!isFranchiseAssociated) {
                return res.status(403).json({ message: 'You are not authorized to add exam data to this franchise.' });
            }
        }

        // Find the selected franchise
        const franchise = await Franchise.findById(franchiseId);
        if (!franchise) {
            return res.status(404).json({ message: 'Franchise not found.' });
        }

        // Process and validate each entry in examData
        const validExamNames = [
            'ServiceNow: CAD', 'ServiceNow: CSA', 'ServiceNow: Platform Developer',
            'ServiceNow: HR AND IMPLEMENTATION', 'ServiceNow: CLOUD ARCHITECTURE',
            'Salesforce developer', 'Salesforce administrators', 'Google cloud',
            'Mulesoft', 'Fusion', 'PSI'
        ];
        const validStatuses = ['completed', 'Absent', 'Inprogress'];
        const validDurations = [60, 90, 100, 110, 115, 120, 130, 135, 240];

        const newExamData = examData.map((data) => {
            const { name, examName, date, durationInMinutes, status } = data;

            // Ensure all fields are provided
            if (!name || !examName || !date || !durationInMinutes || !status) {
                throw new Error('All fields (name, examName, date, durationInMinutes, and status) are required.');
            }

            // Validate the date
            const examDate = new Date(date);
            if (isNaN(examDate.getTime())) {
                throw new Error('Invalid date format.');
            }

            // Validate the duration
            const duration = Number(durationInMinutes);
            if (isNaN(duration)) {
                throw new Error('Invalid duration format.');
            }

            // Validate the examName, status, and duration
            if (!validExamNames.includes(examName)) {
                throw new Error(`Invalid exam name. Allowed values are: ${validExamNames.join(', ')}`);
            }
            if (!validStatuses.includes(status)) {
                throw new Error(`Invalid status. Allowed values are: ${validStatuses.join(', ')}`);
            }
            if (!validDurations.includes(duration)) {
                throw new Error(`Invalid duration. Allowed values are: ${validDurations.join(', ')}`);
            }

            // Return sanitized exam data object
            return {
                name,
                examName,
                date: examDate.toISOString().split('T')[0], // Format date as 'YYYY-MM-DD'
                durationInMinutes: duration,
                status,
            };
        });

        // Add the exam data to the selected franchise
        franchise.examData.push(...newExamData);
        await franchise.save();

        res.status(201).json({ message: 'Exam data added successfully!', examData: newExamData });

    } catch (error) {
        console.error('Error adding exam data:', error.message);
        res.status(500).json({ message: error.message });
    }
});
// Update Exam Data for a Franchise
app.put('/franchises/:franchiseId/exam-data/:examDataId', authenticate(['user', 'admin', 'superadmin']), async (req, res) => {
    const { franchiseId, examDataId } = req.params;
    const { examData } = req.body;

    try {
        if (!examData || !Array.isArray(examData) || examData.length === 0) {
            return res.status(400).json({ message: 'Exam data must be a non-empty array.' });
        }

        const userId = req.user.id;
        const user = await User.findById(userId).populate('franchise');
        if (!user) {
            return res.status(404).json({ message: 'User not found.' });
        }

        // If the user is a superadmin, bypass the franchise association check
        if (user.role === 'superadmin') {
            // Superadmin is authorized to update exam data for any franchise
        } else {
            // For non-superadmin users, check if they are associated with the franchise
            const isFranchiseAssociated = user.franchise.some(franchise => franchise._id.toString() === franchiseId);
            if (!isFranchiseAssociated) {
                return res.status(403).json({ message: 'You are not authorized to update exam data for this franchise.' });
            }
        }

        const franchise = await Franchise.findById(franchiseId);
        if (!franchise) {
            return res.status(404).json({ message: 'Franchise not found.' });
        }

        const examDataEntry = franchise.examData.id(examDataId);
        if (!examDataEntry) {
            return res.status(404).json({ message: 'Exam data not found.' });
        }

        const validExamNames = ['ServiceNow: CAD', 'ServiceNow: CSA', 'ServiceNow: Platform Developer', 'ServiceNow: HR AND IMPLEMENTATION', 'ServiceNow: CLOUD ARCHITECTURE', 'Salesforce developer', 'Salesforce administrators', 'Google cloud', 'Mulesoft', 'Fusion', 'PSI'];
        const validStatuses = ['completed', 'Absent', 'Inprogress'];
        const validDurations = [60, 90, 100, 110, 115, 120, 130, 135, 240];

        const { name, examName, date, durationInMinutes, status } = examData[0];

        if (!name || !examName || !date || !durationInMinutes || !status) {
            return res.status(400).json({ message: 'All fields (name, examName, date, durationInMinutes, and status) are required.' });
        }

        const examDate = new Date(date);
        if (isNaN(examDate.getTime())) {
            return res.status(400).json({ message: 'Invalid date format.' });
        }

        const duration = Number(durationInMinutes);
        if (isNaN(duration)) {
            return res.status(400).json({ message: 'Invalid duration format.' });
        }

        if (!validExamNames.includes(examName)) {
            return res.status(400).json({ message: `Invalid exam name. Allowed values are: ${validExamNames.join(', ')}` });
        }
        if (!validStatuses.includes(status)) {
            return res.status(400).json({ message: `Invalid status. Allowed values are: ${validStatuses.join(', ')}` });
        }
        if (!validDurations.includes(duration)) {
            return res.status(400).json({ message: `Invalid duration. Allowed values are: ${validDurations.join(', ')}` });
        }

        // Update the exam data entry
        franchise.examData.id(examDataId).set({
            name,
            examName,
            date: examDate.toISOString().split('T')[0],
            durationInMinutes: duration,
            status,
        });

        await franchise.save();

        res.status(200).json({ message: 'Exam data updated successfully!', examData: franchise.examData.id(examDataId) });

    } catch (error) {
        console.error('Error updating exam data at franchiseId:', franchiseId, 'ExamDataId:', examDataId, 'Error:', error.message);
        res.status(500).json({ message: error.message });
    }
});
// Delete Exam Data for a Franchise
app.delete('/franchises/:franchiseId/exam-data/:examDataId', authenticate(['user', 'admin', 'superadmin']), async (req, res) => {
    const { franchiseId, examDataId } = req.params; // Franchise ID and Exam Data ID from the route parameters

    try {
        // Get the user from the request
        const userId = req.user.id;

        // Find the user to check their associated franchises
        const user = await User.findById(userId).populate('franchise');
        if (!user) {
            return res.status(404).json({ message: 'User not found.' });
        }

        // If the user is a superadmin, bypass the franchise association check
        if (user.role === 'superadmin') {
            // Superadmin is authorized to delete exam data for any franchise
        } else {
            // Check if the franchiseId belongs to one of the user's associated franchises
            const isFranchiseAssociated = user.franchise.some(franchise => franchise._id.toString() === franchiseId);
            if (!isFranchiseAssociated) {
                return res.status(403).json({ message: 'You are not authorized to delete exam data for this franchise.' });
            }
        }

        // Find the selected franchise
        const franchise = await Franchise.findById(franchiseId);
        if (!franchise) {
            return res.status(404).json({ message: 'Franchise not found.' });
        }

        // Find the specific exam data entry to delete
        const examDataIndex = franchise.examData.findIndex(data => data._id.toString() === examDataId);
        if (examDataIndex === -1) {
            return res.status(404).json({ message: 'Exam data not found.' });
        }

        // Remove the exam data from the franchise
        franchise.examData.splice(examDataIndex, 1);
        await franchise.save();

        res.status(200).json({ message: 'Exam data deleted successfully.' });

    } catch (error) {
        console.error('Error deleting exam data:', error.message);
        res.status(500).json({ message: error.message });
    }
});

app.get('/api/durationOptions', (req, res) => {
    // Your logic to fetch duration options, e.g., from a database
    res.json({ options: [90, 100, 110, 115, 120, 130, 135, 240] });
  });
  // Get Exam Data for Associated Franchise
  app.get('/api/exam-data', authenticate(['user', 'admin', 'superadmin']), async (req, res) => {
    try {
        const userId = req.user.id;
        const userRole = req.user.role;

        // Find the logged-in user and populate their associated franchises
        const user = await User.findById(userId).populate('franchise');
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (userRole === 'superadmin') {
            const allFranchiseExamData = await Franchise.find().select('name location examData');
            if (!allFranchiseExamData || allFranchiseExamData.length === 0) {
                return res.status(404).json({ message: 'No exam data found for any franchises' });
            }
            return res.status(200).json(allFranchiseExamData);  // Return all franchise exam data for superadmin
        }

        // If the user has no associated franchises
        if (!user.franchise || user.franchise.length === 0) {
            return res.status(404).json({ message: 'No associated franchises found for this user' });
        }

        // Fetch exam data for the user's associated franchises
        const franchiseExamData = await Franchise.find({
            _id: { $in: user.franchise.map(franchise => franchise._id) }
        }).select('name location examData');

        if (!franchiseExamData || franchiseExamData.length === 0) {
            return res.status(404).json({ message: 'No exam data found for associated franchises' });
        }

        // Respond with the exam data
        res.status(200).json(franchiseExamData);
    } catch (error) {
        console.error('Error fetching exam data:', error.message);
        res.status(500).json({ message: 'An unexpected error occurred.' });
    }
});

app.get('/api/exam/count', authenticate(['admin', 'superadmin', 'user']), async (req, res) => {
    try {
        const userId = req.user.id;
        const { period } = req.query; // Capture specific date if provided

        const user = await User.findById(userId).populate('franchise');
        if (!user) return res.status(404).send('User not found');

        const franchiseIds = user.role === 'superadmin' 
            ? await Franchise.find().distinct('_id') 
            : user.franchise.map(f => f._id);

        const now = new Date();

        // Define boundaries for day, week, and month
        const startOfToday = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 0, 0, 0));
        const endOfToday = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 23, 59, 59));

        const startOfWeek = new Date(startOfToday);
        startOfWeek.setUTCDate(startOfWeek.getUTCDate() - startOfWeek.getUTCDay()); // Start of the week (Sunday)

        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setUTCDate(endOfWeek.getUTCDate() + 6); // End of the week (Saturday)

        const startOfMonth = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
        const endOfMonth = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 0)); // Last day of the month

        let startDate, endDate;
        if (period) {
            const selectedDate = new Date(period);
            startDate = new Date(Date.UTC(selectedDate.getUTCFullYear(), selectedDate.getUTCMonth(), selectedDate.getUTCDate(), 0, 0, 0));
            endDate = new Date(Date.UTC(selectedDate.getUTCFullYear(), selectedDate.getUTCMonth(), selectedDate.getUTCDate(), 23, 59, 59));
        }

        const examData = await Franchise.aggregate([
            { $match: { _id: { $in: franchiseIds } } },
            { $unwind: '$examData' },
            { $match: { 'examData.date': { $exists: true, $type: 'date' } } },
            {
                $group: {
                    _id: null,
                    totalExams: { $sum: 1 },
                    examsByDay: {
                        $sum: {
                            $cond: [
                                { $and: [{ $gte: ["$examData.date", startDate || startOfToday] }, { $lt: ["$examData.date", endDate || endOfToday] }] },
                                1,
                                0,
                            ],
                        },
                    },
                    examsByWeek: {
                        $sum: {
                            $cond: [
                                { $and: [{ $gte: ["$examData.date", startOfWeek] }, { $lt: ["$examData.date", endOfWeek] }] },
                                1,
                                0,
                            ],
                        },
                    },
                    examsByMonth: {
                        $sum: {
                            $cond: [
                                { $and: [{ $gte: ["$examData.date", startOfMonth] }, { $lt: ["$examData.date", endOfMonth] }] },
                                1,
                                0,
                            ],
                        },
                    },
                },
            },
        ]);

        if (!examData || examData.length === 0) {
            return res.status(404).send('No exam data found for this user');
        }

        const data = examData[0];
        return res.status(200).json({
            totalExams: data.totalExams,
            examsByDay: data.examsByDay,
            examsByWeek: data.examsByWeek,
            examsByMonth: data.examsByMonth,
        });

    } catch (error) {
        console.error(error);
        return res.status(500).send('Server error');
    }
});



// Start the server
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

