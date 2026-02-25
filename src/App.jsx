import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import DeveloperDashboard from './pages/DeveloperDashboard';
import StudentDetails from './pages/StudentDetails';
import StudentDashboard from './pages/StudentDashboard';

const ProtectedRoute = ({ children, role }) => {
    const user = JSON.parse(localStorage.getItem('userInfo'));

    if (!user) {
        return <Navigate to="/" />;
    }

    if (role && user.role !== role) {
        return <Navigate to={user.role === 'developer' ? '/developer' : '/student'} />;
    }

    return children;
};

function App() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<Login />} />
                <Route path="/register" element={<Register />} />

                <Route
                    path="/developer"
                    element={
                        <ProtectedRoute role="developer">
                            <DeveloperDashboard />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/student-details/:id"
                    element={
                        <ProtectedRoute role="developer">
                            <StudentDetails />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/student"
                    element={
                        <ProtectedRoute role="student">
                            <StudentDashboard />
                        </ProtectedRoute>
                    }
                />

                {/* Catch all */}
                <Route path="*" element={<Navigate to="/" />} />
            </Routes>
        </Router>
    );
}

export default App;
