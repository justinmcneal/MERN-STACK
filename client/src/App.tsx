import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LandingPage from './pages/Landing';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import Home from './pages/Home';
import MainDashboard from './pages/auth/main_dashboard';
import Opportunities from './pages/auth/opportunities';
import Profile from './pages/auth/profile';
import ContactSupport from './pages/auth/contact_support';
import FAQ from './pages/auth/faq';
import AboutUs from './pages/auth/about_us';
import AboutUsInside from './pages/auth/about_us_inside';
import Settings from './pages/auth/settings';
import AllNotifications from './pages/auth/all_notifications';

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
        <Route path="/home" element={<Home />} />
        <Route path="/dashboard" element={<MainDashboard />} />
        <Route path="/opportunities" element={<Opportunities />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/contact-support" element={<ContactSupport />} />
        <Route path="/faq" element={<FAQ />} />
        <Route path="/about-us" element={<AboutUs />} />
        <Route path="/about-us-inside" element={<AboutUsInside />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/all-notifications" element={<AllNotifications />} />
        
        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
};

export default App;