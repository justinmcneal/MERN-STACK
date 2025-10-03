import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Update imports to match your actual directory structure
import LandingPage from './pages/Landing';
import Login from './pages/auth/Login';
import SignUp from './pages/auth/Register';
import MainDashboard from './pages/auth/main_dashboard';
import Opportunities from './pages/auth/opportunities';
import Profile from './pages/auth/profile';
import ContactSupport from './pages/auth/contact_support';
import FAQ from './pages/auth/faq';
import AboutUs from './pages/auth/about_us';
import AboutUsInside from './pages/auth/about_us_inside';
import Settings from './pages/auth/settings';
import AllNotifications from './pages/auth/all_notifications';
import ChangePass from './pages/auth/change_password';




const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        {/* Root path shows Sign In */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/landing_page" element={<LandingPage />} />
        <Route path="/landing_page-in" element={<LandingPage />} />
        
        {/* Fallback: redirect unknown paths to root */}
        <Route path="/logIn" element={<Login />} />
        <Route path="/signUp" element={<SignUp />} />
        <Route path="/dashboard" element={<MainDashboard />} />
        <Route path="/opportunities" element={<Opportunities />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/contact-support" element={<ContactSupport />} />
        <Route path="/faq" element={<FAQ />} />
        <Route path="/about-us" element={<AboutUs />} />
        <Route path="/about us" element={<AboutUsInside />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/all-notifications" element={<AllNotifications />} />
        <Route path="/change-password" element={<ChangePass />} />
        
        <Route path="*" element={<Navigate to="/landing_page" replace />} />
      </Routes>
    </Router>
  );
};

export default App;