/**
 * DG Interns Hub - Week 6: Authentication System
 * Signup Page Logic (Vanilla JavaScript)
 */

document.addEventListener('DOMContentLoaded', () => {
  // DOM Elements
  const signupForm = document.getElementById('signupForm');
  const nameInput = document.getElementById('name');
  const emailInput = document.getElementById('email');
  const passwordInput = document.getElementById('password');
  const confirmPasswordInput = document.getElementById('confirmPassword');
  const submitBtn = document.getElementById('signupSubmitBtn');
  const btnText = document.getElementById('btnText');
  const btnSpinner = document.getElementById('btnSpinner');

  // Alert Box Elements
  const alertBox = document.getElementById('alertBox');
  const alertMessage = document.getElementById('alertMessage');
  const alertIcon = document.getElementById('alertIcon');

  // Password Checklist Elements
  const critLength = document.getElementById('critLength');
  const critUpper = document.getElementById('critUpper');
  const critLower = document.getElementById('critLower');
  const critSpecial = document.getElementById('critSpecial');
  const critMatch = document.getElementById('critMatch');

  // Password Visibility Toggles
  const togglePasswordBtn = document.getElementById('togglePasswordBtn');
  const toggleConfirmPasswordBtn = document.getElementById('toggleConfirmPasswordBtn');

  // API Base URL - Automatically detects if served via Express (:5000) or Live Server (:5500 / other)
  const API_BASE_URL = window.location.origin.includes(':5000')
    ? window.location.origin
    : 'http://localhost:5000';

  // If already authenticated with a valid token, redirect to dashboard
  if (localStorage.getItem('token')) {
    window.location.href = 'dashboard.html';
    return;
  }

  // ==========================================
  // Helper: Comprehensive Password Validation Rule
  // ==========================================
  const validatePassword = (password) => {
    if (!password) {
      return { isValid: false, message: 'Password is required.' };
    }
    const missing = [];
    if (password.length < 8) {
      missing.push('at least 8 characters');
    }
    if (!/[A-Z]/.test(password)) {
      missing.push('at least 1 uppercase letter (A-Z)');
    }
    if (!/[a-z]/.test(password)) {
      missing.push('at least 1 lowercase letter (a-z)');
    }
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?`~]/.test(password)) {
      missing.push('at least 1 special character (e.g. @, #, $, %, !)');
    }

    if (missing.length > 0) {
      return {
        isValid: false,
        message: `Password must contain ${missing.join(', ')}.`,
      };
    }
    return { isValid: true, message: '' };
  };

  // ==========================================
  // Helper: Display Alerts (Success / Danger / Info)
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
    } else {
      alertIcon.innerHTML = `
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="12" y1="8" x2="12" y2="12"></line>
          <line x1="12" y1="8" x2="12.01" y2="8"></line>
        </svg>`;
    }

    alertBox.style.display = 'flex';
    alertBox.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  };

  const hideAlert = () => {
    alertBox.style.display = 'none';
  };

  // ==========================================
  // Helper: Set Button Loading State
  // ==========================================
  const setLoading = (isLoading) => {
    if (isLoading) {
      submitBtn.disabled = true;
      btnText.textContent = 'Creating Account...';
      btnSpinner.style.display = 'inline-block';
    } else {
      submitBtn.disabled = false;
      btnText.textContent = 'Create Account';
      btnSpinner.style.display = 'none';
    }
  };

  // ==========================================
  // Password Visibility Toggle Logic
  // ==========================================
  const setupPasswordToggle = (button, input) => {
    button.addEventListener('click', () => {
      const isPassword = input.type === 'password';
      input.type = isPassword ? 'text' : 'password';

      button.innerHTML = isPassword
        ? `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
            <line x1="1" y1="1" x2="23" y2="23"></line>
          </svg>`
        : `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
            <circle cx="12" cy="12" r="3"></circle>
          </svg>`;
    });
  };

  setupPasswordToggle(togglePasswordBtn, passwordInput);
  setupPasswordToggle(toggleConfirmPasswordBtn, confirmPasswordInput);

  // ==========================================
  // Real-Time Password Validation Checklist
  // ==========================================
  const updateCriteria = () => {
    const pwd = passwordInput.value;
    const confirmPwd = confirmPasswordInput.value;

    const setStatus = (el, isMet) => {
      if (!el) return;
      if (isMet) {
        el.classList.add('met');
        el.querySelector('svg').innerHTML = '<polyline points="20 6 9 17 4 12"></polyline>';
      } else {
        el.classList.remove('met');
        el.querySelector('svg').innerHTML = '<circle cx="12" cy="12" r="10"></circle>';
      }
    };

    setStatus(critLength, pwd.length >= 8);
    setStatus(critUpper, /[A-Z]/.test(pwd));
    setStatus(critLower, /[a-z]/.test(pwd));
    setStatus(critSpecial, /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?`~]/.test(pwd));
    setStatus(critMatch, pwd.length > 0 && pwd === confirmPwd);
  };

  passwordInput.addEventListener('input', updateCriteria);
  confirmPasswordInput.addEventListener('input', updateCriteria);

  // ==========================================
  // Form Submission Handler
  // ==========================================
  signupForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    hideAlert();

    const name = nameInput.value.trim();
    const email = emailInput.value.trim().toLowerCase();
    const password = passwordInput.value;
    const confirmPassword = confirmPasswordInput.value;

    // 1. Client-Side Validation
    if (!name) {
      showAlert('Full Name is required.', 'danger');
      nameInput.focus();
      return;
    }

    if (name.length < 2) {
      showAlert('Full Name must be at least 2 characters long.', 'danger');
      nameInput.focus();
      return;
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) {
      showAlert('Email address is required.', 'danger');
      emailInput.focus();
      return;
    }

    if (!emailPattern.test(email)) {
      showAlert('Please enter a valid email address (e.g. user@example.com).', 'danger');
      emailInput.focus();
      return;
    }

    // Comprehensive Password Complexity Check (min 8 chars, uppercase, lowercase, special char)
    const pwdCheck = validatePassword(password);
    if (!pwdCheck.isValid) {
      showAlert(pwdCheck.message, 'danger');
      passwordInput.focus();
      return;
    }

    if (password !== confirmPassword) {
      showAlert('Passwords do not match. Please verify both fields.', 'danger');
      confirmPasswordInput.focus();
      return;
    }

    // 2. Submit to Backend API
    setLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name,
          email,
          password,
          confirmPassword,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Registration failed. Please try again.');
      }

      // 3. Signup Success: Store JWT token & user info in localStorage
      showAlert('Account created successfully! Redirecting to Dashboard...', 'success');

      if (data.token) {
        localStorage.setItem('token', data.token);
      }
      if (data.user) {
        localStorage.setItem('user', JSON.stringify(data.user));
      }

      // 4. Redirect after short delay so user sees success confirmation
      setTimeout(() => {
        window.location.href = 'dashboard.html';
      }, 1200);
    } catch (error) {
      console.error('Signup error:', error);
      showAlert(error.message || 'Unable to connect to the backend server. Is Docker and Node.js running?', 'danger');
    } finally {
      setLoading(false);
    }
  });
});
