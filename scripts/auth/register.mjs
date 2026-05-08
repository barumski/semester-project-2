import { REGISTER_URL, getHeaders } from "../api/api.mjs";

const form = document.querySelector('#register-form');

form.addEventListener('submit', async (event) => {
  event.preventDefault();

  const name = form.name.value;
  const email = form.email.value;
  const password = form.password.value;

  try {
    const response = await fetch(REGISTER_URL, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({
            name,
            email,
            password,
        }),
    });
    
    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.errors?.[0]?.message || 'Registration failed');
    }

    console.log('User registered successfully', data);

    window.location.href = './login.html';

    } catch (error) {
        console.error('Register error:', error.message);
    }
  });