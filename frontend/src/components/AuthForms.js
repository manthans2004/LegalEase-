import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { X, User, Mail, Lock, Eye, EyeOff, Calendar } from 'react-feather';
import './AuthForms.css'; // We'll create this new CSS file

const AuthForms = ({ onClose }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: ''
  });
  const { login, register, error, setError } = useAuth();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const result = isLogin 
      ? await login({ email: formData.email, password: formData.password })
      : await register(formData);

    if (result.success) {
      onClose();
    }
  };

  const switchMode = () => {
    setIsLogin(!isLogin);
    setError('');
    setFormData({ username: '', email: '', password: '' });
  };

  return (
    <div className="auth-modal-overlay">
      <div className="auth-modal-container">
        <div className="auth-modal-header">
          <div className="auth-modal-icon">
            <Calendar size={24} />
          </div>
          <h2>{isLogin ? 'Welcome Back' : 'Create Account'}</h2>
          <p>{isLogin ? 'Sign in to continue your legal journey' : 'Join us to simplify legal documentation'}</p>
          <button className="auth-close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="auth-modal-body">
          {error && (
            <div className="auth-error-message">
              <div className="error-icon">!</div>
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="auth-form">
            {!isLogin && (
              <div className="input-group">
                <div className="input-icon">
                  <User size={18} />
                </div>
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  required={!isLogin}
                  placeholder="Choose a username"
                  className="auth-input"
                />
              </div>
            )}

            <div className="input-group">
              <div className="input-icon">
                <Mail size={18} />
              </div>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                placeholder="Enter your email address"
                className="auth-input"
              />
            </div>

            <div className="input-group">
              <div className="input-icon">
                <Lock size={18} />
              </div>
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                placeholder="Create a password"
                className="auth-input"
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            <button type="submit" className="auth-submit-btn">
              {isLogin ? 'Sign In' : 'Create Account'}
            </button>
          </form>

          <div className="auth-divider">
            <span>or</span>
          </div>

          <div className="auth-footer">
            <p>
              {isLogin ? "Don't have an account? " : "Already have an account? "}
              <button type="button" onClick={switchMode} className="auth-mode-switch">
                {isLogin ? 'Sign up now' : 'Sign in here'}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthForms;