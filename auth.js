// auth.js — LOCALSTORAGE VERSION FOR VERCEL

document.addEventListener('DOMContentLoaded', function () {
  const loginForm = document.getElementById('login-form');
  const signupForm = document.getElementById('signup-form');

  if (loginForm) {
    loginForm.addEventListener('submit', handleLogin);
  }

  if (signupForm) {
    signupForm.addEventListener('submit', handleSignup);
  }
});

function handleSignup(e) {
  e.preventDefault();

  const username = document.getElementById('username').value;
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;

  if (!username || !email || !password) {
    alert('Fill in all fields!');
    return;
  }

  let users = JSON.parse(localStorage.getItem('users') || '[]');
  if (users.find((u) => u.email === email)) {
    alert('Email already registered!');
    return;
  }

  users.push({ username, email, password });
  localStorage.setItem('users', JSON.stringify(users));

  alert('Account created! Redirecting to login...');
  setTimeout(() => (window.location.href = 'login.html'), 1000);
}

function handleLogin(e) {
  e.preventDefault();

  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;

  let users = JSON.parse(localStorage.getItem('users') || '[]');
  const user = users.find((u) => u.email === email && u.password === password);

  if (user) {
    localStorage.setItem('currentUser', JSON.stringify(user));
    alert('Login successful!');
    setTimeout(() => (window.location.href = 'profile.html'), 1000);
  } else {
    alert('Invalid email or password!');
  }
}
