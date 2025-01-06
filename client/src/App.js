import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";

import Dashboard from "./components/Dashboard";
import CreateUser from "./components/CreateUser";
import CreateFranchise from "./components/CreateFranchise";
import ExamData from "./components/ExamData";
import FranchiseList from "./components/FranchiseList";
import AdminDashboard from "./components/adminDashboard";
import UserDashboard from "./components/userDashboard";
import UserExamData from "./components/userManageExamData";
import Logout from './pages/logout';
import CreateUserSuperAdmin from "./components/CreateUserSuperAdmin";


function App() {
    

    return (
        <Router>
            <Routes>
                
                        <Route path="/logout" element={<Logout />} />
                        <Route path="/dashboard" element={<Dashboard />} />
                        <Route path="/create-user" element={<CreateUser />} />
                        <Route path="/create-franchise" element={<CreateFranchise />} />
                        <Route path="/exam-data" element={<ExamData />} />
                        <Route path="/franchises" element={<FranchiseList />} />
                        <Route path="/admin-dashboard" element={<AdminDashboard />} />
                        <Route path="/user-dashboard" element={<UserDashboard />} />
                        <Route path="/exam-data-user" element={<UserExamData />} />
                        <Route path="/create-superadmin" element={<CreateUserSuperAdmin />} />
                  
                        <Route path="/" element={<Login />} />
                        <Route path="/login" element={<Login />} />
                
            </Routes>
        </Router>
    );
}

export default App;
