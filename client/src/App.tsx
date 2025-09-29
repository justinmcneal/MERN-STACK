import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LandingPage from './view_pages/landing_page';
import Login from './view_pages/logIn';
import SignUp from './view_pages/signUp';
import MainDashboard from './view_pages/main_dashboard';
import Opportunities from './view_pages/opportunities';
import Profile from './view_pages/profile';
import ContactSupport from './view_pages/contact_support';




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
        
        
        <Route path="*" element={<Navigate to="/landing_page" replace />} />
      </Routes>
    </Router>
  );
};

export default App;