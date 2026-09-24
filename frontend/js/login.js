/**
 * DG Interns Hub - Week 6: Authentication System
 * Login Page Logic (Vanilla JavaScript)
 */

document.addEventListener('DOMContentLoaded', () => {
  // DOM Elements
  const loginForm = document.getElementById('loginForm');
  const emailInput = document.getElementById('email');
  const passwordInput = document.getElementById('password');
  const submitBtn = document.getElementById('loginSubmitBtn');
  const btnText = document.getElementById('btnText');
  const btnSpinner = document.getElementById('btnSpinner');

  // Alert Box Elements
  const alertBox = document.getElementById('alertBox');
  const alertMessage = document.getElementById('alertMessage');
  const alertIcon = document.getElementById('alertIcon');

  // Password Visibility Toggle
  const togglePasswordBtn = document.getElementById('togglePasswordBtn');

  // API Base URL - Handles Express server (:5000) or Live Server
  const API_BASE_URL = window.location.origin.includes(':5000')
    ? window.location.origin
    : 'http://localhost:5000';

  // If already authenticated with a valid token, redirect to dashboard
  if (localStorage.getItem('token')) {
    window.location.href = 'dashboard.html';
    return;
  }

  // ==========================================
  // Helper: Display Alerts
  // ==========================================
  const showAlert = (message, type = 'danger') => {
    alertBox.className = `alert-box alert-${type}`;
    alertMessage.textContent = message;

    if (type === 'danger') {
      alertIcon.innerHTML = `
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="12" y1="8" x2="12" y2="12"></line>
          <line x1="12" y1="16" x2="12.01" y2="16"></line>
        </svg>`;
    } else if (type === 'success') {
      alertIcon.innerHTML = `
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
          <polyline points="22 4 12 14.01 9 11.01"></polyline>
        </svg>`;
    }

    alertBox.style.display = 'flex';
  };

  const hideAlert = () => {
    alertBox.style.display = 'none';
  };

  // ==========================================
  // Helper: Button Loading State
  // ==========================================
  const setLoading = (isLoading) => {
    if (isLoading) {
      submitBtn.disabled = true;
      btnText.textContent = 'Verifying Credentials...';
      btnSpinner.style.display = 'inline-block';
    } else {
      submitBtn.disabled = false;
      btnText.textContent = 'Sign In';
      btnSpinner.style.display = 'none';
    }
  };

  // ==========================================
  // Password Visibility Toggle Logic
  // ==========================================
  if (togglePasswordBtn) {
    togglePasswordBtn.addEventListener('click', () => {
      const isPassword = passwordInput.type === 'password';
      passwordInput.type = isPassword ? 'text' : 'password';

      togglePasswordBtn.innerHTML = isPassword
        ? `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
            <line x1="1" y1="1" x2="23" y2="23"></line>
          </svg>`
        : `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
            <circle cx="12" cy="12" r="3"></circle>
          </svg>`;
    });
  }

  // ==========================================
  // Form Submit Handler
  // ==========================================
  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    hideAlert();

    const email = emailInput.value.trim().toLowerCase();
    const password = passwordInput.value;

    // 1. Client-Side Validation
    if (!email) {
      showAlert('Please enter your email address.', 'danger');
      emailInput.focus();
      return;
    }

    if (!password) {
      showAlert('Please enter your password.', 'danger');
      passwordInput.focus();
      return;
    }

    // 2. Submit to Backend API
    setLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Invalid email or password.');
      }

      // 3. Login Success: Store token & user data in localStorage
      showAlert('Login successful! Redirecting to Dashboard...', 'success');

      if (data.token) {
        localStorage.setItem('token', data.token);
      }
      if (data.user) {
        localStorage.setItem('user', JSON.stringify(data.user));
      }

      // 4. Redirect to Dashboard
      setTimeout(() => {
        window.location.href = 'dashboard.html';
      }, 1000);
    } catch (error) {
      console.error('Login error:', error);
      showAlert(error.message || 'Unable to connect to backend server. Make sure the server is running.', 'danger');
    } finally {
      setLoading(false);
    }
  });
});
