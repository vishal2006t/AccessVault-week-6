/**
 * AccessVault — Secure User Authentication System
 * Protected Dashboard Logic (Vanilla JavaScript)
 */

document.addEventListener('DOMContentLoaded', async () => {
  // DOM Elements
  const loadingElement = document.getElementById('dashboardLoading');
  const contentElement = document.getElementById('dashboardContent');
  const welcomeHeading = document.getElementById('welcomeHeading');
  const userEmailDisplay = document.getElementById('userEmailDisplay');
  const userAvatar = document.getElementById('userAvatar');
  const cardUserName = document.getElementById('cardUserName');
  const cardUserEmail = document.getElementById('cardUserEmail');
  const cardUserId = document.getElementById('cardUserId');
  const cardUserCreatedAt = document.getElementById('cardUserCreatedAt');
  const rawTokenDisplay = document.getElementById('rawTokenDisplay');
  const toggleTokenBtn = document.getElementById('toggleTokenBtn');
  const tokenDetailsBox = document.getElementById('tokenDetailsBox');
  const sessionTimestamp = document.getElementById('sessionTimestamp');
  const logoutBtn = document.getElementById('logoutBtn');

  // API Base URL - Detects Express (:5000) or Live Server
  const API_BASE_URL = window.location.origin.includes(':5000')
    ? window.location.origin
    : 'http://localhost:5000';

  // 1. Check for token in localStorage
  const token = localStorage.getItem('token');

  if (!token) {
    console.warn('No token found in localStorage. Redirecting to login.');
    redirectToLogin();
    return;
  }

  // Helper: Clear session and redirect
  function redirectToLogin() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = 'login.html';
  }

  // 2. Verify token and fetch current user profile from GET /api/auth/me
  try {
    const response = await fetch(`${API_BASE_URL}/api/auth/me`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await response.json();

    if (!response.ok || !data.success || !data.user) {
      console.error('Session invalid or expired:', data.message);
      alert(data.message || 'Session expired. Please log in again.');
      redirectToLogin();
      return;
    }

    const user = data.user;

    // 3. Populate Dashboard Data
    welcomeHeading.textContent = `Welcome, ${user.name}`;
    userEmailDisplay.textContent = user.email;
    cardUserName.textContent = user.name;
    cardUserEmail.textContent = user.email;
    cardUserId.textContent = user.id || user._id || 'N/A';

    // Format Creation Date
    if (user.createdAt) {
      const date = new Date(user.createdAt);
      cardUserCreatedAt.textContent = date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } else {
      cardUserCreatedAt.textContent = 'Active Member';
    }

    // Generate Avatar initial
    userAvatar.textContent = user.name.charAt(0).toUpperCase();

    // Show raw token in inspector box
    rawTokenDisplay.textContent = token;

    sessionTimestamp.textContent = `Verified at ${new Date().toLocaleTimeString()}`;

    // 4. Reveal Dashboard
    loadingElement.style.display = 'none';
    contentElement.style.display = 'block';
  } catch (error) {
    console.error('Failed to authenticate token:', error);
    alert('Unable to connect to authentication server. Please ensure the backend is running.');
    redirectToLogin();
  }

  // 5. Toggle Token Inspector Details
  if (toggleTokenBtn && tokenDetailsBox) {
    toggleTokenBtn.addEventListener('click', () => {
      const isVisible = tokenDetailsBox.style.display === 'block';
      tokenDetailsBox.style.display = isVisible ? 'none' : 'block';
      toggleTokenBtn.textContent = isVisible ? 'Show Token Details' : 'Hide Token Details';
    });
  }

  // 6. Logout Handler
  if (logoutBtn) {
    logoutBtn.addEventListener('click', async () => {
      try {
        // Optional call to notify backend of logout
        await fetch(`${API_BASE_URL}/api/auth/logout`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        }).catch(() => {}); // Gracefully ignore network errors on logout
      } finally {
        // Clear client-side stored session
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = 'login.html';
      }
    });
  }
});
