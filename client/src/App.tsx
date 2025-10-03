import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './components/layout/ProtectedRoute';

// Public pages (no authentication required)
import LandingPage from './pages/public/Landing';
import Login from './pages/public/Login';
import Register from './pages/public/Register';

// Protected pages (authentication required)
import Home from './pages/protected/Home';
import MainDashboard from './pages/protected/main_dashboard';
import Opportunities from './pages/protected/opportunities';
import Profile from './pages/protected/profile';
import ContactSupport from './pages/protected/contact_support';
import FAQ from './pages/protected/faq';
import AboutUs from './pages/protected/about_us';
import AboutUsInside from './pages/protected/about_us_inside';
import Settings from './pages/protected/settings';
import AllNotifications from './pages/protected/all_notifications';

const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/landing" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        {/* Protected routes */}
        <Route path="/home" element={<ProtectedRoute><Home /></ProtectedRoute>} />
        <Route path="/dashboard" element={<ProtectedRoute><MainDashboard /></ProtectedRoute>} />
        <Route path="/opportunities" element={<ProtectedRoute><Opportunities /></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
        <Route path="/contact-support" element={<ProtectedRoute><ContactSupport /></ProtectedRoute>} />
        <Route path="/faq" element={<ProtectedRoute><FAQ /></ProtectedRoute>} />
        <Route path="/about-us" element={<ProtectedRoute><AboutUs /></ProtectedRoute>} />
        <Route path="/about-us-inside" element={<ProtectedRoute><AboutUsInside /></ProtectedRoute>} />
        <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
        <Route path="/all-notifications" element={<ProtectedRoute><AllNotifications /></ProtectedRoute>} />
        
        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
};

export default App;