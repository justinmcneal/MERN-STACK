import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Landing.css';

const Landing: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="landing-container">
      <header className="landing-header">
        <div className="landing-logo">MyApp</div>
        <div className="landing-header-buttons">
          <button
            className="landing-login-btn"
            onClick={() => navigate('/login')}
            aria-label="Go to Login"
          >
            Login
          </button>
          <button
            className="landing-signup-btn"
            onClick={() => navigate('/register')}
            aria-label="Go to Signup"
          >
            Signup
          </button>
        </div>
      </header>
      <main className="landing-main">
        <h1>Welcome to MyApp</h1>
        <p>Your all-in-one solution for productivity and collaboration.</p>
      </main>
    </div>
  );
};

export default Landing;
