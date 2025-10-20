import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import ProtectedRoute from './components/ProtectedRoute';
import ErrorBoundary from './components/ErrorBoundary';

// Update imports to match your actual directory structure
import LandingPage from './pages/Landing';
import Login from './pages/Login';
import SignUp from './pages/Register';
import VerifyEmail from './pages/VerifyEmail';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Dashboard from './pages/main_dashboard';
import Opportunities from './pages/opportunities';
import Profile from './pages/profile';
import ContactSupport from './pages/contact_support';
import FAQ from './pages/faq';
import AboutUs from './pages/about_us';
import AboutUsInside from './pages/about_us_inside';
import Settings from './pages/settings';
import AllNotifications from './pages/all_notifications';
import ChangePass from './pages/change_password';




const App: React.FC = () => {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <AuthProvider>
          <Router>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/landing_page" element={<LandingPage />} />
            <Route path="/landing_page-in" element={<LandingPage />} />
            <Route path="/logIn" element={<Login />} />
            <Route path="/signUp" element={<SignUp />} />
            <Route path="/verify-email" element={<VerifyEmail />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/about" element={<AboutUs />} />
            
            {/* Protected Routes */}
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } />
            <Route path="/opportunities" element={
              <ProtectedRoute>
                <Opportunities />
              </ProtectedRoute>
            } />
            <Route path="/profile" element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            } />
            <Route path="/contact-support" element={
              <ProtectedRoute>
                <ContactSupport />
              </ProtectedRoute>
            } />
            <Route path="/faq" element={
              <ProtectedRoute>
                <FAQ />
              </ProtectedRoute>
            } />
            <Route path="/about-us" element={
              <ProtectedRoute>
                <AboutUsInside />
              </ProtectedRoute>
            } />
            <Route path="/settings" element={
              <ProtectedRoute>
                <Settings />
              </ProtectedRoute>
            } />
            <Route path="/all-notifications" element={
              <ProtectedRoute>
                <AllNotifications />
              </ProtectedRoute>
            } />
            <Route path="/change-password" element={
              <ProtectedRoute>
                <ChangePass />
              </ProtectedRoute>
            } />
            
            {/* Fallback: redirect unknown paths to root */}
            <Route path="*" element={<Navigate to="/landing_page" replace />} />
          </Routes>
        </Router>
      </AuthProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
};

export default App;